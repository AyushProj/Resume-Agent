import { useState } from "react"
import * as pdfjs from "pdfjs-dist"
import mammoth from "mammoth"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

export default function ResumeUpload({ onUpload }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function extractText(file) {
    const ext = file.name.split(".").pop().toLowerCase()

    if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let fullText = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(" ") + "\n"
      }
      return fullText

    } else if (ext === "docx") {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value

    } else {
      throw new Error("Only PDF or DOCX files are supported.")
    }
  }

  async function handleFile(file) {
    if (!file) return
    setError("")
    setLoading(true)
    try {
      const text = await extractText(file)
      if (!text.trim()) throw new Error("Could not extract text from this file.")
      onUpload(text, file.name)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  function handleInputChange(e) {
    const file = e.target.files[0]
    handleFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
        <p className="text-gray-400 text-sm">Supports PDF and DOCX — any number of pages</p>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center 
          justify-center cursor-pointer transition-all gap-3
          ${dragging ? "border-indigo-500 bg-indigo-900/20" : "border-gray-700 hover:border-indigo-600 hover:bg-gray-900"}`}
      >
        <span className="text-5xl">📂</span>
        <p className="text-gray-300 font-medium">Drag & drop your resume here</p>
        <p className="text-gray-500 text-sm">or click to browse</p>
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-indigo-400 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Extracting text from your resume...
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  )
}