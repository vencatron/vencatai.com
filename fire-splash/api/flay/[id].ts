import {
  firecrawlRequest,
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
type PageIntent =
  | "homepage"
  | "pricing"
  | "faq"
  | "trust"
  | "about"
  | "legal"
  | "product"
  | "contact"
  | "blog"
  | "general";

type RankedPage = {
  page: CrawlPage;
  url: string;
  key: string;
  score: number;
  intent: PageIntent;
  contentLength: number;
};
type FirecrawlRequestOptions = {
  timeoutMs: number;
  retries: number;
  retryBaseDelayMs: number;
};
type JsonRepairResult =
  | {
      ok: true;
      parsed: Record<string, any>;
      stopReason: string | null;
    }
  | {
      ok: false;
      detail?: any;
      raw?: string;
      stopReason?: string | null;
    };

const INTENT_QUOTAS: Array<{ intent: PageIntent; max: number }> = [
  { intent: "pricing", max: 4 },
  { intent: "product", max: 4 },
  { intent: "faq", max: 3 },
  { intent: "trust", max: 3 },
  { intent: "about", max: 2 },
  { intent: "legal", max: 2 },
  { intent: "contact", max: 2 },
  { intent: "blog", max: 1 },
  { intent: "general", max: 8 },
];

const JSON_BRIEF_SCHEMA = {
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
  entities: [
    {
      name: "string",
      type: "string",
      relevance: "string",
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

function canonicalPageKey(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.origin}${path}`;
  } catch {
    return rawUrl.trim().replace(/\/+$/, "");
  }
}

function isHomepageUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    return !url.pathname || url.pathname === "/" || /^\/(home|index(\.html?)?)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function detectIntent(rawUrl: string): PageIntent {
  if (isHomepageUrl(rawUrl)) return "homepage";
  if (/pricing|price|plans?|billing|quote|cost/i.test(rawUrl)) return "pricing";
  if (/faq|support|help|docs|documentation|knowledge-base/i.test(rawUrl)) return "faq";
  if (/testimonial|review|customer|case-study|case-studies|success-story|rating/i.test(rawUrl))
    return "trust";
  if (/about|company|team|leadership|careers|jobs/i.test(rawUrl)) return "about";
  if (/privacy|terms|security|compliance|gdpr|hipaa|policy/i.test(rawUrl)) return "legal";
  if (/features?|product|solutions?|platform|use-cases?|integrations?/i.test(rawUrl))
    return "product";
  if (/contact|press|media|partners?|book-demo|demo/i.test(rawUrl)) return "contact";
  if (/blog|insights|resources|news|webinar|events?/i.test(rawUrl)) return "blog";
  return "general";
}

function scoreForSelection({
  url,
  contentLength,
  intent,
}: {
  url: string;
  contentLength: number;
  intent: PageIntent;
}) {
  let score = scoreUrl(url);
  score += Math.min(Math.floor(contentLength / 1600), 3);
  if (intent === "homepage") score += 2;
  if (intent === "blog") score -= 1;
  return score;
}

function rankPages(pages: CrawlPage[]): RankedPage[] {
  return pages
    .map((page) => {
      const url = normalizeUrl(page);
      const markdown = isString(page.markdown) ? page.markdown : "";
      const contentLength = markdown.replace(/\s+/g, " ").trim().length;
      const intent = detectIntent(url);
      return {
        page,
        url,
        key: canonicalPageKey(url),
        score: scoreForSelection({ url, contentLength, intent }),
        intent,
        contentLength,
      };
    })
    .filter((entry) => entry.contentLength > 0)
    .sort((a, b) => b.score - a.score || b.contentLength - a.contentLength);
}

function selectHighValuePages(pages: CrawlPage[], maxPages: number): RankedPage[] {
  const ranked = rankPages(pages);
  const selected: RankedPage[] = [];
  const seen = new Set<string>();

  const add = (entry: RankedPage) => {
    if (seen.has(entry.key) || selected.length >= maxPages) return false;
    seen.add(entry.key);
    selected.push(entry);
    return true;
  };

  const homepage = ranked.find((entry) => entry.intent === "homepage");
  if (homepage) add(homepage);

  for (const quota of INTENT_QUOTAS) {
    let count = 0;
    for (const entry of ranked) {
      if (selected.length >= maxPages || count >= quota.max) break;
      if (entry.intent !== quota.intent || seen.has(entry.key)) continue;
      if (add(entry)) count += 1;
    }
  }

  for (const entry of ranked) {
    if (selected.length >= maxPages) break;
    add(entry);
  }

  return selected;
}

async function fetchFirecrawlStatus(
  id: string,
  firecrawlKey: string,
  fetchFn: FetchLike,
  options: FirecrawlRequestOptions,
) {
  return await firecrawlRequest({
    fetchFn,
    url: `${FIRECRAWL_BASE}/crawl/${id}`,
    apiKey: firecrawlKey,
    timeoutMs: options.timeoutMs,
    retries: options.retries,
    retryBaseDelayMs: options.retryBaseDelayMs,
  });
}

async function fetchFirecrawlNext(
  nextUrl: string,
  firecrawlKey: string,
  fetchFn: FetchLike,
  options: FirecrawlRequestOptions,
) {
  return await firecrawlRequest({
    fetchFn,
    url: nextUrl,
    apiKey: firecrawlKey,
    timeoutMs: options.timeoutMs,
    retries: options.retries,
    retryBaseDelayMs: options.retryBaseDelayMs,
  });
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePositiveInt(value: unknown, fallback: number) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildJsonRepairPrompt(rawText: string) {
  return `You repair malformed JSON.
Return ONLY a valid JSON object. No markdown, no commentary.
Do not invent facts. Preserve existing values when possible.
If a required field is missing, use "Not found" for strings and [] for arrays.

Required schema (types only):
${JSON.stringify(JSON_BRIEF_SCHEMA, null, 2)}

Malformed JSON input:
${rawText.slice(0, 24000)}`;
}

async function repairMalformedClaudeJson({
  rawText,
  model,
  apiKey,
  fetchFn,
  timeoutMs = 60000,
}: {
  rawText: string;
  model: string;
  apiKey: string;
  fetchFn: FetchLike;
  timeoutMs?: number;
}): Promise<JsonRepairResult> {
  const repairResponse = await callClaude({
    prompt: buildJsonRepairPrompt(rawText),
    maxTokens: 4200,
    model,
    apiKey,
    fetchFn,
    temperature: 0,
    timeoutMs,
  });

  if (!repairResponse.ok) {
    return { ok: false, detail: repairResponse.data };
  }

  const parsed = safeJsonParse(repairResponse.data.text);
  if (!isPlainObject(parsed)) {
    return {
      ok: false,
      raw: repairResponse.data.text.slice(0, 2000),
      stopReason: repairResponse.data.stopReason,
    };
  }

  return {
    ok: true,
    parsed,
    stopReason: repairResponse.data.stopReason,
  };
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
    const goal =
      typeof query.goal === "string" && query.goal.trim().length > 0
        ? query.goal.trim()
        : "Full Brief (all categories)";
    const extract = query.extract === "1" || query.extract === "true" || query.extract === "yes";

    const fetchFn = await getFetchFn();
    const maxPaginationRequests = parsePositiveInt(
      process.env.FLAY_MAX_PAGINATION_REQUESTS,
      10,
    );
    const maxCollectedPages = parsePositiveInt(process.env.FLAY_MAX_COLLECTED_PAGES, 120);
    const maxSelectedPages = parsePositiveInt(process.env.FLAY_MAX_SELECTED_PAGES, 10);
    const maxCharsPerPage = parsePositiveInt(process.env.FLAY_MAX_CHARS_PER_PAGE, 3000);
    const maxTotalChars = parsePositiveInt(process.env.FLAY_MAX_TOTAL_CHARS, 50000);
    const claudeTimeoutMs = parsePositiveInt(process.env.FLAY_CLAUDE_TIMEOUT_MS, 240000);
    const firecrawlRequestOptions: FirecrawlRequestOptions = {
      timeoutMs: parsePositiveInt(process.env.FLAY_FIRECRAWL_TIMEOUT_MS, 30000),
      retries: parsePositiveInt(process.env.FLAY_FIRECRAWL_RETRIES, 2),
      retryBaseDelayMs: parsePositiveInt(process.env.FLAY_FIRECRAWL_RETRY_DELAY_MS, 600),
    };

    const t0 = Date.now();
    console.log(`[flay:extract] id=${id} extract=${extract} goal="${goal}"`);

    const statusResponse = await fetchFirecrawlStatus(
      id,
      firecrawlKey,
      fetchFn,
      firecrawlRequestOptions,
    );
    console.log(`[flay:extract] firecrawl status ok=${statusResponse.ok} (${Date.now() - t0}ms)`);
    if (!statusResponse.ok) {
      console.log(`[flay:extract] firecrawl status FAILED`, statusResponse.data);
      sendError(res, 502, "Firecrawl status failed.", {
        status: statusResponse.status,
        attempts: statusResponse.attempts,
        detail: statusResponse.data,
      });
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
    let paginationError: Record<string, any> | null = null;
    while (next && guard < maxPaginationRequests && pages.length < maxCollectedPages) {
      const nextResponse = await fetchFirecrawlNext(
        next,
        firecrawlKey,
        fetchFn,
        firecrawlRequestOptions,
      );
      if (!nextResponse.ok) {
        paginationError = {
          status: nextResponse.status,
          attempts: nextResponse.attempts,
          detail: nextResponse.data,
        };
        break;
      }
      const nextData: any = nextResponse.data;
      if (Array.isArray(nextData?.data)) {
        const remaining = Math.max(maxCollectedPages - pages.length, 0);
        if (remaining <= 0) break;
        pages = pages.concat(nextData.data.slice(0, remaining));
      }
      next = nextData?.next;
      guard += 1;
    }
    const paginationTruncated = Boolean(next) || guard >= maxPaginationRequests;
    console.log(`[flay:extract] pagination done: ${guard} requests, ${pages.length} pages collected, truncated=${paginationTruncated} (${Date.now() - t0}ms)`);

    const selectedEntries = selectHighValuePages(pages, maxSelectedPages);

    const sources: { url: string; title: string; content: string; intent: PageIntent }[] = [];
    let totalChars = 0;

    for (const entry of selectedEntries) {
      const page = entry.page;
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
      sources.push({ url: pageUrl, title, content, intent: entry.intent });
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
          entities: [],
          risks_gaps: ["Not found"],
          sources: [],
        },
      });
      return;
    }

    const prompt = buildPrompt({ goal, sources });
    const maxTokens = 4200;

    console.log(`[flay:extract] prompt built: ${sources.length} sources, ${totalChars} chars, ~${Math.round(totalChars / 4)} tokens est. (${Date.now() - t0}ms)`);
    console.log(`[flay:extract] calling Claude model=${claudeModel} timeout=${claudeTimeoutMs}ms`);
    const tClaude = Date.now();

    const claudeResponse = await callClaude({
      prompt,
      maxTokens,
      model: claudeModel,
      apiKey: claudeKey,
      fetchFn,
      temperature: 0,
      timeoutMs: claudeTimeoutMs,
    });

    console.log(`[flay:extract] Claude responded ok=${claudeResponse.ok} (${Date.now() - tClaude}ms, total ${Date.now() - t0}ms)`);

    if (!claudeResponse.ok) {
      console.log(`[flay:extract] Claude FAILED:`, JSON.stringify(claudeResponse.data).slice(0, 500));
      sendError(res, 502, "Claude extraction failed.", claudeResponse.data);
      return;
    }

    let parsed = safeJsonParse(claudeResponse.data.text);
    let repairResult: JsonRepairResult | null = null;

    if (!isPlainObject(parsed)) {
      console.log(`[flay:extract] JSON parse failed, attempting repair... (${Date.now() - t0}ms)`);
      repairResult = await repairMalformedClaudeJson({
        rawText: claudeResponse.data.text,
        model: claudeModel,
        apiKey: claudeKey,
        fetchFn,
        timeoutMs: 60000,
      });
      if (repairResult.ok) {
        parsed = repairResult.parsed;
      }
    }

    if (!isPlainObject(parsed)) {
      console.log(`[flay:extract] FAILED: invalid JSON even after repair (total ${Date.now() - t0}ms)`);
      sendError(res, 502, "Claude returned invalid JSON.", {
        stop_reason: claudeResponse.data.stopReason,
        repair_attempted: true,
        repair_stop_reason: repairResult?.ok ? repairResult.stopReason : repairResult?.stopReason,
        repair_detail: repairResult?.ok ? null : repairResult?.detail,
        raw: claudeResponse.data.text.slice(0, 2000),
      });
      return;
    }

    console.log(`[flay:extract] SUCCESS: brief generated (total ${Date.now() - t0}ms)`);

    sendJson(res, 200, {
      status: "completed",
      result: {
        ...(parsed as Record<string, any>),
      },
      meta: {
        pages_used: sources.length,
        total_pages: pages.length,
        crawl_pages_truncated: paginationTruncated,
        pagination_requests: guard,
        pagination_error: paginationError,
        json_repaired: Boolean(repairResult?.ok),
      },
    });
  } catch (error: any) {
    sendError(res, 500, "Unhandled error.", {
      message: error?.message ?? "Unknown error",
      stack: error?.stack,
    });
  }
}
