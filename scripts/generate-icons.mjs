/*
 * Generates placeholder PWA icons with no external image dependencies.
 * Draws a rounded-square gradient mark (echoing the Little Things ring) with a
 * white check, plus full-bleed maskable variants and an Apple touch icon.
 *
 * Run: node scripts/generate-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

// --- tiny PNG encoder ---------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- drawing helpers ----------------------------------------------------
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function mix(a, b, t) {
  return a + (b - a) * t;
}
// Signed-distance smoothstep coverage (1 inside, 0 outside), ~1px AA band.
function coverage(dist) {
  return clamp01(0.5 - dist);
}

function roundedRectSDF(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function segmentDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp01(((px - ax) * dx + (py - ay) * dy) / len2);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function over(dst, src) {
  // src, dst = {r,g,b,a} with a in 0..1
  const a = src.a + dst.a * (1 - src.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (src.r * src.a + dst.r * dst.a * (1 - src.a)) / a,
    g: (src.g * src.a + dst.g * dst.a * (1 - src.a)) / a,
    b: (src.b * src.a + dst.b * dst.a * (1 - src.a)) / a,
    a,
  };
}

function renderIcon(size, { maskable }) {
  const rgba = Buffer.alloc(size * size * 4);
  const s = size;
  // Mark occupies the whole canvas for maskable (full-bleed, safe centre),
  // or an inset rounded square for regular icons.
  const inset = maskable ? 0 : s * 0.08;
  const cx = s / 2;
  const cy = s / 2;
  const halfW = s / 2 - inset;
  const radius = maskable ? 0 : s * 0.22;

  // Gradient endpoints (lavender -> warm rose), echoing the ring logo.
  const g0 = { r: 108, g: 92, b: 231 };
  const g1 = { r: 232, g: 112, b: 159 };

  // Check geometry (three points), sized relative to the mark.
  const scale = maskable ? 0.6 : 0.78;
  const p1 = { x: cx - 0.2 * s * scale, y: cy + 0.02 * s * scale };
  const p2 = { x: cx - 0.04 * s * scale, y: cy + 0.18 * s * scale };
  const p3 = { x: cx + 0.24 * s * scale, y: cy - 0.16 * s * scale };
  const stroke = s * 0.062 * (maskable ? 1 : 1.05);

  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      let pixel = { r: 0, g: 0, b: 0, a: 0 };

      const bgCov = coverage(roundedRectSDF(px, py, cx, cy, halfW, halfW, radius));
      if (bgCov > 0) {
        const t = clamp01((px + py) / (2 * s));
        pixel = over(pixel, {
          r: mix(g0.r, g1.r, t),
          g: mix(g0.g, g1.g, t),
          b: mix(g0.b, g1.b, t),
          a: bgCov,
        });
      }

      const dCheck = Math.min(
        segmentDist(px, py, p1.x, p1.y, p2.x, p2.y),
        segmentDist(px, py, p2.x, p2.y, p3.x, p3.y),
      );
      const checkCov = coverage(dCheck - stroke / 2);
      if (checkCov > 0) {
        pixel = over(pixel, { r: 255, g: 255, b: 255, a: checkCov });
      }

      const idx = (y * s + x) * 4;
      rgba[idx] = Math.round(pixel.r);
      rgba[idx + 1] = Math.round(pixel.g);
      rgba[idx + 2] = Math.round(pixel.b);
      rgba[idx + 3] = Math.round(pixel.a * 255);
    }
  }
  return encodePng(s, s, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const outputs = [
  ['icon-192.png', 192, { maskable: false }],
  ['icon-512.png', 512, { maskable: false }],
  ['maskable-192.png', 192, { maskable: true }],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }],
];

for (const [name, size, opts] of outputs) {
  writeFileSync(join(OUT_DIR, name), renderIcon(size, opts));
  console.log('wrote', name, `${size}x${size}`);
}
