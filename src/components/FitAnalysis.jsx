export default function FitAnalysis({ fitReport, onGenerate, onTryNewJD, loading }) {

  const scoreColor =
    fitReport.score >= 75 ? "text-green-400" :
    fitReport.score >= 50 ? "text-yellow-400" :
    "text-red-400"

  const scoreBg =
    fitReport.score >= 75 ? "bg-green-900/30 border-green-700" :
    fitReport.score >= 50 ? "bg-yellow-900/30 border-yellow-700" :
    "bg-red-900/30 border-red-700"

  const verdictEmoji =
    fitReport.verdict === "Strong Fit" ? "🟢" :
    fitReport.verdict === "Partial Fit" ? "🟡" :
    "🔴"

  return (
    <div className="flex flex-col gap-6 mt-6">

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Your Fit Report</h2>
        <p className="text-gray-400 text-sm">Based on your resume vs the job description</p>
      </div>

      {/* Score card */}
      <div className={`flex flex-col items-center justify-center gap-2 px-6 py-8 
        border rounded-2xl ${scoreBg}`}>
        <p className={`text-7xl font-extrabold ${scoreColor}`}>
          {fitReport.score}%
        </p>
        <p className="text-lg font-semibold text-white">
          {verdictEmoji} {fitReport.verdict}
        </p>
        <p className="text-gray-400 text-sm text-center mt-1 max-w-sm">
          {fitReport.summary}
        </p>
      </div>

      {/* Matched skills */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-green-400 font-semibold text-sm uppercase tracking-wide">
          ✅ Matched Skills & Experience
        </h3>
        <ul className="flex flex-col gap-2">
          {fitReport.matched.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-500 mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Missing skills */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">
          ⚠️ Gaps / Missing Skills
        </h3>
        {fitReport.missing.length === 0 ? (
          <p className="text-sm text-gray-400">No major gaps found — great match!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {fitReport.missing.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-500 mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all
            ${loading
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
              Generating your tailored resume...
            </span>
          ) : "✨ Generate Tailored Resume"}
        </button>

        <button
          onClick={onTryNewJD}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-base border border-gray-700 
            text-gray-300 hover:border-gray-500 hover:text-white transition-all cursor-pointer"
        >
          🔄 Try a Different Job Description
        </button>
      </div>

    </div>
  )
}