const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

function sendJson(res: any, statusCode: number, body: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function sendError(res: any, statusCode: number, error: string, detail?: any) {
  sendJson(res, statusCode, { error, detail });
}

async function readRawBody(req: any): Promise<string> {
  if (typeof req?.body === "string") return req.body;
  if (Buffer.isBuffer(req?.body)) return req.body.toString("utf8");
  if (req?.body && typeof req.body === "object") {
    try {
      return JSON.stringify(req.body);
    } catch {
      return "";
    }
  }

  if (!req || typeof req.on !== "function") return "";

  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", (err: any) => reject(err));
  });
}

async function readJsonBody(req: any) {
  const raw = await readRawBody(req);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeUrlInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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

function trimContent(content: string, maxChars: number) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  return `${compact.slice(0, maxChars)}...`;
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

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      sendError(res, 405, "Method not allowed");
      return;
    }

    const body = await readJsonBody(req);
    const rawUrl = typeof body?.url === "string" ? body.url : "";
    const url = normalizeUrlInput(rawUrl);
    const mode = body?.mode === "thorough" ? "thorough" : "executive";
    const goal =
      typeof body?.goal === "string" && body.goal.trim().length > 0
        ? body.goal.trim()
        : "Competitor Snapshot";

    if (!url || !isValidHttpUrl(url)) {
      sendError(res, 400, "Please provide a valid URL.");
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

    const fetchFn = await getFetchFn();

    if (mode === "executive") {
      const scrapeResponse = await fetchFn(`${FIRECRAWL_BASE}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown", "html"],
          onlyMainContent: true,
        }),
      });

      const scrapeData = await safeReadJson(scrapeResponse);
      if (!scrapeResponse.ok) {
        sendError(res, 502, "Firecrawl scrape failed.", scrapeData);
        return;
      }

      const page: any = (scrapeData as any)?.data ?? scrapeData ?? {};
      const markdown = typeof page?.markdown === "string" ? page.markdown : "";
      if (!markdown) {
        sendError(res, 502, "No content returned from scrape.", scrapeData);
        return;
      }

      const sources = [
        {
          url: page?.metadata?.sourceURL || page?.metadata?.url || url,
          title: page?.metadata?.title || "",
          content: trimContent(markdown, 12000),
        },
      ];

      const prompt = buildPrompt({ goal, mode, sources });
      const claudeResponse = await callClaude({
        prompt,
        maxTokens: 1400,
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
        meta: { pages_used: 1, total_pages: 1 },
      });
      return;
    }

    const limit = 100;
    const maxDiscoveryDepth = 3;
    const crawlEntireDomain = true;

    const payload = {
      url,
      limit,
      maxDiscoveryDepth,
      crawlEntireDomain,
      allowExternalLinks: false,
      allowSubdomains: false,
      ignoreQueryParameters: true,
      sitemap: "include",
      scrapeOptions: {
        formats: ["markdown", "html"],
        onlyMainContent: true,
      },
    };

    const crawlResponse = await fetchFn(`${FIRECRAWL_BASE}/crawl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const crawlData = await safeReadJson(crawlResponse);
    if (!crawlResponse.ok || !(crawlData as any)?.id) {
      sendError(res, 502, "Firecrawl crawl failed.", crawlData);
      return;
    }

    sendJson(res, 200, {
      jobId: (crawlData as any).id,
      mode,
      goal,
      limit,
    });
  } catch (error: any) {
    sendError(res, 500, "Unhandled error.", {
      message: error?.message ?? "Unknown error",
      stack: error?.stack,
    });
  }
}
