'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { href: '/template',  label: 'Template',  icon: 'ti-file-text' },
  { href: '/schedules', label: 'Schedules', icon: 'ti-calendar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // 1. Sign out on client side to clear Supabase browser cookies/session
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();

      // 2. Call server route handler to clear server cookies
      await fetch('/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // 3. Hard redirect to /login to ensure full reset of client state and cache
      window.location.href = '/login';
    }
  };

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-zinc-800 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
          <span className="text-sm font-bold text-black">S</span>
        </div>
        <span className="text-[15px] font-medium tracking-tight text-white">SI-TEKS</span>
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
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              <i className={`ti ${item.icon} text-lg`} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className={`ti ${isLoggingOut ? 'ti-loader-2 animate-spin' : 'ti-logout'} text-lg`} aria-hidden="true" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}