import {
  DEFAULT_MODEL,
  FIRECRAWL_BASE,
  buildPrompt,
  callClaude,
  getFetchFn,
  getId,
  isString,
  normalizeTitle,
  normalizeUrl,
  parseQuery,
  safeJsonParse,
  safeReadJson,
  scoreUrl,
  sendError,
  sendJson,
  trimContent,
} from "./lib.js";

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

type FetchLike = (input: string, init?: any) => Promise<any>;

async function fetchFirecrawlStatus(
  id: string,
  firecrawlKey: string,
  fetchFn: FetchLike,
) {
  const response = await fetchFn(`${FIRECRAWL_BASE}/crawl/${id}`, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await safeReadJson(response);
  return { ok: response.ok, data };
}

async function fetchFirecrawlNext(
  nextUrl: string,
  firecrawlKey: string,
  fetchFn: FetchLike,
) {
  const response = await fetchFn(nextUrl, {
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
    },
  });
  const data = await safeReadJson(response);
  return { ok: response.ok, data };
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
