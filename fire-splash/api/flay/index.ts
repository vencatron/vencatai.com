import {
  firecrawlRequest,
  FIRECRAWL_BASE,
  getFetchFn,
  isValidHttpUrl,
  normalizeUrlInput,
  sendError,
  sendJson,
} from "./lib.js";

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

function hasCreditLimitError(detail: any) {
  const text = JSON.stringify(detail || {}).toLowerCase();
  return text.includes("insufficient credits") || text.includes("upgrade your plan");
}

function parsePositiveInt(value: unknown, fallback: number) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
    const goal =
      typeof body?.goal === "string" && body.goal.trim().length > 0
        ? body.goal.trim()
        : "Full Brief (all categories)";

    if (!url || !isValidHttpUrl(url)) {
      sendError(res, 400, "Please provide a valid URL.");
      return;
    }

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;
    if (!firecrawlKey) {
      sendError(res, 500, "Missing FIRECRAWL_API_KEY.");
      return;
    }
    if (!claudeKey) {
      sendError(res, 500, "Missing CLAUDE_API_KEY.");
      return;
    }

    const fetchFn = await getFetchFn();

    const crawlLimit = Number.parseInt(process.env.FLAY_CRAWL_LIMIT || "500", 10);
    const discoveryDepth = Number.parseInt(process.env.FLAY_MAX_DISCOVERY_DEPTH || "6", 10);
    const firecrawlTimeoutMs = parsePositiveInt(process.env.FLAY_FIRECRAWL_TIMEOUT_MS, 30000);
    const firecrawlRetries = parsePositiveInt(process.env.FLAY_FIRECRAWL_RETRIES, 2);
    const firecrawlRetryDelayMs = parsePositiveInt(process.env.FLAY_FIRECRAWL_RETRY_DELAY_MS, 600);
    const limit = Number.isFinite(crawlLimit) && crawlLimit > 0 ? crawlLimit : 500;
    const maxDiscoveryDepth =
      Number.isFinite(discoveryDepth) && discoveryDepth > 0 ? discoveryDepth : 6;
    const crawlEntireDomain = true;

    const fallbackLimits = [limit, 300, 150, 75].filter(
      (value, index, all) => value > 0 && all.indexOf(value) === index,
    );

    let crawlData: any = null;
    let appliedLimit = limit;
    let lastFailure: any = null;

    for (const currentLimit of fallbackLimits) {
      const payload = {
        url,
        limit: currentLimit,
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

      const crawlResponse = await firecrawlRequest({
        fetchFn,
        url: `${FIRECRAWL_BASE}/crawl`,
        apiKey: firecrawlKey,
        method: "POST",
        body: payload,
        timeoutMs: firecrawlTimeoutMs,
        retries: firecrawlRetries,
        retryBaseDelayMs: firecrawlRetryDelayMs,
      });
      const currentData = crawlResponse.data;
      if (crawlResponse.ok && (currentData as any)?.id) {
        crawlData = currentData as any;
        appliedLimit = currentLimit;
        break;
      }

      lastFailure = {
        status: crawlResponse.status,
        attempts: crawlResponse.attempts,
        detail: currentData,
      };
      if (!hasCreditLimitError(currentData)) {
        sendError(res, 502, "Firecrawl crawl failed.", lastFailure);
        return;
      }
    }

    if (!crawlData || !(crawlData as any)?.id) {
      sendError(res, 502, "Firecrawl crawl failed.", lastFailure);
      return;
    }

    sendJson(res, 200, {
      jobId: (crawlData as any).id,
      goal,
      limit: appliedLimit,
    });
  } catch (error: any) {
    sendError(res, 500, "Unhandled error.", {
      message: error?.message ?? "Unknown error",
      stack: error?.stack,
    });
  }
}
