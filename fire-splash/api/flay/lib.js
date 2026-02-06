export const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
export const CLAUDE_ENDPOINT = "https://api.anthropic.com/v1/messages";
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendError(res, statusCode, error, detail) {
  sendJson(res, statusCode, { error, detail });
}

export async function getFetchFn() {
  if (typeof fetch === "function") return fetch;
  const undici = await import("undici");
  return undici.fetch;
}

export async function safeReadJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text.slice(0, 2000) };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(statusCode) {
  return statusCode === 408 || statusCode === 409 || statusCode === 425 || statusCode === 429 || statusCode >= 500;
}

export async function firecrawlRequest({
  fetchFn,
  url,
  apiKey,
  method = "GET",
  body,
  timeoutMs = 30000,
  retries = 2,
  retryBaseDelayMs = 600,
}) {
  const normalizedTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 30000;
  const normalizedRetries = Number.isFinite(retries) && retries >= 0 ? Math.floor(retries) : 0;
  const normalizedDelay =
    Number.isFinite(retryBaseDelayMs) && retryBaseDelayMs > 0 ? retryBaseDelayMs : 600;
  const maxAttempts = normalizedRetries + 1;

  let lastResult = {
    ok: false,
    status: 0,
    attempts: 0,
    data: { error: "Firecrawl request failed." },
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const hasAbortController = typeof AbortController !== "undefined";
    const controller = hasAbortController ? new AbortController() : null;
    const timer = controller
      ? setTimeout(() => {
          controller.abort();
        }, normalizedTimeout)
      : null;

    let response;
    try {
      response = await fetchFn(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller?.signal,
      });
    } catch (error) {
      if (timer) clearTimeout(timer);

      const isAbortError = error?.name === "AbortError";
      lastResult = {
        ok: false,
        status: 0,
        attempts: attempt,
        data: {
          error: isAbortError ? "Firecrawl request timed out." : "Firecrawl request failed.",
          detail: isString(error?.message) ? error.message : "Unknown request error",
          timeout_ms: isAbortError ? normalizedTimeout : undefined,
        },
      };

      if (attempt < maxAttempts) {
        const backoffMs = Math.min(normalizedDelay * 2 ** (attempt - 1), 5000);
        await delay(backoffMs);
        continue;
      }

      return lastResult;
    }

    if (timer) clearTimeout(timer);

    const data = await safeReadJson(response);
    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        attempts: attempt,
        data,
      };
    }

    lastResult = {
      ok: false,
      status: response.status,
      attempts: attempt,
      data,
    };

    if (!isRetryableStatus(response.status) || attempt >= maxAttempts) {
      return lastResult;
    }

    const backoffMs = Math.min(normalizedDelay * 2 ** (attempt - 1), 5000);
    await delay(backoffMs);
  }

  return lastResult;
}

function sanitizeJsonText(text) {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function stripCodeFence(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return text;
}

function stripTrailingCommas(text) {
  let result = "";
  let inString = false;
  let quote = "";
  let escape = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      result += char;
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      result += char;
      continue;
    }

    if (char === ",") {
      let lookahead = i + 1;
      while (lookahead < text.length && /\s/.test(text[lookahead])) {
        lookahead += 1;
      }
      if (text[lookahead] === "}" || text[lookahead] === "]") {
        continue;
      }
    }

    result += char;
  }

  return result;
}

function extractJsonFragments(text) {
  const fragments = [];
  let start = -1;
  const stack = [];
  let inString = false;
  let quote = "";
  let escape = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === quote) {
        inString = false;
        quote = "";
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      continue;
    }

    if (char === "{" || char === "[") {
      if (stack.length === 0) start = i;
      stack.push(char);
      continue;
    }

    if (char !== "}" && char !== "]") continue;
    if (stack.length === 0) continue;

    const last = stack[stack.length - 1];
    const matches = (last === "{" && char === "}") || (last === "[" && char === "]");
    if (!matches) {
      stack.length = 0;
      start = -1;
      continue;
    }

    stack.pop();
    if (stack.length === 0 && start !== -1) {
      fragments.push(text.slice(start, i + 1));
      start = -1;
    }
  }

  return fragments;
}

function parseJsonCandidate(candidate) {
  if (typeof candidate !== "string") return null;

  const trimmed = sanitizeJsonText(candidate).trim();
  if (!trimmed) return null;

  const attempts = [trimmed];
  const withoutTrailingCommas = stripTrailingCommas(trimmed);
  if (withoutTrailingCommas !== trimmed) attempts.push(withoutTrailingCommas);

  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);
      if (typeof parsed === "string") {
        const nested = parseJsonCandidate(parsed);
        if (nested && typeof nested === "object") return nested;
      }
      return parsed;
    } catch {
      // Try next parse strategy.
    }
  }

  return null;
}

export function safeJsonParse(text) {
  if (typeof text !== "string") return null;

  const base = sanitizeJsonText(text).trim();
  if (!base) return null;

  const candidates = [base, stripCodeFence(base)];
  const seen = new Set();

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);

    const direct = parseJsonCandidate(trimmed);
    if (direct && typeof direct === "object") return direct;

    const fragments = extractJsonFragments(trimmed);
    for (const fragment of fragments) {
      const parsedFragment = parseJsonCandidate(fragment);
      if (parsedFragment && typeof parsedFragment === "object") {
        return parsedFragment;
      }
    }
  }

  return null;
}

export function trimContent(content, maxChars) {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= maxChars) return compact;
  return `${compact.slice(0, maxChars)}...`;
}

export function normalizeUrlInput(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildPrompt({ goal, sources }) {
  const limits = {
    keyFacts: 10,
    pricing: 8,
    claims: 10,
    faqs: 8,
    trust: 8,
    entities: 10,
    risks: 5,
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

  const sourceBlocks = sources
    .map(
      (source, index) =>
        `[Source ${index + 1}] URL: ${source.url}\nTitle: ${
          source.title || "Untitled"
        }\nIntent: ${source.intent || "general"}\nContent: ${source.content}`,
    )
    .join("\n\n");

  return `You are Web Flayer, an analyst who produces high-signal executive briefs.
Use only the provided sources. If a field is missing, write "Not found".
Return ONLY valid JSON. No markdown, no commentary.

Goal focus: ${goal}

Brief quality bar:
- prioritize decision-critical facts over general marketing copy.
- include concrete numbers, timelines, constraints, and qualifiers when present.
- keep executive_summary concise and specific.
- avoid duplicates across sections.
- prefer the strongest available evidence and be explicit about uncertainty.

Depth requirements by field:
- one_liner: one sentence with the core positioning + audience.
- executive_summary: 120-180 words; include offer, buyer, pricing posture, trust posture, and key risk.
- key_facts.value: write a concrete 1-2 sentence insight, not a fragment.
- pricing_offers.notes: include billing cadence, trial/guarantee, commitments, or hidden constraints when available.
- claims_proof.proof: explain why the proof is strong, weak, or conditional.
- faqs_policies.answer: include practical implication for a buyer.
- trust_signals.signal: include the reason it increases confidence.
- entities.relevance: explain why this entity matters to strategy or buying decisions.
- risks_gaps: each item should include the consequence if ignored.

Coverage guidance:
- use diverse sources across intents when available (pricing, faq/support, product, trust, legal, about, contact).

Hard limits:
- key_facts: max ${limits.keyFacts}
- pricing_offers: max ${limits.pricing}
- claims_proof: max ${limits.claims}
- faqs_policies: max ${limits.faqs}
- trust_signals: max ${limits.trust}
- entities: max ${limits.entities}
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
  temperature = 0.2,
  timeoutMs = 180000,
}) {
  const hasAbortController = typeof AbortController !== "undefined";
  const hasTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0;
  const controller = hasAbortController && hasTimeout ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => {
        controller.abort();
      }, timeoutMs)
    : null;

  let response;
  try {
    response = await fetchFn(CLAUDE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller?.signal,
    });
  } catch (error) {
    if (timer) clearTimeout(timer);
    const isAbortError = error?.name === "AbortError";
    return {
      ok: false,
      data: {
        error: isAbortError ? "Claude request timed out." : "Claude request failed.",
        detail: isString(error?.message) ? error.message : "Unknown request error",
        timeout_ms: isAbortError ? timeoutMs : undefined,
      },
    };
  }

  if (timer) clearTimeout(timer);

  const data = await safeReadJson(response);
  if (!response.ok) {
    return { ok: false, data };
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .map((item) => (typeof item?.text === "string" ? item.text : ""))
        .join("\n")
        .trim()
    : "";

  const stopReason = isString(data?.stop_reason) ? data.stop_reason : null;
  const usage = data?.usage && typeof data.usage === "object" ? data.usage : null;

  return { ok: true, data: { text, stopReason, usage } };
}

export function isString(value) {
  return typeof value === "string";
}

export function normalizeUrl(page) {
  return page?.metadata?.sourceURL || page?.metadata?.url || page?.url || "Unknown URL";
}

export function normalizeTitle(page) {
  return page?.metadata?.title || "";
}

export function scoreUrl(url) {
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

export function parseQuery(req) {
  if (req?.query && typeof req.query === "object") return req.query;
  const url = new URL(req?.url || "/", "http://localhost");
  const query = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
}

export function getId(req) {
  const query = parseQuery(req);
  if (typeof query.id === "string" && query.id) return query.id;

  const url = new URL(req?.url || "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length >= 3 && parts[0] === "api" && parts[1] === "flay") {
    return parts[2];
  }
  return null;
}
