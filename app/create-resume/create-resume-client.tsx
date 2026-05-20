"use client"

import type React from "react"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, FileText, Loader2, Paperclip, Sparkles, X } from "lucide-react"

export function CreateResumeClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [name, setName] = useState("")
  const [skills, setSkills] = useState("")
  const [education, setEducation] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const isValid =
    uploadedFile !== null ||
    (name.trim().length > 0 && skills.trim().length > 0 && education.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isGenerating) return

    setIsGenerating(true)

    try {
      let resume = ""

      if (uploadedFile) {
        const isTextFile =
          uploadedFile.type.startsWith("text/") || /\.(txt|md|rtf)$/i.test(uploadedFile.name)

        if (!isTextFile) {
          setUploadError("Upload a TXT, MD, or RTF resume for now, or paste the details below.")
          setIsGenerating(false)
          return
        }

        resume = await uploadedFile.text()
        sessionStorage.setItem("skillmatch:uploaded-file-name", uploadedFile.name)
      } else {
        resume = [
          name.trim(),
          "",
          "SKILLS",
          skills.trim(),
          "",
          "EDUCATION",
          education.trim(),
        ].join("\n")
        sessionStorage.removeItem("skillmatch:uploaded-file-name")
      }

      // Persist so the ATS page can pick it up
      sessionStorage.setItem("skillmatch:generated-resume", resume)
    } catch {
      // ignore storage errors (private mode, etc.)
    }

    // Small delay to show the generating state
    await new Promise((r) => setTimeout(r, 900))

    router.push("/ats")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadedFile(file ?? null)
    setUploadedFileName(file?.name ?? "")
    setUploadError("")
  }

  const clearSelectedFile = () => {
    setUploadedFile(null)
    setUploadedFileName("")
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at top, black 40%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(56,189,248,0.22), rgba(20,184,166,0.12) 45%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400">
            <Sparkles className="h-4 w-4 text-slate-950" />
          </span>
          <span className="font-sans text-base font-semibold tracking-tight">SkillMatch AI</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </header>

      {/* Content */}
      <section className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-6">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
            <FileText className="h-3.5 w-3.5 text-sky-300" />
            Resume Builder
          </span>
          <h1 className="mt-4 text-balance font-sans text-4xl font-semibold tracking-tight md:text-5xl">
            Create your{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              resume
            </span>
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/70 md:text-base">
            Fill in the basics or upload a text resume. We&apos;ll send it into the ATS analyzer.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8"
        >
          <div className="flex flex-col gap-6">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground/90">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayşe Yılmaz"
                autoComplete="name"
                className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-2">
              <label htmlFor="skills" className="text-sm font-medium text-foreground/90">
                Skills
              </label>
              <textarea
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, SQL, AWS, Figma"
                rows={3}
                className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
              />
              <p className="text-xs text-foreground/50">Separate skills with commas.</p>
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="resume-upload" className="text-sm font-medium text-foreground/90">
                  Upload Resume
                </label>
                <span className="text-xs text-foreground/50">TXT, MD, RTF</span>
              </div>

              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept=".txt,.md,.rtf,text/plain,text/markdown,application/rtf"
                onChange={handleFileChange}
                className="sr-only"
              />

              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground/85 transition hover:bg-white/10"
                >
                  <Paperclip className="h-4 w-4" />
                  Choose File
                </button>

                <div className="min-h-12 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground/75">
                  {uploadedFileName ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate">{uploadedFileName}</span>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70 transition hover:bg-white/10"
                        aria-label="Remove selected file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-foreground/45">No file selected</span>
                  )}
                </div>

                {uploadError && <p className="text-xs text-rose-300">{uploadError}</p>}
              </div>
            </div>

            {/* Education */}
            <div className="flex flex-col gap-2">
              <label htmlFor="education" className="text-sm font-medium text-foreground/90">
                Education
              </label>
              <textarea
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder={"Bilgisayar Mühendisliği, İstanbul Teknik Üniversitesi (2020 - 2024)\nGANO: 3,80 / 4,00"}
                rows={4}
                className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isGenerating}
              className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {uploadedFile ? "Analyze Uploaded Resume" : "Generate Resume"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-foreground/50">
              We&apos;ll redirect you to the ATS analyzer once your resume is ready.
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}
