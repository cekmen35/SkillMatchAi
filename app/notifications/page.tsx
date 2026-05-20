"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bell, Calendar, ChevronRight, Inbox, Mail, MailOpen, User } from "lucide-react"

type InterviewMessage = {
  jobId: string
  message: string
  round: number
  dateStr?: string // we will extract it
}

export default function NotificationsPage() {
  const [messages, setMessages] = useState<InterviewMessage[]>([])
  const [activeMessage, setActiveMessage] = useState<InterviewMessage | null>(null)
  const [jobMap, setJobMap] = useState<Record<string, { title: string; company: string }>>({})
  const [acceptedIds, setAcceptedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load kanban mapping to get job titles
    try {
      const rawRoles = localStorage.getItem("kanbanTracker")
      if (rawRoles) {
        const tracker = JSON.parse(rawRoles)
        const newMap: Record<string, { title: string; company: string }> = {}
        Object.values(tracker).forEach((columnArray: any) => {
          columnArray.forEach((job: any) => {
            newMap[job.id] = { title: job.title, company: job.company }
          })
        })
        setJobMap(newMap)
      }
    } catch {}

    // Load messages
    try {
      const rawMsgs = localStorage.getItem("interviewMessages")
      if (rawMsgs) {
        const parsed = JSON.parse(rawMsgs)
        setMessages(parsed.reverse()) // newest first
        if (parsed.length > 0) {
          setActiveMessage(parsed[0])
        }
      }
    } catch {}
  }, [])

  return (
    <div className="relative min-h-dvh bg-background text-foreground flex flex-col">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, #000 40%, transparent 100%)"
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-50"
        style={{
          background: "radial-gradient(closest-side, rgba(56,189,248,0.15), transparent 70%)"
        }}
      />

      <header className="relative flex items-center justify-between px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Inbox className="h-5 w-5 text-sky-400" /> Notifications
            </h1>
            <p className="text-xs text-foreground/50">Your active recruiter communications</p>
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full pt-6 px-6 gap-6 pb-24">
        {/* Left Side: Inbox List */}
        <div className="lg:w-1/3 flex flex-col rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shrink-0 h-[70vh] overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
              <Bell className="h-4 w-4" /> Message Inbox
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-10 text-center text-sm text-foreground/40 font-medium h-full flex items-center justify-center flex-col gap-3">
                 <MailOpen className="h-8 w-8 opacity-20" />
                 Your inbox is empty.
              </div>
            ) : (
              messages.map((msg, i) => {
                const jobMeta = jobMap[msg.jobId] || { title: "Backend Engineer", company: "Turkcell" }
                const isActive = activeMessage === msg
                return (
                  <button
                    key={i}
                    onClick={() => setActiveMessage(msg)}
                    className={`w-full text-left flex flex-col p-4 border-b border-white/5 transition-all outline-none ${isActive ? "bg-sky-500/10 border-l-2 border-l-sky-400" : "hover:bg-white/[0.03] border-l-2 border-l-transparent"}`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                       <span className="text-xs font-bold text-foreground/90 truncate mr-2 tracking-wide uppercase">{jobMeta.company}</span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-sky-500/20 text-sky-300" : "bg-white/10 text-foreground/50"}`}>Round {msg.round}</span>
                    </div>
                    <h3 className={`text-sm truncate w-full mb-1 ${isActive ? "font-semibold text-sky-400" : "font-medium text-foreground/70"}`}>
                       Round {msg.round} scheduled - {jobMeta.title}
                    </h3>
                    <p className="text-xs text-foreground/50 truncate w-full">{msg.message}</p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Detail */}
        <div className="lg:w-2/3 h-[70vh] rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden">
           {!activeMessage ? (
              <div className="h-full flex items-center justify-center flex-col gap-4 text-foreground/30">
                 <Mail className="h-12 w-12 stroke-1" />
                 <p className="text-sm">Select a message to view details</p>
              </div>
           ) : (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                 {/* Email Header */}
                 <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg">
                             <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                             <h2 className="text-xl font-bold tracking-tight">{jobMap[activeMessage.jobId]?.company || "Bilinmeyen Şirket"} İK Ekibi</h2>
                             <p className="text-xs text-foreground/50 items-center flex gap-1 mt-0.5">
                               <span>careers@{jobMap[activeMessage.jobId]?.company?.toLowerCase().replace(/\s/g, '') || "company"}.com</span>
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="mt-2 pl-16">
                       <h3 className="text-lg font-semibold text-foreground/90">
                          Interview Request: Round {activeMessage.round} - {jobMap[activeMessage.jobId]?.title || "Unknown Role"}
                       </h3>
                    </div>
                 </div>

                 {/* Email Body matching rigorous Mockup Specs */}
                 <div className="flex-1 p-6 pl-[88px] overflow-y-auto">
                    <div className="prose prose-invert max-w-none text-sm text-foreground/80 mb-6">
                       <p className="mb-4">Hi there,</p>
                       <p className="font-semibold text-white tracking-wide">
                          Congratulations! You are shortlisted for <span className="text-indigo-400 font-bold">Round {activeMessage.round}</span>.
                       </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 mb-5 flex flex-col gap-3">
                       <div className="flex items-center gap-4 text-xs">
                          <span className="font-bold tracking-widest text-foreground/60 uppercase w-12">Date:</span>
                          <span className="font-medium text-white">Friday, 11:00 AM</span>
                       </div>
                       <div className="flex items-center gap-4 text-xs">
                          <span className="font-bold tracking-widest text-foreground/60 uppercase w-12">Mode:</span>
                          <span className="font-medium text-white">Virtual Zoom</span>
                       </div>
                    </div>

                    <p className="text-sm text-foreground/70 mb-6">
                       Please confirm your availability by clicking one of the options below.
                    </p>

                    <div className="flex items-center gap-3 mb-10">
                       {!acceptedIds[activeMessage.jobId] ? (
                          <>
                             <button
                                onClick={() => setAcceptedIds(prev => ({...prev, [activeMessage.jobId]: true}))}
                                className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm uppercase tracking-widest transition-all shadow-md active:scale-95"
                             >
                                Accept
                             </button>
                             <button
                                className="px-8 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-widest transition-all active:scale-95"
                             >
                                Reschedule
                             </button>
                          </>
                       ) : (
                          <div className="flex items-center gap-3">
                             <button
                                disabled
                                className="px-8 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-extrabold text-sm uppercase tracking-widest cursor-not-allowed shadow-inner flex items-center gap-2"
                             >
                                Accepted
                             </button>
                             
                             <Link
                                href={`/interview?jobId=${activeMessage.jobId}&round=${activeMessage.round}`}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg"
                             >
                                Start Interview <ChevronRight className="w-4 h-4" />
                             </Link>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           )}
        </div>
      </main>
    </div>
  )
}
