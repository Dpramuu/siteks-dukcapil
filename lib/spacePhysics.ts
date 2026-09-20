/**
 * Fisika "luar angkasa" untuk ikon sosmed di hero.
 *
 * Bedanya dengan bola biasa:
 *  - tidak ada gravitasi → ikon tidak jatuh, hanya meluncur lurus
 *  - hambatan sangat kecil → meluncur lama dan melambat pelan sekali
 *  - pantulan licin (tanpa gesekan) tapi kehilangan sedikit tenaga, sambil
 *    memutar ikon (tumbling) sesuai arah benturan
 *  - tidak pernah benar-benar berhenti: selalu ada kecepatan hanyut minimum
 *
 * Modul ini murni matematika (tanpa DOM/React) supaya gampang dites.
 */

export type Rect = { left: number; top: number; right: number; bottom: number };

export type Body = {
  x: number; // pusat
  y: number;
  vx: number; // px/detik
  vy: number;
  r: number; // jari-jari
  angle: number; // derajat
  spin: number; // derajat/detik
  idleSpin: number; // putaran santai saat melayang
  held: boolean; // sedang dipegang pointer → tidak ikut fisika
};

/* ---- angka-angka yang boleh kamu utak-atik untuk mengubah "rasa"-nya ---- */
export const TUNING = {
  /** 1 = pantul sempurna. 0.86 = terasa licin tapi lama-lama melemah */
  restitution: 0.86,
  /** pantulan antar-ikon */
  bodyRestitution: 0.94,
  /** hambatan per detik. Kecil = meluncur jauh (0.3 ≈ ruang hampa) */
  linearDamping: 0.3,
  /** seberapa cepat putaran kembali ke putaran santai */
  spinDamping: 0.7,
  /** kecepatan hanyut minimum (px/detik) — 0 kalau mau ikon berhenti total */
  minDrift: 16,
  /** batas kecepatan lemparan (px/detik) */
  maxSpeed: 2600,
  /** seberapa kuat benturan memutar ikon */
  impactSpin: 0.35,
  /** batas putaran (derajat/detik) */
  maxSpin: 720,
  /** jendela waktu untuk menghitung kecepatan lemparan (ms) */
  releaseWindowMs: 100,
};

export type Tuning = typeof TUNING;

const RAD2DEG = 180 / Math.PI;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createBody(x: number, y: number, r: number, seed: number): Body {
  // arah & kecepatan hanyut awal dibuat deterministik dari seed (bukan Math.random)
  // supaya hasil render server & klien tidak berbeda
  const heading = seed * 2.399963; // sudut emas → arah tersebar rata
  const speed = 14 + (seed % 3) * 4;
  return {
    x,
    y,
    vx: Math.cos(heading) * speed,
    vy: Math.sin(heading) * speed,
    r,
    angle: 0,
    spin: 0,
    idleSpin: (seed % 2 === 0 ? 1 : -1) * (4 + (seed % 3) * 2.5),
    held: false,
  };
}

/** Pantulkan `b` dari permukaan dengan normal (nx, ny) yang menghadap ke luar permukaan. */
function bounce(b: Body, nx: number, ny: number, e: number, t: Tuning) {
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return; // sudah menjauh
  b.vx -= (1 + e) * vn * nx;
  b.vy -= (1 + e) * vn * ny;

  // kecepatan menyusur permukaan → jadi putaran (ikon "menggelinding" sesaat)
  const vt = b.vx * -ny + b.vy * nx;
  b.spin = clamp(b.spin + (vt / b.r) * RAD2DEG * t.impactSpin, -t.maxSpin, t.maxSpin);
}

function collideCircleRect(b: Body, rc: Rect, t: Tuning) {
  const cx = clamp(b.x, rc.left, rc.right);
  const cy = clamp(b.y, rc.top, rc.bottom);
  const dx = b.x - cx;
  const dy = b.y - cy;
  const d2 = dx * dx + dy * dy;

  let nx: number;
  let ny: number;
  let pen: number;

  if (d2 > 0) {
    if (d2 >= b.r * b.r) return;
    const d = Math.sqrt(d2);
    nx = dx / d;
    ny = dy / d;
    pen = b.r - d;
  } else {
    // pusat ikon ada DI DALAM kotak → dorong keluar lewat sisi terdekat
    const dl = b.x - rc.left;
    const dr = rc.right - b.x;
    const dtp = b.y - rc.top;
    const dbt = rc.bottom - b.y;
    const m = Math.min(dl, dr, dtp, dbt);
    if (m === dl) {
      nx = -1;
      ny = 0;
      pen = dl + b.r;
    } else if (m === dr) {
      nx = 1;
      ny = 0;
      pen = dr + b.r;
    } else if (m === dtp) {
      nx = 0;
      ny = -1;
      pen = dtp + b.r;
    } else {
      nx = 0;
      ny = 1;
      pen = dbt + b.r;
    }
  }

  b.x += nx * pen;
  b.y += ny * pen;
  bounce(b, nx, ny, t.restitution, t);
}

function collideWalls(b: Body, w: Rect, t: Tuning) {
  if (b.x < w.left + b.r) {
    b.x = w.left + b.r;
    bounce(b, 1, 0, t.restitution, t);
  } else if (b.x > w.right - b.r) {
    b.x = w.right - b.r;
    bounce(b, -1, 0, t.restitution, t);
  }
  if (b.y < w.top + b.r) {
    b.y = w.top + b.r;
    bounce(b, 0, 1, t.restitution, t);
  } else if (b.y > w.bottom - b.r) {
    b.y = w.bottom - b.r;
    bounce(b, 0, -1, t.restitution, t);
  }
}

function collideBodies(a: Body, b: Body, t: Tuning) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minD = a.r + b.r;
  const d2 = dx * dx + dy * dy;
  if (d2 >= minD * minD) return;

  const d = Math.sqrt(d2) || 0.0001;
  const nx = dx / d;
  const ny = dy / d;
  const pen = minD - d;

  // massa ∝ luas; ikon yang sedang dipegang dianggap tak bisa didorong
  const ima = a.held ? 0 : 1 / (a.r * a.r);
  const imb = b.held ? 0 : 1 / (b.r * b.r);
  const total = ima + imb;
  if (total === 0) return;

  a.x -= (nx * pen * ima) / total;
  a.y -= (ny * pen * ima) / total;
  b.x += (nx * pen * imb) / total;
  b.y += (ny * pen * imb) / total;

  const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (rvn > 0) return; // sudah saling menjauh

  const j = (-(1 + t.bodyRestitution) * rvn) / total;
  a.vx -= j * ima * nx;
  a.vy -= j * ima * ny;
  b.vx += j * imb * nx;
  b.vy += j * imb * ny;

  // sentuhan kecil supaya tabrakan antar-ikon juga membuat keduanya berputar
  const kick = (rvn / minD) * RAD2DEG * 0.12;
  if (!a.held) a.spin = clamp(a.spin - kick, -t.maxSpin, t.maxSpin);
  if (!b.held) b.spin = clamp(b.spin + kick, -t.maxSpin, t.maxSpin);
}

/**
 * Majukan simulasi sebesar `dt` detik.
 * `obstacles` = kotak-kotak yang harus dipantulkan (baris teks, laptop, dst.)
 * `walls` = batas area hero.
 */
export function stepBodies(
  bodies: Body[],
  obstacles: Rect[],
  walls: Rect,
  dt: number,
  t: Tuning = TUNING,
) {
  if (dt <= 0) return;

  // pecah jadi beberapa langkah kecil supaya lemparan kencang tidak "tembus" teks tipis
  let maxMove = 0;
  let minR = Infinity;
  for (const b of bodies) {
    minR = Math.min(minR, b.r);
    if (!b.held) maxMove = Math.max(maxMove, Math.hypot(b.vx, b.vy) * dt);
  }
  const steps = clamp(Math.ceil(maxMove / (minR * 0.4)), 1, 16);
  const h = dt / steps;

  const drag = Math.exp(-t.linearDamping * h);
  const spinEase = 1 - Math.exp(-t.spinDamping * h);

  for (let s = 0; s < steps; s++) {
    for (const b of bodies) {
      if (b.held) continue;
      b.x += b.vx * h;
      b.y += b.vy * h;
      b.angle += b.spin * h;
      b.vx *= drag;
      b.vy *= drag;
      b.spin += (b.idleSpin - b.spin) * spinEase;
    }

    for (const b of bodies) {
      if (b.held) continue;
      for (const rc of obstacles) collideCircleRect(b, rc, t);
      collideWalls(b, walls, t);
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) collideBodies(bodies[i], bodies[j], t);
    }

    // ikon yang terdorong ke tembok oleh ikon lain jangan sampai keluar area
    for (const b of bodies) if (!b.held) collideWalls(b, walls, t);
  }

  // hanyut minimum: di luar angkasa tidak ada yang benar-benar diam
  if (t.minDrift > 0) {
    for (const b of bodies) {
      if (b.held) continue;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp >= t.minDrift) continue;
      if (sp < 1e-3) {
        const a = b.angle * (Math.PI / 180);
        b.vx = Math.cos(a) * t.minDrift;
        b.vy = Math.sin(a) * t.minDrift;
      } else {
        // batas bawah tegas; di kecepatan serendah ini (≤ minDrift) lonjakannya tak terlihat
        const k = t.minDrift / sp;
        b.vx *= k;
        b.vy *= k;
      }
    }
  }
}

export type Sample = { t: number; x: number; y: number };

/** Kecepatan lemparan (px/detik) dari jejak posisi pointer beberapa ms terakhir. */
export function releaseVelocity(
  samples: Sample[],
  now: number,
  t: Tuning = TUNING,
): { vx: number; vy: number } {
  const recent = samples.filter((s) => now - s.t <= t.releaseWindowMs);
  if (recent.length < 2) return { vx: 0, vy: 0 };
  const a = recent[0];
  const b = recent[recent.length - 1];
  const dt = (b.t - a.t) / 1000;
  if (dt <= 0) return { vx: 0, vy: 0 };
  let vx = (b.x - a.x) / dt;
  let vy = (b.y - a.y) / dt;
  const sp = Math.hypot(vx, vy);
  if (sp > t.maxSpeed) {
    vx *= t.maxSpeed / sp;
    vy *= t.maxSpeed / sp;
  }
  return { vx, vy };
}