import { useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { jsPDF } from "jspdf";
import { DoomFire } from "@/components/DoomFire";
import {
  getDisplayPercent,
  getProgressPercent,
  getStatusLabel,
  nextOptimisticProgress,
} from "@/utils/progress";
import type { FlayStatus, ProgressState } from "@/utils/progress";

// Globe icon for URL input
const GlobeIcon = () => (
  <svg
    className="w-5 h-5 text-white/40"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Icon components for feature cards
const ClockIcon = () => (
  <svg
    className="w-8 h-8 text-warning"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaginationIcon = () => (
  <svg
    className="w-8 h-8 text-success"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ApiIcon = () => (
  <svg
    className="w-8 h-8 text-primary"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GOALS = [
  "Competitor Snapshot",
  "Pricing & Offers",
  "FAQ Digest",
  "Trust Signals",
  "Team & Contact",
  "Press Kit",
] as const;

const MODES = [
  { label: "Executive", value: "executive" },
  { label: "Thorough", value: "thorough" },
] as const;

type FlayMode = (typeof MODES)[number]["value"];

type FlayResult = {
  title?: string;
  one_liner?: string;
  executive_summary?: string;
  key_facts?: { label: string; value: string; source_url: string; evidence: string }[];
  pricing_offers?: {
    plan: string;
    price: string;
    notes: string;
    source_url: string;
    evidence: string;
  }[];
  claims_proof?: {
    claim: string;
    proof: string;
    source_url: string;
    evidence: string;
  }[];
  faqs_policies?: {
    question: string;
    answer: string;
    source_url: string;
    evidence: string;
  }[];
  trust_signals?: { signal: string; source_url: string; evidence: string }[];
  risks_gaps?: string[];
  sources?: { url: string; title?: string }[];
};

export default function IndexPage() {
  const [urlInput, setUrlInput] = useState("");
  const [goal, setGoal] = useState<(typeof GOALS)[number]>("Competitor Snapshot");
  const [mode, setMode] = useState<FlayMode>("executive");
  const [status, setStatus] = useState<FlayStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlayResult | null>(null);
  const [pagesUsed, setPagesUsed] = useState<number | null>(null);
  const [progress, setProgress] = useState<ProgressState>(null);
  const [uiProgress, setUiProgress] = useState(0);

  const isBusy = status === "starting" || status === "crawling" || status === "extracting";

  const progressPercent = useMemo(() => getProgressPercent(progress), [progress]);

  const displayPercent = useMemo(
    () =>
      getDisplayPercent({
        isBusy,
        progressPercent,
        uiProgress,
      }),
    [isBusy, progressPercent, uiProgress],
  );

  const statusLabel = useMemo(() => getStatusLabel(status), [status]);

  useEffect(() => {
    if (!isBusy) return;

    const tickMs = 450;
    const timer = window.setInterval(() => {
      setUiProgress((current) =>
        nextOptimisticProgress({
          current,
          actual: progressPercent,
          status,
        }),
      );
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [isBusy, progressPercent, status]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isBusy) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isBusy]);

  useEffect(() => {
    if (!isBusy) {
      document.title = "Web Flayer";
      return;
    }

    if (status === "crawling" && progress && progress.total) {
      document.title = `Web Flayer (${progress.completed}/${progress.total})`;
      return;
    }

    document.title = "Web Flayer (Flaying...)";
  }, [isBusy, progress, status]);

  const formatApiError = (data: any, fallback: string) => {
    const parts: string[] = [];
    if (typeof data?.error === "string") parts.push(data.error);
    if (typeof data?.detail === "string") parts.push(data.detail);
    if (typeof data?.detail?.message === "string") parts.push(data.detail.message);
    if (typeof data?.detail?.error === "string") parts.push(data.detail.error);
    if (typeof data?.raw === "string") parts.push(data.raw);
    const message = parts.filter(Boolean).join(" | ");
    return message || fallback;
  };

  const readResponseBody = async (response: Response) => {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return { data: await response.json(), rawText: null };
      } catch {
        // fall through to text
      }
    }
    const text = await response.text();
    return { data: null, rawText: text };
  };

  const startFlay = async (overrideUrl?: string | null) => {
    const safeOverride = typeof overrideUrl === "string" ? overrideUrl : null;
    let targetUrl = safeOverride ? safeOverride.trim() : urlInput.trim();
    if (!targetUrl) {
      setError("Add a URL to flay.");
      setStatus("error");
      return;
    }
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    setError(null);
    setResult(null);
    setPagesUsed(null);
    setProgress(null);
    setUiProgress(2);
    setStatus("starting");

    try {
      const response = await fetch("/api/flay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, goal, mode }),
      });
      const { data, rawText } = await readResponseBody(response);
      if (!response.ok) {
        if (rawText) {
          throw new Error(`API error: ${rawText.slice(0, 200)}`);
        }
        throw new Error(formatApiError(data, "Unable to start crawl."));
      }
      if (data?.result) {
        setResult(data.result);
        setPagesUsed(data?.meta?.pages_used ?? null);
        setStatus("done");
        return;
      }
      if (!data?.jobId) {
        throw new Error("No crawl job returned.");
      }
      setStatus("crawling");
      pollStatus(data.jobId, 0);
    } catch (err: any) {
      setError(err?.message || "Unable to start crawl.");
      setStatus("error");
    }
  };

  const fetchExtraction = async (id: string) => {
    const response = await fetch(
      `/api/flay/${id}?extract=1&mode=${mode}&goal=${encodeURIComponent(goal)}`,
    );
    const { data, rawText } = await readResponseBody(response);
    if (!response.ok) {
      if (rawText) {
        throw new Error(`API error: ${rawText.slice(0, 200)}`);
      }
      throw new Error(formatApiError(data, "Extraction failed."));
    }
    if (!data?.result) {
      throw new Error("No result returned.");
    }
    return data;
  };

  const pollStatus = async (id: string, attempt: number) => {
    try {
      const response = await fetch(
        `/api/flay/${id}?mode=${mode}&goal=${encodeURIComponent(goal)}`,
      );
      const { data, rawText } = await readResponseBody(response);
      if (!response.ok) {
        if (rawText) {
          throw new Error(`API error: ${rawText.slice(0, 200)}`);
        }
        throw new Error(formatApiError(data, "Status check failed."));
      }

      if (data?.status && data.status !== "completed") {
        if (data.status === "failed") {
          throw new Error("Crawl failed.");
        }
        setStatus("crawling");
        if (typeof data?.completed === "number" && typeof data?.total === "number") {
          setProgress({ completed: data.completed, total: data.total });
        }
        if (attempt < 60) {
          setTimeout(() => pollStatus(id, attempt + 1), 2500);
        } else {
          throw new Error("Crawl timed out.");
        }
        return;
      }

      if (data?.status === "completed") {
        if (typeof data?.completed === "number" && typeof data?.total === "number") {
          setProgress({ completed: data.completed, total: data.total });
        }
        setStatus("extracting");
        const extraction = await fetchExtraction(id);
        setResult(extraction.result);
        setPagesUsed(extraction?.meta?.pages_used ?? null);
        setStatus("done");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to fetch result.");
      setStatus("error");
    }
  };

  const downloadPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addPageIfNeeded = (height: number) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addHeading = (text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      addPageIfNeeded(24);
      doc.text(text, margin, y);
      y += 24;
    };

    const addSubheading = (text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      addPageIfNeeded(18);
      doc.text(text, margin, y);
      y += 18;
    };

    const addBody = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        addPageIfNeeded(14);
        doc.text(line, margin, y);
        y += 14;
      });
      y += 6;
    };

    const addList = (items: string[]) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, maxWidth);
        lines.forEach((line: string) => {
          addPageIfNeeded(14);
          doc.text(line, margin, y);
          y += 14;
        });
      });
      y += 6;
    };

    addHeading(result.title || "Web Flayer Brief");
    addBody(result.one_liner || "");
    addBody(result.executive_summary || "");

    if (result.key_facts?.length) {
      addSubheading("Key Facts");
      addList(result.key_facts.map((fact) => `${fact.label}: ${fact.value}`));
    }

    if (result.pricing_offers?.length) {
      addSubheading("Pricing & Offers");
      addList(
        result.pricing_offers.map(
          (offer) => `${offer.plan}: ${offer.price} ${offer.notes || ""}`.trim(),
        ),
      );
    }

    if (result.claims_proof?.length) {
      addSubheading("Claims & Proof");
      addList(
        result.claims_proof.map((claim) => `${claim.claim} (${claim.proof})`),
      );
    }

    if (result.faqs_policies?.length) {
      addSubheading("FAQs & Policies");
      addList(
        result.faqs_policies.map((faq) => `Q: ${faq.question} A: ${faq.answer}`),
      );
    }

    if (result.trust_signals?.length) {
      addSubheading("Trust Signals");
      addList(result.trust_signals.map((signal) => signal.signal));
    }

    if (result.risks_gaps?.length) {
      addSubheading("Risks & Gaps");
      addList(result.risks_gaps);
    }

    if (result.sources?.length) {
      addSubheading("Sources");
      addList(result.sources.map((source) => source.url));
    }

    doc.save("web-flayer-brief.pdf");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden">
      {/* Background Layer */}
      <DoomFire />

      {isBusy ? (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-white/10 overflow-hidden">
            <div
              className={[
                "h-full",
                status === "extracting" ? "bg-primary/80" : "bg-warning/80",
                "transition-[width] duration-500 ease-out",
              ].join(" ")}
              style={{
                width: `${Math.max(8, displayPercent ?? 8)}%`,
              }}
            />
          </div>
          <div className="px-4 py-2 bg-black/50 border-b border-white/10 backdrop-blur-md">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <p className="text-[10px] text-white/60 font-mono tracking-[0.25em] uppercase">
                {statusLabel}
              </p>
              <p className="text-[10px] text-white/40 font-mono tracking-[0.25em] uppercase">
                {status === "crawling" && progress
                  ? `${progress.completed}/${progress.total || "?"} pages`
                  : status === "extracting"
                    ? "Generating brief"
                    : "Working"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <main className="relative z-10 w-full max-w-5xl px-6 flex flex-col gap-14 items-center">

        {/* Hero Section */}
        <section className="text-center">
          <p className="text-sm md:text-base text-white/40 font-mono tracking-[0.3em] uppercase mb-2">
            Vencat
          </p>
          <h1
            className="text-6xl md:text-8xl font-black tracking-widest text-white mb-4 mix-blend-difference"
            style={{ fontFamily: '"Michroma", sans-serif' }}
          >
            WEB FLAYER
          </h1>
          <p className="text-lg md:text-2xl text-white/70 font-mono tracking-widest uppercase mb-4">
            Turn any webpage into a one-page brief.
          </p>
          <p className="text-base md:text-lg text-white/50 font-mono tracking-[0.2em] uppercase mb-8">
            Context. Claims. Proof. No code.
          </p>

          {/* URL Input Bar */}
          <div className="w-full max-w-2xl mb-8">
            <div className="flex gap-0">
              <Input
                classNames={{
                  base: "flex-1",
                  mainWrapper: "h-full",
                  input: "text-sm !text-white caret-white placeholder:!text-white/50",
                  inputWrapper: [
                    "h-12",
                    "bg-black/40",
                    "border",
                    "border-white/10",
                    "border-r-0",
                    "rounded-none",
                    "rounded-l-lg",
                    "backdrop-blur-md",
                    "hover:bg-black/50",
                    "group-data-[focus=true]:bg-black/50",
                    "group-data-[focus=true]:!bg-black/50",
                    "!cursor-text",
                  ].join(" "),
                }}
                placeholder="https://example.com/products"
                startContent={<GlobeIcon />}
                type="text"
                inputMode="url"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
              />
              <Button
                className="h-12 font-bold rounded-none rounded-r-lg px-8 tracking-wider"
                color="warning"
                size="lg"
                variant="shadow"
                isDisabled={isBusy}
                onPress={() => startFlay()}
              >
                {isBusy ? "FLAYING..." : "GENERATE BRIEF"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex flex-wrap justify-center gap-2">
              {GOALS.map((item) => {
                const isActive = goal === item;
                return (
                  <Chip
                    key={item}
                    onClick={() => {
                      if (!isBusy) setGoal(item);
                    }}
                    classNames={{
                      base: [
                        "border",
                        "transition-colors",
                        "cursor-pointer",
                        isActive
                          ? "bg-warning/30 border-warning/60"
                          : "bg-black/40 border-white/10 hover:bg-white/10",
                      ].join(" "),
                      content: [
                        "text-xs font-mono tracking-wider",
                        isActive ? "text-warning-200" : "text-white/70",
                      ].join(" "),
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    {item}
                  </Chip>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {MODES.map((item) => {
                const isActive = mode === item.value;
                return (
                  <Button
                    key={item.value}
                    size="sm"
                    variant={isActive ? "shadow" : "bordered"}
                    color={isActive ? "warning" : "default"}
                    className="rounded-none tracking-widest uppercase"
                    onPress={() => setMode(item.value)}
                    isDisabled={isBusy}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mb-8">
            <p className="text-xs text-white/50 font-mono tracking-[0.2em] uppercase">
              {statusLabel}
              {pagesUsed ? ` (${pagesUsed} pages)` : ""}
            </p>
            {progress ? (
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between text-[10px] text-white/40 font-mono uppercase tracking-widest mb-2">
                  <span>
                    {progress.completed}/{progress.total || "?"} pages
                  </span>
                  <span>
                    {displayPercent !== null ? `${Math.round(displayPercent)}%` : "Calculating"}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-warning/70 transition-[width] duration-500 ease-out"
                    style={{
                      width: `${Math.max(8, displayPercent ?? 8)}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
            {error ? (
              <p className="text-xs text-danger-400 font-mono tracking-[0.2em] uppercase">
                {error}
              </p>
            ) : null}
          </div>

          
        </section>

        {isBusy && !result ? (
          <section className="w-full">
            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-5 px-5 flex-col items-start gap-2">
                <p className="text-tiny uppercase font-bold text-warning/80">
                  Web Flayer is working
                </p>
                <h4 className="font-bold text-xl text-white">
                  Keep this tab open. We'll finish the brief here.
                </h4>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                  {statusLabel}
                </p>
              </CardHeader>
              <CardBody className="overflow-visible py-5">
                <div className="w-full">
                  <div className="flex items-center justify-between text-[10px] text-white/40 font-mono uppercase tracking-widest mb-2">
                    <span>
                      {status === "crawling" && progress
                        ? `${progress.completed}/${progress.total || "?"} pages`
                        : status === "extracting"
                          ? "Generating"
                          : "Starting"}
                    </span>
                    <span>
                      {displayPercent !== null
                        ? `${Math.round(displayPercent)}%`
                        : "Working"}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={[
                        "h-full",
                        status === "extracting" ? "bg-primary/70" : "bg-warning/70",
                        "transition-[width] duration-500 ease-out",
                      ].join(" ")}
                      style={{ width: `${Math.max(8, displayPercent ?? 8)}%` }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">
                      Step 1
                    </p>
                    <p className="text-sm text-white/80 font-semibold">Map the site</p>
                    <p className="text-xs text-white/40 mt-2">
                      We find the pages that matter (pricing, FAQ, proof, policies).
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">
                      Step 2
                    </p>
                    <p className="text-sm text-white/80 font-semibold">Extract meaning</p>
                    <p className="text-xs text-white/40 mt-2">
                      Claude turns messy pages into structured facts with citations.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-4">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest mb-1">
                      Step 3
                    </p>
                    <p className="text-sm text-white/80 font-semibold">Format the brief</p>
                    <p className="text-xs text-white/40 mt-2">
                      We render a clean report you can share or export as PDF.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>
        ) : null}

        {result ? (
          <section className="w-full">
            <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-5">
              Web Flayer brief
            </p>
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <Card className="bg-black/50 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-5 px-5 flex-col items-start gap-2">
                  <p className="text-tiny uppercase font-bold text-warning/80">
                    Executive summary
                  </p>
                  <h4 className="font-bold text-2xl text-white">
                    {result.title || "Web Flayer Brief"}
                  </h4>
                  {result.one_liner ? (
                    <p className="text-xs text-white/50 font-mono uppercase tracking-widest">
                      {result.one_liner}
                    </p>
                  ) : null}
                </CardHeader>
                <CardBody className="overflow-visible py-5">
                  <p className="text-default-300 text-sm leading-relaxed">
                    {result.executive_summary || "No summary returned yet."}
                  </p>
                </CardBody>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                  <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <p className="text-tiny uppercase font-bold text-success/80">Key facts</p>
                    <h4 className="font-bold text-large text-white">What matters fast</h4>
                  </CardHeader>
                  <CardBody className="overflow-visible py-4">
                    <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                      {(result.key_facts || []).map((fact) => (
                        <li key={`${fact.label}-${fact.value}`}>
                          {fact.label}: {fact.value}
                        </li>
                      ))}
                      {(result.key_facts || []).length === 0 ? (
                        <li>No key facts found.</li>
                      ) : null}
                    </ul>
                  </CardBody>
                </Card>

                <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                  <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <p className="text-tiny uppercase font-bold text-primary/80">
                      Pricing & offers
                    </p>
                    <h4 className="font-bold text-large text-white">Plans and pricing</h4>
                  </CardHeader>
                  <CardBody className="overflow-visible py-4">
                    <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                      {(result.pricing_offers || []).map((offer) => (
                        <li key={`${offer.plan}-${offer.price}`}>
                          {offer.plan}: {offer.price} {offer.notes || ""}
                        </li>
                      ))}
                      {(result.pricing_offers || []).length === 0 ? (
                        <li>No pricing details found.</li>
                      ) : null}
                    </ul>
                  </CardBody>
                </Card>

                <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                  <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                    <p className="text-tiny uppercase font-bold text-warning/80">Claims</p>
                    <h4 className="font-bold text-large text-white">Claims & proof</h4>
                  </CardHeader>
                  <CardBody className="overflow-visible py-4">
                    <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                      {(result.claims_proof || []).map((claim) => (
                        <li key={`${claim.claim}-${claim.proof}`}>
                          {claim.claim} ({claim.proof})
                        </li>
                      ))}
                      {(result.claims_proof || []).length === 0 ? (
                        <li>No claims captured.</li>
                      ) : null}
                    </ul>
                  </CardBody>
                </Card>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 w-full mt-6">
              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-success/80">FAQ</p>
                  <h4 className="font-bold text-large text-white">FAQs & policies</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    {(result.faqs_policies || []).map((faq) => (
                      <li key={`${faq.question}-${faq.answer}`}>
                        {faq.question}: {faq.answer}
                      </li>
                    ))}
                    {(result.faqs_policies || []).length === 0 ? (
                      <li>No FAQs found.</li>
                    ) : null}
                  </ul>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-primary/80">Signals</p>
                  <h4 className="font-bold text-large text-white">Trust signals</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    {(result.trust_signals || []).map((signal) => (
                      <li key={`${signal.signal}-${signal.source_url}`}>
                        {signal.signal}
                      </li>
                    ))}
                    {(result.trust_signals || []).length === 0 ? (
                      <li>No trust signals found.</li>
                    ) : null}
                  </ul>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-warning/80">Risks</p>
                  <h4 className="font-bold text-large text-white">Risks & gaps</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    {(result.risks_gaps || []).map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                    {(result.risks_gaps || []).length === 0 ? (
                      <li>No risks captured.</li>
                    ) : null}
                  </ul>
                </CardBody>
              </Card>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                size="lg"
                color="warning"
                variant="shadow"
                className="font-bold rounded-none px-12 tracking-widest"
                onPress={downloadPdf}
              >
                DOWNLOAD PDF
              </Button>
            </div>
          </section>
        ) : null}

        {/* Pick a Goal */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-5">
            Pick a goal, not a template
          </p>
          <div className="grid md:grid-cols-3 gap-6 w-full">
            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-warning/80">Popular</p>
                <h4 className="font-bold text-large text-white">Competitor Snapshot</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  What they sell, who it's for, why it wins, and how to beat it.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-success/80">Sales</p>
                <h4 className="font-bold text-large text-white">Pricing & Offers</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Plans, price points, trials, guarantees, and hidden fees.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-primary/80">Support</p>
                <h4 className="font-bold text-large text-white">FAQ Digest</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  The top questions, policies, and objections answered in plain language.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-warning/80">Marketing</p>
                <h4 className="font-bold text-large text-white">Trust Signals</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Testimonials, customer logos, claims, and proof that builds credibility.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-success/80">Ops</p>
                <h4 className="font-bold text-large text-white">Team & Contact</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Key people, emails, socials, locations, and how to get a response.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <p className="text-tiny uppercase font-bold text-primary/80">Press</p>
                <h4 className="font-bold text-large text-white">Press Kit</h4>
              </CardHeader>
              <CardBody className="overflow-visible py-4">
                <p className="text-default-400 text-sm">
                  Boilerplate, mission, product lines, and the story journalists need.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Output Preview */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-5">
            Output preview
          </p>
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <Card className="bg-black/50 border border-white/10 backdrop-blur-md shadow-2xl">
              <CardHeader className="pb-0 pt-5 px-5 flex-col items-start gap-1">
                <p className="text-tiny uppercase font-bold text-warning/80">
                  Context brief
                </p>
                <h4 className="font-bold text-2xl text-white">Lumina Desk</h4>
                <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
                  Source: lumina.example - Updated 2 hours ago
                </p>
              </CardHeader>
              <CardBody className="overflow-visible py-5">
                <p className="text-default-300 text-sm leading-relaxed">
                  Lumina sells height-adjustable desks for remote teams and home offices. The
                  positioning centers on reducing back pain and boosting focus, with a clean,
                  minimalist design. Pricing starts at $499 with bundle discounts, and the primary
                  upsell is the cable management + monitor arm kit. Trust signals include 4.8
                  reviews, 50k+ desks shipped, and a 5-year warranty.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Target: Remote teams
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Price: $499+
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Trial: 30 days
                  </Chip>
                  <Chip
                    classNames={{
                      base: "bg-white/5 border border-white/10",
                      content: "text-white/80 text-xs font-mono tracking-wider",
                    }}
                    size="sm"
                    variant="bordered"
                  >
                    Warranty: 5 years
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-success/80">Key facts</p>
                  <h4 className="font-bold text-large text-white">What matters fast</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    <li>Primary offer: electric standing desks with bundle kits.</li>
                    <li>Main CTA: "Build your desk" with 3-step configurator.</li>
                    <li>Proof: 50k+ units shipped, 4.8 average rating.</li>
                    <li>Risk: shipping 2-3 weeks on larger sizes.</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-primary/80">Entities</p>
                  <h4 className="font-bold text-large text-white">People & brands</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      Lumina Desk
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      FlexTrack Frame
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      5-Year Warranty
                    </Chip>
                    <Chip
                      classNames={{
                        base: "bg-black/40 border border-white/10",
                        content: "text-white/80 text-xs font-mono tracking-wider",
                      }}
                      size="sm"
                      variant="bordered"
                    >
                      Free Shipping
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
                <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                  <p className="text-tiny uppercase font-bold text-warning/80">Signals</p>
                  <h4 className="font-bold text-large text-white">Claims & proof</h4>
                </CardHeader>
                <CardBody className="overflow-visible py-4">
                  <ul className="text-default-400 text-sm list-disc list-inside space-y-2">
                    <li>"Reduces back pain" backed by customer testimonials.</li>
                    <li>"Ships in 48 hours" only for select sizes.</li>
                    <li>"Built for 10 years" paired with a 5-year warranty.</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* Content Section - concise explanation */}
        <section className="grid md:grid-cols-3 gap-6 w-full">
          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-warning/80">Step 1</p>
              <h4 className="font-bold text-large text-white">Paste a URL</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Any webpage works. We read it like a human, not a crawler.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-success/80">Step 2</p>
              <h4 className="font-bold text-large text-white">Choose a goal</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Pick a brief: pricing, competitor, FAQ, trust signals, or press kit.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold text-primary/80">Step 3</p>
              <h4 className="font-bold text-large text-white">Get the brief</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4">
              <p className="text-default-400 text-sm">
                Clean, decision-ready summaries with citations you can trust.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Feature Highlights Section */}
        <section className="grid md:grid-cols-3 gap-6 w-full">
          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <ClockIcon />
              <h4 className="font-bold text-large text-white">Change Alerts</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                Know when pricing, claims, or policies shift without re-checking.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <PaginationIcon />
              <h4 className="font-bold text-large text-white">Multi-Page Coverage</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                We connect product, pricing, and FAQ pages into one brief.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-center gap-2">
              <ApiIcon />
              <h4 className="font-bold text-large text-white">Cited Sources</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-4 text-center">
              <p className="text-default-400 text-sm">
                Every claim links back to the exact page section it came from.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Export Format Selector */}
        <section className="w-full">
          <p className="text-center text-white/40 text-sm font-mono tracking-wider uppercase mb-4">
            Deliverables people actually use
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              One-page brief
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Exec summary
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Sales email draft
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              Meeting notes
            </Chip>
            <Chip
              classNames={{
                base: "bg-black/40 border border-white/10 backdrop-blur-md hover:bg-white/10 cursor-pointer transition-colors",
                content: "text-white/80 font-mono tracking-wider",
              }}
              size="lg"
              variant="bordered"
            >
              FAQ digest
            </Chip>
          </div>
        </section>

        <Divider className="bg-white/10" />

        <p className="text-center text-white/30 text-xs font-mono max-w-md">
          Web context without the complexity. Built for non-technical teams.
        </p>

      </main>

      <footer className="absolute bottom-4 z-10 text-[10px] text-white/10 font-mono tracking-[0.5em]">
        VENCAT WEB FLAYER
      </footer>
    </div>
  );
}
