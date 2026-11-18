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

  // Model is configurable via the GROQ_MODEL env var for easy future migrations
  const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b"

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

IMPORTANT: Respond ONLY with a raw JSON object. No text before it, no text after it, no markdown, no backticks, no explanations whatsoever. Just the JSON object starting with { and ending with }.

{
  "score": <number between 0 and 100>,
  "verdict": <"Strong Fit" | "Partial Fit" | "Not a Fit">,
  "summary": "<one sentence explaining the verdict>",
  "matched": ["<matched skill or experience>", "<matched skill or experience>"],
  "missing": ["<gap or missing skill>", "<gap or missing skill>"]
}
`

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.1,
          messages: [
            {
              role: "system",
              content: "You are a JSON-only response bot. You never write anything except valid JSON. No prose, no markdown, no backticks. Only raw JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Groq API error")
      }

      const raw = (data.choices?.[0]?.message?.content || "").trim()

      // Strip any markdown fences if they sneak in
      const stripped = raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim()

      // Extract just the { } block — find first { and last }
      const start = stripped.indexOf("{")
      const end = stripped.lastIndexOf("}")

      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in LLM response")
      }

      const jsonString = stripped.slice(start, end + 1)
      const fitReport = JSON.parse(jsonString)

      // Validate the shape before returning
      if (
        typeof fitReport.score !== "number" ||
        !fitReport.verdict ||
        !fitReport.summary ||
        !Array.isArray(fitReport.matched) ||
        !Array.isArray(fitReport.missing)
      ) {
        throw new Error("LLM returned incomplete fit report")
      }

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
- Do NOT use markdown, asterisks, hashtags, or backticks anywhere

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT (plain text only, no markdown, no backticks, no asterisks):
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
          model: MODEL,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content: "You are a professional resume writer. You output clean plain text resumes only. No markdown, no asterisks, no hashtags, no backticks. Plain text only."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Groq API error")
      }

      // Strip any markdown that sneaks in
      const generatedResume = (data.choices?.[0]?.message?.content || "")
        .trim()
        .replace(/```/g, "")
        .replace(/\*\*/g, "")
        .replace(/^#+\s/gm, "")
        .trim()

      if (!generatedResume) {
        throw new Error("LLM returned an empty resume")
      }

      return res.status(200).json({ generatedResume })

    } else {
      return res.status(400).json({ error: "Invalid mode" })
    }

  } catch (err) {
    console.error("API error:", err)
    return res.status(500).json({ error: err.message || "Something went wrong" })
  }
}