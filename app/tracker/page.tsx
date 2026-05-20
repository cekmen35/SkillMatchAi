"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Kanban,
  XCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react"

type AppliedJob = {
  id: string
  title: string
  company: string
  appliedAt: string
}

type ColumnStatus = "applied" | "interviewing" | "offer" | "rejected"

type TrackerState = Record<ColumnStatus, AppliedJob[]>

const COLUMNS: { id: ColumnStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "applied", label: "Applied", icon: <Briefcase className="h-4 w-4" />, color: "border-sky-400/20 bg-sky-400/10 text-sky-300" },
  { id: "interviewing", label: "Interviewing", icon: <Sparkles className="h-4 w-4" />, color: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
  { id: "offer", label: "Offer", icon: <CheckCircle2 className="h-4 w-4" />, color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  { id: "rejected", label: "Rejected", icon: <XCircle className="h-4 w-4" />, color: "border-rose-400/20 bg-rose-400/10 text-rose-300" }
]

const DEFAULT_STATE: TrackerState = {
  applied: [],
  interviewing: [],
  offer: [],
  rejected: []
}

export default function TrackerPage() {
  const router = useRouter()
  const [data, setData] = useState<TrackerState>(DEFAULT_STATE)
  const [ready, setReady] = useState(false)

  const REJECTION_REASONS = [
    "Skill Gap",
    "Lack of Experience",
    "Location Issue",
    "No Response",
    "Other"
  ]
  const [rejectionModal, setRejectionModal] = useState<{ job: AppliedJob; from: ColumnStatus } | null>(null)
  const [diagnosticModal, setDiagnosticModal] = useState<AppliedJob | null>(null)
  const [recruiterMessage, setRecruiterMessage] = useState<{job: AppliedJob, message: string, round: number} | null>(null)

  function triggerNextRound(job: AppliedJob) {
       const nextDays = Math.floor(Math.random() * 3) + 1;
       const date = new Date(Date.now() + nextDays * 86400000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
       
       const times = ["10:00 AM", "1:30 PM", "3:00 PM", "9:00 AM", "11:15 AM"]
       const time = times[Math.floor(Math.random() * times.length)]
       
       let history: any[] = []
       try {
           const raw = localStorage.getItem("interviewMessages")
           if (raw) history = JSON.parse(raw)
       } catch {}
       
       const jobRounds = history.filter((h: any) => h.jobId === job.id).length
       const currentRound = jobRounds + 1
       const nextRoundNum = currentRound + 1
       
       const msg = `Congratulations! You cleared Round ${currentRound}. Your Round ${nextRoundNum} is scheduled on ${date} at ${time}.`
       
       const obj = { jobId: job.id, message: msg, round: nextRoundNum }
       history.push(obj)
       localStorage.setItem("interviewMessages", JSON.stringify(history))
       
       setRecruiterMessage({ job, message: msg, round: nextRoundNum })
       setTimeout(() => setRecruiterMessage(null), 12000)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kanbanTracker")
      if (raw) {
        setData({ ...DEFAULT_STATE, ...JSON.parse(raw) })
      }
    } catch {
      // Ignore
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (recruiterMessage) {
      const timer = setTimeout(() => {
        router.push(`/interview?jobId=${recruiterMessage.job.id}&round=${recruiterMessage.round}`)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [recruiterMessage, router])

  useEffect(() => {
    if (ready) {
      localStorage.setItem("kanbanTracker", JSON.stringify(data))
    }
  }, [data, ready])

  function executeMove(job: AppliedJob, from: ColumnStatus, to: ColumnStatus) {
    setData((prev) => {
      const copy = { ...prev }
      copy[from] = copy[from].filter((j) => j.id !== job.id)
      copy[to] = [job, ...copy[to]]
      return copy
    })
  }

  function move(job: AppliedJob, from: ColumnStatus, to: ColumnStatus) {
    if (to === "rejected") {
      setRejectionModal({ job, from })
    } else {
      executeMove(job, from, to)
    }
  }

  function handleRejectionSubmit(reason: string) {
    if (!rejectionModal) return
    try {
      const raw = localStorage.getItem("rejectionData")
      const history = raw ? JSON.parse(raw) : []
      history.push({ jobId: rejectionModal.job.id, reason })
      localStorage.setItem("rejectionData", JSON.stringify(history))
    } catch {}
    executeMove(rejectionModal.job, rejectionModal.from, "rejected")
    setRejectionModal(null)
  }

  function renderButtons(job: AppliedJob, status: ColumnStatus) {
    const idx = COLUMNS.findIndex((c) => c.id === status)
    const prev = idx > 0 ? COLUMNS[idx - 1].id : null
    const next = idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].id : null

    return (
      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-3">
        {prev ? (
          <button onClick={() => move(job, status, prev)} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition text-xs text-foreground/70 font-medium">
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Move</span>
          </button>
        ) : <div />}
        
        {status === "interviewing" && (
          <button onClick={() => triggerNextRound(job)} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest border border-sky-500/20 transition mx-auto cursor-pointer relative z-10 box-border hover:shadow-[0_0_10px_rgba(56,189,248,0.2)]">
             <Sparkles className="h-3.5 w-3.5" />
             Pass Round
          </button>
        )}

        {status === "rejected" && (
          <button onClick={() => setDiagnosticModal(job)} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20 transition mx-auto cursor-pointer relative z-10 box-border hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]">
             <Sparkles className="h-3.5 w-3.5" />
             Diagnose
          </button>
        )}

        {next ? (
          <button onClick={() => move(job, status, next)} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition text-xs text-foreground/70 font-medium">
            <span className="hidden sm:inline">Next stage</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : <div />}
      </div>
    )
  }

  return (
    <main className="relative min-h-dvh bg-background text-foreground overflow-x-hidden md:overflow-x-auto pb-24">
      {/* Background accents */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at top, rgba(0,0,0,0.9), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.22), rgba(20,184,166,0.12) 55%, transparent 75%)",
        }}
      />

      <header className="flex items-center justify-between px-6 sm:px-8 py-6 mb-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-sky-400 text-background">
            <Kanban className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Job Tracker</h1>
            <p className="text-xs text-foreground/60 hidden sm:block">Manage your active applications</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to jobs
        </Link>
      </header>

      {!ready ? (
        <div className="flex justify-center p-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
        </div>
      ) : (
        <div className="px-6 sm:px-8 flex items-start gap-4 sm:gap-6 overflow-x-auto snap-x">
          {COLUMNS.map((col) => {
            const jobs = data[col.id] || []
            return (
              <div key={col.id} className="w-[300px] sm:w-[320px] shrink-0 snap-center flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-xl relative">
                <div className="flex items-center justify-between mb-5 px-2">
                  <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${col.color}`}>
                    {col.icon}
                    {col.label}
                  </div>
                  <span className="text-sm font-semibold text-foreground/50">{jobs.length}</span>
                </div>
                
                <div className="flex flex-col gap-4 overflow-y-auto pr-1 h-full pb-10">
                  {jobs.length === 0 ? (
                    <div className="py-10 px-4 text-center rounded-xl border border-dashed border-white/10 mt-2">
                      <p className="text-xs text-foreground/40 font-medium tracking-wide uppercase">No jobs in {col.label}</p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id} className="group relative flex flex-col rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg">
                        <Link href={`/job/${job.id}`} className="flex items-start gap-3 min-w-0 mb-2">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-black/20">
                            <Building2 className="h-4 w-4 text-foreground/60" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold tracking-tight text-sm group-hover:text-sky-300 transition-colors">
                              {job.title}
                            </h3>
                            <p className="truncate text-xs text-foreground/60 mt-0.5">{job.company}</p>
                          </div>
                        </Link>
                        {renderButtons(job, col.id)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rejection Modal Overlay */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-black/90 shadow-2xl p-6 relative">
            <h2 className="text-xl font-bold tracking-tight mb-2">Track Rejection</h2>
            <p className="text-sm text-foreground/60 mb-6">Select the primary reason for this rejection on <strong className="text-foreground/80">{rejectionModal.job.company}</strong> to help us improve your future AI matches.</p>
            <div className="flex flex-col gap-2.5">
               {REJECTION_REASONS.map(reason => (
                  <button 
                     key={reason}
                     onClick={() => handleRejectionSubmit(reason)}
                     className="w-full text-left px-5 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 transition text-sm font-medium text-rose-200"
                  >
                     {reason}
                  </button>
               ))}
               <button 
                  onClick={() => {
                     executeMove(rejectionModal.job, rejectionModal.from, "rejected")
                     setRejectionModal(null)
                  }}
                  className="w-full text-center mt-3 text-xs font-semibold uppercase tracking-wider text-foreground/40 hover:text-foreground/80 outline-none transition"
               >
                  Skip for now
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Modal */}
      {diagnosticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#1a1a1a] shadow-2xl overflow-hidden shadow-rose-500/10">
             <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-1"><Sparkles className="h-5 w-5 text-rose-400" /> Rejection Diagnostics</h3>
                <p className="text-sm text-foreground/50">AI rule-based analysis for <strong className="text-foreground/80">{diagnosticModal.title}</strong> at {diagnosticModal.company}</p>
             </div>
             <div className="p-6 space-y-4">
                <p className="text-xs font-bold tracking-widest uppercase text-rose-400/80 mb-2">Top reasons you didn't get this job:</p>
                <div className="space-y-3">
                   <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-rose-300 text-sm">1. Missing Docker</span>
                         <span className="text-[10px] font-bold text-rose-200 bg-rose-500/20 px-2 py-0.5 rounded-full">70% Impact</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed"><strong className="text-emerald-400 uppercase tracking-wide text-[10px] mr-1">How to fix:</strong> Complete the 2-week Docker certification path and add it to your profile skills.</p>
                   </div>
                   <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-orange-300 text-sm">2. Weak resume keywords</span>
                         <span className="text-[10px] font-bold text-orange-200 bg-orange-500/20 px-2 py-0.5 rounded-full">20% Impact</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed"><strong className="text-emerald-400 uppercase tracking-wide text-[10px] mr-1">How to fix:</strong> Inject "Microservices" and "CI/CD" organically into your bullet points.</p>
                   </div>
                   <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-amber-300 text-sm">3. Overqualified</span>
                         <span className="text-[10px] font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full">10% Impact</span>
                      </div>
                      <p className="text-xs text-foreground/70 leading-relaxed"><strong className="text-emerald-400 uppercase tracking-wide text-[10px] mr-1">How to fix:</strong> Focus future searches strictly on Senior/Lead tier bands.</p>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3 justify-end">
                <button onClick={() => setDiagnosticModal(null)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition">Close AI Report</button>
             </div>
          </div>
        </div>
      )}

      {/* Recruiter Message Popup */}
      {recruiterMessage && (
         <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="w-80 rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden shadow-sky-500/10">
               <div className="flex items-center gap-3 bg-white/[0.03] px-4 py-3 border-b border-white/5">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner">
                     <span className="text-[10px] font-bold text-white tracking-widest uppercase">HR</span>
                     <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#1a1a1a] bg-emerald-500"></span>
                  </div>
                  <div>
                     <p className="text-sm font-bold text-white leading-none mb-1">Recruiter Team</p>
                     <p className="text-[10px] text-foreground/50 tracking-wider uppercase">{recruiterMessage.job.company}</p>
                  </div>
                  <button onClick={() => setRecruiterMessage(null)} className="ml-auto text-foreground/40 hover:text-white transition"><XCircle className="w-4 h-4" /></button>
               </div>
               <div className="p-5 text-sm text-sky-100/90 leading-relaxed font-medium bg-sky-500/5 border-l-2 border-sky-400">
                  {recruiterMessage.message}
               </div>
               <div className="p-4 bg-sky-500/5 border-t border-white/5 flex gap-3">
                  <Link href={`/interview?jobId=${recruiterMessage.job.id}&round=${recruiterMessage.round}`} className="flex-1 text-center bg-gradient-to-br from-sky-400 to-teal-400 hover:opacity-90 font-bold text-xs py-2.5 rounded-xl transition text-black shadow-lg shadow-sky-400/20">
                     Go to Round {recruiterMessage.round} 
                  </Link>
               </div>
            </div>
         </div>
      )}
    </main>
  )
}
