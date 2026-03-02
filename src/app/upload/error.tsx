"use client";

export default function UploadError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="bg-red-50 p-6 rounded-lg text-center shadow-sm">
            <h2 className="text-lg font-bold text-red-900 mb-2">Upload Failed</h2>
            <p className="text-sm text-red-700 mb-4 max-w-sm mx-auto">
                We encountered an error processing your file upload or establishing a secure payment session. Please try again or check your connectivity.
            </p>
            <button
                onClick={() => reset()}
                className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
            >
                Retry Upload
            </button>
        </div>
    );
}
