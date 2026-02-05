export const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
export const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export type FlayMode = "executive" | "thorough";

export type SourceChunk = {
  url: string;
  title: string;
  content: string;
};

export type CrawlPage = {
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    sourceURL?: string;
    url?: string;
  };
  url?: string;
};

export type FetchLike = (input: string, init?: any) => Promise<any>;

export function sendJson(res: any, statusCode: number, body: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendError(res: any, statusCode: number, error: string, detail?: any) {
  sendJson(res, statusCode, { error, detail });
}

export async function getFetchFn(): Promise<FetchLike> {
  if (typeof fetch === "function") return fetch as FetchLike;
  const undici = await import("undici");
  return undici.fetch as unknown as FetchLike;
}

export async function safeReadJson(response: { text: () => Promise<string> }) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text.slice(0, 2000) };
  }
}

export function safeJsonParse(text: string) {
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

export function trimContent(content: string, maxChars: number) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  return `${compact.slice(0, maxChars)}...`;
}

export function normalizeUrlInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildPrompt({
  goal,
  mode,
  sources,
}: {
  goal: string;
  mode: FlayMode;
  sources: SourceChunk[];
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

export async function callClaude({
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
  fetchFn: FetchLike;
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

  const data = await safeReadJson(response as unknown as { text: () => Promise<string> });
  if (!(response as any).ok) {
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

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function normalizeUrl(page: CrawlPage) {
  return (
    page?.metadata?.sourceURL ||
    page?.metadata?.url ||
    page?.url ||
    "Unknown URL"
  );
}

export function normalizeTitle(page: CrawlPage) {
  return page?.metadata?.title || "";
}

export function scoreUrl(url: string) {
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

export function parseQuery(req: any) {
  if (req?.query && typeof req.query === "object") return req.query;
  const url = new URL(req?.url || "/", "http://localhost");
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export function getId(req: any) {
  const query = parseQuery(req);
  if (typeof query.id === "string" && query.id) return query.id;

  const url = new URL(req?.url || "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length >= 3 && parts[0] === "api" && parts[1] === "flay") {
    return parts[2];
  }
  return null;
}
