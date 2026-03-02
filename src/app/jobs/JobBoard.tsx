"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

type Job = {
    id: string;
    created_at: string;
    status: string;
    file_url: string;
};

export default function JobBoard({ initialJobs, userId }: { initialJobs: Job[], userId: string }) {
    const [jobs, setJobs] = useState<Job[]>(initialJobs);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleClaim = async (jobId: string) => {
        setClaimingId(jobId);
        setError(null);

        const { error: updateError } = await supabase
            .from("jobs")
            .update({
                status: "in_progress",
                assigned_to: userId,
            })
            .eq("id", jobId)
            .eq("status", "pending"); // Guard: only update if it is still pending

        if (updateError) {
            setError(updateError.message);
            setClaimingId(null);
            return;
        }

        // Success -> Remove from list and redirect to dashboard
        setJobs((currentJobs) => currentJobs.filter((j) => j.id !== jobId));
        router.push("/dashboard");
        router.refresh();
    };

    if (jobs.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">No pending jobs</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Check back later for new transcription opportunities.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                Job ID
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Created
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Claim</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                    {job.id.split("-")[0]}...
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                        {job.status}
                                    </span>
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button
                                        onClick={() => handleClaim(job.id)}
                                        disabled={claimingId === job.id}
                                        className="text-black hover:text-gray-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {claimingId === job.id ? "Claiming..." : "Claim Job"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
