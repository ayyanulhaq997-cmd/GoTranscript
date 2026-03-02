"use client";

import Link from "next/link";

export default function PaymentError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="bg-red-50 p-8 rounded-xl text-center shadow-md max-w-md w-full border border-red-100">
                <div className="mx-auto flex h-16 w-16 mb-4 items-center justify-center rounded-full bg-red-100">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-red-900 mb-2">Payment Verification Failed</h2>
                <p className="text-sm text-red-700 mb-6">
                    We could not securely verify your Stripe session. Please return to your active dashboard to try again, or contact support if the problem persists.
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-50 border border-red-200"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
