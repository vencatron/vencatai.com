import {
  buildPrompt,
  callClaude,
  DEFAULT_MODEL,
  safeJsonParse,
  trimContent,
} from "./shared.js";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

function readJsonBody(req: any) {
  if (!req.body) return null;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = readJsonBody(req);
  const url = body?.url?.trim();
  const mode = body?.mode === "thorough" ? "thorough" : "executive";
  const goal =
    typeof body?.goal === "string" && body.goal.trim().length > 0
      ? body.goal.trim()
      : "Competitor Snapshot";

  if (!url || !isValidHttpUrl(url)) {
    res.status(400).json({ error: "Please provide a valid http(s) URL." });
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

  const limit = mode === "thorough" ? 100 : 18;
  const maxDiscoveryDepth = mode === "thorough" ? 3 : 1;
  const crawlEntireDomain = mode === "thorough";

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

  try {
    if (mode === "executive") {
      const scrapeResponse = await fetch(`${FIRECRAWL_BASE}/scrape`, {
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

      const scrapeData = await scrapeResponse.json();
      if (!scrapeResponse.ok) {
        res.status(502).json({
          error: "Firecrawl scrape failed.",
          detail: scrapeData,
        });
        return;
      }

      const page = scrapeData?.data ?? scrapeData ?? {};
      const markdown = typeof page?.markdown === "string" ? page.markdown : "";
      if (!markdown) {
        res.status(502).json({ error: "No content returned from scrape." });
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
      });

      if (!claudeResponse.ok) {
        res.status(502).json({
          error: "Claude extraction failed.",
          detail: claudeResponse.data,
        });
        return;
      }

      const parsed = safeJsonParse(claudeResponse.data.text);
      if (!parsed) {
        res.status(502).json({
          error: "Claude returned invalid JSON.",
          raw: claudeResponse.data.text.slice(0, 2000),
        });
        return;
      }

      res.status(200).json({
        status: "completed",
        result: parsed,
        meta: { pages_used: 1, total_pages: 1 },
      });
      return;
    }

    const response = await fetch(`${FIRECRAWL_BASE}/crawl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data?.id) {
      res.status(502).json({
        error: "Firecrawl crawl failed.",
        detail: data,
      });
      return;
    }

    res.status(200).json({
      jobId: data.id,
      mode,
      goal,
      limit,
    });
  } catch (error: any) {
    res.status(502).json({
      error: "Unable to reach Firecrawl.",
      detail: error?.message ?? "Unknown error",
    });
  }
}
