'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { gsap, ScrollSmoother, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import Magnetic from '@/app/components/ui/Magnetic';
import ThemeToggle from '@/app/components/ui/ThemeToggle';

const NAV = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#tentang', label: 'Tentang' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#alur', label: 'Alur' },
  { href: '#faq', label: 'FAQ' },
];

/* logo satu warna dipakai sebagai mask, jadi warnanya ikut token --color-accent
   (biru di mode terang, biru lebih terang di mode gelap) */
function LogoMark({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block bg-accent ${className}`}
      style={{
        WebkitMaskImage: 'url(/logo_simanten.png)',
        maskImage: 'url(/logo_simanten.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hover, setHover] = useState(false);
  const [activeSection, setActiveSection] = useState('#beranda');

  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);
  const miniRef = useRef<HTMLButtonElement>(null);
  const miniInnerRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hoverTimer = useRef(0);
  const morphReady = useRef(false);
  const prev = useRef({ compact: false, label: '' });
  const menuReady = useRef(false);
  const indicatorReady = useRef(false);

  const compact = collapsed && !hover && !menuOpen;
  const activeLabel = NAV.find((n) => n.href === activeSection)?.label ?? '';

  /* ---------------------------------------------------------- scroll → collapse */
  // hysteresis: baru berubah setelah scroll >12px searah, supaya tidak berkedip
  // saat scroll kecil / arah bolak-balik
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let anchor = 0;
    let dir = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        if (y < 140) {
          anchor = y;
          setCollapsed(false);
          return;
        }
        if (self.direction !== dir) {
          dir = self.direction;
          anchor = y;
        }
        if (Math.abs(y - anchor) > 12) setCollapsed(dir === 1);
      },
    });

    return () => st.kill();
  }, []);

  // menu mobile ikut menutup saat navbar menyempit
  useEffect(() => {
    if (collapsed) setMenuOpen(false);
  }, [collapsed]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [menuOpen]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* ------------------------------------------------------------ hover (mouse) */
  const handleEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover(true), 60);
  };
  const handleLeave = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setHover(false), 220);
  };

  /* ------------------------------------------------- lebar layer penuh dikunci */
  // layer penuh selalu selebar stage, jadi isinya tidak ikut "terjepit"
  // saat pill menyempit — hanya di-crossfade dan di-clip oleh pill
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const full = fullRef.current;
    if (!stage || !full) return;

    const sync = () => {
      full.style.width = `${stage.offsetWidth}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  /* --------------------------------------------------------- morph pill ↔ mini */
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const full = fullRef.current;
    const mini = miniRef.current;
    const inner = miniInnerRef.current;
    const stage = stageRef.current;
    if (!pill || !full || !mini || !inner || !stage) return;

    const { compact: wasCompact, label: prevLabel } = prev.current;
    const isFirst = !morphReady.current;
    morphReady.current = true;
    prev.current = { compact, label: activeLabel };

    const target = compact ? inner.offsetWidth : stage.offsetWidth;

    if (isFirst || prefersReducedMotion()) {
      gsap.set(pill, compact ? { width: target } : { clearProps: 'width' });
      gsap.set(full, { autoAlpha: compact ? 0 : 1 });
      gsap.set(mini, { autoAlpha: compact ? 1 : 0 });
      return;
    }

    // status compact tidak berubah: hanya label section yang ganti
    if (compact === wasCompact) {
      if (compact && prevLabel !== activeLabel) {
        gsap.to(pill, { width: target, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        gsap.fromTo(
          labelRef.current,
          { yPercent: 70, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' },
        );
      }
      return;
    }

    tlRef.current?.kill();
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tlRef.current = tl;

    if (compact) {
      tl.to(full, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0)
        .to(pill, { width: target, duration: 0.65 }, 0.05)
        .to(mini, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' }, 0.35);
    } else {
      tl.to(mini, { autoAlpha: 0, duration: 0.15, ease: 'power2.out' }, 0)
        .to(
          pill,
          {
            width: target,
            duration: 0.65,
            onComplete: () => {
              gsap.set(pill, { clearProps: 'width' });
            },
          },
          0,
        )
        .to(full, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, 0.3);
    }

    // tanpa cleanup: effect ini juga jalan saat label berganti, dan itu tidak boleh
    // mematikan animasi melebar yang sedang berjalan. Timeline dimatikan lewat tlRef.
  }, [compact, activeLabel]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    [],
  );

  /* ------------------------------------- indikator aktif yang bergeser antar link */
  useLayoutEffect(() => {
    const nav = navRef.current;
    const ind = indicatorRef.current;
    if (!nav || !ind) return;

    const place = (animate: boolean) => {
      const el = nav.querySelector<HTMLElement>(`[data-href="${activeSection}"]`);
      if (!el || !el.offsetWidth) {
        gsap.set(ind, { opacity: 0 });
        return;
      }
      const vars = { x: el.offsetLeft, width: el.offsetWidth, opacity: 1 };
      if (animate && !prefersReducedMotion()) {
        gsap.to(ind, { ...vars, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
      } else {
        gsap.set(ind, vars);
      }
    };

    place(indicatorReady.current);
    indicatorReady.current = true;

    const ro = new ResizeObserver(() => place(false));
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activeSection]);

  /* ---------------------------------------------------------------- scroll-spy */
  // Section aktif dihitung murni dari posisi scroll (bukan dari callback masuk/keluar),
  // jadi tidak bisa "tertinggal" di section lama ke arah scroll mana pun.
  // Ditunda satu frame: HeroZoom dan pin Fitur harus sudah membuat ScrollTrigger-nya.
  useEffect(() => {
    let ctx: gsap.Context | undefined;

    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        // penanda awal tiap section; nilai .start dibaca live sehingga ikut ter-refresh
        const marks = (['#fitur', '#alur', '#faq'] as const).flatMap((href) => {
          const el = document.querySelector(href);
          if (!el) return [];
          return [{ href, st: ScrollTrigger.create({ trigger: el, start: 'top center' }) }];
        });

        const resolve = (y: number): string => {
          let active = '#beranda';
          const hero = ScrollTrigger.getById('hero-zoom');
          // Tentang = paruh akhir hero + pilar, sampai awal Fitur
          if (hero && y >= hero.start + (hero.end - hero.start) * 0.5) active = '#tentang';
          for (const m of marks) if (y >= m.st.start) active = m.href;
          return active;
        };

        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => setActiveSection(resolve(self.scroll())),
          onRefresh: (self) => setActiveSection(resolve(self.scroll())),
        });

        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  /* ----------------------------------------------------------- progres scroll */
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  /* --------------------------------------------------------------- menu mobile */
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    if (!menuReady.current) {
      menuReady.current = true;
      return;
    }

    gsap.killTweensOf(el);

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: menuOpen ? 1 : 0, height: menuOpen ? 'auto' : 0 });
      return;
    }

    if (menuOpen) {
      const items = el.querySelectorAll('[data-menu-item]');
      gsap
        .timeline()
        .to(el, { autoAlpha: 1, height: 'auto', duration: 0.5, ease: 'expo.out' })
        .fromTo(
          items,
          { autoAlpha: 0, x: -12 },
          { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out', clearProps: 'transform' },
          0.08,
        );
    } else {
      gsap.to(el, { autoAlpha: 0, height: 0, duration: 0.3, ease: 'power2.inOut' });
    }
  }, [menuOpen]);

  /* ---------------------------------------------------------------- navigasi */
  // hero di-pin, jadi #beranda dan #tentang tidak bisa dicapai lewat anchor biasa
  const goTo = (e: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const st = ScrollTrigger.getById('hero-zoom');
    const target: number | string =
      href === '#beranda' ? 0 : href === '#tentang' && st ? st.end : href;

    const smoother = ScrollSmoother.get();
    if (smoother) smoother.scrollTo(target, true);
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // header tidak menangkap klik di area kosong kiri-kanan pill
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-5">
      <div ref={stageRef} className="relative flex w-full max-w-3xl justify-center">
        {/* ================================ PILL ================================ */}
        <div
          ref={pillRef}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
          onClick={() => {
            if (compact) setCollapsed(false); // tap di layar sentuh / Enter di keyboard
          }}
          className="pointer-events-auto relative h-14 w-full shrink-0 overflow-hidden rounded-full border border-line/60 bg-surface/80 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 sm:h-16"
        >
          {/* ---------- layer penuh ---------- */}
          <div
            ref={fullRef}
            className="absolute inset-y-0 left-0 flex w-full items-center justify-between pl-5 pr-2.5 sm:pr-3"
          >
            <Link
              href="/"
              onClick={(e) => goTo(e, '#beranda')}
              className="group flex shrink-0 items-center gap-2.5"
            >
              <LogoMark className="h-7 w-7 shrink-0 transition-transform duration-500 ease-out group-hover:scale-110" />
              <span className="text-sm font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                Simanten
              </span>
            </Link>

            {/* desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              <nav ref={navRef} aria-label="Navigasi utama" className="relative flex items-center gap-0.5">
                <span
                  ref={indicatorRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-0 rounded-full bg-ink/[0.07] opacity-0"
                />
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    data-href={item.href}
                    data-active={activeSection === item.href}
                    aria-current={activeSection === item.href ? 'true' : undefined}
                    onClick={(e) => goTo(e, item.href)}
                    className="relative rounded-full px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink data-[active=true]:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <span className="h-5 w-px bg-line" aria-hidden />

              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Magnetic strength={0.2}>
                  <Link
                    href="/login"
                    className="press group inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-5 py-2.5 text-[13px] font-medium text-bg hover:border-accent hover:bg-accent hover:text-bg"
                  >
                    Masuk
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Magnetic>
              </div>
            </div>

            {/* mobile & tablet */}
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle />
              <Link
                href="/login"
                className="press rounded-full border border-ink bg-ink px-4 py-2 text-xs font-medium text-bg"
              >
                Masuk
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                className="press relative h-9 w-9 rounded-full border border-line"
              >
                <span
                  className={`absolute top-1/2 left-1/2 -mt-[0.75px] -ml-2 block h-[1.5px] w-4 rounded-full bg-ink transition-transform duration-300 ease-out ${
                    menuOpen ? 'rotate-45' : '-translate-y-[3px]'
                  }`}
                />
                <span
                  className={`absolute top-1/2 left-1/2 -mt-[0.75px] -ml-2 block h-[1.5px] w-4 rounded-full bg-ink transition-transform duration-300 ease-out ${
                    menuOpen ? '-rotate-45' : 'translate-y-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ---------- layer mini (saat menyempit) ---------- */}
          <button
            ref={miniRef}
            type="button"
            aria-label={`Buka navigasi (sekarang di ${activeLabel})`}
            className="invisible absolute inset-0 flex items-center justify-center opacity-0"
          >
            <span ref={miniInnerRef} className="flex shrink-0 items-center gap-2.5 px-5 whitespace-nowrap">
              <LogoMark className="h-7 w-7 shrink-0" />
              <span className="text-sm font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
                Simanten
              </span>
              <span className="h-3.5 w-px bg-line-strong" aria-hidden />
              <span className="overflow-hidden">
                <span ref={labelRef} className="block text-[13px] font-medium text-ink-soft">
                  {activeLabel}
                </span>
              </span>
            </span>
          </button>

          {/* progres scroll — menempel di dasar pill */}
          <div
            ref={progressRef}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-ink"
          />
        </div>

        {/* ============================ MENU MOBILE ============================ */}
        <div
          id="nav-menu"
          ref={menuRef}
          className="pointer-events-auto invisible absolute inset-x-0 top-full mt-2 h-0 overflow-hidden rounded-3xl border border-line/60 bg-surface/90 opacity-0 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Menu" className="space-y-0.5 p-2">
            {NAV.map((item) => {
              const active = activeSection === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  data-menu-item
                  aria-current={active ? 'true' : undefined}
                  onClick={(e) => {
                    goTo(e, item.href);
                    setMenuOpen(false);
                  }}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors ${
                    active
                      ? 'bg-ink/[0.06] font-medium text-ink'
                      : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink'
                  }`}
                >
                  {item.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
                </a>
              );
            })}
            <div className="mt-1 border-t border-line pt-1">
              <Link
                href="/login"
                data-menu-item
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                Masuk
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}