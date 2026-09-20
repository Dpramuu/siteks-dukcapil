'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, MotionPathPlugin, prefersReducedMotion } from '@/lib/gsap';

const STEPS = [
  {
    step: '01',
    title: 'Susun teks',
    desc: 'Ambil template narasi layanan yang sudah baku, atau tulis naskah baru untuk topik adminduk tertentu.',
  },
  {
    step: '02',
    title: 'Pilih kanal & waktu',
    desc: 'Tentukan kanal publikasi serta tanggal dan jam tayang yang paling tepat untuk warga.',
  },
  {
    step: '03',
    title: 'Periksa pratinjau',
    desc: 'Cek kerapian baris, panjang teks, dan penempatan tagar sebelum jadwal dikunci.',
  },
  {
    step: '04',
    title: 'Pantau kalender',
    desc: 'Lihat agenda harian dan bulanan, lengkap dengan status draf, terjadwal, dan terbit.',
  },
];

/* --- setelan rasa gerak (silakan diutak-atik) ---------------------------- */
const CURVINESS = 1.25; // kelengkungan jalur antar titik. 0 = lurus, makin besar makin meliuk
const SEGMENT_EASE = 'power2.inOut'; // pelan di titik, cepat di tengah ruas
const DWELL = 0.14; // lama "berhenti" di tiap titik tengah (relatif terhadap total waktu gerak)
const LEAD = 0.05; // jeda di titik pertama sebelum mulai bergerak
const TAIL = 0.1; // jeda di titik terakhir setelah tiba

type Pt = { x: number; y: number };

/** posisi tiap titik sebagai pecahan panjang jalur (0..1), dicari dari titik terdekat pada path */
function nodeFractions(path: SVGPathElement, pts: Pt[], length: number) {
  const out = [0];
  let from = 0;
  for (let k = 1; k < pts.length - 1; k++) {
    let best = from;
    let bestDist = Infinity;
    for (let l = from; l <= length; l += 1) {
      const p = path.getPointAtLength(l);
      const dist = (p.x - pts[k].x) ** 2 + (p.y - pts[k].y) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = l;
      }
    }
    out.push(best / length);
    from = best;
  }
  out.push(1);
  return out;
}

/**
 * Satu fungsi ease untuk seluruh perjalanan: bergerak tiap ruas dengan SEGMENT_EASE,
 * lalu diam sejenak di titik. Dengan begini penanda dan garis progres cukup satu tween
 * dan tetap sinkron. `arrivals` = kapan (0..1) penanda tiba di tiap titik.
 */
function buildRoute(fractions: number[]) {
  const inOut = gsap.parseEase(SEGMENT_EASE);
  const legs: { t0: number; t1: number; from: number; to: number }[] = [];

  let cursor = LEAD;
  for (let i = 0; i < fractions.length - 1; i++) {
    const span = fractions[i + 1] - fractions[i]; // waktu ruas ∝ panjangnya → kecepatan seragam
    legs.push({ t0: cursor, t1: cursor + span, from: fractions[i], to: fractions[i + 1] });
    cursor += span + (i < fractions.length - 2 ? DWELL : 0);
  }
  const total = cursor + TAIL;

  const ease = (t: number) => {
    const time = t * total;
    let at = 0;
    for (const leg of legs) {
      if (time < leg.t0) return at;
      if (time <= leg.t1) return leg.from + (leg.to - leg.from) * inOut((time - leg.t0) / (leg.t1 - leg.t0));
      at = leg.to;
    }
    return at;
  };

  return { ease, arrivals: [0, ...legs.map((l) => l.t1 / total)] };
}

export default function WorkflowPath() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  /* ------------------------------------------- jalur + titik + penanda */
  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const track = trackRef.current;
    const route = routeRef.current;
    const traveler = travelerRef.current;
    const steps = stepRefs.current.filter((el): el is HTMLLIElement => !!el);
    if (!root || !svg || !track || !route || !traveler || steps.length < 2) return;

    const nodes = steps.map((s) => s.querySelector<HTMLElement>('.flow-node')!);
    const pings = steps.map((s) => s.querySelector<HTMLElement>('.flow-ping')!);
    const halo = traveler.querySelector<HTMLElement>('.flow-traveler-halo')!;
    const reduce = prefersReducedMotion();

    let ctx: gsap.Context | null = null;
    let timer = 0;
    let reached = 0;
    let lastW = 0;
    let lastH = 0;

    const applyReached = (count: number, animate: boolean) => {
      steps.forEach((el, i) => {
        el.classList.toggle('is-reached', i < count);
        el.classList.toggle('is-current', i === count - 1);
      });
      if (animate) {
        for (let i = reached; i < count; i++) {
          gsap.fromTo(
            pings[i],
            { scale: 1, opacity: 0.55 },
            { scale: 2.6, opacity: 0, duration: 0.9, ease: 'power2.out', overwrite: true },
          );
        }
      }
      reached = count;
    };

    const build = () => {
      ctx?.revert();
      applyReached(0, false);

      const box = root.getBoundingClientRect();
      lastW = box.width;
      lastH = box.height;
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);

      // titik = pusat tiap penanda di DOM, diukur relatif terhadap root.
      // Karena relatif, hasilnya tidak terpengaruh scroll / ScrollSmoother / pin di atasnya.
      const pts: Pt[] = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });

      // jalur mulus yang melewati semua titik
      const d = MotionPathPlugin.rawPathToString(
        MotionPathPlugin.arrayToRawPath(pts, { curviness: CURVINESS }),
      );
      track.setAttribute('d', d);
      route.setAttribute('d', d);

      const length = route.getTotalLength();
      if (!length) return;

      svg.style.opacity = '1';

      if (reduce) {
        // tanpa gerak: jalur tergambar penuh, semua titik menyala, penanda disembunyikan
        route.style.strokeDasharray = 'none';
        route.style.strokeDashoffset = '0';
        traveler.style.display = 'none';
        applyReached(steps.length, false);
        return;
      }

      route.style.strokeDasharray = `${length}`;
      route.style.strokeDashoffset = `${length}`;

      const { ease, arrivals } = buildRoute(nodeFractions(route, pts, length));
      const born = performance.now();

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: 'none', duration: 1 },
          scrollTrigger: {
            trigger: root,
            start: 'top 72%',
            end: 'bottom 55%',
            scrub: 0.5,
          },
          onUpdate: () => {
            const t = tl.progress();
            const count = arrivals.filter((a, i) => (i === 0 ? t > 0.0005 : t >= a - 0.0005)).length;
            // 200 md pertama = sinkronisasi awal (reload di tengah halaman / resize) → tanpa denyut
            if (count !== reached) applyReached(count, performance.now() - born > 200);
          },
        });

        // garis progres menggambar dirinya…
        tl.fromTo(route, { strokeDashoffset: length }, { strokeDashoffset: 0, ease }, 0);
        // …sementara penanda menyusuri jalur yang sama lewat MotionPath
        tl.to(
          traveler,
          {
            motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] },
            ease,
            immediateRender: true,
          },
          0,
        );

        // denyut halus di sekeliling penanda
        gsap.fromTo(
          halo,
          { scale: 1, opacity: 0.6 },
          { scale: 1.9, opacity: 0, duration: 1.6, ease: 'power1.out', repeat: -1 },
        );
      }, root);

      traveler.style.opacity = '1';
    };

    // rakit ulang saat ukuran berubah (breakpoint, rotasi layar, font selesai dimuat)
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 150);
    });

    build();
    ro.observe(root);
    // posisi section ini bergantung pada pin milik Hero/Pillars di atasnya
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      ro.disconnect();
      ctx?.revert();
    };
  }, []);

  /* --------------------------------------------------- kartu masuk */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.flow-card',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.12,
          scrollTrigger: { trigger: root, start: 'top 82%', once: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="flow-root relative isolate">
      {/* jalur: garis putus-putus sebagai rel, garis solid aksen sebagai progres */}
      <svg
        ref={svgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0 transition-opacity duration-700"
      >
        <path
          ref={trackRef}
          className="fill-none stroke-line-strong"
          strokeWidth={1.5}
          strokeDasharray="2 7"
          strokeLinecap="round"
        />
        <path
          ref={routeRef}
          className="flow-route fill-none"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>

      {/* penanda yang berjalan di atas jalur (diposisikan oleh MotionPathPlugin) */}
      <div
        ref={travelerRef}
        aria-hidden
        className="flow-traveler pointer-events-none absolute top-0 left-0 z-20 opacity-0"
      >
        <span className="flow-traveler-halo" />
        <span className="flow-traveler-core" />
      </div>

      <ol className="relative z-10 grid gap-y-6 lg:gap-y-10">
        {STEPS.map((s, i) => (
          <li
            key={s.step}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="flow-step"
          >
            <span className="flow-stem" aria-hidden />
            <span className="flow-node" aria-hidden>
              <span className="flow-ping" />
              <span className="flow-dot" />
            </span>

            <div className="flow-card">
              <div className="flow-surface group">
                <span className="flow-index font-mono text-xs tracking-widest text-muted">
                  {s.step}
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{s.desc}</p>
                <span className="flow-rule mt-6 block h-px w-8 bg-line-strong" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}