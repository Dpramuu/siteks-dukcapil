import { createBrowserClient } from '@supabase/ssr';

// Dipakai di Client Components (login, register, logout, dll)
// Berbeda dari supabase-server.ts yang dipakai di Server Components
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

