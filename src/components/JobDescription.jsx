export default function JobDescription({
  fileName,
  jobDescription,
  setJobDescription,
  onAnalyze,
  loading
}) {
  return (
    <div className="flex flex-col gap-6 mt-6">

      {/* Resume confirmed banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-green-900/30 border border-green-700 rounded-xl">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-green-400 font-medium text-sm">Resume uploaded successfully</p>
          <p className="text-gray-400 text-xs mt-0.5">{fileName}</p>
        </div>
      </div>

      {/* JD input */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Paste Job Description</h2>
        <p className="text-gray-400 text-sm">
          Copy the full job description from the listing and paste it below
        </p>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        rows={12}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 
          text-sm text-gray-200 placeholder-gray-600 resize-none
          focus:outline-none focus:border-indigo-500 transition"
      />

      {/* Word count */}
      <p className="text-gray-600 text-xs -mt-4 text-right">
        {jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0} words
      </p>

      {/* Analyze button */}
      <button
        onClick={onAnalyze}
        disabled={loading || !jobDescription.trim()}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-all
          ${loading || !jobDescription.trim()
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
          }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing your fit...
          </span>
        ) : "🔍 Analyze My Fit"}
      </button>

    </div>
  )
}