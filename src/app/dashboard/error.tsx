"use client";

import { useEffect } from "react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Dashboard error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Could not load dashboard data</h2>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
                There was a problem fetching your roles or active jobs. The database may be down or your session expired.
            </p>
            <button
                onClick={() => reset()}
                className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
                Try refreshing
            </button>
        </div>
    );
}
