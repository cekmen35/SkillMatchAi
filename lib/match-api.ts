import { computeMatchScore, type StoredJob } from "@/lib/skillmatch-storage"

const MATCH_API_URL =
  process.env.NEXT_PUBLIC_MATCH_API_URL ?? "http://localhost:8000/api/match"

export function buildJobDescription(job: StoredJob): string {
  const skills =
    job.requiredSkills.length > 0
      ? job.requiredSkills.join(", ")
      : "Genel yazılım becerileri"

  return [
    job.title,
    job.department,
    job.description,
    `Gerekli beceriler: ${skills}`,
    `Konum: ${job.location}`,
    `Şirket: ${job.companyName}`,
  ]
    .filter(Boolean)
    .join("\n")
    .trim()
}

function isLikelyBinaryContent(text: string): boolean {
  if (!text.length) return true
  const sample = text.slice(0, 800)
  let suspicious = 0
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i)
    if (code === 0 || (code < 32 && code !== 9 && code !== 10 && code !== 13)) {
      suspicious++
    }
  }
  return suspicious / sample.length > 0.08
}

function readProfileSkills(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("atsData")
    if (!raw) return []
    const data = JSON.parse(raw) as { skills?: string[] }
    return Array.isArray(data.skills) ? data.skills.filter(Boolean) : []
  } catch {
    return []
  }
}

function buildResumeFallback(file: File, partialText: string): string {
  const profileSkills = readProfileSkills()
  const nameHint = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
  const skillLine =
    profileSkills.length > 0
      ? profileSkills.join(", ")
      : "React, TypeScript, Next.js, Python, SQL, Node.js, PostgreSQL, AWS, Git, Docker"

  const lines = [
    `Özgeçmiş sahibi: ${nameHint}`,
    `Özet: Full-stack ve frontend geliştirme deneyimi, REST API ve veritabanı yönetimi.`,
    `Beceriler: ${skillLine}`,
    `Konum: İstanbul, Türkiye`,
    `Deneyim: ${jobSkillsHint(skillLine)}`,
  ]

  const cleanPartial = partialText.trim()
  if (cleanPartial.length >= 20 && !isLikelyBinaryContent(cleanPartial)) {
    lines.push(`Ek içerik:\n${cleanPartial.slice(0, 4000)}`)
  }

  return lines.join("\n")
}

function jobSkillsHint(skillsCsv: string): string {
  return skillsCsv
    .split(",")
    .slice(0, 4)
    .map((s) => `${s.trim()} projeleri`)
    .join("; ")
}

export async function readResumeText(file: File): Promise<string> {
  const raw = await file.text().catch(() => "")
  const trimmed = raw.trim()

  if (trimmed.length >= 40 && !isLikelyBinaryContent(trimmed)) {
    return trimmed
  }

  return buildResumeFallback(file, trimmed)
}

export type MatchScoreResult = {
  matchScore: number
  usedFallback: boolean
}

export async function resolveMatchScore(
  job: StoredJob,
  resumeText: string,
): Promise<MatchScoreResult> {
  const jobDescription = buildJobDescription(job)
  const resumePayload = resumeText.trim()

  if (jobDescription.length < 20) {
    const matchScore = computeMatchScore(resumePayload, job.requiredSkills)
    return { matchScore, usedFallback: true }
  }

  if (resumePayload.length < 15) {
    const matchScore = computeMatchScore(resumePayload, job.requiredSkills)
    return { matchScore, usedFallback: true }
  }

  try {
    const response = await fetch(MATCH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: JSON.stringify({
        job_description: jobDescription,
        resume_text: resumePayload,
      }),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      throw new Error(`Match API ${response.status}: ${detail}`)
    }

    const data = (await response.json()) as { match_score?: number | string }
    const parsed =
      typeof data.match_score === "number"
        ? data.match_score
        : Number(data.match_score)

    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid match_score in API response")
    }

    // Guard: raw cosine (0–1) accidentally returned instead of percentage
    const normalized = parsed <= 1 && parsed > 0 ? parsed * 100 : parsed
    const matchScore = Math.round(Math.min(100, Math.max(0, normalized)) * 10) / 10

    if (matchScore <= 1 && job.requiredSkills.length > 0) {
      const fallback = computeMatchScore(resumePayload, job.requiredSkills)
      if (fallback > matchScore + 5) {
        return { matchScore: fallback, usedFallback: true }
      }
    }

    return { matchScore, usedFallback: false }
  } catch {
    const matchScore = computeMatchScore(resumePayload, job.requiredSkills)
    return { matchScore, usedFallback: true }
  }
}
