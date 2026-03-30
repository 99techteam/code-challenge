function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <svg className="text-red-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-gray-800 text-sm font-semibold mb-1">Failed to load token prices</p>
        <p className="text-gray-400 text-xs mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default ErrorMessage;
