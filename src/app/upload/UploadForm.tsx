"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function UploadForm({ userId }: { userId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select an audio file first.");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("audio-files")
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // 2. Insert into jobs table
            const demoPrice = 2000; // $20.00 in cents

            const { data: jobData, error: insertError } = await supabase.from("jobs").insert([
                {
                    user_id: userId,
                    file_url: filePath,
                    status: "pending",
                    price: demoPrice,
                    payment_status: "unpaid"
                },
            ]).select().single();

            if (insertError) {
                throw new Error(insertError.message);
            }

            // 3. Create Stripe Checkout Session
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: jobData.id, price: demoPrice }),
            });

            const sessionData = await res.json();
            if (!res.ok) {
                throw new Error(sessionData.error || "Failed to create checkout session");
            }

            // 4. Update job with stripe_session_id
            await supabase
                .from("jobs")
                .update({ stripe_session_id: sessionData.sessionId })
                .eq("id", jobData.id);

            // 5. Redirect to Stripe Checkout
            router.push(sessionData.url);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during upload.");
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload} className="space-y-6">
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
                    Select Audio File
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md bg-white font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:underline"
                            >
                                <span>Upload a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept="audio/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600 mt-1">MP3, M4A, WAV up to 50MB</p>
                        {file && (
                            <p className="mt-4 text-sm font-medium text-black">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="flex w-full justify-center rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                    {uploading ? "Uploading Job..." : "Submit Audio for Transcription"}
                </button>
            </div>
        </form>
    );
}
