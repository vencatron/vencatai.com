import {
  buildPrompt,
  callClaude,
  DEFAULT_MODEL,
  safeJsonParse,
  trimContent,
} from "./shared.js";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

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
  const extract =
    req.query?.extract === "1" ||
    req.query?.extract === "true" ||
    req.query?.extract === "yes";

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

  if (!extract) {
    res.status(200).json({
      status: "completed",
      completed: statusResponse.data?.completed ?? statusResponse.data?.total ?? 0,
      total: statusResponse.data?.total ?? 0,
      ready: true,
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
