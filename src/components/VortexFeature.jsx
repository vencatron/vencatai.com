import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Vortex({
  children,
  className,
  containerClassName,
  particleCount = 540,
  rangeY = 420,
  baseHue = 185,
  rangeHue = 140,
  baseSpeed = 0.08,
  rangeSpeed = 1.2,
  baseRadius = 0.8,
  rangeRadius = 2.1,
  backgroundColor = 'rgba(2, 6, 23, 0.94)',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !container || !ctx) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noise3D = createNoise3D();
    const particlePropCount = 9;
    const particlePropsLength = particleCount * particlePropCount;
    const particleProps = new Float32Array(particlePropsLength);
    const center = [0, 0];
    const TAU = 2 * Math.PI;
    const baseTTL = 50;
    const rangeTTL = 150;
    const noiseSteps = 3;
    const xOff = 0.00125;
    const yOff = 0.00125;
    const zOff = 0.0005;
    let tick = 0;
    let width = 0;
    let height = 0;

    const rand = n => n * Math.random();
    const randRange = n => n - rand(2 * n);
    const fadeInOut = (t, m) => {
      const hm = 0.5 * m;
      return Math.abs(((t + hm) % m) - hm) / hm;
    };
    const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      center[0] = width * 0.5;
      center[1] = height * 0.5;
    };

    const initParticle = i => {
      const x = rand(width);
      const y = center[1] + randRange(rangeY);
      const vx = 0;
      const vy = 0;
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const speed = baseSpeed + rand(rangeSpeed);
      const radius = baseRadius + rand(rangeRadius);
      const hue = baseHue + rand(rangeHue);

      particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
    };

    const initParticles = () => {
      tick = 0;
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        initParticle(i);
      }
    };

    const drawParticle = (x, y, x2, y2, life, ttl, radius, hue) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = radius;
      ctx.strokeStyle = `hsla(${hue}, 100%, 62%, ${fadeInOut(life, ttl)})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    const checkBounds = (x, y) => x > width || x < 0 || y > height || y < 0;

    const updateParticle = i => {
      const i2 = i + 1;
      const i3 = i + 2;
      const i4 = i + 3;
      const i5 = i + 4;
      const i6 = i + 5;
      const i7 = i + 6;
      const i8 = i + 7;
      const i9 = i + 8;

      const x = particleProps[i];
      const y = particleProps[i2];
      const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
      const vx = lerp(particleProps[i3], Math.cos(n), 0.5);
      const vy = lerp(particleProps[i4], Math.sin(n), 0.5);
      const life = particleProps[i5];
      const ttl = particleProps[i6];
      const speed = particleProps[i7];
      const x2 = x + vx * speed;
      const y2 = y + vy * speed;
      const radius = particleProps[i8];
      const hue = particleProps[i9];

      drawParticle(x, y, x2, y2, life, ttl, radius, hue);

      particleProps[i] = x2;
      particleProps[i2] = y2;
      particleProps[i3] = vx;
      particleProps[i4] = vy;
      particleProps[i5] = life + 1;

      if (checkBounds(x, y) || life > ttl) initParticle(i);
    };

    const drawParticles = () => {
      for (let i = 0; i < particlePropsLength; i += particlePropCount) {
        updateParticle(i);
      }
    };

    const renderGlow = () => {
      ctx.save();
      ctx.filter = 'blur(8px) brightness(190%)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.filter = 'blur(3px) brightness(170%)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(canvas, 0, 0, width, height);
      ctx.restore();
    };

    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      drawParticles();
      renderGlow();

      if (!prefersReducedMotion) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    };

    resize();
    initParticles();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      resize();
      initParticles();
      draw();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [
    backgroundColor,
    baseHue,
    baseRadius,
    baseSpeed,
    particleCount,
    rangeHue,
    rangeRadius,
    rangeSpeed,
    rangeY,
  ]);

  return (
    <div ref={containerRef} className={cx('relative h-full w-full', containerClassName)}>
      <div className="absolute inset-0 z-0 bg-slate-950">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>
      <div className={cx('relative z-10', className)}>{children}</div>
    </div>
  );
}

export default function VortexFeature() {
  return (
    <section className="relative overflow-hidden px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative z-10 mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-cyber-cyan/15 bg-slate-950 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_28px_90px_rgba(0,0,0,0.55),0_0_120px_rgba(0,245,255,0.08)]">
        <Vortex
          backgroundColor="rgba(2, 6, 23, 0.96)"
          rangeY={520}
          particleCount={620}
          baseHue={180}
          rangeHue={140}
          baseSpeed={0.04}
          rangeSpeed={1.35}
          baseRadius={0.7}
          rangeRadius={2.4}
          className="flex min-h-[28rem] w-full flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[32rem] sm:px-10"
        >
          <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_45%,rgba(15,23,42,0)_0%,rgba(2,6,23,0.2)_45%,rgba(2,6,23,0.92)_100%)]" />
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyber-cyan shadow-[0_0_40px_rgba(0,245,255,0.08)]">
            AI-native production studio
          </div>
          <h2 className="max-w-4xl text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Real products, built at frontier speed.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-xl">
            We ship websites, Next.js apps, cinematic AI videos, and creative visuals — built fast, built right, with no templates and no shortcuts.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-300 sm:text-sm">
            {['Websites', 'Apps', 'AI video', 'Visual systems'].map(item => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </Vortex>
      </div>
    </section>
  );
}
