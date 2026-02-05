import { describe, expect, it } from "vitest";
import {
  buildPrompt,
  getId,
  isValidHttpUrl,
  normalizeUrlInput,
  parseQuery,
  safeJsonParse,
  safeReadJson,
  scoreUrl,
  trimContent,
} from "../api/flay/lib";

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

  it("reads json responses safely", async () => {
    const ok = await safeReadJson({ text: async () => '{"ok":true}' });
    expect(ok).toEqual({ ok: true });

    const bad = await safeReadJson({ text: async () => "not json" });
    expect((bad as { _raw: string })._raw).toBe("not json");
  });

  it("builds prompts with goal and sources", () => {
    const prompt = buildPrompt({
      goal: "Pricing & Offers",
      mode: "executive",
      sources: [
        {
          url: "https://example.com/pricing",
          title: "Pricing",
          content: "Plan A is $10/month.",
        },
      ],
    });

    expect(prompt).toContain("Goal focus: Pricing & Offers");
    expect(prompt).toContain("Mode: executive");
    expect(prompt).toContain("[Source 1]");
    expect(prompt).toContain("https://example.com/pricing");
  });

  it("scores urls by intent", () => {
    expect(scoreUrl("https://example.com/pricing")).toBeGreaterThanOrEqual(4);
    expect(scoreUrl("https://example.com/blog/post")).toBeGreaterThanOrEqual(1);
  });

  it("parses query params from request", () => {
    const query = parseQuery({ url: "/api/flay/abc?mode=thorough&goal=Test" });
    expect(query.mode).toBe("thorough");
    expect(query.goal).toBe("Test");
  });

  it("extracts ids from query or path", () => {
    expect(getId({ query: { id: "fromQuery" } })).toBe("fromQuery");
    expect(getId({ url: "/api/flay/fromPath" })).toBe("fromPath");
    expect(getId({ url: "/api/other" })).toBeNull();
  });
});
