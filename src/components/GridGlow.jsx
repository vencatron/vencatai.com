import { useEffect, useRef } from 'react';

export default function GridGlow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    let mouseX = -1000;
    let mouseY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isVisible = false;
    let animId = null;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisible = true;
    }

    function onMouseLeave() {
      isVisible = false;
    }

    function onTouchMove(e) {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        isVisible = true;
      }
    }

    function onTouchEnd() {
      isVisible = false;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    function draw() {
      animId = requestAnimationFrame(draw);

      // Smooth lerp
      const lerp = 0.12;
      currentX += (mouseX - currentX) * lerp;
      currentY += (mouseY - currentY) * lerp;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (!isVisible) return;

      ctx.globalCompositeOperation = 'lighter';

      // Main cyan glow — large, prominent
      const r1 = 280;
      const g1 = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, r1);
      g1.addColorStop(0, 'rgba(0, 245, 255, 0.18)');
      g1.addColorStop(0.3, 'rgba(0, 200, 255, 0.10)');
      g1.addColorStop(0.6, 'rgba(168, 85, 247, 0.06)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Secondary purple glow — offset
      const ox2 = currentX - 40;
      const oy2 = currentY - 25;
      const r2 = 220;
      const g2 = ctx.createRadialGradient(ox2, oy2, 0, ox2, oy2, r2);
      g2.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      g2.addColorStop(0.4, 'rgba(168, 85, 247, 0.06)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Tertiary pink/warm glow — opposite offset
      const ox3 = currentX + 35;
      const oy3 = currentY + 20;
      const r3 = 200;
      const g3 = ctx.createRadialGradient(ox3, oy3, 0, ox3, oy3, r3);
      g3.addColorStop(0, 'rgba(236, 72, 153, 0.12)');
      g3.addColorStop(0.4, 'rgba(236, 72, 153, 0.05)');
      g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      // Tight bright core — white/cyan center dot
      const r4 = 60;
      const g4 = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, r4);
      g4.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      g4.addColorStop(0.5, 'rgba(0, 245, 255, 0.06)');
      g4.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, w, h);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
