import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function requireValue(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`Missing ${label}`);
  }
  return value;
}

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    requireValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );
}
