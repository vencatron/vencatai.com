import { describe, expect, it } from "vitest";
import {
  getDisplayPercent,
  getProgressPercent,
  getStatusLabel,
  nextOptimisticProgress,
} from "../src/utils/progress";

describe("progress utils", () => {
  it("computes progress percent safely", () => {
    expect(getProgressPercent(null)).toBeNull();
    expect(getProgressPercent({ completed: 1, total: 0 })).toBeNull();
    expect(getProgressPercent({ completed: 2, total: 10 })).toBe(20);
    expect(getProgressPercent({ completed: 5, total: 3 })).toBe(100);
  });

  it("computes display percent for busy states", () => {
    expect(
      getDisplayPercent({ isBusy: false, progressPercent: 50, uiProgress: 10 }),
    ).toBeNull();
    expect(
      getDisplayPercent({ isBusy: true, progressPercent: 20, uiProgress: 10 }),
    ).toBe(20);
    expect(
      getDisplayPercent({ isBusy: true, progressPercent: null, uiProgress: 5 }),
    ).toBe(5);
    expect(
      getDisplayPercent({ isBusy: true, progressPercent: 120, uiProgress: 120 }),
    ).toBe(99);
  });

  it("returns human status labels", () => {
    expect(getStatusLabel("starting")).toBe("Starting crawl...");
    expect(getStatusLabel("crawling")).toBe("Crawling pages...");
    expect(getStatusLabel("extracting")).toBe("Extracting the brief...");
    expect(getStatusLabel("done")).toBe("Brief ready.");
    expect(getStatusLabel("error")).toBe("Something went wrong.");
    expect(getStatusLabel("idle")).toBe("Ready.");
  });

  it("advances optimistic progress", () => {
    expect(
      nextOptimisticProgress({ current: 0, actual: null, status: "starting" }),
    ).toBe(4);
    expect(
      nextOptimisticProgress({ current: 50, actual: 60, status: "crawling" }),
    ).toBeCloseTo(60.9, 1);
    expect(
      nextOptimisticProgress({ current: 98, actual: 99, status: "extracting" }),
    ).toBe(99);
  });
});
