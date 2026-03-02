"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function PayoutAction({ payoutId }: { payoutId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handlePay = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/payouts/mark-paid", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payoutId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to update payout flag");
            }

            router.refresh();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handlePay}
                disabled={loading}
                className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
                {loading ? "Processing..." : "Mark as Paid"}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
