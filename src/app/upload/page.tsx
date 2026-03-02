import { getUserRole } from "@/lib/getUserRole";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";
import Link from "next/link";

export default async function UploadPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    const { role } = await getUserRole();

    // Role protection: Only clients can upload jobs
    if (role !== "client") {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="font-semibold text-lg text-gray-900 tracking-tight">
                            GoTranscript <span className="text-gray-400 font-normal px-2">|</span> New Job
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
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-sm border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Upload Audio File
                        </h1>
                        <p className="text-sm text-gray-500 mb-8">
                            Submit your audio for transcription. We'll notify you when it's ready.
                        </p>

                        <UploadForm userId={user.id} />
                    </div>
                </div>
            </main>
        </div>
    );
}
