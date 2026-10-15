"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "ti-layout-dashboard",
  },
  {
    href: "/template",
    label: "Template",
    icon: "ti-file-text",
  },
  {
    href: "/schedules",
    label: "Schedules",
    icon: "ti-calendar",
  },
];

type UserSession = {
  id?: string;
  username?: string;
  email?: string;
};

type SidebarProps = {
  user?: UserSession | null;
};

export default function Sidebar({ user: initialUser }: SidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(
    initialUser ?? null
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      return;
    }

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [initialUser]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <span className="text-sm font-bold text-black">S</span>
        </div>

        <span className="text-[15px] font-medium tracking-tight text-white">
          SI-TEKS
        </span>
      </div>

      {/* Menu */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
          Menu
        </p>

        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
              }`}
            >
              <i className={`ti ${item.icon} text-lg`} aria-hidden="true" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 p-3 flex flex-col gap-2">
        {currentUser && (
          <div className="flex items-center gap-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-xs font-semibold text-blue-400 shrink-0">
              {currentUser.username
                ? currentUser.username.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">
                {currentUser.username}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i
            className={`ti ${
              isLoggingOut ? "ti-loader-2 animate-spin" : "ti-logout"
            } text-lg`}
            aria-hidden="true"
          />

          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}

