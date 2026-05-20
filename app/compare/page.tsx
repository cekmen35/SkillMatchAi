"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, TrendingUp, Sparkles, Building2, AlertTriangle, ArrowRight } from "lucide-react"

export default function ComparePage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem("compareJobs")
    if (raw) {
      try {
        setJobs(JSON.parse(raw))
      } catch (e) {}
    }
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  if (jobs.length !== 2) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 border border-white/10 bg-white/5 rounded-2xl p-10 text-center shadow-xl">
           <AlertTriangle className="h-10 w-10 text-rose-400" />
           <h1 className="text-xl font-bold">Invalid Comparison state</h1>
           <p className="text-sm text-foreground/60 max-w-sm">You must select exactly two jobs from the dashboard to compare them.</p>
           <Link href="/dashboard" className="mt-4 rounded-full bg-sky-500/20 text-sky-400 px-6 py-2 text-sm font-semibold hover:bg-sky-500/30 transition">
             Return to Dashboard
           </Link>
        </div>
      </main>
    )
  }

  const [job1, job2] = jobs

  // AI Recommendation Logic Engine
  let recommendedJob = null
  let reason = ""

  if (job1.match !== job2.match) {
    recommendedJob = job1.match > job2.match ? job1 : job2
    reason = "Highest overall skill match percentage."
  } else if (job1.missing.length !== job2.missing.length) {
    recommendedJob = job1.missing.length < job2.missing.length ? job1 : job2
    reason = "Fewer critical missing skills to learn."
  } else {
    // Tie breaker falls back to Job 1 intrinsically
    recommendedJob = job1
    reason = "Perfect baseline parity, slight structural edge."
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* Background aesthetics */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.2]"
        style={{
          backgroundImage: "radial-gradient(ellipse at top, rgba(14,165,233,0.15), transparent 70%)"
        }}
      />

      <header className="mx-auto flex max-w-5xl items-center p-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 animate-in slide-in-from-bottom-4 duration-500">
         <h1 className="text-4xl font-bold tracking-tight mb-2">Job Comparison</h1>
         <p className="text-foreground/60 mb-10 text-lg">Side-by-side analysis mapping exact internal constraints.</p>

         {/* AI Recommendation Banner */}
         <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <div className="flex items-start gap-4">
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                 <Sparkles className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">✨ AI Recommendation</h2>
                  <p className="text-xl font-bold text-emerald-50">
                    {recommendedJob.title} <span className="text-emerald-300 font-medium text-lg ml-1">at {recommendedJob.company}</span>
                  </p>
                  <p className="text-sm text-emerald-200/70 mt-1">Based on: <strong className="text-emerald-300">{reason}</strong></p>
               </div>
            </div>
            <Link href={`/job/${recommendedJob.id}`} className="shrink-0 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-background transition hover:bg-emerald-400 flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
               View Role <ArrowRight className="h-4 w-4" />
            </Link>
         </div>

         {/* Comparison Matrix */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            
            {/* Visual dividing line on desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2" />

            {[job1, job2].map((job, idx) => (
               <div key={job.id} className="flex flex-col gap-8">
                  {/* Job Header */}
                  <div className={`p-6 rounded-2xl border border-white/5 bg-white/[0.02] ${recommendedJob.id === job.id ? 'ring-2 ring-emerald-500/40 bg-emerald-500/[0.02]' : ''}`}>
                     <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 flex border items-center justify-center border-white/10 bg-white/5 rounded-xl shrink-0">
                           <Building2 className="w-4 h-4 text-sky-300" />
                        </div>
                        <div>
                           <h3 className="font-bold text-lg leading-tight">{job.title}</h3>
                           <p className="text-sky-300/80 text-sm font-medium">{job.company}</p>
                        </div>
                     </div>
                     <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">{job.location} · {job.type}</span>
                  </div>

                  {/* Stat Matrices */}
                  <div className="space-y-6">
                     
                     {/* Match Score */}
                     <div>
                        <p className="text-xs font-bold tracking-widest text-foreground/50 uppercase mb-2">Match Percentage</p>
                        <div className="flex items-end gap-3 border-b border-white/5 pb-4">
                           <span className={`text-4xl font-bold tracking-tighter ${recommendedJob.id === job.id ? 'text-emerald-400' : 'text-white'}`}>
                              {job.match}%
                           </span>
                           <span className="text-sm font-medium text-foreground/60 mb-1 break-words">Fit</span>
                        </div>
                     </div>

                     {/* Salary */}
                     <div>
                        <p className="text-xs font-bold tracking-widest text-foreground/50 uppercase mb-2">Salary Estimate</p>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                           <TrendingUp className="h-5 w-5 text-sky-400" />
                           <span className="text-xl font-semibold text-sky-50">{job.salary || "Undisclosed"}</span>
                        </div>
                     </div>

                     {/* Skills Matched */}
                     <div>
                        <p className="text-xs font-bold tracking-widest text-foreground/50 uppercase mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 
                          Matched Skills ({job.matched?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2 pb-4">
                           {job.matched?.length > 0 ? job.matched.map((s: string) => (
                             <span key={s} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                               {s}
                             </span>
                           )) : <span className="text-sm text-foreground/40 italic">No direct matches identified.</span>}
                        </div>
                     </div>

                     {/* Skills Missing */}
                     <div>
                        <p className="text-xs font-bold tracking-widest text-foreground/50 uppercase mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400" /> 
                          Missing Core Skills ({job.missing?.length || 0})
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {job.missing?.length > 0 ? job.missing.map((s: string) => (
                             <span key={s} className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-medium text-rose-300">
                               {s}
                             </span>
                           )) : <span className="text-sm text-emerald-400/70 font-medium tracking-wide">You perfectly cover all boundaries!</span>}
                        </div>
                     </div>

                  </div>
               </div>
            ))}
         </div>
      </div>
    </main>
  )
}
