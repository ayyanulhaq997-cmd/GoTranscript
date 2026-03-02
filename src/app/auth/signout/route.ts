import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Signout error:", error);
    }

    // Redirect to signin
    const url = new URL("/auth/signin", request.url);
    return NextResponse.redirect(url);
}
