import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Link from "next/link";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
    apiVersion: "2025-01-27.acacia" as any,
});

export default async function PaymentSuccessPage({
    searchParams,
}: {
    searchParams: { session_id?: string; job_id?: string };
}) {
    const { session_id, job_id } = await searchParams; // next15 destructuring format pattern

    if (!session_id || !job_id) {
        redirect("/dashboard");
    }

    try {
        // Verify session with Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            const { createAdminClient } = await import('@/lib/supabaseAdmin');
            const adminClient = createAdminClient();

            // Update database payment_status to 'paid' (Must use Admin Client because RLS prevents standard updates to payment_status)
            await adminClient
                .from("jobs")
                .update({ payment_status: "paid" })
                .eq("id", job_id)
                .eq("stripe_session_id", session_id);
        } else {
            redirect("/dashboard?error=payment-failed")
        }

    } catch (err) {
        console.error("Payment sync failed:", err);
        return (
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                <p className="text-red-500">Could not confirm payment at this time. Support will be notified.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                        Payment Successful!
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Your transaction was completed and your job is now visible to transcribers.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Reference: {session_id?.slice(0, 10)}...
                    </p>
                </div>
                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="flex w-full justify-center rounded-md bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
