"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function ReviewAction({ jobId }: { jobId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleComplete = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/jobs/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to mark as complete");
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
                onClick={handleComplete}
                disabled={loading}
                className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? "Marking..." : "Mark as Completed"}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}
