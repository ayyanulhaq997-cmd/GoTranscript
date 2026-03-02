import { getUserRole } from "@/lib/getUserRole";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import JobBoard from "./JobBoard";
import Link from "next/link";

export default async function JobsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    const { role } = await getUserRole();

    // Role protection: Only transcribers can access the job board
    if (role !== "transcriber") {
        redirect("/dashboard");
    }

    // Fetch pending jobs
    const { data: jobs, error } = await supabase
        .from("jobs")
        .select("id, created_at, status, file_url")
        .eq("status", "pending")
        .eq("payment_status", "paid")
        .order("created_at", { ascending: true }); // older jobs first

    if (error) {
        console.error("Error fetching jobs:", error);
    }

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="font-semibold text-lg text-gray-900 tracking-tight">
                            GoTranscript <span className="text-gray-400 font-normal px-2">|</span> Job Board
                        </div>
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-600 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Available Jobs</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Browse pending transcription tasks and claim them below.
                        </p>
                    </div>

                    <JobBoard initialJobs={jobs || []} userId={user.id} />
                </div>
            </main>
        </div>
    );
}
