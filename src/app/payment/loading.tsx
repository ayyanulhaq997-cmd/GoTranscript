export default function PaymentLoading() {
    return (
        <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-green-600"></div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Verifying Secure Payment...</h3>
                    <p className="text-sm text-gray-500 max-w-sm animate-pulse">Communicating with our payment processor. Please do not close or refresh this window.</p>
                </div>
            </div>
        </div>
    );
}
