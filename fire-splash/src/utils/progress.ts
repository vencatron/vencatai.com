export type FlayStatus = "idle" | "starting" | "crawling" | "extracting" | "done" | "error";

export type ProgressState = { completed: number; total: number } | null;

export const SIMULATED_PROGRESS_DURATION_MS = 105000;
const SIMULATED_MIN_PROGRESS = 2;
const SIMULATED_MAX_PROGRESS = 99;

const BUSY_PHASES = [
  { startPercent: 0, label: "Extracting page signals...", phase: "Phase 1 of 6" },
  { startPercent: 16, label: "Scanning into memory...", phase: "Phase 2 of 6" },
  { startPercent: 33, label: "Analyzing meaning...", phase: "Phase 3 of 6" },
  { startPercent: 50, label: "Cross-checking claims...", phase: "Phase 4 of 6" },
  { startPercent: 68, label: "Drafting executive brief...", phase: "Phase 5 of 6" },
  { startPercent: 84, label: "Finalizing report format...", phase: "Phase 6 of 6" },
] as const;

const getBusyPhase = (displayPercent: number | null) => {
  const percent = Math.max(
    SIMULATED_MIN_PROGRESS,
    Math.min(SIMULATED_MAX_PROGRESS, displayPercent ?? SIMULATED_MIN_PROGRESS),
  );

  return BUSY_PHASES.reduce(
    (active, candidate) => (percent >= candidate.startPercent ? candidate : active),
    BUSY_PHASES[0],
  );
};

const formatDuration = (totalMs: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function getProgressPercent(progress: ProgressState) {
  if (!progress) return null;
  if (!progress.total || progress.total <= 0) return null;
  return Math.min(100, Math.round((progress.completed / progress.total) * 100));
}

export function getDisplayPercent({
  isBusy,
  uiProgress,
}: {
  isBusy: boolean;
  uiProgress: number;
}) {
  if (!isBusy) return null;
  return Math.min(
    SIMULATED_MAX_PROGRESS,
    Math.max(SIMULATED_MIN_PROGRESS, Math.round(uiProgress * 10) / 10),
  );
}

export function getStatusLabel(status: FlayStatus, displayPercent: number | null = null) {
  if (status === "starting" || status === "crawling" || status === "extracting") {
    return getBusyPhase(displayPercent).label;
  }
  if (status === "done") return "Brief ready.";
  if (status === "error") return "Something went wrong.";
  return "Ready.";
}

export function getStatusPhaseLabel(status: FlayStatus, displayPercent: number | null = null) {
  if (status === "starting" || status === "crawling" || status === "extracting") {
    return getBusyPhase(displayPercent).phase;
  }
  if (status === "done") return "Complete";
  if (status === "error") return "Failed";
  return "Standby";
}

export function getSimulatedTimer(elapsedMs: number) {
  const clampedElapsed = Math.min(Math.max(0, elapsedMs), SIMULATED_PROGRESS_DURATION_MS);
  return `${formatDuration(clampedElapsed)} / ${formatDuration(SIMULATED_PROGRESS_DURATION_MS)}`;
}

export function nextOptimisticProgress({
  current,
  startedAtMs,
  nowMs = Date.now(),
}: {
  current: number;
  startedAtMs: number;
  nowMs?: number;
}) {
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const progressRatio = Math.min(1, elapsedMs / SIMULATED_PROGRESS_DURATION_MS);
  const easedRatio = 1 - (1 - progressRatio) ** 1.08;
  const target =
    SIMULATED_MIN_PROGRESS +
    easedRatio * (SIMULATED_MAX_PROGRESS - SIMULATED_MIN_PROGRESS);

  return Math.round(Math.max(current, target) * 10) / 10;
}
