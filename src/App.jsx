import { useState } from "react"
import ResumeUpload from "./components/ResumeUpload"
import JobDescription from "./components/JobDescription"
import FitAnalysis from "./components/FitAnalysis"
import NewResume from "./components/NewResume"

export default function App() {
  // Global state
  const [resumeText, setResumeText] = useState("")        // extracted text from uploaded resume
  const [resumeFileName, setResumeFileName] = useState("") // just for display
  const [jobDescription, setJobDescription] = useState("") // JD pasted by user
  const [fitReport, setFitReport] = useState(null)         // analysis result from LLM
  const [generatedResume, setGeneratedResume] = useState("") // tailored resume from LLM
  const [step, setStep] = useState(1)                      // controls which screen to show
  const [loading, setLoading] = useState(false)            // loading state for API calls
  const [error, setError] = useState("")                   // error messages

  // Step 1 → Step 2: resume uploaded successfully
  function handleResumeUpload(text, fileName) {
    setResumeText(text)
    setResumeFileName(fileName)
    setStep(2)
  }

  // Step 2 → Step 3: analyze fit
  async function handleAnalyze() {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, mode: "analyze" })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFitReport(data.fitReport)
      setStep(3)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 3 → Step 4: generate tailored resume
  async function handleGenerateResume() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, mode: "generate" })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGeneratedResume(data.generatedResume)
      setStep(4)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // "Try a different JD" — keep resume, reset everything else
  function handleTryNewJD() {
    setJobDescription("")
    setFitReport(null)
    setGeneratedResume("")
    setError("")
    setStep(2)
  }

  // Full reset — start from scratch
  function handleStartOver() {
    setResumeText("")
    setResumeFileName("")
    setJobDescription("")
    setFitReport(null)
    setGeneratedResume("")
    setError("")
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <h1 className="text-xl font-bold tracking-tight">Resume Agent</h1>
        </div>
        {step > 1 && (
          <button
            onClick={handleStartOver}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Start Over
          </button>
        )}
      </header>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 pt-8 pb-2">
        {["Upload Resume", "Job Description", "Fit Report", "New Resume"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step === i + 1 ? "bg-indigo-600 text-white" :
                step > i + 1 ? "bg-green-600 text-white" :
                "bg-gray-800 text-gray-500"}`}>
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${step === i + 1 ? "text-white" : "text-gray-500"}`}>
              {label}
            </span>
            {i < 3 && <div className="w-6 h-px bg-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <ResumeUpload onUpload={handleResumeUpload} />
        )}

        {step === 2 && (
          <JobDescription
            fileName={resumeFileName}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onAnalyze={handleAnalyze}
            loading={loading}
          />
        )}

        {step === 3 && fitReport && (
          <FitAnalysis
            fitReport={fitReport}
            onGenerate={handleGenerateResume}
            onTryNewJD={handleTryNewJD}
            loading={loading}
          />
        )}

        {step === 4 && (
          <NewResume
            generatedResume={generatedResume}
            onTryNewJD={handleTryNewJD}
            onStartOver={handleStartOver}
          />
        )}

      </main>
    </div>
  )
}