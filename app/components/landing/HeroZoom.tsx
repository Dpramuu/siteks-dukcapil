'use client';

import { Fragment, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import FloatingSocialIcons from '@/app/components/landing/FloatingSocialIcons';

/* ------------------------------------------------------------------ data */

const STATS = [
  { value: '24', label: 'Template' },
  { value: '3', label: 'Kanal' },
  { value: '12', label: 'Jadwal minggu ini' },
];

const AGENDA = [
  { title: 'Promo akhir pekan', time: '09:00', status: 'Terjadwal' },
  { title: 'Peluncuran produk baru', time: '13:30', status: 'Terjadwal' },
  { title: 'Pengumuman tim', time: '16:00', status: 'Draf' },
];

const SIDEBAR = ['Dashboard', 'Template', 'Jadwal'];

/** hari ke-n (0-27) -> status publikasi */
const MARKED: Record<number, 'terbit' | 'terjadwal' | 'draf'> = {
  2: 'terbit',
  5: 'terbit',
  8: 'terjadwal',
  11: 'terjadwal',
  12: 'draf',
  16: 'terjadwal',
  19: 'draf',
  23: 'terjadwal',
  25: 'draf',
};

const MARK_COLOR = {
  terbit: 'bg-ink',
  terjadwal: 'bg-accent',
  draf: 'bg-line-strong',
} as const;

/** posisi atas laptop saat awal (pecahan tinggi layar) — harus sama dengan style top */
const START_TOP = 0.66;

/* ------------------------------------------------------- isi bagian Tentang */

const TENTANG_TITLE = 'Satu sistem untuk semua konten bisnis Anda.';
const TENTANG_BODY =
  'Caption yang tercecer di banyak percakapan, jadwal posting yang berantakan, dan pesan brand yang berubah-ubah antar admin — semua itu bikin repot. SIMANTEN merapikan semuanya dalam satu tempat: dari template naskah sampai jadwal tayang di setiap kanal.';

/** pecah teks jadi kata-kata supaya bisa dinyalakan satu per satu saat scroll */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <span data-word>{word}</span>{' '}
        </Fragment>
      ))}
    </>
  );
}

function TentangIntro({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow">Tentang</p>
      <h2 className="mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
        <Words text={TENTANG_TITLE} />
      </h2>
      <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-base">
        <Words text={TENTANG_BODY} />
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- komponen */

export default function HeroZoom() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const spacer = spacerRef.current;
    const stage = stageRef.current;
    const head = headRef.current;
    const laptop = laptopRef.current;
    const screen = screenRef.current;
    const ui = uiRef.current;
    const base = baseRef.current;
    const intro = introRef.current;
    const icons = iconsRef.current;
    if (!spacer || !stage || !head || !laptop || !screen || !ui || !base || !intro || !icons)
      return;

    const ctx = gsap.context(() => {
      /* titik tengah layar laptop, relatif terhadap pembungkus laptop */
      const screenCenterY = () => screen.offsetTop + screen.offsetHeight / 2;

      /* zoom berpusat di tengah layar laptop, bukan di tengah seluruh laptop */
      gsap.set(laptop, {
        xPercent: -50,
        transformOrigin: `50% ${(screenCenterY() / laptop.offsetHeight) * 100}%`,
      });

      const words = intro.querySelectorAll('[data-word]');

      const vw = () => stage.clientWidth;
      const vh = () => stage.clientHeight;
      /* skala agar layar menutup seluruh viewport (+ sedikit sisa di tepi) */
      const coverScale = () =>
        Math.max(vw() / screen.offsetWidth, vh() / screen.offsetHeight) * 1.08;
      /* geser ke atas sampai tengah layar laptop = tengah viewport */
      const toCenterY = () => vh() / 2 - screenCenterY() - vh() * START_TOP;

      /* --- animasi masuk saat halaman dibuka --- */
      gsap.fromTo(
        head.querySelectorAll('[data-hero-item]'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out' },
      );
      gsap.from(laptop, { opacity: 0, yPercent: 8, duration: 1.3, delay: 0.45, ease: 'expo.out' });

      /* --- zoom laptop mengikuti scroll (pin + scrub) --- */
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'hero-zoom',
            trigger: stage,
            start: 'top top',
            end: '+=330%',
            pin: true,
            /* pembungkus pin disediakan sendiri, jadi GSAP tidak memindahkan <section> di DOM (bikin React error removeChild) */
            pinSpacer: spacer,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        /* judul memudar ke atas */
        .to(head, { yPercent: -30, opacity: 0, duration: 0.35 }, 0)
        /* ikon sosmed melayang ikut memudar bareng judul */
        .to(icons, { opacity: 0, duration: 0.3 }, 0)
        /* laptop naik ke tengah layar */
        .to(laptop, { y: toCenterY, duration: 0.65, ease: 'power2.inOut' }, 0)
        /* laptop membesar sampai layarnya memenuhi viewport */
        .to(laptop, { scale: coverScale, duration: 1, ease: 'power2.in' }, 0.35)
        /* dasar laptop memudar (bayangannya jangan sampai menutupi layar) */
        .to(base, { opacity: 0, duration: 0.2 }, 1.0)
        /* tampilan aplikasi memudar, layar tinggal permukaan polos */
        .to(ui, { opacity: 0, duration: 0.3 }, 1.05)
        /* teks Tentang muncul di layar */
        .fromTo(
          intro,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          1.3,
        )
        /* kata-kata menghitam satu per satu mengikuti scroll */
        .fromTo(words, { opacity: 0.12 }, { opacity: 1, duration: 0.15, stagger: 0.02 }, 1.6)
        /* jeda singkat sebelum halaman lanjut scroll */
        .to({}, { duration: 0.25 });
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={spacerRef}>
        <section
          ref={stageRef}
          id="beranda"
          className="hero-grain relative h-svh overflow-hidden bg-surface"
        >
          {/* ------------------------------ judul + subjudul ------------------------------ */}
          <div
            ref={headRef}
            className="absolute inset-x-0 top-0 z-10 px-5 pt-[clamp(6.5rem,17svh,11rem)] text-center text-ink"
          >
            <h1
              data-hero-item
              data-bounce="text"
              className="display-type mx-auto max-w-5xl text-[clamp(2.6rem,7vw,6.25rem)] leading-[0.95] tracking-[-0.035em]"
            >
              Naskah konten,
              <br />
              terjadwal rapi.
            </h1>
            <p
              data-hero-item
              data-bounce="text"
              className="mx-auto mt-6 max-w-2xl text-base font-medium tracking-tight sm:text-xl"
            >
              Susun template naskah konten bisnis Anda, lalu jadwalkan ke semua kanal media sosial dari satu tempat.
            </p>
          </div>

          {/* ----------------------- ikon sosmed melayang, bisa digeser ----------------------- */}
          <FloatingSocialIcons ref={iconsRef} />

          {/* ---------------------------------- laptop ---------------------------------- */}
          <div
            ref={laptopRef}
            data-bounce="box"
            className="absolute left-1/2 z-10 w-[min(80vw,52rem)]"
            style={{ top: `${START_TOP * 100}%` }}
          >
            {/* tutup layar */}
            <div className="rounded-t-[1.1rem] bg-[#141416] p-[2.4%] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.55)]">
              <div
                ref={screenRef}
                className="@container relative aspect-[16/10] overflow-hidden rounded-[0.35rem] bg-surface"
              >
                {/* tampilan aplikasi (ukuran mengikuti lebar layar lewat satuan cqw) */}
                <div ref={uiRef} className="absolute inset-0 flex text-ink">
                  <aside className="flex w-[19cqw] shrink-0 flex-col gap-[0.8cqw] border-r border-line p-[1.6cqw]">
                    <p className="mb-[1cqw] text-[1.5cqw] font-semibold tracking-[0.16em] uppercase">
                      Simanten
                    </p>
                    {SIDEBAR.map((label, i) => (
                      <div
                        key={label}
                        className={`rounded-[0.6cqw] px-[1.2cqw] py-[0.9cqw] text-[1.3cqw] ${
                          i === 2 ? 'bg-ink text-bg' : 'text-muted'
                        }`}
                      >
                        {label}
                      </div>
                    ))}
                  </aside>

                  <div className="flex min-w-0 flex-1 flex-col gap-[1.6cqw] p-[2cqw]">
                    <div className="flex items-center justify-between">
                      <p className="text-[1.9cqw] font-semibold tracking-tight">Kalender konten</p>
                      <span className="rounded-full border border-line px-[1.2cqw] py-[0.5cqw] text-[1.1cqw] text-muted">
                        Bulan ini
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-[1cqw]">
                      {STATS.map((s) => (
                        <div key={s.label} className="rounded-[0.8cqw] border border-line p-[1.2cqw]">
                          <p className="text-[2.6cqw] leading-none font-semibold tracking-tight">
                            {s.value}
                          </p>
                          <p className="mt-[0.6cqw] text-[1.05cqw] text-muted">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-[0.7cqw]">
                      {Array.from({ length: 28 }, (_, i) => {
                        const mark = MARKED[i];
                        return (
                          <div
                            key={i}
                            className="h-[5.2cqw] rounded-[0.5cqw] border border-line p-[0.6cqw] text-[1cqw] text-muted"
                          >
                            {i + 1}
                            {mark && (
                              <span
                                className={`mt-[0.4cqw] block h-[0.8cqw] rounded-full ${MARK_COLOR[mark]}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <aside className="flex w-[24cqw] shrink-0 flex-col gap-[1cqw] border-l border-line p-[1.6cqw]">
                    <p className="text-[1.3cqw] font-medium">Agenda hari ini</p>
                    {AGENDA.map((a) => (
                      <div key={a.title} className="rounded-[0.8cqw] border border-line p-[1.1cqw]">
                        <p className="text-[1.15cqw] font-medium">{a.title}</p>
                        <p className="mt-[0.5cqw] flex justify-between text-[0.95cqw] text-muted">
                          <span>{a.time}</span>
                          <span className={a.status === 'Terjadwal' ? 'text-accent' : ''}>
                            {a.status}
                          </span>
                        </p>
                      </div>
                    ))}
                  </aside>
                </div>
              </div>
            </div>

            {/* dasar laptop */}
            <div
              ref={baseRef}
              data-bounce="box"
              className="relative left-1/2 h-[clamp(0.55rem,1.4vw,0.9rem)] w-[114%] -translate-x-1/2 rounded-b-[1.2rem] bg-gradient-to-b from-[#d9d9dd] to-[#9d9da3] shadow-[0_30px_50px_-20px_rgba(0,0,0,0.45)]"
            >
              <span className="absolute top-0 left-1/2 h-[40%] w-[14%] -translate-x-1/2 rounded-b-md bg-black/15" />
            </div>
          </div>

          {/* --------------- Tentang: tampil di layar saat laptop memenuhi viewport --------------- */}
          <div
            ref={introRef}
            className="pointer-events-none invisible absolute inset-0 z-20 flex items-center justify-center px-5 pb-[14svh] text-center opacity-0 motion-reduce:hidden"
          >
            <TentangIntro className="max-w-3xl" />
          </div>
        </section>
      </div>

      {/* versi statis untuk pengguna yang mematikan animasi */}
      <div id="tentang" className="hidden scroll-mt-16 bg-surface motion-reduce:block">
        <div className="mx-auto max-w-6xl px-5 pt-24 sm:px-8">
          <TentangIntro className="max-w-2xl" />
        </div>
      </div>
    </>
  );
}