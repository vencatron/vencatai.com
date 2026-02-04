import { useEffect, useRef } from 'react';

const FIRE_WIDTH = 240; // High density
const FIRE_HEIGHT = 60;
const CHARS = [' ', '.', ':', '-', '=', '+', 'X', '#', '&', '@'];

interface DoomFireProps {
  intensity?: number;
}

export function DoomFire({ intensity = 1.0 }: DoomFireProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const firePixelsRef = useRef<number[]>(new Array(FIRE_WIDTH * FIRE_HEIGHT).fill(0));

  useEffect(() => {
    const firePixels = firePixelsRef.current;
    
    function animate() {
      // Bottom row
      for (let x = 0; x < FIRE_WIDTH; x++) {
        firePixels[(FIRE_HEIGHT - 1) * FIRE_WIDTH + x] = Math.floor((CHARS.length - 1) * intensity);
      }

      // Spread
      for (let y = 0; y < FIRE_HEIGHT - 1; y++) {
        for (let x = 0; x < FIRE_WIDTH; x++) {
          const src = (y + 1) * FIRE_WIDTH + x;
          const pixel = firePixels[src];
          if (pixel === 0) {
            firePixels[y * FIRE_WIDTH + x] = 0;
          } else {
            const randIdx = Math.round(Math.random() * 3);
            const dst = y * FIRE_WIDTH + Math.min(FIRE_WIDTH - 1, Math.max(0, x - randIdx + 1));
            firePixels[dst] = Math.max(0, pixel - (randIdx & 1));
          }
        }
      }

      // Render
      if (preRef.current) {
        let output = '';
        for (let y = 0; y < FIRE_HEIGHT; y++) {
          for (let x = 0; x < FIRE_WIDTH; x++) {
            output += CHARS[firePixels[y * FIRE_WIDTH + x]];
          }
          output += '\n';
        }
        preRef.current.textContent = output;
      }
      requestAnimationFrame(animate);
    }

    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [intensity]);

  return (
    <pre
      ref={preRef}
      className="fixed inset-0 pointer-events-none text-white/20 select-none bg-black"
      style={{
        fontFamily: "monospace",
        fontSize: '10px',
        lineHeight: '9px',
        textAlign: 'center'
      }}
    />
  );
}
