"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Severity = "high" | "medium" | "low"

type Issue = {
  title: string
  description: string
  severity: Severity
}

type AnalysisResult = {
  score: number
  skills: string[]
  issues: Issue[]
  wordCount: number
}

// A small, curated keyword dictionary used to extract "skills" from free text.
const SKILL_KEYWORDS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring",
  "Kotlin",
  "Swift",
  "Go",
  "Rust",
  "C++",
  "C#",
  ".NET",
  "Ruby",
  "Rails",
  "PHP",
  "Laravel",
  "HTML",
  "CSS",
  "Tailwind",
  "SASS",
  "Redux",
  "GraphQL",
  "REST",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Supabase",
  "Firebase",
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "GitHub",
  "Jira",
  "Figma",
  "Agile",
  "Scrum",
  "Leadership",
  "Communication",
  "Testing",
  "Jest",
  "Cypress",
  "Playwright",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Data Analysis",
  "SQL",
  "Tableau",
  "Power BI",
  "Product Management",
  "SEO",
  "Marketing",
] as const

function analyzeResume(text: string): AnalysisResult {
  const trimmed = text.trim()
  const lower = trimmed.toLowerCase()
  const words = trimmed.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Extract skills (case-insensitive match, dedup, preserve canonical casing)
  const skills = Array.from(
    new Set(
      SKILL_KEYWORDS.filter((k) => {
        const needle = k.toLowerCase()
        // word-ish match to reduce false positives for short tokens like "go" or "r"
        const pattern = new RegExp(
          `(^|[^a-z0-9+#.])${needle.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          )}([^a-z0-9+#.]|$)`,
          "i",
        )
        return pattern.test(lower)
      }),
    ),
  )

  // Heuristic issue detection
  const issues: Issue[] = []

  if (wordCount < 150) {
    issues.push({
      title: "Resume is too short",
      description:
        "Most competitive resumes have 350–700 words. Add more detail about your impact, metrics, and tools used.",
      severity: "high",
    })
  } else if (wordCount > 1100) {
    issues.push({
      title: "Resume is quite long",
      description:
        "Consider tightening to 1–2 pages (roughly 400–900 words). Cut older roles and low-signal bullets.",
      severity: "low",
    })
  }

  const hasContact =
    /@/.test(trimmed) || /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/.test(trimmed)
  if (!hasContact) {
    issues.push({
      title: "Missing contact information",
      description:
        "Include a professional email and phone number at the top so recruiters can reach you quickly.",
      severity: "high",
    })
  }

  const hasMetrics = /\b(\d+%|\$\s?\d|\d+\s?(k|m|bn|users|customers|clients))\b/i.test(
    trimmed,
  )
  if (!hasMetrics) {
    issues.push({
      title: "Few quantified achievements",
      description:
        "En az 3 maddeye sayısal metrik ekleyin (%, ₺, kullanıcı, kazanılan süre). Metrikler ATS ve işe alım sinyalini güçlendirir.",
      severity: "medium",
    })
  }

  const hasActionVerbs =
    /\b(led|built|launched|designed|implemented|shipped|owned|drove|improved|reduced|increased|architected)\b/i.test(
      trimmed,
    )
  if (!hasActionVerbs) {
    issues.push({
      title: "Weak action verbs",
      description:
        "Start bullets with strong verbs like Led, Built, Shipped, Reduced, Improved to showcase ownership and impact.",
      severity: "medium",
    })
  }

  if (skills.length < 5) {
    issues.push({
      title: "Low keyword coverage",
      description:
        "ATS systems match against role keywords. Add relevant tools, frameworks, and methodologies from the job description.",
      severity: "high",
    })
  }

  const hasSummary = /\b(summary|profile|objective)\b/i.test(trimmed)
  if (!hasSummary) {
    issues.push({
      title: "No summary section detected",
      description:
        "Add a 2–3 line professional summary at the top to frame your experience for both ATS and recruiters.",
      severity: "low",
    })
  }

  // Score: start at 100, penalize by issue severity and reward skills coverage.
  const severityPenalty: Record<Severity, number> = {
    high: 16,
    medium: 9,
    low: 4,
  }
  let score = 100
  for (const issue of issues) score -= severityPenalty[issue.severity]
  score += Math.min(skills.length, 12) * 2 // up to +24 for strong keyword coverage
  score = Math.max(28, Math.min(98, Math.round(score)))

  return { score, skills, issues, wordCount }
}

function scoreTone(score: number) {
  if (score >= 85)
    return {
      label: "Excellent",
      ring: "text-emerald-400",
      track: "stroke-emerald-400",
      bg: "bg-emerald-400/10",
      text: "text-emerald-300",
      border: "border-emerald-400/30",
    }
  if (score >= 70)
    return {
      label: "Good",
      ring: "text-sky-300",
      track: "stroke-sky-300",
      bg: "bg-sky-400/10",
      text: "text-sky-300",
      border: "border-sky-400/30",
    }
  if (score >= 55)
    return {
      label: "Needs Work",
      ring: "text-amber-300",
      track: "stroke-amber-300",
      bg: "bg-amber-400/10",
      text: "text-amber-300",
      border: "border-amber-400/30",
    }
  return {
    label: "At Risk",
    ring: "text-rose-300",
    track: "stroke-rose-300",
    bg: "bg-rose-400/10",
    text: "text-rose-300",
    border: "border-rose-400/30",
  }
}

function severityStyles(sev: Severity) {
  switch (sev) {
    case "high":
      return {
        icon: XCircle,
        text: "text-rose-300",
        bg: "bg-rose-400/10",
        border: "border-rose-400/20",
        label: "High",
      }
    case "medium":
      return {
        icon: AlertTriangle,
        text: "text-amber-300",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        label: "Medium",
      }
    case "low":
      return {
        icon: CheckCircle2,
        text: "text-sky-300",
        bg: "bg-sky-400/10",
        border: "border-sky-400/20",
        label: "Low",
      }
  }
}

export default function AtsClient() {
  const [resumeText, setResumeText] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Pick up a resume generated on /create-resume, if present.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("skillmatch:generated-resume")
      const storedFileName = sessionStorage.getItem("skillmatch:uploaded-file-name")
      if (stored) {
        setResumeText(stored)
        sessionStorage.removeItem("skillmatch:generated-resume")
      }
      if (storedFileName) {
        setFileName(storedFileName)
        sessionStorage.removeItem("skillmatch:uploaded-file-name")
      }
    } catch {
      // ignore
    }
  }, [])
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length
  const canAnalyze = wordCount >= 5 && !isAnalyzing

  const syncResumeText = (value: string) => {
    setResumeText(value)
    if (fileName) setFileName(null)
  }

  const handleFile = async (file: File) => {
    setError(null)

    const isText =
      file.type.startsWith("text/") ||
      /\.(txt|md|rtf)$/i.test(file.name)

    if (!isText) {
      setFileName(file.name)
      setError(
        "For the best results, paste your resume text below. PDF/DOCX parsing isn't enabled in this demo.",
      )
      return
    }

    try {
      const text = await file.text()
      setFileName(file.name)
      setResumeText(text)
    } catch {
      setError("Couldn't read that file. Try pasting the text instead.")
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const onAnalyze = async () => {
    if (!canAnalyze) return
    setIsAnalyzing(true)
    setResult(null)
    // simulate analysis latency for nicer UX
    await new Promise((r) => setTimeout(r, 900))
    const res = analyzeResume(resumeText)
    setResult(res)
    setIsAnalyzing(false)

    // Persist extracted skills so other pages (e.g. /dashboard) can match jobs.
    try {
      localStorage.setItem("userSkills", JSON.stringify(res.skills))
    } catch {
      // ignore (e.g. storage disabled / quota exceeded)
    }

    // scroll results into view on mobile
    requestAnimationFrame(() => {
      document
        .getElementById("ats-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const reset = () => {
    setResult(null)
    setResumeText("")
    setFileName(null)
    setError(null)
  }

  const tone = useMemo(
    () => (result ? scoreTone(result.score) : null),
    [result],
  )

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-15%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-500/20 via-cyan-400/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[500px] w-[700px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-400/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            SkillMatch <span className="text-muted-foreground">AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back home
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-6">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            ATS Resume Scan
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            How well does your resume{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
              beat the bots
            </span>
            ?
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Upload your resume file or paste the text below. We&apos;ll score ATS
            compatibility, extract key skills, and flag issues to fix in seconds.
          </p>
        </div>

        {/* Input card */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur md:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/20 to-teal-400/20 text-sky-300 ring-1 ring-inset ring-sky-400/20">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your resume</p>
                  <p className="text-xs text-muted-foreground">
                    {fileName
                      ? `Loaded: ${fileName}`
                      : "Drop a .txt file or paste text below"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="ats-resume-upload"
                  type="file"
                  accept=".txt,.md,.rtf,text/plain"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <label
                  htmlFor="ats-resume-upload"
                  className="rounded-full border-border/70 bg-card/50 backdrop-blur hover:bg-card/70"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="pointer-events-none rounded-full border-border/70 bg-card/50 backdrop-blur hover:bg-card/70"
                    tabIndex={-1}
                  >
                    <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                    Upload file
                  </Button>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="resume-text" className="sr-only">
                Paste your resume text
              </label>
              <Textarea
                id="resume-text"
                placeholder={`Özgeçmişinizi buraya yapıştırın…\n\nÖrnek:\nAyşe Yılmaz — Kıdemli Frontend Mühendisi\nayse.yilmaz@email.com · +90 532 000 00 00\nİstanbul, Türkiye\n\nÖzet\n6+ yıl React ve Next.js deneyimi olan frontend mühendisi…\n\nDeneyim\n• TypeScript geçişini yöneterek hata oranını %35 azalttım…`}
                value={resumeText}
                onChange={(e) => syncResumeText(e.currentTarget.value)}
                onInput={(e) => syncResumeText(e.currentTarget.value)}
                className="min-h-[240px] resize-y rounded-xl border-border/60 bg-background/40 text-sm leading-relaxed placeholder:text-muted-foreground/60"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{wordCount} words</span>
                <span>Min 5 words to analyze</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Your resume stays in your browser. Nothing is uploaded to a server in this demo.
              </p>
              <div className="flex items-center gap-2">
                {result && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Reset
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={onAnalyze}
                  disabled={!canAnalyze}
                  className="group h-10 rounded-full bg-gradient-to-r from-sky-400 to-teal-400 px-5 text-sm font-medium text-background shadow-[0_0_40px_-10px_rgba(56,189,248,0.6)] transition-transform hover:scale-[1.02] hover:from-sky-300 hover:to-teal-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                      Analyze Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Analyzing state */}
        {isAnalyzing && !result && (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/40 px-6 py-10 text-center backdrop-blur"
          >
            <Loader2
              className="h-6 w-6 animate-spin text-sky-300"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Analyzing your resume…</p>
            <p className="text-xs text-muted-foreground">
              Scanning for skills, keywords, and ATS issues.
            </p>
          </div>
        )}

        {/* Results */}
        {result && tone && (
          <div id="ats-results" className="mx-auto mt-10 max-w-5xl">
            <div className="grid gap-4 md:grid-cols-5">
              {/* Score card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur md:col-span-2">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  ATS Score
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <ScoreRing score={result.score} trackClass={tone.track} />
                  <div>
                    <p className={`text-sm font-medium ${tone.text}`}>{tone.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {result.score >= 85
                        ? "Your resume is well-optimized for most ATS systems."
                        : result.score >= 70
                          ? "Solid baseline — a few targeted tweaks will push it higher."
                          : result.score >= 55
                            ? "Needs meaningful improvements to reliably pass ATS filters."
                            : "At risk of being filtered out. Address the high-severity issues first."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <Stat label="Skills" value={String(result.skills.length)} />
                  <Stat label="Issues" value={String(result.issues.length)} />
                  <Stat label="Words" value={String(result.wordCount)} />
                </div>
              </div>

              {/* Skills card */}
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur md:col-span-3">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Extracted Skills
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {result.skills.length} found
                  </span>
                </div>

                {result.skills.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No recognizable skills found. Try adding tools, frameworks, and
                    methodologies from the job description.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.skills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Issues */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Issues to Fix
                </p>
                <span className="text-xs text-muted-foreground">
                  {result.issues.length} {result.issues.length === 1 ? "issue" : "issues"}
                </span>
              </div>

              {result.issues.length === 0 ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-emerald-200">
                      No major issues detected
                    </p>
                    <p className="mt-1 text-xs text-emerald-200/80">
                      Nicely done. Tailor keywords for each role and keep quantifying impact.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {result.issues.map((issue) => {
                    const styles = severityStyles(issue.severity)
                    const Icon = styles.icon
                    return (
                      <li
                        key={issue.title}
                        className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`mt-0.5 h-5 w-5 ${styles.text}`} aria-hidden="true" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{issue.title}</p>
                              <span
                                className={`rounded-full border ${styles.border} px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${styles.text}`}
                              >
                                {styles.label}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur sm:flex-row sm:p-6">
              <div>
                <p className="text-sm font-medium">Ready to see roles that match your skills?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We&apos;ll surface jobs aligned to the strongest keywords on your resume.
                </p>
              </div>
              <Button
                asChild
                className="group h-11 w-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 px-6 text-sm font-medium text-background shadow-[0_0_40px_-10px_rgba(56,189,248,0.6)] transition-transform hover:scale-[1.02] hover:from-sky-300 hover:to-teal-300 sm:w-auto"
              >
                <Link href="/dashboard">
                  <Briefcase className="mr-2 h-4 w-4" aria-hidden="true" />
                  View Jobs
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function ScoreRing({ score, trackClass }: { score: number; trackClass: string }) {
  const size = 112
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`ATS score ${score} out of 100`}
        role="img"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-border/60"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${trackClass} transition-[stroke-dashoffset] duration-700 ease-out`}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  )
}
