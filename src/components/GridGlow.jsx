import { useEffect, useRef } from 'react';

export default function GridGlow() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const CELL = 60; // grid cell size — matches the CSS grid
    const TRAIL_LENGTH = 18; // how many cells stay lit
    const FADE_SPEED = 0.025; // how fast cells fade out

    // Color palette — cyber theme
    const COLORS = [
      [0, 245, 255],    // cyan
      [168, 85, 247],   // purple
      [236, 72, 153],   // pink
      [0, 200, 255],    // blue-cyan
      [139, 92, 246],   // violet
      [244, 114, 182],  // light pink
      [34, 211, 238],   // teal
      [192, 132, 252],  // lavender
    ];

    // Track lit cells: Map of "col,row" => { color, opacity, targetOpacity }
    const litCells = new Map();
    let mouseX = -1000;
    let mouseY = -1000;
    let lastCellKey = '';
    let colorIndex = 0;
    let animId = null;
    let scrollY = 0;

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    function onScroll() {
      scrollY = window.scrollY;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollY = window.scrollY;

    function onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Calculate which grid cell the cursor is in (account for scroll)
      const absY = mouseY + scrollY;
      const col = Math.floor(mouseX / CELL);
      const row = Math.floor(absY / CELL);
      const cellKey = col + ',' + row;

      if (cellKey !== lastCellKey) {
        lastCellKey = cellKey;

        // Restart the render loop if it went idle
        if (animId === null) animId = requestAnimationFrame(draw);

        // Pick next color, cycling through palette
        const color = COLORS[colorIndex % COLORS.length];
        colorIndex++;

        // Add or refresh this cell
        litCells.set(cellKey, {
          col,
          row,
          color,
          opacity: 0,
          targetOpacity: 0.35,
          birth: Date.now(),
        });

        // Also light up adjacent cells with lower opacity for a softer effect
        const neighbors = [
          [col - 1, row], [col + 1, row],
          [col, row - 1], [col, row + 1],
        ];
        neighbors.forEach(([nc, nr]) => {
          const nk = nc + ',' + nr;
          if (!litCells.has(nk) || litCells.get(nk).targetOpacity < 0.12) {
            const nColor = COLORS[(colorIndex + nc + nr) % COLORS.length];
            litCells.set(nk, {
              col: nc,
              row: nr,
              color: nColor,
              opacity: 0,
              targetOpacity: 0.12,
              birth: Date.now(),
            });
          }
        });

        // Trim old cells if too many
        if (litCells.size > TRAIL_LENGTH * 5) {
          const entries = Array.from(litCells.entries());
          entries.sort((a, b) => a[1].birth - b[1].birth);
          const toRemove = entries.slice(0, entries.length - TRAIL_LENGTH * 3);
          toRemove.forEach(([key]) => litCells.delete(key));
        }
      }
    }

    function onTouchMove(e) {
      if (e.touches.length > 0) {
        onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      }
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove, { passive: true });

    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      // Go idle when nothing is lit — no need to burn frames while the cursor rests
      if (litCells.size === 0) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(draw);

      const toDelete = [];

      litCells.forEach((cell, key) => {
        // Fade in
        if (cell.opacity < cell.targetOpacity) {
          cell.opacity = Math.min(cell.opacity + 0.06, cell.targetOpacity);
        }

        // Age-based fade out
        const age = Date.now() - cell.birth;
        if (age > 400) {
          cell.targetOpacity = 0;
          cell.opacity -= FADE_SPEED;
        }

        if (cell.opacity <= 0.001) {
          toDelete.push(key);
          return;
        }

        // Calculate screen position (account for scroll offset)
        const x = cell.col * CELL;
        const y = cell.row * CELL - scrollY;

        // Skip if off-screen
        if (y + CELL < 0 || y > h || x + CELL < 0 || x > w) return;

        const [r, g, b] = cell.color;

        // Draw the cell with a subtle inner glow
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${cell.opacity})`;
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

        // Brighter border on the cell edges to emphasize the box shape
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${cell.opacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
      });

      toDelete.forEach((key) => litCells.delete(key));
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
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
