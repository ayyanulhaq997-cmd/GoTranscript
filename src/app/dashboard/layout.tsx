import { getUserRole } from "@/lib/getUserRole";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { createClient } from "@/lib/supabaseServer";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    const { role, error } = await getUserRole();

    if (error) {
        console.error("Failed to load user role: ", error);
    }

    // Define role-specific text
    const getRoleTitle = (role: string | null) => {
        switch (role) {
            case "admin":
                return "Admin Dashboard";
            case "transcriber":
                return "Transcriber Dashboard";
            case "client":
                return "Client Dashboard";
            default:
                return "User Dashboard";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="font-semibold text-lg text-gray-900 tracking-tight">
                            GoTranscript <span className="text-gray-400 font-normal px-2">|</span> {getRoleTitle(role)}
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                {user.email} <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs ml-2 uppercase font-medium">{role || 'unknown'}</span>
                            </span>
                            <form action="/auth/signout" method="post">
                                <button className="text-sm font-medium text-gray-600 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md">
                                    Sign out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
