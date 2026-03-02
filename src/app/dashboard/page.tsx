import { getUserRole } from "@/lib/getUserRole";
import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubmitWorkButton from "./SubmitWorkButton";
import ReviewAction from "./ReviewAction";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    const { role } = await getUserRole();

    if (role === "transcriber") {
        // 1. Fetch active jobs for transcriber
        const { data: activeJobs, error } = await supabase
            .from("jobs")
            .select("id, created_at, status")
            .eq("assigned_to", user.id)
            .eq("status", "in_progress")
            .order("created_at", { ascending: false });

        // 2. Fetch transcriber's payouts
        const { data: payouts } = await supabase
            .from("payouts")
            .select("amount, status")
            .eq("transcriber_id", user.id);

        let totalEarned = 0;
        let pendingPayouts = 0;
        let paidPayouts = 0;

        if (payouts) {
            totalEarned = payouts.reduce((sum, p) => sum + p.amount, 0) / 100;
            pendingPayouts = payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) / 100;
            paidPayouts = payouts.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0) / 100;
        }

        return (
            <div className="space-y-8">
                <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                        My Dashboard
                    </h3>
                    <div className="mt-3 sm:ml-4 sm:mt-0">
                        <Link
                            href="/jobs"
                            className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                        >
                            Find New Jobs
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-3 rounded-lg overflow-hidden ring-1 ring-gray-200 shadow-sm">
                    <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                        <p className="text-sm font-medium leading-6 text-gray-500">Total Earned</p>
                        <p className="mt-2 flex items-baseline gap-x-2">
                            <span className="text-3xl font-semibold tracking-tight text-gray-900">${totalEarned.toFixed(2)}</span>
                        </p>
                    </div>
                    <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                        <p className="text-sm font-medium leading-6 text-gray-500">Paid to Date</p>
                        <p className="mt-2 flex items-baseline gap-x-2">
                            <span className="text-3xl font-semibold tracking-tight text-green-600">${paidPayouts.toFixed(2)}</span>
                        </p>
                    </div>
                    <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                        <p className="text-sm font-medium leading-6 text-gray-500">Pending Payouts</p>
                        <p className="mt-2 flex items-baseline gap-x-2">
                            <span className="text-3xl font-semibold tracking-tight text-yellow-600">${pendingPayouts.toFixed(2)}</span>
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Active Jobs
                    </h3>


                    {error && (
                        <p className="text-sm text-red-600">Failed to load active jobs.</p>
                    )}

                    {(!activeJobs || activeJobs.length === 0) ? (
                        <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No active jobs</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You aren't working on any jobs right now.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/jobs"
                                    className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                                >
                                    Browse Job Board
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
                            {activeJobs.map((job) => (
                                <li key={job.id} className="flex items-center justify-between gap-x-6 px-4 py-5 sm:px-6 hover:bg-gray-50">
                                    <div className="min-w-0">
                                        <div className="flex items-start gap-x-3">
                                            <p className="text-sm font-semibold leading-6 text-gray-900">
                                                Job #{job.id.split("-")[0]}
                                            </p>
                                            <p className="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-blue-700 bg-blue-50 ring-blue-600/20">
                                                {job.status}
                                            </p>
                                        </div>
                                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                            <p className="whitespace-nowrap">
                                                Claimed on <time dateTime={job.created_at}>{new Date(job.created_at).toLocaleDateString()}</time>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-none items-center gap-x-4">
                                        <SubmitWorkButton jobId={job.id} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    if (role === "client") {
        const { data: clientJobs, error } = await supabase
            .from("jobs")
            .select("id, created_at, status, submission_url")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        return (
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900">
                        Welcome to your Dashboard
                    </h3>
                    <div className="mt-3 sm:ml-4 sm:mt-0">
                        <Link
                            href="/upload"
                            className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                        >
                            Upload Audio
                        </Link>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600">Failed to load your jobs.</p>}

                {(!clientJobs || clientJobs.length === 0) ? (
                    <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload an audio file to get started.
                        </p>
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-100 bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
                        {clientJobs.map((job) => (
                            <li key={job.id} className="flex items-center justify-between gap-x-6 px-4 py-5 sm:px-6 hover:bg-gray-50">
                                <div className="min-w-0">
                                    <div className="flex items-start gap-x-3">
                                        <p className="text-sm font-semibold leading-6 text-gray-900">
                                            Job #{job.id.split("-")[0]}
                                        </p>
                                        <p className="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-blue-700 bg-blue-50 ring-blue-600/20">
                                            {job.status}
                                        </p>
                                    </div>
                                    <div className="mt-1 flex flex-col gap-y-1 text-xs leading-5 text-gray-500">
                                        <p className="whitespace-nowrap">
                                            Uploaded on <time dateTime={job.created_at}>{new Date(job.created_at).toLocaleDateString()}</time>
                                        </p>
                                        {job.submission_url && (
                                            <a
                                                href={job.submission_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Download Transcript
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-none items-center gap-x-4">
                                    {job.status === "submitted" && (
                                        <ReviewAction jobId={job.id} />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    // Admin logic
    redirect("/admin");
}
