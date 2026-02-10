import { describe, expect, it } from "vitest";
import {
  getDisplayPercent,
  getProgressPercent,
  getSimulatedTimer,
  getStatusLabel,
  getStatusPhaseLabel,
  nextOptimisticProgress,
  SIMULATED_PROGRESS_DURATION_MS,
} from "../src/utils/progress";

describe("progress utils", () => {
  it("computes progress percent safely", () => {
    expect(getProgressPercent(null)).toBeNull();
    expect(getProgressPercent({ completed: 1, total: 0 })).toBeNull();
    expect(getProgressPercent({ completed: 2, total: 10 })).toBe(20);
    expect(getProgressPercent({ completed: 5, total: 3 })).toBe(100);
  });

  it("computes display percent for busy states", () => {
    expect(getDisplayPercent({ isBusy: false, uiProgress: 10 })).toBeNull();
    expect(getDisplayPercent({ isBusy: true, uiProgress: 5 })).toBe(5);
    expect(getDisplayPercent({ isBusy: true, uiProgress: 120 })).toBe(99);
    expect(getDisplayPercent({ isBusy: true, uiProgress: 1 })).toBe(2);
  });

  it("returns human status and phase labels", () => {
    expect(getStatusLabel("starting", 2)).toBe("Extracting page signals...");
    expect(getStatusLabel("crawling", 35)).toBe("Analyzing meaning...");
    expect(getStatusLabel("extracting", 90)).toBe("Finalizing report format...");
    expect(getStatusLabel("done")).toBe("Brief ready.");
    expect(getStatusLabel("error")).toBe("Something went wrong.");
    expect(getStatusLabel("idle")).toBe("Ready.");
    expect(getStatusPhaseLabel("extracting", 52)).toBe("Phase 4 of 6");
    expect(getStatusPhaseLabel("done")).toBe("Complete");
  });

  it("advances optimistic progress on a 1 minute 45 second timer", () => {
    expect(
      nextOptimisticProgress({ current: 0, startedAtMs: 1000, nowMs: 1000 }),
    ).toBe(2);
    expect(
      nextOptimisticProgress({
        current: 40,
        startedAtMs: 0,
        nowMs: SIMULATED_PROGRESS_DURATION_MS / 2,
      }),
    ).toBeGreaterThan(50);
    expect(
      nextOptimisticProgress({
        current: 98,
        startedAtMs: 0,
        nowMs: SIMULATED_PROGRESS_DURATION_MS,
      }),
    ).toBe(99);
    expect(
      nextOptimisticProgress({ current: 80, startedAtMs: 0, nowMs: 5000 }),
    ).toBe(80);
  });

  it("formats simulated timer labels", () => {
    expect(getSimulatedTimer(0)).toBe("00:00 / 01:45");
    expect(getSimulatedTimer(SIMULATED_PROGRESS_DURATION_MS)).toBe("01:45 / 01:45");
    expect(getSimulatedTimer(999999)).toBe("01:45 / 01:45");
  });
});
