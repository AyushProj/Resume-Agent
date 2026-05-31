export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { resumeText, jobDescription, mode } = req.body

  if (!resumeText || !jobDescription || !mode) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "API key not configured" })
  }

  try {
    if (mode === "analyze") {
      const prompt = `
You are an expert technical recruiter and resume analyst.

Below is a candidate's resume and a job description.
Analyze how well the candidate fits the role.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY in the following JSON format, nothing else, no markdown backticks:
{
  "score": <number between 0 and 100>,
  "verdict": <"Strong Fit" | "Partial Fit" | "Not a Fit">,
  "summary": <one sentence explaining the verdict>,
  "matched": [<list of 4-6 specific matched skills or experiences>],
  "missing": [<list of 2-4 gaps or missing skills, empty array if none>]
}
`
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Groq API error")
      }

      const raw = data.choices[0].message.content.trim()
      const clean = raw.replace(/```json|```/g, "").trim()
      const fitReport = JSON.parse(clean)

      return res.status(200).json({ fitReport })

    } else if (mode === "generate") {
      const prompt = `
You are an expert resume writer.

Below is a candidate's full master resume and a job description.
Your job is to write a tailored, one-page resume for this specific role.

STRICT RULES:
- Only use information present in the candidate's resume — do NOT invent anything
- Prioritize and reorder experience, projects, and skills most relevant to the job
- Remove anything irrelevant to this role
- Mirror keywords from the job description naturally
- Keep it concise enough to fit on one page
- Format it as clean plain text using the structure below

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT (plain text only, no markdown, no backticks):
[Full Name]
[Email] | [Phone] | [LinkedIn] | [Location]

SUMMARY
2-3 sentence professional summary tailored to this role

SKILLS
Comma separated relevant skills

EXPERIENCE
[Job Title] — [Company] | [Dates]
- Relevant bullet point
- Relevant bullet point

PROJECTS
[Project Name]
- Relevant bullet point

EDUCATION
[Degree] — [University] | [Year]
`

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Groq API error")
      }

      const generatedResume = data.choices[0].message.content.trim()

      return res.status(200).json({ generatedResume })
    }

  } catch (err) {
    console.error("API error:", err)
    return res.status(500).json({ error: err.message || "Something went wrong" })
  }
}