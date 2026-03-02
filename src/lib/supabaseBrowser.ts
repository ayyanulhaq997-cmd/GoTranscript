import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy_url_for_build.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key_for_build"
    );
}
