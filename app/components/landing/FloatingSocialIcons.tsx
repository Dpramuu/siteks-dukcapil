'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import {
  createBody,
  releaseVelocity,
  stepBodies,
  type Body,
  type Rect,
  type Sample,
} from '@/lib/spacePhysics';

/* ganti "src" ke file logo kamu sendiri di /public/icons — nama file boleh
   diganti, tinggal sesuaikan path-nya di sini */
const ICONS = [

  { src: '/instagram.png', alt: 'Instagram', top: '12%', left: '80%', size: 84 },
  { src: '/tiktok.png', alt: 'TikTok', top: '18%', left: '8%', size: 76 },
  { src: '/facebook.png', alt: 'Facebook', top: '58%', left: '5%', size: 78 },
  { src: '/twitter.png', alt: 'X', top: '36%', left: '91%', size: 72 },
];

/* Elemen di dalam hero yang boleh dibentur ikon ditandai dengan atribut:
     data-bounce="text"  → dibentur per baris tulisan (mepet ke huruf, bukan kotak lebar)
     data-bounce="box"   → dibentur sebagai satu kotak (laptop, dsb.)
   Tambah atributnya ke elemen lain kalau mau ikut jadi penghalang. */
const TEXT_PAD = 6; // jarak napas antara ikon dan huruf (px)

const pct = (v: string) => parseFloat(v) / 100;

/* ref diteruskan ke pembungkus, supaya HeroZoom bisa ikut memudarkannya
   saat animasi zoom laptop berjalan */
const FloatingSocialIcons = forwardRef<HTMLDivElement>((_, ref) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => wrapRef.current as HTMLDivElement);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (prefersReducedMotion()) return;

    const stage = wrap.parentElement;
    if (!stage) return;

    const roots = Array.from(wrap.querySelectorAll<HTMLElement>('[data-icon-root]'));
    const bubbles = roots.map((r) => r.querySelector<HTMLElement>('[data-icon-bubble]')!);
    const setX = roots.map((r) => gsap.quickSetter(r, 'x', 'px') as (v: number) => void);
    const setY = roots.map((r) => gsap.quickSetter(r, 'y', 'px') as (v: number) => void);
    const setRot = bubbles.map((b) => gsap.quickSetter(b, 'rotation', 'deg') as (v: number) => void);

    const bodies: Body[] = [];
    const history: Sample[][] = roots.map(() => []);
    const heldBy: (number | null)[] = roots.map(() => null); // pointerId yang memegang
    const grab = roots.map(() => ({ dx: 0, dy: 0 }));

    let W = 0;
    let H = 0;
    let ready = false;

    const range = document.createRange();
    const obstacleEls = Array.from(stage.querySelectorAll<HTMLElement>('[data-bounce]'));
    const obstacles: Rect[] = [];

    const measureObstacles = (origin: DOMRect) => {
      obstacles.length = 0;
      const push = (r: DOMRect, pad: number) => {
        if (r.width < 2 || r.height < 2) return;
        obstacles.push({
          left: r.left - origin.left - pad,
          top: r.top - origin.top - pad,
          right: r.right - origin.left + pad,
          bottom: r.bottom - origin.top + pad,
        });
      };
      for (const el of obstacleEls) {
        if (el.dataset.bounce === 'text') {
          range.selectNodeContents(el);
          for (const r of Array.from(range.getClientRects())) push(r, TEXT_PAD);
        } else {
          push(el.getBoundingClientRect(), 0);
        }
      }
    };

    /* posisi awal = titik CSS (top/left persen) tiap ikon. Elemennya tetap
       ditaruh CSS di titik itu; fisika hanya menggeser lewat transform. */
    const baseX = (i: number) => W * pct(ICONS[i].left);
    const baseY = (i: number) => H * pct(ICONS[i].top);

    const init = () => {
      bodies.length = 0;
      ICONS.forEach((ic, i) => bodies.push(createBody(baseX(i), baseY(i), ic.size / 2, i + 1)));
      ready = true;
    };

    const render = () => {
      bodies.forEach((b, i) => {
        setX[i](b.x - baseX(i));
        setY[i](b.y - baseY(i));
        setRot[i](b.angle);
      });
    };

    /* ------------------------------------------------ drag & lempar (pointer) */

    const pointerLocal = (e: PointerEvent) => {
      const o = wrap.getBoundingClientRect();
      return { x: e.clientX - o.left, y: e.clientY - o.top };
    };

    const cleanups: Array<() => void> = [];

    roots.forEach((root, i) => {
      const onDown = (e: PointerEvent) => {
        if (!ready || heldBy[i] !== null) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        // ikon yang sudah memudar (saat zoom laptop) tidak boleh bisa dipegang
        if (Number(gsap.getProperty(wrap, 'opacity')) < 0.3) return;

        const b = bodies[i];
        const p = pointerLocal(e);
        heldBy[i] = e.pointerId;
        grab[i] = { dx: b.x - p.x, dy: b.y - p.y };
        history[i] = [];
        b.held = true;
        b.vx = 0;
        b.vy = 0;
        root.setPointerCapture(e.pointerId);
        gsap.to(root, { scale: 1.1, duration: 0.2, overwrite: 'auto' });
        e.preventDefault();
      };

      const onMove = (e: PointerEvent) => {
        if (heldBy[i] !== e.pointerId) return;
        const b = bodies[i];
        const p = pointerLocal(e);
        // ikon boleh digeser ke mana saja di dalam hero (menembus teks saat dipegang);
        // tabrakan baru berlaku setelah dilepas
        b.x = Math.min(W - b.r, Math.max(b.r, p.x + grab[i].dx));
        b.y = Math.min(H - b.r, Math.max(b.r, p.y + grab[i].dy));
      };

      const onUp = (e: PointerEvent) => {
        if (heldBy[i] !== e.pointerId) return;
        const b = bodies[i];
        const v = releaseVelocity(history[i], performance.now());
        b.held = false;
        b.vx = v.vx;
        b.vy = v.vy;
        heldBy[i] = null;
        history[i] = [];
        if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
        gsap.to(root, { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      };

      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);
      cleanups.push(() => {
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onUp);
      });
    });

    /* ----------------------------------------------------------- loop utama */

    const tick = (_time: number, deltaMs: number) => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return; // disembunyikan (layar < sm)

      if (!ready) {
        W = w;
        H = h;
        init();
      } else if (w !== W || h !== H) {
        // ukuran hero berubah → skalakan posisi supaya ikon tetap di tempat relatifnya
        bodies.forEach((b) => {
          b.x = Math.min(w - b.r, Math.max(b.r, (b.x / W) * w));
          b.y = Math.min(h - b.r, Math.max(b.r, (b.y / H) * h));
        });
        W = w;
        H = h;
      }

      // ikon sedang memudar/hilang saat laptop dizoom → hemat CPU, fisika berhenti
      if (Number(gsap.getProperty(wrap, 'opacity')) < 0.02) return;

      const dt = Math.min(deltaMs / 1000, 1 / 30);
      const origin = wrap.getBoundingClientRect();
      measureObstacles(origin);

      // untuk ikon yang sedang dipegang: catat jejaknya (dipakai sebagai kecepatan lemparan)
      const now = performance.now();
      bodies.forEach((b, i) => {
        if (!b.held) return;
        const hist = history[i];
        hist.push({ t: now, x: b.x, y: b.y });
        while (hist.length > 2 && now - hist[0].t > 160) hist.shift();
        if (hist.length >= 2) {
          const v = releaseVelocity(hist, now);
          b.vx = v.vx; // supaya ikon lain terpental benar saat ditabrak ikon yang dipegang
          b.vy = v.vy;
        }
      });

      stepBodies(bodies, obstacles, { left: 0, top: 0, right: W, bottom: H }, dt);
      render();
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(roots);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 z-30 hidden sm:block"
      aria-hidden
    >
      {ICONS.map(({ src, alt, top, left, size }, i) => (
        <div
          key={i}
          data-icon-root
          data-cursor
          className="pointer-events-auto absolute cursor-grab touch-none select-none will-change-transform active:cursor-grabbing"
          style={{
            top,
            left,
            width: size,
            height: size,
            marginTop: -size / 2,
            marginLeft: -size / 2,
          }}
        >
            <div data-icon-bubble className="h-full w-full">
            <img
                src={src}
                alt={alt}
                draggable={false}
                className="h-full w-full object-contain select-none drop-shadow-[0_14px_18px_rgba(0,0,0,0.25)]"
            />
            </div>
        </div>
      ))}
    </div>
  );
});

FloatingSocialIcons.displayName = 'FloatingSocialIcons';

export default FloatingSocialIcons;