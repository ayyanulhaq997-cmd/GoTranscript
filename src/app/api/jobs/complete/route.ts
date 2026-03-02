import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { jobId } = await req.json();

        // 1. Verify job ownership entirely on the server using RLS context
        const { data: job, error: jobError } = await supabase
            .from("jobs")
            .select("price, assigned_to, user_id, status")
            .eq("id", jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json({ error: "Job not found or unauthorized to access." }, { status: 404 });
        }

        if (job.user_id !== user.id) {
            return NextResponse.json({ error: "You do not own this job." }, { status: 403 });
        }

        if (job.status !== "submitted") {
            return NextResponse.json({ error: "Job is not in the correct state to manually complete." }, { status: 400 });
        }

        // 2. Perform the critical updates bypassing RLS, executing as admin
        const adminClient = createAdminClient();

        const { error: updateError } = await adminClient
            .from("jobs")
            .update({ status: "completed" })
            .eq("id", jobId);

        if (updateError) throw updateError;

        // 3. Create transcriber payout automatically
        const transcriberCut = Math.round((job.price || 0) * 0.70);
        const { error: payoutError } = await adminClient
            .from("payouts")
            .insert({
                job_id: jobId,
                transcriber_id: job.assigned_to,
                amount: transcriberCut,
                status: "pending"
            });

        if (payoutError) {
            console.error("Failed to generate payout row:", payoutError);
            // Production system edge case handling would alert administrators here
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Server Error" }, { status: 500 });
    }
}
