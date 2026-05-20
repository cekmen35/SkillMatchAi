"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"

type Status = "Applied" | "Interview" | "Offer" | "Rejected"

type AppliedJob = {
  jobId: string
  title: string
  company: string
  appliedAt: number
  appliedBy: "AI" | "user"
}

type SavedJob = {
  id: string
  title: string
  company: string
  location: string
  savedOn: string
  match: number
  tags: string[]
}

const SAVED_JOBS: SavedJob[] = [
  {
    id: "5",
    title: "Staff Product Engineer",
    company: "Trendyol",
    location: "İstanbul, Türkiye",
    savedOn: "14 Nis 2026",
    match: 86,
    tags: ["TypeScript", "Next.js", "Postgres"],
  },
  {
    id: "6",
    title: "Frontend Platform Engineer",
    company: "Getir",
    location: "İstanbul, Türkiye",
    savedOn: "10 Nis 2026",
    match: 79,
    tags: ["React", "Design Systems", "Testing"],
  },
  {
    id: "7",
    title: "Senior Software Engineer",
    company: "Yemeksepeti",
    location: "Uzaktan · Türkiye",
    savedOn: "5 Nis 2026",
    match: 74,
    tags: ["Node.js", "GraphQL", "AWS"],
  },
]

type Tab = "applied" | "saved"

export default function HistoryClient() {
  const [tab, setTab] = useState<Tab>("applied")
  const [applied, setApplied] = useState<AppliedJob[]>([])
  const [saved, setSaved] = useState<SavedJob[]>(SAVED_JOBS)


  useEffect(() => {
     try {
        const raw = localStorage.getItem("appliedJobs");
        if (raw) {
           const parsed = JSON.parse(raw);
           if (Array.isArray(parsed)) {
              setApplied(parsed);
           }
        }
     } catch {}
  }, []);

  const stats = useMemo(() => {
    return {
      applied: applied.length,
      saved: saved.length,
      interviews: 0,
      offers: 0,
    }
  }, [applied, saved])

  function removeApplied(id: string) {
    setApplied((prev) => {
       const updated = prev.filter((j) => j.jobId !== id);
       localStorage.setItem("appliedJobs", JSON.stringify(updated));
       return updated;
    });
  }

  function removeSaved(id: string) {
    setSaved((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1000px 500px at 80% -10%, rgba(56,189,248,0.10), transparent 60%), radial-gradient(800px 400px at 10% 10%, rgba(45,212,191,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          SkillMatch AI
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-foreground/70">
            <Clock className="h-3 w-3" />
            Activity
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your job history
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-foreground/60 sm:text-base">
            Track the jobs you&apos;ve applied to and the ones you&apos;ve saved
            for later — all in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Applied"
            value={stats.applied}
            icon={<Send className="h-4 w-4" />}
            tone="sky"
          />
          <StatCard
            label="Saved"
            value={stats.saved}
            icon={<Bookmark className="h-4 w-4" />}
            tone="teal"
          />
          <StatCard
            label="Interviews"
            value={stats.interviews}
            icon={<Calendar className="h-4 w-4" />}
            tone="amber"
          />
          <StatCard
            label="Offers"
            value={stats.offers}
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="emerald"
          />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 w-fit">
          <TabButton active={tab === "applied"} onClick={() => setTab("applied")}>
            <Send className="h-3.5 w-3.5" />
            Applied
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-foreground/70">
              {applied.length}
            </span>
          </TabButton>
          <TabButton active={tab === "saved"} onClick={() => setTab("saved")}>
            <Bookmark className="h-3.5 w-3.5" />
            Saved
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-foreground/70">
              {saved.length}
            </span>
          </TabButton>
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === "applied" ? (
            applied.length === 0 ? (
              <EmptyState
                icon={<Send className="h-5 w-5" />}
                title="No applications yet"
                description="Jobs you apply to will appear here so you can track their status."
                cta={{ href: "/dashboard", label: "Browse jobs" }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {applied.map((job) => (
                  <AppliedCard
                    key={job.jobId}
                    job={job}
                    onRemove={() => removeApplied(job.jobId)}
                  />
                ))}
              </div>
            )
          ) : saved.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-5 w-5" />}
              title="No saved jobs"
              description="Save jobs from the dashboard to come back to them later."
              cta={{ href: "/dashboard", label: "Browse jobs" }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {saved.map((job) => (
                <SavedCard
                  key={job.id}
                  job={job}
                  onRemove={() => removeSaved(job.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/* -------------------- Subcomponents -------------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "bg-gradient-to-br from-sky-400 to-teal-400 text-background"
          : "text-foreground/70 hover:bg-white/5 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: "sky" | "teal" | "amber" | "emerald"
}) {
  const toneMap: Record<string, string> = {
    sky: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    teal: "text-teal-300 bg-teal-400/10 border-teal-400/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-foreground/50">
          {label}
        </span>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${toneMap[tone]}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function StatusBadge({ method }: { method: "AI" | "user" }) {
  const styles: Record<string, string> = {
    user: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    AI: "border-violet-400/20 bg-violet-500/20 text-violet-300",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${styles[method]}`}
    >
      {method === "AI" ? "🤖 Applied by AI" : "Applied"}
    </span>
  )
}

function MatchBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function AppliedCard({
  job,
  onRemove,
}: {
  job: AppliedJob
  onRemove: () => void
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge method={job.appliedBy || "user"} />
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
              <Calendar className="h-3 w-3" />
              {new Date(job.appliedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h3 className="mt-2 truncate text-lg font-semibold tracking-tight">
            {job.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/60">
             <span className="inline-flex items-center gap-1">
               <Building2 className="h-3.5 w-3.5" />
               {job.company}
             </span>
             <span className="inline-flex items-center gap-1">
               <Briefcase className="h-3.5 w-3.5" />
               Full-time
             </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${job.title}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/60 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Link
          href={`/job/${job.jobId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition hover:text-sky-200"
        >
          View details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  )
}

function SavedCard({ job, onRemove }: { job: SavedJob; onRemove: () => void }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-teal-400/20 bg-teal-400/10 px-2 py-0.5 text-[11px] font-medium text-teal-300">
              <Bookmark className="h-3 w-3 fill-current" />
              Saved
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-foreground/50">
              <Calendar className="h-3 w-3" />
              {job.savedOn}
            </span>
          </div>
          <h3 className="mt-2 truncate text-lg font-semibold tracking-tight">
            {job.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/60">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${job.title} from saved`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/60 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground/50">Match</span>
          <span className="font-semibold text-foreground">{job.match}%</span>
        </div>
        <div className="mt-1.5">
          <MatchBar value={job.match} />
        </div>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-foreground/70"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <Link
          href={`/job/${job.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-300 transition hover:text-sky-200"
        >
          View details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-3 py-1.5 text-[11px] font-semibold text-background transition hover:opacity-90"
        >
          <Send className="h-3 w-3" />
          Apply now
        </button>
      </div>
    </article>
  )
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-foreground/60">{description}</p>
      <Link
        href={cta.href}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90"
      >
        {cta.label}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
