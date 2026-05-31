import { useRef } from "react"

export default function NewResume({ generatedResume, onTryNewJD, onStartOver }) {
  const resumeRef = useRef(null)

  function handlePrint() {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tailored Resume</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Georgia', serif;
              font-size: 11px;
              line-height: 1.5;
              color: #111;
              padding: 32px 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 20px; font-weight: bold; margin-bottom: 2px; }
            h2 {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              border-bottom: 1px solid #ccc;
              padding-bottom: 2px;
              margin-top: 14px;
              margin-bottom: 6px;
              color: #333;
            }
            h3 { font-size: 11px; font-weight: bold; margin-bottom: 1px; }
            p { margin-bottom: 4px; }
            ul { padding-left: 16px; margin-bottom: 4px; }
            li { margin-bottom: 2px; }
            a { color: #111; text-decoration: none; }
            .contact {
              font-size: 10px;
              color: #444;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>${resumeRef.current.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // Convert plain text resume to basic HTML for display
  function formatResume(text) {
    const lines = text.split("\n")
    return lines.map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return <br key={i} />

      // All caps short lines = section header
      if (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && trimmed.length > 2) {
        return (
          <h2 key={i} className="text-xs font-bold uppercase tracking-widest border-b 
            border-gray-300 text-gray-700 pb-1 mt-5 mb-2">
            {trimmed}
          </h2>
        )
      }

      // First line = name (largest)
      if (i === 0) {
        return (
          <h1 key={i} className="text-2xl font-bold text-gray-900 mb-1">
            {trimmed}
          </h1>
        )
      }

      // Bullet points
      if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
        return (
          <li key={i} className="text-gray-700 text-xs ml-4 mb-1">
            {trimmed.replace(/^[-•]\s*/, "")}
          </li>
        )
      }

      // Default paragraph
      return (
        <p key={i} className="text-gray-700 text-xs mb-1">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="flex flex-col gap-6 mt-6">

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-1">Your Tailored Resume</h2>
        <p className="text-gray-400 text-sm">
          Optimized for this role using only your original experience
        </p>
      </div>

      {/* Resume preview */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div ref={resumeRef} className="flex flex-col">
          {formatResume(generatedResume)}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handlePrint}
        className="w-full py-4 rounded-xl font-semibold text-base
          bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
      >
        ⬇️ Download as PDF
      </button>

      {/* Secondary actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onTryNewJD}
          className="w-full py-4 rounded-xl font-semibold text-base border border-gray-700
            text-gray-300 hover:border-gray-500 hover:text-white transition-all cursor-pointer"
        >
          🔄 Try a Different Job Description
        </button>
        <button
          onClick={onStartOver}
          className="w-full py-4 rounded-xl font-semibold text-base border border-gray-700
            text-gray-300 hover:border-gray-500 hover:text-white transition-all cursor-pointer"
        >
          🔁 Start Over with a New Resume
        </button>
      </div>

    </div>
  )
}