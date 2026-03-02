import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { getUserRole } from "@/lib/getUserRole";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { role } = await getUserRole();
        if (role !== "admin") {
            return NextResponse.json({ error: "Only admins can perform this action." }, { status: 403 });
        }

        const { payoutId } = await req.json();

        // 1. Bypass Payouts RLS limitations using admin role mapping
        const adminClient = createAdminClient();

        const { error } = await adminClient
            .from("payouts")
            .update({ status: "paid" })
            .eq("id", payoutId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
