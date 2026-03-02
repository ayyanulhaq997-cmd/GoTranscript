export default function DashboardLoading() {
    return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
                <p className="text-sm text-gray-500 font-medium animate-pulse">Loading dashboard elements...</p>
            </div>
        </div>
    );
}
