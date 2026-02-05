import {
  DEFAULT_MODEL,
  FIRECRAWL_BASE,
  buildPrompt,
  callClaude,
  getFetchFn,
  isValidHttpUrl,
  normalizeUrlInput,
  safeJsonParse,
  safeReadJson,
  sendError,
  sendJson,
  trimContent,
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
