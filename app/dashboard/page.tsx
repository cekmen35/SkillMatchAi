"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AnaSayfaLink } from "@/components/ana-sayfa-link"
import {
  Briefcase,
  FileUp,
  LogOut,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { getSalaryInsight } from "@/lib/turkish-locale"
import { readResumeText, resolveMatchScore } from "@/lib/match-api"
import {
  getApplications,
  getCurrentUser,
  getJobs,
  saveApplications,
  seedJobsIfEmpty,
  setCurrentUser,
  type StoredApplication,
  type StoredJob,
  type StoredUser,
} from "@/lib/skillmatch-storage"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<StoredUser | null>(null)
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [myApplications, setMyApplications] = useState<StoredApplication[]>([])
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    seedJobsIfEmpty()
    const current = getCurrentUser()
    if (!current || current.role !== "JOB_SEEKER") {
      router.replace("/register")
      return
    }
    setUser(current)
    loadData(current.id)
  }, [router])

  const loadData = (seekerId: string) => {
    setJobs(getJobs().sort((a, b) => b.postedAt - a.postedAt))
    setMyApplications(
      getApplications()
        .filter((a) => a.seekerId === seekerId)
        .sort((a, b) => b.appliedAt - a.appliedAt),
    )
  }

  const handleApply = async (job: StoredJob, file: File | null) => {
    if (!user || !file) {
      setNotice("Başvuru için lütfen bir CV dosyası seçin.")
      return
    }

    setApplyingId(job.id)
    setNotice("")

    const all = getApplications()
    const duplicate = all.some(
      (a) => a.jobId === job.id && a.seekerId === user.id,
    )
    if (duplicate) {
      setNotice("Bu ilana zaten başvurdunuz.")
      setApplyingId(null)
      return
    }

    try {
      const resumeText = await readResumeText(file)
      const { matchScore, usedFallback } = await resolveMatchScore(job, resumeText)

      const application: StoredApplication = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        companyId: job.companyId,
        companyName: job.companyName,
        jobTitle: job.title,
        seekerId: user.id,
        seekerName: user.name,
        matchScore,
        cvFileName: file.name,
        appliedAt: Date.now(),
      }

      all.push(application)
      saveApplications(all)
      setLastScore(matchScore)
      setNotice(
        usedFallback
          ? `${job.companyName} · ${job.title} başvurunuz kaydedildi (AI sunucusuna ulaşılamadı, yedek skor: %${matchScore}).`
          : `${job.companyName} · ${job.title} başvurunuz kaydedildi. AI eşleşme skoru: %${matchScore}`,
      )
      loadData(user.id)
    } catch {
      setNotice("Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setApplyingId(null)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push("/register")
  }

  const scoreForJob = (jobId: string) =>
    myApplications.find((a) => a.jobId === jobId)?.matchScore

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Yükleniyor...
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.1),transparent_50%)]"
      />

      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              İş Arayan Paneli
            </p>
            <h1 className="text-xl font-semibold">Merhaba, {user.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <AnaSayfaLink />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" /> Çıkış
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {notice && (
          <div className="mb-6 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
            {notice}
          </div>
        )}

        {lastScore !== null && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <p className="text-sm">
              Son başvuru AI eşleşme skorunuz:{" "}
              <strong className="text-emerald-300">%{lastScore}</strong>
            </p>
          </div>
        )}

        {myApplications.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Başvurularım
            </h2>
            <div className="flex flex-wrap gap-2">
              {myApplications.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs"
                >
                  {a.companyName} · %{a.matchScore}
                </span>
              ))}
            </div>
          </section>
        )}

        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Briefcase className="h-5 w-5 text-sky-400" />
          Canlı İlanlar
          <span className="text-sm font-normal text-muted-foreground">
            ({jobs.length})
          </span>
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {jobs.map((job) => {
            const appliedScore = scoreForJob(job.id)
            const marketInsight = getSalaryInsight(job.title)

            return (
              <article
                key={job.id}
                className="group flex flex-col rounded-2xl border border-white/10 bg-card/30 p-6 shadow-lg backdrop-blur transition hover:border-sky-500/30 hover:bg-card/50"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold leading-snug group-hover:text-sky-300">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.companyName} · {job.department}
                    </p>
                  </div>
                  {appliedScore !== undefined && (
                    <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                      %{appliedScore}
                    </span>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span>·</span>
                  <span>{job.salary}</span>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-foreground/70">
                  {job.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-foreground/70"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mb-4 flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/10 px-2.5 py-1.5 text-[11px] text-sky-200">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Piyasa Analizi: <strong className="text-sky-300">{marketInsight}</strong>
                </div>

                <label className="mt-auto cursor-pointer">
                  <input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.md"
                    className="hidden"
                    disabled={applyingId === job.id || appliedScore !== undefined}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      void handleApply(job, f)
                      e.target.value = ""
                    }}
                  />
                  <span
                    className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition ${
                      appliedScore !== undefined
                        ? "cursor-default border border-white/10 bg-white/5 text-muted-foreground"
                        : applyingId === job.id
                          ? "bg-white/10 text-muted-foreground"
                          : "bg-gradient-to-r from-sky-400 to-teal-400 text-black hover:opacity-90"
                    }`}
                  >
                    <FileUp className="h-4 w-4" />
                    {appliedScore !== undefined
                      ? "Başvuruldu"
                      : applyingId === job.id
                        ? "AI analiz ediliyor..."
                        : "Başvur & CV Yükle"}
                  </span>
                </label>
              </article>
            )
          })}
        </div>

        {jobs.length === 0 && (
          <p className="rounded-xl border border-white/10 bg-card/20 p-8 text-center text-muted-foreground">
            Henüz yayınlanmış ilan yok. Şirket hesabıyla giriş yapıp ilan ekleyebilirsiniz.
          </p>
        )}
      </div>
    </main>
  )
}
