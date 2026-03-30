import { useEffect, useState, useRef } from 'react';

const FULL_TEXT = "We ship real products — websites, Next.js apps, and cinematic AI videos — built fast, built right, with no templates and no shortcuts. Just frontier models and a keyboard.";

const LINES_BEFORE = [
  { text: '~ vencat.ai', bold: true, color: 'text-cyber-cyan' },
  { text: ' | whoami', color: 'text-slate-400' },
  { text: ' | venture-catalyst-llc', color: 'text-cyber-purple' },
  { text: ' | node --version', color: 'text-slate-400' },
  { text: ' | v25.2.1', color: 'text-emerald-400' },
];

export default function TerminalHero() {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [phase, setPhase] = useState('lines'); // 'lines' | 'typing' | 'done'
  const [visibleLines, setVisibleLines] = useState(0);
  const indexRef = useRef(0);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Phase 1: reveal pre-lines one by one
  useEffect(() => {
    if (phase !== 'lines') return;
    if (visibleLines >= LINES_BEFORE.length) {
      setTimeout(() => setPhase('typing'), 400);
      return;
    }
    const t = setTimeout(() => setVisibleLines(v => v + 1), 260);
    return () => clearTimeout(t);
  }, [phase, visibleLines]);

  // Phase 2: type the main message char by char
  useEffect(() => {
    if (phase !== 'typing') return;
    if (indexRef.current >= FULL_TEXT.length) {
      setPhase('done');
      return;
    }
    // Slightly variable speed for realism
    const char = FULL_TEXT[indexRef.current];
    const delay = char === ' ' ? 55 : char === '.' ? 180 : char === "'" ? 80 : 38;
    const t = setTimeout(() => {
      indexRef.current += 1;
      setDisplayedText(FULL_TEXT.slice(0, indexRef.current));
    }, delay);
    return () => clearTimeout(t);
  });

  return (
    <section className="relative py-16 sm:py-24 flex items-center justify-center overflow-hidden px-5 sm:px-6 lg:px-8">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyber-cyan/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Terminal window */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(10, 10, 20, 0.92)',
            border: '1px solid rgba(0, 245, 255, 0.15)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(0,245,255,0.06)',
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
          >
            {/* Traffic lights */}
            <div className="flex gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Title */}
            <span className="flex-1 text-center text-xs text-slate-500 font-mono tracking-widest">
              venture-catalyst — zsh — 80×24
            </span>
          </div>

          {/* Terminal body */}
          <div className="px-5 py-5 font-mono text-sm sm:text-base leading-relaxed min-h-[220px]">
            {/* Pre-lines */}
            {LINES_BEFORE.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="flex items-start gap-0">
                {line.bold ? (
                  <span className={`font-bold ${line.color ?? 'text-white'}`}>{line.text}</span>
                ) : (
                  <span className={line.color ?? 'text-slate-300'}>{line.text}</span>
                )}
              </div>
            ))}

            {/* Spacer before main typing line */}
            {phase !== 'lines' && <div className="mt-3" />}

            {/* Main typing line */}
            {phase !== 'lines' && (
              <div className="flex items-start">
                {/* Prompt */}
                <span className="text-cyber-cyan font-bold mr-2 flex-shrink-0">❯</span>
                {/* Typed text */}
                <span className="text-white leading-relaxed">
                  {displayedText}
                  {/* Cursor */}
                  <span
                    className="inline-block w-[2px] h-[1.1em] ml-[1px] align-middle bg-cyber-cyan rounded-sm transition-opacity duration-100"
                    style={{ opacity: cursorVisible ? 1 : 0 }}
                  />
                </span>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between px-5 py-2 border-t"
            style={{
              background: 'rgba(0,245,255,0.04)',
              borderColor: 'rgba(0,245,255,0.12)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-500">vencat.ai</span>
            </div>
            <span className="text-xs font-mono text-slate-600">
              {phase === 'done'
                ? `${FULL_TEXT.length} chars`
                : phase === 'typing'
                ? `${displayedText.length} / ${FULL_TEXT.length}`
                : 'initializing...'}
            </span>
          </div>
        </div>

        {/* Subtle label below */}
        <p className="text-center text-xs text-slate-600 mt-4 font-mono tracking-widest uppercase">
          Powered by Claude · Codex · Gemini
        </p>
      </div>
    </section>
  );
}
