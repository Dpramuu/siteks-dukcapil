'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { href: '/template',  label: 'Template',  icon: 'ti-file-text' },
  { href: '/schedules', label: 'Schedules', icon: 'ti-calendar' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch('/(auth)/logout', { method: 'POST' });
    router.refresh(); // refresh supaya layout server re-fetch session
    router.push('/login');
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
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
        >
          <i className="ti ti-logout text-lg" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}