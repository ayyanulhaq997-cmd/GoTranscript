import { getUserRole } from "@/lib/getUserRole";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import PayoutAction from "./PayoutAction";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    const { role } = await getUserRole();

    // 1. Accessible ONLY to role = admin
    // Redirect others to /dashboard
    if (role !== "admin") {
        redirect("/dashboard");
    }

    // 2. Fetch admin stats
    const { count: totalJobs } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true });

    const { count: completedJobs } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed");

    const { data: paidJobs } = await supabase
        .from("jobs")
        .select("price")
        .eq("payment_status", "paid");

    const totalRevenue = (paidJobs || []).reduce((sum, job) => sum + (job.price || 0), 0) / 100;

    // 3. Fetch list of payout rows
    const { data: payouts } = await supabase
        .from("payouts")
        .select(`
            id,
            job_id,
            transcriber_id,
            amount,
            status,
            created_at
        `)
        .order("created_at", { ascending: false });

    const pendingPayoutsCount = (payouts || []).filter(p => p.status === "pending").length;

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="font-semibold text-lg text-gray-900 tracking-tight">
                            GoTranscript <span className="text-gray-400 font-normal px-2">|</span> Admin Control Panel
                        </div>
                        <Link
                            href="/auth/signout"
                            className="text-sm font-medium text-gray-600 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md"
                        >
                            Log Out
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Monitor marketplace health and pending transcriber payouts.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-px bg-gray-200 sm:grid-cols-4 rounded-lg overflow-hidden ring-1 ring-gray-200 shadow-sm">
                        <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                            <p className="text-sm font-medium leading-6 text-gray-500">Total Revenue</p>
                            <p className="mt-2 flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-gray-900">${totalRevenue.toFixed(2)}</span>
                            </p>
                        </div>
                        <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                            <p className="text-sm font-medium leading-6 text-gray-500">Total Jobs</p>
                            <p className="mt-2 flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-gray-900">{totalJobs || 0}</span>
                            </p>
                        </div>
                        <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                            <p className="text-sm font-medium leading-6 text-gray-500">Completed Jobs</p>
                            <p className="mt-2 flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-gray-900">{completedJobs || 0}</span>
                            </p>
                        </div>
                        <div className="bg-white px-4 py-6 sm:px-6 lg:px-8">
                            <p className="text-sm font-medium leading-6 text-gray-500">Pending Payouts</p>
                            <p className="mt-2 flex items-baseline gap-x-2">
                                <span className="text-4xl font-semibold tracking-tight text-yellow-600">{pendingPayoutsCount}</span>
                                <span className="text-sm text-gray-500">jobs</span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Transcriber Payouts</h2>
                        {(!payouts || payouts.length === 0) ? (
                            <div className="text-center bg-white rounded-lg border border-gray-200 p-12 shadow-sm">
                                <p className="text-sm text-gray-500">No payouts to process at this time.</p>
                            </div>
                        ) : (
                            <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Job ID
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Transcriber
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Amount
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Action</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {payouts.map((payout) => (
                                            <tr key={payout.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    #{payout.job_id.split("-")[0]}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {payout.transcriber_id.split("-")[0]}...
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-semibold">
                                                    ${(payout.amount / 100).toFixed(2)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${payout.status === 'paid'
                                                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                            : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                        }`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    {payout.status === "pending" && (
                                                        <PayoutAction payoutId={payout.id} />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
