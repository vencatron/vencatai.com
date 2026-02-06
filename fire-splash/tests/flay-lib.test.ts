import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  firecrawlRequest,
  getId,
  isValidHttpUrl,
  normalizeUrlInput,
  parseQuery,
  safeJsonParse,
  safeReadJson,
  scoreUrl,
  trimContent,
} from "../api/flay/lib.js";

describe("flay lib", () => {
  it("normalizes urls", () => {
    expect(normalizeUrlInput("example.com")).toBe("https://example.com");
    expect(normalizeUrlInput("https://example.com")).toBe("https://example.com");
    expect(normalizeUrlInput(" ")).toBe("");
  });

  it("validates http urls", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  it("trims content and bounds length", () => {
    expect(trimContent("  a   b  c  ", 100)).toBe("a b c");
    expect(trimContent("hello world", 5)).toBe("hello...");
  });

  it("parses json safely", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse("noise {\"b\":2} trailing")).toEqual({ b: 2 });
    expect(safeJsonParse("no json here")).toBeNull();
  });

  it("parses fenced json with trailing commas", () => {
    const payload = "```json\n{\n  \"a\": 1,\n  \"b\": [\"x\", \"y\",],\n}\n```";
    expect(safeJsonParse(payload)).toEqual({ a: 1, b: ["x", "y"] });
  });

  it("parses nested json string payloads", () => {
    const wrapped = '"{\\"title\\":\\"Example\\",\\"key_facts\\":[]}"';
    expect(safeJsonParse(wrapped)).toEqual({ title: "Example", key_facts: [] });
  });

  it("reads json responses safely", async () => {
    const ok = await safeReadJson({ text: async () => '{"ok":true}' });
    expect(ok).toEqual({ ok: true });

    const bad = await safeReadJson({ text: async () => "not json" });
    expect((bad as { _raw: string })._raw).toBe("not json");
  });

  it("builds prompts with goal and sources", () => {
    const prompt = buildPrompt({
      goal: "Pricing & Offers",
      sources: [
        {
          url: "https://example.com/pricing",
          title: "Pricing",
          intent: "pricing",
          content: "Plan A is $10/month.",
        },
      ],
    });

    expect(prompt).toContain("Goal focus: Pricing & Offers");
    expect(prompt).toContain("Brief quality bar:");
    expect(prompt).toContain("- entities: max 10");
    expect(prompt).toContain("[Source 1]");
    expect(prompt).toContain("Intent: pricing");
    expect(prompt).toContain("https://example.com/pricing");
  });

  it("scores urls by intent", () => {
    expect(scoreUrl("https://example.com/pricing")).toBeGreaterThanOrEqual(4);
    expect(scoreUrl("https://example.com/blog/post")).toBeGreaterThanOrEqual(1);
  });

  it("parses query params from request", () => {
    const query = parseQuery({ url: "/api/flay/abc?extract=1&goal=Test" });
    expect(query.extract).toBe("1");
    expect(query.goal).toBe("Test");
  });

  it("extracts ids from query or path", () => {
    expect(getId({ query: { id: "fromQuery" } })).toBe("fromQuery");
    expect(getId({ url: "/api/flay/fromPath" })).toBe("fromPath");
    expect(getId({ url: "/api/other" })).toBeNull();
  });

  it("handles successful firecrawl requests", async () => {
    const fetchFn = async () => ({
      ok: true,
      status: 200,
      text: async () => '{"id":"job_123"}',
    });

    const result = await firecrawlRequest({
      fetchFn,
      url: "https://api.firecrawl.dev/v2/crawl",
      apiKey: "test",
      method: "POST",
      body: { url: "https://example.com" },
      retries: 0,
    });

    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.attempts).toBe(1);
    expect((result.data as any).id).toBe("job_123");
  });

  it("retries retryable firecrawl failures", async () => {
    let calls = 0;
    const fetchFn = async () => {
      calls += 1;
      if (calls === 1) {
        return {
          ok: false,
          status: 500,
          text: async () => '{"error":"temporary"}',
        };
      }
      return {
        ok: true,
        status: 200,
        text: async () => '{"id":"job_456"}',
      };
    };

    const result = await firecrawlRequest({
      fetchFn,
      url: "https://api.firecrawl.dev/v2/crawl/job_456",
      apiKey: "test",
      retries: 1,
      retryBaseDelayMs: 1,
    });

    expect(result.ok).toBe(true);
    expect(result.attempts).toBe(2);
    expect(calls).toBe(2);
    expect((result.data as any).id).toBe("job_456");
  });

  it("surfaces timeout errors from firecrawl requests", async () => {
    const fetchFn = async () => {
      const error = new Error("request aborted");
      (error as any).name = "AbortError";
      throw error;
    };

    const result = await firecrawlRequest({
      fetchFn,
      url: "https://api.firecrawl.dev/v2/crawl/job_timeout",
      apiKey: "test",
      retries: 0,
      timeoutMs: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(1);
    expect((result.data as any).error).toContain("timed out");
    expect((result.data as any).timeout_ms).toBe(10);
  });
});
