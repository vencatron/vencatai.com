const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

type CrawlPage = {
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    sourceURL?: string;
    url?: string;
  };
  url?: string;
};

function sendJson(res: any, statusCode: number, body: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendError(res: any, statusCode: number, error: string, detail?: any) {
  sendJson(res, statusCode, { error, detail });
}

async function getFetchFn(): Promise<typeof fetch> {
  if (typeof fetch === "function") return fetch;
  const undici = await import("undici");
  return undici.fetch as unknown as typeof fetch;
}

async function safeReadJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text.slice(0, 2000) };
  }
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function trimContent(content: string, maxChars: number) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  return `${compact.slice(0, maxChars)}...`;
}

function buildPrompt({
  goal,
  mode,
  sources,
}: {
  goal: string;
  mode: "executive" | "thorough";
  sources: { url: string; title: string; content: string }[];
}) {
  const limits =
    mode === "thorough"
      ? {
          keyFacts: 12,
          pricing: 10,
          claims: 12,
          faqs: 10,
          trust: 10,
          risks: 6,
        }
      : {
          keyFacts: 6,
          pricing: 5,
          claims: 6,
          faqs: 5,
          trust: 5,
          risks: 3,
        };

  const schema = {
    title: "string",
    one_liner: "string",
    executive_summary: "string",
    key_facts: [
      {
        label: "string",
        value: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    pricing_offers: [
      {
        plan: "string",
        price: "string",
        notes: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    claims_proof: [
      {
        claim: "string",
        proof: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    faqs_policies: [
      {
        question: "string",
        answer: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    trust_signals: [
      {
        signal: "string",
        source_url: "string",
        evidence: "string",
      },
    ],
    risks_gaps: ["string"],
    sources: [
      {
        url: "string",
        title: "string",
      },
    ],
  };

  const sourceBlocks = sources
    .map(
      (source, index) =>
        `[Source ${index + 1}] URL: ${source.url}\nTitle: ${
          source.title || "Untitled"
        }\nContent: ${source.content}`,
    )
    .join("\n\n");

  return `You are Web Flayer, an analyst who produces non-technical briefs.
Use only the provided sources. If a field is missing, write "Not found".
Return ONLY valid JSON. No markdown, no commentary.

Goal focus: ${goal}
Mode: ${mode}

Hard limits:
- key_facts: max ${limits.keyFacts}
- pricing_offers: max ${limits.pricing}
- claims_proof: max ${limits.claims}
- faqs_policies: max ${limits.faqs}
- trust_signals: max ${limits.trust}
- risks_gaps: max ${limits.risks}

Evidence rules:
- evidence must be a short snippet (max 25 words) from the source.
- every fact or claim must include a source_url and evidence.

JSON schema (types only):
${JSON.stringify(schema, null, 2)}

Sources:
${sourceBlocks}`;
}

async function callClaude({
  prompt,
  maxTokens,
  model,
  apiKey,
  fetchFn,
}: {
  prompt: string;
  maxTokens: number;
  model: string;
  apiKey: string;
  fetchFn: typeof fetch;
}) {
  const response = await fetchFn(CLAUDE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await safeReadJson(response as unknown as Response);
  if (!response.ok) {
    return { ok: false as const, data };
  }

  const text = Array.isArray((data as any)?.content)
    ? (data as any).content
        .map((item: any) => (typeof item?.text === "string" ? item.text : ""))
        .join("\n")
        .trim()
    : "";

  return { ok: true as const, data: { text } };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizeUrl(page: CrawlPage) {
  return (
    page?.metadata?.sourceURL ||
    page?.metadata?.url ||
    page?.url ||
    "Unknown URL"
  );
}

function normalizeTitle(page: CrawlPage) {
  return page?.metadata?.title || "";
}

function scoreUrl(url: string) {
  const rules = [
    { pattern: /pricing|price|plans|plan/i, weight: 4 },
    { pattern: /faq|support|help|docs|documentation/i, weight: 3 },
    { pattern: /about|company|team|careers/i, weight: 2 },
    { pattern: /contact|press|media/i, weight: 2 },
    { pattern: /testimonial|review|customer|case-study|case-studies/i, weight: 2 },
    { pattern: /security|privacy|terms|compliance/i, weight: 2 },
    { pattern: /features|product|solutions|use-cases/i, weight: 1 },
    { pattern: /blog|insights|resources/i, weight: 1 },
  ];

  return rules.reduce((score, rule) => {
    if (rule.pattern.test(url)) return score + rule.weight;
    return score;
  }, 0);
}

async function fetchFirecrawlStatus(
  id: string,
  firecrawlKey: string,
  fetchFn: typeof fetch,
) {
  const response = await fetchFn(`${FIRECRAWL_BASE}/crawl/${id}`, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await safeReadJson(response as unknown as Response);
  return { ok: response.ok, data };
}

async function fetchFirecrawlNext(
  nextUrl: string,
  firecrawlKey: string,
  fetchFn: typeof fetch,
) {
  const response = await fetchFn(nextUrl, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await safeReadJson(response as unknown as Response);
  return { ok: response.ok, data };
}

function parseQuery(req: any) {
  if (req?.query && typeof req.query === "object") return req.query;
  const url = new URL(req?.url || "/", "http://localhost");
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

function getId(req: any) {
  const query = parseQuery(req);
  if (typeof query.id === "string" && query.id) return query.id;

  const url = new URL(req?.url || "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  // expected: /api/flay/:id
  if (parts.length >= 3 && parts[0] === "api" && parts[1] === "flay") {
    return parts[2];
  }
  return null;
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      sendError(res, 405, "Method not allowed");
      return;
    }

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;
    const claudeModel = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
    if (!firecrawlKey) {
      sendError(res, 500, "Missing FIRECRAWL_API_KEY.");
      return;
    }
    if (!claudeKey) {
      sendError(res, 500, "Missing CLAUDE_API_KEY.");
      return;
    }

    const id = getId(req);
    if (!id || !isString(id)) {
      sendError(res, 400, "Missing crawl id.");
      return;
    }

    const query = parseQuery(req);
    const mode = query.mode === "thorough" ? "thorough" : "executive";
    const goal =
      typeof query.goal === "string" && query.goal.trim().length > 0
        ? query.goal.trim()
        : "Competitor Snapshot";
    const extract = query.extract === "1" || query.extract === "true" || query.extract === "yes";

    const fetchFn = await getFetchFn();

    const statusResponse = await fetchFirecrawlStatus(id, firecrawlKey, fetchFn);
    if (!statusResponse.ok) {
      sendError(res, 502, "Firecrawl status failed.", statusResponse.data);
      return;
    }

    if ((statusResponse.data as any)?.status !== "completed") {
      sendJson(res, 200, {
        status: (statusResponse.data as any)?.status || "processing",
        completed: (statusResponse.data as any)?.completed ?? 0,
        total: (statusResponse.data as any)?.total ?? 0,
      });
      return;
    }

    if (!extract) {
      sendJson(res, 200, {
        status: "completed",
        completed:
          (statusResponse.data as any)?.completed ??
          (statusResponse.data as any)?.total ??
          0,
        total: (statusResponse.data as any)?.total ?? 0,
        ready: true,
      });
      return;
    }

    let pages: CrawlPage[] = Array.isArray((statusResponse.data as any)?.data)
      ? (statusResponse.data as any).data
      : [];

    let next = (statusResponse.data as any)?.next;
    let guard = 0;
    while (next && guard < 10) {
      const nextResponse = await fetchFirecrawlNext(next, firecrawlKey, fetchFn);
      if (!nextResponse.ok) break;
      const nextData: any = nextResponse.data;
      if (Array.isArray(nextData?.data)) {
        pages = pages.concat(nextData.data);
      }
      next = nextData?.next;
      guard += 1;
    }

    const pagesWithScores = pages.map((page, index) => ({
      page,
      index,
      score: scoreUrl(normalizeUrl(page)),
    }));

    pagesWithScores.sort((a, b) => b.score - a.score);

    const maxPages = mode === "thorough" ? 28 : 12;
    const selected = pagesWithScores.slice(0, maxPages).map((entry) => entry.page);

    const maxCharsPerPage = mode === "thorough" ? 4500 : 3000;
    const maxTotalChars = mode === "thorough" ? 220000 : 120000;

    const sources: { url: string; title: string; content: string }[] = [];
    let totalChars = 0;

    for (const page of selected) {
      const pageUrl = normalizeUrl(page);
      const title = normalizeTitle(page);
      const markdown = isString(page.markdown) ? page.markdown : "";
      if (!markdown) continue;
      let content = trimContent(markdown, maxCharsPerPage);
      if (totalChars + content.length > maxTotalChars) {
        const remaining = Math.max(maxTotalChars - totalChars, 0);
        if (remaining < 200) break;
        content = trimContent(markdown, remaining);
      }
      totalChars += content.length;
      sources.push({ url: pageUrl, title, content });
    }

    if (sources.length === 0) {
      sendJson(res, 200, {
        status: "completed",
        result: {
          title: "Not found",
          one_liner: "Not found",
          executive_summary: "Not found",
          key_facts: [],
          pricing_offers: [],
          claims_proof: [],
          faqs_policies: [],
          trust_signals: [],
          risks_gaps: ["Not found"],
          sources: [],
        },
      });
      return;
    }

    const prompt = buildPrompt({ goal, mode, sources });
    const maxTokens = mode === "thorough" ? 3500 : 1800;

    const claudeResponse = await callClaude({
      prompt,
      maxTokens,
      model: claudeModel,
      apiKey: claudeKey,
      fetchFn,
    });

    if (!claudeResponse.ok) {
      sendError(res, 502, "Claude extraction failed.", claudeResponse.data);
      return;
    }

    const parsed = safeJsonParse(claudeResponse.data.text);
    if (!parsed) {
      sendError(res, 502, "Claude returned invalid JSON.", {
        raw: claudeResponse.data.text.slice(0, 2000),
      });
      return;
    }

    sendJson(res, 200, {
      status: "completed",
      result: parsed,
      meta: {
        pages_used: sources.length,
        total_pages: pages.length,
      },
    });
  } catch (error: any) {
    sendError(res, 500, "Unhandled error.", {
      message: error?.message ?? "Unknown error",
      stack: error?.stack,
    });
  }
}
