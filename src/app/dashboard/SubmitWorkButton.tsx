"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseBrowser";

export default function SubmitWorkButton({ jobId }: { jobId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
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
            setError("Please select a document file first.");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // 1. Upload file to Supabase Storage (transcripts bucket)
            const fileExt = file.name.split(".").pop();
            const fileName = `transcript_${jobId}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("transcripts")
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            // 2. Fetch the public URL (or just save the path)
            const { data: publicUrlData } = supabase.storage
                .from("transcripts")
                .getPublicUrl(filePath);

            // 3. Update jobs table
            const { error: updateError } = await supabase
                .from("jobs")
                .update({
                    submission_url: publicUrlData.publicUrl,
                    status: "submitted",
                    completed_at: new Date().toISOString(),
                })
                .eq("id", jobId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            // 4. Success -> Refresh
            setIsFormOpen(false);
            router.refresh();

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during upload.");
            setUploading(false);
        }
    };

    if (!isFormOpen) {
        return (
            <button
                onClick={() => setIsFormOpen(true)}
                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
            >
                Submit Work
            </button>
        );
    }

    return (
        <form onSubmit={handleUpload} className="flex flex-col gap-2 mt-2 w-full max-w-sm">
            <input
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={handleFileChange}
                className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="rounded-md bg-black px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Confirm Submit"}
                </button>
                <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
