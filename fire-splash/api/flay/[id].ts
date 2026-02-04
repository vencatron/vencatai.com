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

async function fetchFirecrawlStatus(id: string, firecrawlKey: string) {
  const response = await fetch(`${FIRECRAWL_BASE}/crawl/${id}`, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

async function fetchFirecrawlNext(nextUrl: string, firecrawlKey: string) {
  const response = await fetch(nextUrl, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await response.json();
  return { ok: response.ok, data };
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
}: {
  prompt: string;
  maxTokens: number;
  model: string;
  apiKey: string;
}) {
  const response = await fetch(CLAUDE_ENDPOINT, {
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

  const data = await response.json();
  if (!response.ok) {
    return { ok: false, data };
  }
  const text = Array.isArray(data?.content)
    ? data.content
        .map((item: any) => (isString(item?.text) ? item.text : ""))
        .join("\n")
        .trim()
    : "";

  return { ok: true, data: { text } };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  const claudeKey = process.env.CLAUDE_API_KEY;
  const claudeModel = process.env.CLAUDE_MODEL || DEFAULT_MODEL;
  if (!firecrawlKey) {
    res.status(500).json({ error: "Missing FIRECRAWL_API_KEY." });
    return;
  }
  if (!claudeKey) {
    res.status(500).json({ error: "Missing CLAUDE_API_KEY." });
    return;
  }

  const id = req.query?.id;
  if (!id || !isString(id)) {
    res.status(400).json({ error: "Missing crawl id." });
    return;
  }

  const mode = req.query?.mode === "thorough" ? "thorough" : "executive";
  const goal =
    typeof req.query?.goal === "string" && req.query.goal.trim().length > 0
      ? req.query.goal.trim()
      : "Competitor Snapshot";

  const statusResponse = await fetchFirecrawlStatus(id, firecrawlKey);
  if (!statusResponse.ok) {
    res.status(502).json({ error: "Firecrawl status failed.", detail: statusResponse.data });
    return;
  }

  if (statusResponse.data?.status !== "completed") {
    res.status(200).json({
      status: statusResponse.data?.status || "processing",
      completed: statusResponse.data?.completed ?? 0,
      total: statusResponse.data?.total ?? 0,
    });
    return;
  }

  let pages: CrawlPage[] = Array.isArray(statusResponse.data?.data)
    ? statusResponse.data.data
    : [];

  let next = statusResponse.data?.next;
  let guard = 0;
  while (next && guard < 10) {
    const nextResponse = await fetchFirecrawlNext(next, firecrawlKey);
    if (!nextResponse.ok) break;
    const nextData = nextResponse.data;
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
    const url = normalizeUrl(page);
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
    sources.push({ url, title, content });
  }

  if (sources.length === 0) {
    res.status(200).json({
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
  });

  if (!claudeResponse.ok) {
    res.status(502).json({
      status: "failed",
      error: "Claude extraction failed.",
      detail: claudeResponse.data,
    });
    return;
  }

  const parsed = safeJsonParse(claudeResponse.data.text);
  if (!parsed) {
    res.status(502).json({
      status: "failed",
      error: "Claude returned invalid JSON.",
      raw: claudeResponse.data.text.slice(0, 2000),
    });
    return;
  }

  res.status(200).json({
    status: "completed",
    result: parsed,
    meta: {
      pages_used: sources.length,
      total_pages: pages.length,
    },
  });
}
