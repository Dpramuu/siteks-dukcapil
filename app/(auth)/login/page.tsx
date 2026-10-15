"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";
import CustomCursor from "@/app/components/ui/CustomCursor";
import LogoMark from "@/app/components/ui/LogoMark";
import Magnetic from "@/app/components/ui/Magnetic";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

/** hanya izinkan path internal; tolak URL eksternal ("//evil.com", "https://...") */
function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/dashboard";
  return value;
}

/** input bergaya garis bawah: label naik saat fokus / terisi, garis biru memanjang saat fokus */
function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  trailing?: ReactNode;
}) {
  return (
    <div data-auth-in className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        autoCapitalize="none"
        spellCheck={false}
        placeholder=" "
        className="peer block w-full border-b border-line-strong bg-transparent pt-6 pr-11 pb-2.5 text-base text-ink outline-none transition-colors duration-300 hover:border-ink-soft/60"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-6 left-0 origin-left text-base text-muted transition-all duration-300 ease-out peer-focus:-translate-y-5 peer-focus:scale-75 peer-focus:text-accent peer-autofill:-translate-y-5 peer-autofill:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-5 peer-[:not(:placeholder-shown)]:scale-75"
      >
        {label}
      </label>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] peer-focus:scale-x-100"
      />
      {trailing}
    </div>
  );
}

/* siku biru di empat sudut kartu — seperti tanda potong di dokumen cetak */
const CORNERS = [
  "-top-px -left-px border-t-2 border-l-2",
  "-top-px -right-px border-t-2 border-r-2",
  "-bottom-px -left-px border-b-2 border-l-2",
  "-bottom-px -right-px border-b-2 border-r-2",
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  /* animasi masuk + gerak latar */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return; // CSS sudah menampilkan semuanya

    const ctx = gsap.context(() => {
      const masks = Array.from(root.querySelectorAll<HTMLElement>("[data-mask]"));
      const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
      const card = root.querySelector<HTMLElement>("[data-card]");
      const corners = Array.from(root.querySelectorAll<HTMLElement>("[data-corner]"));
      const wordmark = root.querySelector<HTMLElement>("[data-wm]");
      const rest = Array.from(
        root.querySelectorAll<HTMLElement>(
          "[data-auth-in]:not([data-mask]):not([data-card]):not([data-corner]):not([data-wm])",
        ),
      );

      gsap.set(masks, { opacity: 1 });
      gsap.set(lines, { yPercent: 115 });
      gsap.set(corners, { scale: 0 });

      const tl = gsap.timeline({ delay: 0.1 });
      if (wordmark) tl.fromTo(wordmark, { opacity: 0 }, { opacity: 1, duration: 2.2, ease: "power2.out" }, 0);
      if (card) {
        tl.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "expo.out" },
          0.1,
        );
      }
      tl.to(corners, { scale: 1, duration: 0.8, stagger: 0.07, ease: "back.out(2.5)" }, 0.5)
        .to(lines, { yPercent: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.45)
        .fromTo(
          rest,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: "expo.out" },
          0.6,
        );
    }, root);

    /* cahaya biru lembut + wordmark raksasa bergeser mengikuti kursor */
    let detach = () => {};
    if (window.matchMedia("(pointer: fine)").matches) {
      const spot = root.querySelector<HTMLElement>("[data-spot]");
      const par = root.querySelector<HTMLElement>("[data-par]");
      if (spot) gsap.set(spot, { xPercent: -50, yPercent: -50 });
      const sx = spot ? gsap.quickTo(spot, "x", { duration: 0.9, ease: "power3.out" }) : null;
      const sy = spot ? gsap.quickTo(spot, "y", { duration: 0.9, ease: "power3.out" }) : null;
      const px = par ? gsap.quickTo(par, "x", { duration: 1.4, ease: "power3.out" }) : null;
      const py = par ? gsap.quickTo(par, "y", { duration: 1.4, ease: "power3.out" }) : null;

      const onMove = (e: PointerEvent) => {
        if (spot && sx && sy) {
          sx(e.clientX);
          sy(e.clientY);
          gsap.to(spot, { opacity: 1, duration: 0.8, overwrite: "auto" });
        }
        if (px && py) {
          px((e.clientX / window.innerWidth - 0.5) * -60);
          py((e.clientY / window.innerHeight - 0.5) * -30);
        }
      };
      window.addEventListener("pointermove", onMove);
      detach = () => window.removeEventListener("pointermove", onMove);
    }

    return () => {
      detach();
      ctx.revert();
    };
  }, []);

  // pesan error muncul dengan sedikit goyangan supaya terlihat
  useEffect(() => {
    const el = errorRef.current;
    if (!error || !el || prefersReducedMotion()) return;

    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(el, { x: -12 }, { x: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
  }, [error]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email atau password salah.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const redirectTo = safeRedirect(params.get("redirectTo"));

      // transisi keluar: lingkaran hitam melebar dari tombol sampai menutup layar
      const curtain = curtainRef.current;
      if (curtain && !prefersReducedMotion()) {
        const rect = submitRef.current?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        );

        await new Promise<void>((resolve) => {
          const logo = curtain.querySelector("[data-curtain-logo]");
          gsap.set(curtain, { clipPath: `circle(0px at ${x}px ${y}px)` });
          gsap
            .timeline({ onComplete: resolve })
            .to(curtain, {
              clipPath: `circle(${radius}px at ${x}px ${y}px)`,
              duration: 1,
              ease: "expo.inOut",
            })
            .fromTo(
              logo,
              { opacity: 0, scale: 0.6 },
              { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" },
              "-=0.45",
            );
        });
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError("Tidak dapat terhubung ke server. Pastikan aplikasi sedang berjalan.");

      setLoading(false);
    }
  };

  return (
    <div ref={rootRef} className="relative isolate flex h-svh flex-col overflow-hidden bg-bg text-ink">
      {/* ---------- latar: titik halus, wordmark raksasa, cahaya biru ---------- */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in srgb, var(--color-ink) 22%, transparent) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div data-auth-in data-wm className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div data-par>
            <p className="text-center text-[17vw] leading-none font-black tracking-[-0.06em] whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_var(--color-line-strong)]">
              SIMANTEN
            </p>
          </div>
        </div>

        <div
          data-spot
          className="absolute top-0 left-0 size-[32rem] rounded-full bg-accent/25 opacity-0 blur-3xl"
        />
      </div>

      {/* ---------- bar atas ---------- */}
      <header data-auth-in className="relative z-10 flex items-center justify-end px-6 py-5 sm:px-10">
        <ThemeToggle />
      </header>

      {/* ---------- kartu di tengah ---------- */}
      <main className="relative z-10 grid min-h-0 flex-1 place-items-center px-5 pb-12">
        <div
          data-auth-in
          data-card
          className="relative w-full max-w-md rounded-sm border border-line bg-surface/80 p-7 backdrop-blur-md sm:p-10 [@media(max-height:760px)]:p-6"
        >
          {CORNERS.map((c) => (
            <span
              key={c}
              data-auth-in
              data-corner
              aria-hidden
              className={`absolute size-5 border-accent ${c}`}
            />
          ))}

          <div data-auth-in className="mb-6 flex items-center gap-2.5 [@media(max-height:760px)]:mb-4">
            <LogoMark className="h-8 w-8 bg-accent" />
            <span className="text-lg font-semibold tracking-tight">Simanten</span>
          </div>

          <div className="mb-7 [@media(max-height:760px)]:mb-5">
            <h1
              data-auth-in
              data-mask
              className="text-[clamp(2.2rem,4.4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.04em]"
            >
              <span className="-my-[0.12em] block overflow-hidden py-[0.12em]">
                <span data-line className="block">
                  Masuk
                </span>
              </span>
            </h1>
            <p data-auth-in className="mt-3 text-sm text-muted">
              Lanjutkan ke akun SI-MANTEN kamu.
            </p>
          </div>

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="mb-6 flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Field
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <Field
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="absolute right-0 bottom-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div data-auth-in className="mt-2">
              <Magnetic strength={0.12} className="block">
                <button
                  ref={submitRef}
                  type="submit"
                  disabled={loading}
                  className="press group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-ink py-4 text-sm font-medium text-bg disabled:opacity-70"
                >
                  {/* isi biru yang naik dari bawah saat di-hover */}
                  <span
                    aria-hidden
                    className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </span>
                </button>
              </Magnetic>
            </div>
          </form>

          <p data-auth-in className="mt-6 text-center text-sm text-muted [@media(max-height:760px)]:mt-4">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="link-sweep font-medium text-accent transition-colors hover:text-ink"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </main>

      <p
        data-auth-in
        className="absolute inset-x-0 bottom-5 z-10 hidden text-center text-xs text-muted [@media(min-height:760px)]:block"
      >
        Sistem Informasi Manajemen Konten
      </p>

      {/* tirai transisi setelah login berhasil */}
      <div
        ref={curtainRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-ink"
        style={{ clipPath: "circle(0px at 50% 50%)" }}
      >
        <div data-curtain-logo className="opacity-0">
          <LogoMark className="h-14 w-14 bg-bg" />
        </div>
      </div>

      {/* cursor custom — dipasang di sini supaya cursor tidak hilang di halaman login */}
      <CustomCursor />
    </div>
  );
}