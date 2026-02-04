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
  if (!firecrawlKey) {
    res.status(500).json({ error: "Missing FIRECRAWL_API_KEY." });
    return;
  }

  const limit = mode === "thorough" ? 100 : 30;
  const maxDiscoveryDepth = mode === "thorough" ? 3 : 2;
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
