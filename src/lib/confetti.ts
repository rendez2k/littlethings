/**
 * A small, calm confetti burst for celebrating a completion. Self-contained
 * (no dependency): it paints a short-lived full-screen canvas and cleans itself
 * up. Callers should gate this on the reduced-motion preference.
 */

interface Origin {
  x: number;
  y: number;
}

// Soft, on-brand confetti colours (indigo + gentle pastels).
const COLORS = ['#6c5ce7', '#a99bff', '#f4c9d2', '#b7e0c8', '#f6e2a8', '#bbd3f2'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  life: number;
}

/** Fire a gentle burst, optionally from a screen point (defaults to centre). */
export function confettiBurst(origin?: Origin): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!window.requestAnimationFrame) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '80',
  });
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h / 2;

  const count = 34;
  const pieces: Piece[] = Array.from({ length: count }, (_, i) => {
    // Spray upward in a fan, varying speed by index so it never looks uniform.
    const angle = (-Math.PI / 2) + (((i / count) - 0.5) * (Math.PI * 0.85));
    const speed = 6 + ((i * 37) % 60) / 10;
    return {
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: ((i * 53) % 360) * (Math.PI / 180),
      vrot: (((i % 7) - 3) / 20),
      size: 6 + ((i * 13) % 5),
      color: COLORS[i % COLORS.length]!,
      life: 1,
    };
  });

  const gravity = 0.28;
  const drag = 0.99;
  let frame = 0;
  const maxFrames = 90;

  const tick = () => {
    frame += 1;
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    for (const p of pieces) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life = Math.max(0, 1 - frame / maxFrames);
      if (p.life > 0 && p.y < h + 20) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }
    if (alive && frame < maxFrames) {
      window.requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  };

  window.requestAnimationFrame(tick);
}
