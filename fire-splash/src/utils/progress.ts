export type FlayStatus = "idle" | "starting" | "crawling" | "extracting" | "done" | "error";

export type ProgressState = { completed: number; total: number } | null;

export function getProgressPercent(progress: ProgressState) {
  if (!progress) return null;
  if (!progress.total || progress.total <= 0) return null;
  return Math.min(100, Math.round((progress.completed / progress.total) * 100));
}

export function getDisplayPercent({
  isBusy,
  progressPercent,
  uiProgress,
}: {
  isBusy: boolean;
  progressPercent: number | null;
  uiProgress: number;
}) {
  if (!isBusy) return null;
  const actual = progressPercent ?? 0;
  return Math.min(99, Math.max(uiProgress, actual));
}

export function getStatusLabel(status: FlayStatus) {
  if (status === "starting") return "Starting crawl...";
  if (status === "crawling") return "Crawling pages...";
  if (status === "extracting") return "Extracting the brief...";
  if (status === "done") return "Brief ready.";
  if (status === "error") return "Something went wrong.";
  return "Ready.";
}

export function nextOptimisticProgress({
  current,
  actual,
  status,
}: {
  current: number;
  actual: number | null;
  status: FlayStatus;
}) {
  const normalizedActual = actual ?? 0;
  let next = Math.max(current, normalizedActual);
  const cap = status === "extracting" ? 99 : status === "crawling" ? 93 : 18;

  if (next < cap) {
    const remaining = cap - next;
    const delta =
      status === "starting"
        ? Math.min(4, remaining)
        : Math.max(0.2, remaining / (status === "extracting" ? 18 : 35));
    next = Math.min(cap, next + delta);
  }

  return Math.round(next * 10) / 10;
}
