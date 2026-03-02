import { createClient } from "@supabase/supabase-js";

// Uses the Service Role Key to bypass RLS for secure server-side operations
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy_url_for_build.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_for_build",
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
}
