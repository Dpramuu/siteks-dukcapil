"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import LogoMark from "@/app/components/ui/LogoMark";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

const STORAGE_KEY = "simanten:sidebar-collapsed";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "ti-layout-dashboard" },
  { href: "/template", label: "Template", icon: "ti-file-text" },
  { href: "/schedules", label: "Schedules", icon: "ti-calendar" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ambil state terakhir dari localStorage
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* abaikan */
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* abaikan */
      }
      return next;
    });
  };

  // Shortcut: Ctrl/Cmd + B
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  // Label yang hilang halus saat sidebar ciut
  const labelClass = `whitespace-nowrap transition-all duration-200 ${
    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
  }`;

  // Tooltip saat sidebar ciut
  const Tooltip = ({ text }: { text: string }) =>
    collapsed ? (
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-bg opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {text}
      </span>
    ) : null;

  return (
    <>
      {/* ───────── Desktop sidebar ───────── */}
      <aside
        className={`relative z-30 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 ease-in-out md:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {/* Tombol minimize — menempel di tepi sidebar */}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
          title={`${collapsed ? "Perbesar" : "Perkecil"} sidebar (Ctrl+B)`}
          className="absolute -right-3 top-[26px] z-40 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-muted shadow-sm transition-colors hover:border-accent hover:text-accent"
        >
          <i
            className={`ti ti-chevron-left text-sm transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex h-[72px] items-center gap-3 border-b border-line px-[18px]"
          aria-label="SIMANTEN"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <LogoMark className="h-6 w-6 bg-accent" />
          </span>

          <span
            className={`flex flex-col overflow-hidden leading-tight transition-all duration-200 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-ink">
              SIMANTEN
            </span>
            <span className="whitespace-nowrap text-[11px] text-muted">
              Manajemen Konten
            </span>
          </span>
        </Link>

        {/* Menu */}
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <p
            className={`mb-1 overflow-hidden whitespace-nowrap px-3 text-[11px] font-medium uppercase tracking-widest text-muted transition-all duration-200 ${
              collapsed ? "h-0 opacity-0" : "h-4 opacity-100"
            }`}
          >
            Menu
          </p>

          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-soft text-accent"
                    : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                {/* Indikator aktif */}
                {isActive && (
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
                )}

                <i
                  className={`ti ${item.icon} shrink-0 text-xl`}
                  aria-hidden="true"
                />

                <span className={`overflow-hidden ${labelClass}`}>
                  {item.label}
                </span>

                <Tooltip text={item.label} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          className={`flex gap-2 border-t border-line p-3 ${
            collapsed ? "flex-col items-center" : "items-center"
          }`}
        >
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Logout"
            className={`group relative flex cursor-pointer items-center gap-3 rounded-xl py-2.5 text-sm font-medium text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 ${
              collapsed ? "w-full justify-center px-0" : "flex-1 px-3.5"
            }`}
          >
            <i
              className={`ti ${
                isLoggingOut ? "ti-loader-2 animate-spin" : "ti-logout"
              } shrink-0 text-xl`}
              aria-hidden="true"
            />

            {!collapsed && (
              <span className="whitespace-nowrap">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}

            <Tooltip text="Logout" />
          </button>

          <ThemeToggle className="shrink-0" />
        </div>
      </aside>

      {/* ───────── Mobile bottom nav ───────── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-surface/95 px-2 py-2 backdrop-blur md:hidden">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              <i className={`ti ${item.icon} text-xl`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium text-muted disabled:opacity-50"
        >
          <i
            className={`ti ${
              isLoggingOut ? "ti-loader-2 animate-spin" : "ti-logout"
            } text-xl`}
            aria-hidden="true"
          />
          Logout
        </button>
      </nav>
    </>
  );
}