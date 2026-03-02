export default function UploadLoading() {
    return (
        <div className="flex justify-center items-center min-h-[200px] bg-white rounded-lg border border-dashed border-gray-200">
            <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-black"></div>
                <p className="text-sm text-gray-500">Preparing secure upload...</p>
            </div>
        </div>
    );
}
