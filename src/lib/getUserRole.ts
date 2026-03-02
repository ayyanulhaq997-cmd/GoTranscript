import { createClient } from "./supabaseServer";

export type UserRole = "client" | "transcriber" | "admin";

export async function getUserRole(): Promise<{
    role: UserRole | null;
    error: Error | null;
}> {
    try {
        const supabase = await createClient();

        // 1. Get current authenticating user session
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return { role: null, error: userError };
        }

        // 2. Fetch profile from the database
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) {
            return { role: null, error: profileError };
        }

        return { role: profile.role as UserRole, error: null };
    } catch (error) {
        return {
            role: null,
            error: error instanceof Error ? error : new Error("Unknown error"),
        };
    }
}
