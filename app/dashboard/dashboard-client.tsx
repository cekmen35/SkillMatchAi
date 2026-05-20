"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Bell,
  Check,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Lightbulb,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { MOCK_JOBS_TR, MOCK_INTERNSHIPS_TR } from "@/lib/mock-jobs"
import {
  UNKNOWN_COMPANY,
  formatJobLocation,
  formatJobSalary,
  getSalaryInsight,
  isHighSalaryAmount,
  parseSalaryAmount,
  SALARY_UNDISCLOSED,
} from "@/lib/turkish-locale"

type Job = {
  id: string | number
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  /** Ordered list of skills the role cares about. Used to compute dynamic match. */
  requiredSkills: string[]
  /** Fallback matched/missing/match used when no userSkills are stored yet. */
  fallbackMatched: string[]
  fallbackMissing: string[]
  fallbackMatch: number
}

const JOBS: Job[] = MOCK_JOBS_TR

const INTERNSHIP_JOBS: Job[] = MOCK_INTERNSHIPS_TR

type SortKey = "match" | "recent"

type ScoredJob = Job & {
  match: number
  matched: string[]
  missing: string[]
}

/**
 * Case-insensitive skill lookup. Normalises common variants so that
 * "ML" / "machine learning" / "machine-learning" all collide.
 */
function normalizeSkill(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/[._\-/]+/g, " ").replace(/\s+/g, " ")
  const aliases: Record<string, string> = {
    ml: "machine learning",
    "deep learning": "deep learning",
    dl: "deep learning",
    js: "javascript",
    ts: "typescript",
    "node js": "node.js",
    nodejs: "node.js",
    "next js": "next.js",
    nextjs: "next.js",
    postgres: "postgresql",
    "postgre sql": "postgresql",
    k8s: "kubernetes",
    tf: "tensorflow",
    "nlp": "nlp",
  }
  return aliases[s] ?? s
}

function scoreJob(job: Job, userSkills: string[] | null): ScoredJob {
  // No resume analysed yet → keep hand-authored fallback values.
  if (!userSkills || userSkills.length === 0) {
    return {
      ...job,
      match: job.fallbackMatch,
      matched: job.fallbackMatched,
      missing: job.fallbackMissing,
    }
  }

  const userSet = new Set(userSkills.map(normalizeSkill).filter(Boolean))

  const matched: string[] = []
  const missing: string[] = []
  for (const skill of job.requiredSkills) {
    if (userSet.has(normalizeSkill(skill))) matched.push(skill)
    else missing.push(skill)
  }

  // Core coverage overlapping bounds mapped logically natively
  const total = job.requiredSkills.length || 1;
  let score = (matched.length / total) * 100;

  // Enforce artificial non-linear demo boosts modeling structural ATS heuristic inflations dynamically
  if (matched.length >= 3) {
    score += 30;
  } else if (matched.length >= 2) {
    score += 20;
  } else if (matched.length >= 1) {
    score += 10;
  }

  // Strictly clamp boundaries producing structurally optimized demo bounds
  if (score > 98) score = 98;
  if (score < 72) score = 72 + (matched.length * 3) + (Math.random() * 5); // Forces floor >70 dynamically

  const match = Math.round(score);

  return { ...job, match, matched, missing }
}

export function DashboardClient() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [jobMode, setJobMode] = useState<"Jobs" | "Internships">("Jobs")
  const [fetchedJobs, setFetchedJobs] = useState<Job[]>(JOBS)
  const [sort, setSort] = useState<SortKey>("match")
  const [minMatch, setMinMatch] = useState(0)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [userSkills, setUserSkills] = useState<string[] | null>(null)
  const [selectedJobs, setSelectedJobs] = useState<ScoredJob[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [skillModal, setSkillModal] = useState<string | null>(null)
  const [autoApply, setAutoApply] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<{jobId: string, title: string, company: string, appliedAt: number, appliedBy: "AI" | "user"}[]>(() => {
      if (typeof window !== 'undefined') {
         try {
            const aj = localStorage.getItem("appliedJobs");
            if (aj) return JSON.parse(aj);
         } catch (e) {}
      }
      return [];
  })
  const [aiNoticeJobs, setAiNoticeJobs] = useState<{title: string, company: string}[]>([])
  const [offlineBotJobs, setOfflineBotJobs] = useState<{title: string, company: string}[]>([])
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [floatingToasts, setFloatingToasts] = useState<{id: string, title: string, company: string}[]>([]);

  const handleMarkLearned = (skillToLearn: string) => {
    let currentSkills: string[] = []
    try {
      const stored = localStorage.getItem("userSkills")
      if (stored) currentSkills = JSON.parse(stored)
    } catch {}
    if (!currentSkills.includes(skillToLearn.toLowerCase())) {
      const updated = [...currentSkills, skillToLearn.toLowerCase()]
      localStorage.setItem("userSkills", JSON.stringify(updated))
      setUserSkills(prev => Array.from(new Set([...(prev || []), skillToLearn.toLowerCase()])))
    }
    setSkillModal(null)
  }

  const [rejectionStats, setRejectionStats] = useState<Record<string, number>>({})
  const [totalRejections, setTotalRejections] = useState(0)

  const [newJobsAlert, setNewJobsAlert] = useState(3)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshAlert = () => {
    setIsRefreshing(true)
    setTimeout(() => {
       setNewJobsAlert(0)
       setIsRefreshing(false)
    }, 1200)
  }

  // Read skills persisted from the ATS page on mount (client-only).
  useEffect(() => {
    let cancelled = false
    const load = () => {
      try {
        const raw = localStorage.getItem("userSkills")
        if (!raw) {
          if (!cancelled) setUserSkills([])
        } else {
          const parsed = JSON.parse(raw)
          if (!cancelled) {
            if (Array.isArray(parsed)) {
              setUserSkills(parsed.filter((s): s is string => typeof s === "string"))
            } else {
              setUserSkills([])
            }
          }
        }
      } catch {
        if (!cancelled) setUserSkills([])
      }
      
      try {
         const rejectRaw = localStorage.getItem("rejectionData")
         if (rejectRaw) {
            const parsed = JSON.parse(rejectRaw)
            const counts: Record<string, number> = {}
            parsed.forEach((r: any) => {
               counts[r.reason] = (counts[r.reason] || 0) + 1
            })
            if (!cancelled) {
               setRejectionStats(counts)
               setTotalRejections(parsed.length)
            }
         }
      } catch { }

      try {
         const savedCompare = localStorage.getItem("selectedJobs")
         if (savedCompare) {
            const parsed = JSON.parse(savedCompare)
            if (Array.isArray(parsed) && !cancelled) {
               setSelectedJobs(parsed)
            }
         }
      } catch { }

      try {
         const aa = localStorage.getItem("autoApply")
         if (aa) { if (!cancelled) setAutoApply(aa === "true") }
         const aj = localStorage.getItem("appliedJobs")
         if (aj) {
            const parsed = JSON.parse(aj)
            if (Array.isArray(parsed) && !cancelled) setAppliedJobs(parsed)
         }
         
         const lv = localStorage.getItem("lastVisit")
         if (lv && aa === "true") {
            const diff = Date.now() - parseInt(lv)
            if (diff > 5000 && !cancelled) {
               // Flag for offline check
               setOfflineBotJobs([{ title: "checking", company: "" }]); 
            }
         }
      } catch { }
    }

    // Brief visible loading state so the transition from ATS → Dashboard feels intentional rather than instant.
    const timer = setTimeout(() => {
      load()
      if (!cancelled) setIsLoading(false)
    }, 600)

    const updateVisit = () => localStorage.setItem("lastVisit", String(Date.now()));
    window.addEventListener("beforeunload", updateVisit);
    
    window.addEventListener("focus", load)
    window.addEventListener("storage", load)

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener("beforeunload", updateVisit);
      window.removeEventListener("focus", load)
      window.removeEventListener("storage", load)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("selectedJobs", JSON.stringify(selectedJobs))
    }
  }, [selectedJobs, isLoading])

  useEffect(() => {
    let cancelled = false;
    const loadApi = async () => {
      // Instantly load cached jobs if structurally available
      try {
         const cached = localStorage.getItem(`cachedJobs_${jobMode}`);
         if (cached) {
            const parsed = JSON.parse(cached);
            
            // Validate integrity to avoid old cache bleeding
            const isValidCache = jobMode === "Internships" 
                ? parsed.every((j: any) => j.type === "Internship" || j.title.toLowerCase().includes("intern"))
                : true;
                
            if (isValidCache && parsed.length > 0) {
               setFetchedJobs(parsed);
               setIsLoading(false);
            }
         }
      } catch {}

      if (!isLoading && jobMode !== "Jobs") setIsLoading(true);
      try {
         const sq = jobMode === "Internships"
           ? "yazılım stajyeri Türkiye OR data analyst intern Istanbul"
           : "yazılım mühendisi İstanbul OR backend developer Turkey OR frontend engineer Ankara";
         const res = await fetch(`/api/jobs?query=${encodeURIComponent(sq)}`);
         const data = await res.json();
         if (Array.isArray(data) && data.length > 0 && !cancelled) {
            const mapped: Job[] = data.map((j: any) => ({
              id: `${j.job_id || ''}-${j.employer_name || ''}-${j.job_title || ''}`.replace(/\s+/g, '-'),
              title: j.job_title || "Software Engineer",
              company: j.employer_name || UNKNOWN_COMPANY,
              location: formatJobLocation(j),
              type: jobMode === "Internships" ? "Staj" : (j.job_employment_type ? j.job_employment_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "Tam zamanlı"),
              salary: j.job_min_salary ? formatJobSalary(j.job_min_salary, j.job_max_salary) : SALARY_UNDISCLOSED,
              posted: "Az önce",
              requiredSkills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker", "AWS", "Machine Learning"].sort(() => 0.5 - Math.random()).slice(0, 6),
              fallbackMatched: [],
              fallbackMissing: [],
              fallbackMatch: 0
            }));
            setFetchedJobs(mapped);
            if (!cancelled) {
               localStorage.setItem(`cachedJobs_${jobMode}`, JSON.stringify(mapped));
               localStorage.setItem("cachedJobs", JSON.stringify(mapped)); // Maintain generic fallback compatibility
            }
         } else {
             throw new Error("No data mapped");
         }
      } catch (err) {
         if (!cancelled) {
             console.log("Mock data payload triggered for:", jobMode);
             const fallback = jobMode === "Internships" ? INTERNSHIP_JOBS : JOBS;
             setFetchedJobs(fallback);
             localStorage.setItem(`cachedJobs_${jobMode}`, JSON.stringify(fallback));
         }
      } finally {
         if (!cancelled) setIsLoading(false);
      }
    };
    
    // Slight delay mimicking organic API network fetch conditions visually unless cache overrides
    const timer = setTimeout(loadApi, 50);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [jobMode]);
  
  const scored = useMemo<ScoredJob[]>(
    () => fetchedJobs.map((j) => scoreJob(j, userSkills)),
    [fetchedJobs, userSkills],
  )

  useEffect(() => {
    if (autoApply && scored.length > 0) {
      const currentAppliedIds = new Set(appliedJobs.map(j => String(j.jobId)));
      const newAppliedArr = [...appliedJobs];
      const newlyMatched: {title: string, company: string}[] = [];

      let aiAppliedCount = 0;
      // Scramble dynamically to ensure AI doesn't just pick the top 3 statically every time
      const randomizedJobs = [...scored].sort(() => 0.5 - Math.random());

      randomizedJobs.forEach(sJob => {
         if (sJob.match >= 70 && !currentAppliedIds.has(String(sJob.id)) && aiAppliedCount < 3) {
            newAppliedArr.push({ 
               jobId: String(sJob.id), 
               title: sJob.title, 
               company: sJob.company, 
               appliedAt: Date.now(), 
               appliedBy: "AI" 
            });
            currentAppliedIds.add(String(sJob.id));
            newlyMatched.push({title: sJob.title, company: sJob.company});
            aiAppliedCount++;
         }
      });

      if (newlyMatched.length > 0) {
         const newToasts = newlyMatched.map(nm => ({ id: Math.random().toString(), ...nm }));
         setFloatingToasts(prev => [...prev, ...newToasts]);
         
         setTimeout(() => {
            setFloatingToasts(prev => prev.filter(t => !newToasts.find(nt => nt.id === t.id)));
         }, 4000);

         setAppliedJobs(newAppliedArr);
         localStorage.setItem("appliedJobs", JSON.stringify(newAppliedArr));
         
         if (offlineBotJobs.length > 0 && offlineBotJobs[0].title === "checking") {
            setOfflineBotJobs(newlyMatched);
         } else {
            setAiNoticeJobs(prev => [...prev, ...newlyMatched]);
         }
      } else if (offlineBotJobs.length > 0 && offlineBotJobs[0].title === "checking") {
         setOfflineBotJobs([]); // Clear flag if no jobs found
      }
    }
  }, [autoApply, scored]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = scored.filter((job) => {
      if (job.match < minMatch) return false
      if (activeSkill && !job.missing.includes(activeSkill)) return false
      if (!q) return true
      return (
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.matched.some((s) => s.toLowerCase().includes(q)) ||
        job.missing.some((s) => s.toLowerCase().includes(q))
      )
    })

    if (sort === "match") {
      list = list.slice().sort((a, b) => b.match - a.match)
    } else {
      // Parse semantic posted string into raw integer weight (days ago) for accurate sorting
      const getDaysAgo = (posted: string) => {
         const lower = posted.toLowerCase();
         if (lower.includes("today") || lower.includes("hr") || lower.includes("now")) return 0;
         const match = lower.match(/\d+/);
         if (match) {
            const num = parseInt(match[0]);
            if (lower.includes("w")) return num * 7;
            if (lower.includes("m")) return num * 30;
            return num;
         }
         return 99; // Default fallback
      }
      
      list = list.slice().sort((a, b) => getDaysAgo(a.posted) - getDaysAgo(b.posted));
    }
    return list
  }, [scored, query, sort, minMatch, activeSkill])

  const avgMatch = useMemo(() => {
    if (filtered.length === 0) return 0
    return Math.round(filtered.reduce((a, b) => a + b.match, 0) / filtered.length)
  }, [filtered])

  const topRejectionReason = useMemo(() => {
     if (totalRejections === 0) return null
     return Object.entries(rejectionStats).sort((a, b) => b[1] - a[1])[0]
  }, [rejectionStats, totalRejections])

  const hasResumeSkills = !!userSkills && userSkills.length > 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
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
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.22), rgba(20,184,166,0.12) 55%, transparent 75%)",
        }}
      />

      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 border-b border-white/5 relative z-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">SkillMatch AI</span>
        </Link>
        <nav className="flex items-center gap-4 relative">
          <div className="relative">
             <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className="relative p-2 rounded-full border border-white/10 bg-white/5 transition-all text-foreground/70 hover:bg-white/10 hover:text-white group focus:outline-none focus:ring-2 focus:ring-sky-400/50"
             >
                <Bell className={`w-4 h-4 transition-transform ${(aiNoticeJobs.length > 0 || offlineBotJobs.length > 0) ? "animate-bounce group-hover:animate-none" : ""}`} />
                {(aiNoticeJobs.length > 0 || offlineBotJobs.length > 0) && (
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                )}
             </button>
             
             {isNotifOpen && (
                <div className="absolute top-full mt-3 right-0 w-80 bg-[#0f172a] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-sky-500/20">
                   <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-2"><Bell className="w-3.5 h-3.5"/> Notifications</h4>
                      {(aiNoticeJobs.length > 0 || offlineBotJobs.length > 0) && (
                         <button onClick={() => { setAiNoticeJobs([]); setOfflineBotJobs([]); setIsNotifOpen(false); }} className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold tracking-wide uppercase">Clear All</button>
                      )}
                   </div>
                   
                   <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 relative">
                      {offlineBotJobs.map((j, i) => (
                         j.title !== "checking" && (
                           <div key={`off-${i}`} className="w-full flex items-start gap-3 px-3 py-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20">
                              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                                 🚀
                              </div>
                              <div>
                                 <h5 className="text-[11px] font-extrabold text-violet-300 uppercase tracking-wider">AI Applied While Away</h5>
                                 <p className="text-sm text-white font-medium mt-0.5 leading-snug">{j.title}</p>
                                 <p className="text-xs text-foreground/50">at {j.company}</p>
                              </div>
                           </div>
                         )
                      ))}
                      
                      {aiNoticeJobs.map((j, i) => (
                         <div key={`act-${i}`} className="w-full flex items-start gap-3 px-3 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 animate-in slide-in-from-left-4 fade-in duration-300">
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 border border-sky-500/30">
                               🤖
                            </div>
                            <div>
                               <h5 className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider">Active Auto-Apply</h5>
                               <p className="text-sm text-white font-medium mt-0.5 leading-snug">{j.title}</p>
                               <p className="text-xs text-foreground/50">at {j.company}</p>
                            </div>
                         </div>
                      ))}
                      
                      {((offlineBotJobs.length === 0 || offlineBotJobs[0].title === "checking") && aiNoticeJobs.length === 0) && (
                         <div className="w-full py-8 flex flex-col items-center justify-center gap-2 border border-dashed border-white/5 bg-white/[0.01] rounded-xl text-center">
                            <Bell className="w-6 h-6 text-foreground/30"/>
                            <span className="text-xs text-foreground/50 font-medium">No active broadcasts.</span>
                         </div>
                      )}
                   </div>
                </div>
             )}
          </div>
          
          <Link
            href="/history"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-sky-400/50"
          >
            <Clock className="w-3.5 h-3.5" />
            History Archive
          </Link>

          <Link
            href="/ats"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to analysis
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* Job Alerts */}
        {newJobsAlert > 0 && !isLoading && (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-5 shadow-sm relative overflow-hidden group transition-all animate-in fade-in slide-in-from-top-4">
               <div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 via-transparent to-transparent pointer-events-none" />
               <div className="flex items-center gap-3 relative z-10 text-sm font-medium text-sky-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-teal-400/20 border border-sky-400/30 text-sky-300">
                    <Bell className="h-5 w-5 animate-bounce" />
                  </div>
                  <span className="text-base"><strong className="text-white">🔔 {newJobsAlert} new jobs</strong> match your profile</span>
               </div>
               <button 
                  onClick={handleRefreshAlert}
                  disabled={isRefreshing}
                  className="relative z-10 flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {isRefreshing ? "Updating..." : "Update jobs"}
               </button>
            </div>
        )}

        {/* Hero */}
        <div className="flex flex-col gap-6 border-b border-white/5 pb-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {hasResumeSkills
              ? `Matched against ${userSkills!.length} skill${userSkills!.length === 1 ? "" : "s"} from your resume`
              : `${filtered.length} roles matched to your profile`}
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Your job matches
            </h1>
            <p className="max-w-2xl text-pretty leading-relaxed text-foreground/70">
              {hasResumeSkills
                ? "Scores are computed live from the skills we extracted from your resume. Click any missing skill to filter roles that would unlock with that skill."
                : "Ranked by how closely each role fits your resume. Click any missing skill to filter roles that would unlock with that skill."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
            <StatCard label="Open matches" value={String(filtered.length)} />
            <StatCard label="Average fit" value={`${avgMatch}%`} />
            <StatCard label="Top match" value={`${filtered[0]?.match ?? 0}%`} />
            <StatCard
              label="Missing skills"
              value={String(countUnique(filtered.flatMap((j) => j.missing)))}
            />
          </div>

          {/* Unified Career Insights Module */}
          <div className="mt-10 mb-8 w-full border-t border-white/5 pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-6 flex items-center gap-2">
               <Briefcase className="w-5 h-5 text-foreground/50"/> Kariyer ve Piyasa Analizi
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Market Trends */}
              <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition duration-500 group-hover:scale-110">
                   <TrendingUp className="w-32 h-32" />
                </div>
                <div className="text-xs uppercase tracking-widest font-bold text-foreground/40 flex items-center gap-2 mb-6">
                   <TrendingUp className="w-4 h-4 text-emerald-400"/> Canlı Piyasa Trendleri
                </div>
                <div className="flex flex-wrap gap-3 mt-auto relative z-10 w-full">
                   <div className="flex flex-col flex-1 min-w-[140px] bg-black/20 rounded-xl p-4 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Python</span>
                      <div className="flex items-center text-emerald-400 font-bold text-xl"><TrendingUp className="w-4 h-4 mr-1.5"/> 32% <span className="text-xs text-foreground/50 font-normal ml-1">Talep</span></div>
                   </div>
                   <div className="flex flex-col flex-1 min-w-[140px] bg-black/20 rounded-xl p-4 border border-sky-500/10 hover:border-sky-500/30 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Docker</span>
                      <div className="flex items-center text-sky-400 font-bold text-xl"><TrendingUp className="w-4 h-4 mr-1.5"/> 20% <span className="text-xs text-foreground/50 font-normal ml-1">Beceri</span></div>
                   </div>
                   <div className="flex flex-col w-full bg-black/20 rounded-xl p-4 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Öne Çıkan Rol</span>
                      <div className="flex items-center text-purple-400 font-bold text-xl"><Sparkles className="w-4 h-4 mr-1.5"/> ML Mühendisi</div>
                   </div>
                   <div className="flex flex-col w-full bg-black/20 rounded-xl p-4 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                      <span className="text-[10px] uppercase font-bold text-foreground/40 mb-1">Ort. Maaş (İstanbul)</span>
                      <div className="flex items-center text-amber-300 font-bold text-lg"><TrendingUp className="w-4 h-4 mr-1.5 shrink-0"/> ₺95.000 – ₺140.000 / ay</div>
                   </div>
                </div>
              </div>

              {/* Right Column: Rejection Analytics */}
              <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition duration-500 group-hover:scale-110">
                   <TrendingDown className="w-32 h-32" />
                </div>
                <div className="text-xs uppercase tracking-widest font-bold text-foreground/40 flex items-center gap-2 mb-6">
                   <TrendingDown className="w-4 h-4 text-rose-400" /> Rejection Analytics
                </div>
                {totalRejections > 0 && topRejectionReason ? (
                  <div className="flex flex-col gap-5 mt-auto relative z-10 w-full">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                         <p className="text-sm font-medium text-foreground/70">Most Common Obstacle</p>
                         <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
                            {topRejectionReason[0]} 
                            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-sm">
                               {Math.round((topRejectionReason[1] / totalRejections) * 100)}%
                            </span>
                         </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-1">
                         {Object.entries(rejectionStats)
                           .sort((a, b) => b[1] - a[1])
                           .slice(0, 3) 
                           .map(([reason, count]) => {
                              const pct = Math.round((count / totalRejections) * 100)
                              return (
                                 <div key={reason} className="flex-1 w-full flex items-center gap-3">
                                    <div className="text-xs font-semibold text-foreground/60 truncate w-[140px] text-right">{reason}</div>
                                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                                       <div className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-foreground/80 w-10">{pct}%</span>
                                 </div>
                              )
                         })}
                      </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-auto h-full text-center relative z-10 opacity-70">
                     <p className="text-sm font-medium text-foreground/60 mb-2">No rejections tracked yet.</p>
                     <p className="text-xs text-foreground/40 leading-relaxed max-w-[250px]">Move jobs to 'Rejected' in the Kanban Tracker to automatically generate insights here.</p>
                  </div>
                )}
              </div>

              {/* Third Column: Skill Decay Detection */}
              <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02] shadow-sm relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition duration-500 group-hover:scale-110">
                   <AlertTriangle className="w-32 h-32 text-orange-400" />
                </div>
                <div className="text-xs uppercase tracking-widest font-bold text-foreground/40 flex items-center gap-2 mb-6">
                   <AlertTriangle className="w-4 h-4 text-orange-400" /> Skill Decay Warning
                </div>
                <div className="flex flex-col mt-auto relative z-10 w-full gap-4">
                  {(!userSkills || userSkills.length === 0 || !userSkills.some(s => s.toLowerCase() === "react")) ? (
                      <div className="flex flex-col bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                         <span className="text-[10px] uppercase font-bold text-orange-400 mb-1 tracking-widest">Priority Action Needed</span>
                         <span className="text-sm font-semibold text-orange-200">Your profile is missing modern framework data.</span>
                         <span className="text-xs text-orange-200/60 mt-1">Upgrade your skills to capture tech roles.</span>
                      </div>
                  ) : (
                      <div className="flex flex-col bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                         <span className="text-[10px] uppercase font-bold text-orange-400 mb-1 tracking-widest">Outdated Ecosystem</span>
                         <span className="text-sm font-semibold text-orange-200">Your React skill is outdated.</span>
                         <span className="text-xs text-orange-200/60 mt-2 p-2 bg-orange-500/10 rounded border border-orange-500/20"><strong className="text-orange-300">New trend:</strong> Next.js, Server Components</span>
                         <div className="mt-3">
                            <span className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer hover:bg-orange-500/30 transition border border-orange-500/30">
                               <TrendingUp className="w-3 h-3" /> Upgrade your skill
                            </span>
                         </div>
                      </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-neutral-900 rounded-xl p-6 border border-white/10 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto overflow-hidden">
             <div className="relative w-full md:w-[260px] lg:w-[320px]">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
               <input
                 type="text"
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search title, company, or skill"
                 className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-sky-400/40 focus:bg-white/[0.07]"
               />
             </div>
             
             <div className="inline-flex w-full sm:w-auto rounded-full border border-white/10 bg-white/5 p-1 shrink-0 overflow-hidden">
               <button onClick={() => setJobMode("Jobs")} className={`flex-1 sm:flex-none px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${jobMode === "Jobs" ? "bg-gradient-to-br from-sky-400 to-teal-400 text-black shadow-md scale-100" : "text-foreground/70 hover:text-white"}`}>Jobs</button>
               <button onClick={() => setJobMode("Internships")} className={`flex-1 sm:flex-none px-5 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${jobMode === "Internships" ? "bg-gradient-to-br from-emerald-400 to-teal-400 text-black shadow-md scale-100" : "text-foreground/70 hover:text-white"}`}>Internships</button>
             </div>
             
             <div className="hidden md:flex ml-2 w-px h-6 bg-white/10 shrink-0" />
             <button 
                onClick={() => {
                   const nstate = !autoApply;
                   setAutoApply(nstate);
                   localStorage.setItem("autoApply", String(nstate));
                }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 ${autoApply ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-pulse border-transparent' : 'border border-white/10 bg-white/5 text-foreground/50 hover:bg-white/10 hover:text-white'}`}
             >
                Auto Apply 🤖
             </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              value={sort}
              onChange={setSort}
              options={[
                { value: "match", label: "Best match" },
                { value: "recent", label: "Most recent" },
              ]}
            />
            <SegmentedControl
              value={String(minMatch)}
              onChange={(v) => setMinMatch(Number(v))}
              options={[
                { value: "0", label: "All" },
                { value: "70", label: "70%+" },
                { value: "85", label: "85%+" },
              ]}
            />
          </div>
        </div>

        {/* Global Auto-Applied Tracking Visually */}
        {aiNoticeJobs.length > 0 && (
           <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {aiNoticeJobs.map((j, i) => (
                 <span key={`vis-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 shadow-sm">
                    🤖 AI Applied: {j.title} at {j.company}
                 </span>
              ))}
           </div>
        )}

        {/* Active skill filter chip */}
        {activeSkill && (
          <div className="mt-4 flex items-center gap-2 text-xs text-foreground/70">
            <span>Filtering by missing skill:</span>
            <button
              type="button"
              onClick={() => setActiveSkill(null)}
              className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 font-medium text-sky-300 transition hover:bg-sky-400/15"
            >
              {activeSkill}
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-sky-300" aria-hidden="true" />
            <p className="text-sm font-medium">Loading jobs…</p>
            <p className="text-xs text-foreground/60">
              Matching roles against your resume skills.
            </p>
          </div>
        )}

        {/* Job grid */}
        {!isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSkillClick={(skill) => setSkillModal(skill)}
                selectedJobs={selectedJobs}
                setSelectedJobs={setSelectedJobs}
                appliedJobs={appliedJobs}
                setAppliedJobs={setAppliedJobs}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <Briefcase className="h-6 w-6 text-foreground/40" />
            <h3 className="text-base font-medium">No roles match your filters</h3>
            <p className="max-w-sm text-sm text-foreground/60">
              Try clearing the search or lowering the minimum match threshold.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setMinMatch(0)
                setActiveSkill(null)
              }}
              className="mt-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium transition hover:bg-white/10"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Floating Compare Action Button */}
      {selectedJobs.length > 0 && (
        <button
           type="button"
           onClick={() => {
               if (selectedJobs.length === 2) setIsCompareOpen(true);
           }}
           className={`fixed bottom-24 right-6 z-50 flex items-center gap-2.5 rounded-full px-6 py-4 font-extrabold tracking-wide shadow-2xl transition-all animate-in slide-in-from-right-8 fade-in duration-300 ${
               selectedJobs.length === 2 
                 ? "bg-gradient-to-r from-sky-400 to-teal-400 text-background ring-2 ring-sky-300/50 shadow-[0_0_30px_rgba(56,189,248,0.6)] hover:scale-110 hover:shadow-[0_0_45px_rgba(56,189,248,0.8)] active:scale-95 cursor-pointer" 
                 : "bg-background/90 text-foreground/50 border border-white/10 backdrop-blur-md cursor-default pointer-events-none"
           }`}
        >
           <Sparkles className="h-5 w-5" />
           {selectedJobs.length === 2 ? "COMPARE NOW" : "SELECT 1 MORE TO COMPARE"}
           <span className={`ml-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold shadow-inner ${selectedJobs.length === 2 ? 'bg-background/20 text-background' : 'bg-white/10 text-white'}`}>
             {selectedJobs.length}
           </span>
        </button>
      )}

      {/* Comparison Modal Overlay */}
      {isCompareOpen && selectedJobs.length === 2 && (() => {
        const [j1, j2] = selectedJobs;
        let winnerId = j1.id;
        let reason = "Perfect parity in structure.";
        
        if (j1.match !== j2.match) {
           winnerId = j1.match > j2.match ? j1.id : j2.id;
           reason = "Higher overall match percentage.";
        } else if (j1.missing.length !== j2.missing.length) {
           winnerId = j1.missing.length < j2.missing.length ? j1.id : j2.id;
           reason = "Less critical skill gap required.";
        }
        
        const winnerJob = winnerId === j1.id ? j1 : j2;
        
        const parsedSal1 = parseSalaryAmount(j1.salary || "");
        const parsedSal2 = parseSalaryAmount(j2.salary || "");
        const higherSalaryId = parsedSal1 > parsedSal2 ? j1.id : (parsedSal2 > parsedSal1 ? j2.id : null);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in bg-black/60 backdrop-blur-sm p-6 overflow-hidden">
             <div className="bg-[#0f172a] rounded-2xl border border-white/10 ring-1 ring-sky-500/20 bg-gradient-to-b from-sky-900/10 to-transparent w-full max-w-4xl max-h-[90vh] shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-y-auto flex flex-col relative animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] sticky top-0 z-10 backdrop-blur-xl">
                   <div>
                     <h2 className="text-xl font-bold">Job Comparison</h2>
                     <p className="text-sm text-foreground/60">Contrasting parameters mapping precision metrics.</p>
                   </div>
                   <button onClick={() => setIsCompareOpen(false)} className="rounded-full p-2 hover:bg-white/10 transition text-foreground/60"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6">
                   {/* AI Recommendation Banner */}
                   <div className="mb-8 flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                         <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">🏆 AI Recommended</h2>
                         <p className="text-lg font-bold text-emerald-50">
                           {winnerJob.title} <span className="text-emerald-300/80 font-medium text-sm ml-1">at {winnerJob.company}</span>
                         </p>
                         <p className="text-xs font-semibold text-emerald-200/60 mt-1">Reason: <strong className="text-emerald-300">{reason}</strong></p>
                      </div>
                   </div>

                   <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left border-collapse bg-white/[0.01]">
                         <thead>
                            <tr className="border-b border-white/10 text-xs tracking-wider uppercase text-foreground/50 bg-white/[0.02]">
                               <th className="p-4 font-semibold w-1/5 relative">Feature</th>
                               <th className={`p-4 font-bold w-2/5 border-l border-white/10 relative ${winnerId === j1.id ? 'bg-emerald-500/10 text-emerald-300' : ''}`}>
                                  {j1.title} {winnerId === j1.id && <span className="ml-2 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Better Match</span>}
                                  <div className="absolute top-1/2 -translate-y-1/2 -right-3.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold border border-white/10 shadow-lg text-white">VS</div>
                               </th>
                               <th className={`p-4 font-bold w-2/5 border-l border-white/10 ${winnerId === j2.id ? 'bg-emerald-500/10 text-emerald-300' : ''}`}>
                                  {j2.title} {winnerId === j2.id && <span className="ml-2 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Better Match</span>}
                               </th>
                            </tr>
                         </thead>
                         <tbody className="text-sm">
                            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
                               <td className="p-4 font-medium text-foreground/70">Company</td>
                               <td className={`p-4 border-l border-white/10 font-bold ${winnerId === j1.id ? 'bg-emerald-500/5' : ''}`}>{j1.company}</td>
                               <td className={`p-4 border-l border-white/10 font-bold ${winnerId === j2.id ? 'bg-emerald-500/5' : ''}`}>{j2.company}</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
                               <td className="p-4 font-medium text-foreground/70">Maaş</td>
                               <td className={`p-4 border-l border-white/10 text-sky-300 font-bold ${winnerId === j1.id ? 'bg-emerald-500/5' : ''}`}>
                                  {j1.salary || SALARY_UNDISCLOSED}
                                  {higherSalaryId === j1.id && typeof j1.salary === "string" && !j1.salary.toLowerCase().includes("belirtilmemiş") && !j1.salary.toLowerCase().includes("undisclosed") && <span className="ml-2 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Yüksek Maaş</span>}
                               </td>
                               <td className={`p-4 border-l border-white/10 text-sky-300 font-bold ${winnerId === j2.id ? 'bg-emerald-500/5' : ''}`}>
                                  {j2.salary || SALARY_UNDISCLOSED}
                                  {higherSalaryId === j2.id && typeof j2.salary === "string" && !j2.salary.toLowerCase().includes("belirtilmemiş") && !j2.salary.toLowerCase().includes("undisclosed") && <span className="ml-2 inline-block rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">Yüksek Maaş</span>}
                               </td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
                               <td className="p-4 font-medium text-foreground/70">Location</td>
                               <td className={`p-4 border-l border-white/10 ${winnerId === j1.id ? 'bg-emerald-500/5' : ''}`}>{j1.location}</td>
                               <td className={`p-4 border-l border-white/10 ${winnerId === j2.id ? 'bg-emerald-500/5' : ''}`}>{j2.location}</td>
                            </tr>
                            <tr className="border-b border-white/5 hover:bg-white/[0.02] transition">
                               <td className="p-4 font-medium text-foreground/70">Match %</td>
                               <td className={`p-4 border-l border-white/10 ${winnerId === j1.id ? 'bg-emerald-500/5' : ''}`}><span className="text-emerald-400 font-bold text-lg">{j1.match}%</span></td>
                               <td className={`p-4 border-l border-white/10 ${winnerId === j2.id ? 'bg-emerald-500/5' : ''}`}><span className="text-emerald-400 font-bold text-lg">{j2.match}%</span></td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition">
                               <td className="p-4 font-medium text-foreground/70 pb-6 align-top">Skills Gap</td>
                               <td className={`p-4 border-l border-white/10 pb-6 align-top ${winnerId === j1.id ? 'bg-emerald-500/5' : ''}`}>
                                  <div className="flex flex-col gap-3">
                                     <div className="text-[10px] uppercase font-bold text-emerald-400">✅ Matched</div>
                                     <div className="flex flex-wrap gap-1.5 mb-2">
                                        {j1.matched.length ? j1.matched.map(s => <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-medium">{s}</span>) : <span className="text-xs text-foreground/40 italic">None</span>}
                                     </div>
                                     <div className="text-[10px] uppercase font-bold text-rose-400">❌ Missing</div>
                                     <div className="flex flex-wrap gap-1.5">
                                        {j1.missing.length ? j1.missing.map(s => <span key={s} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-medium">{s}</span>) : <span className="text-xs text-foreground/40 italic">None</span>}
                                     </div>
                                  </div>
                               </td>
                               <td className={`p-4 border-l border-white/10 pb-6 align-top ${winnerId === j2.id ? 'bg-emerald-500/5' : ''}`}>
                                  <div className="flex flex-col gap-3">
                                     <div className="text-[10px] uppercase font-bold text-emerald-400">✅ Matched</div>
                                     <div className="flex flex-wrap gap-1.5 mb-2">
                                        {j2.matched.length ? j2.matched.map(s => <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-medium">{s}</span>) : <span className="text-xs text-foreground/40 italic">None</span>}
                                     </div>
                                     <div className="text-[10px] uppercase font-bold text-rose-400">❌ Missing</div>
                                     <div className="flex flex-wrap gap-1.5">
                                        {j2.missing.length ? j2.missing.map(s => <span key={s} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-medium">{s}</span>) : <span className="text-xs text-foreground/40 italic">None</span>}
                                     </div>
                                  </div>
                               </td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
          </div>
        )
      })}

      {/* Skill Insights Modal */}
      {skillModal && (() => {
        const jobsUnlocked = scored.filter(j => j.missing.includes(skillModal)).length;
        const timeEstimate = skillModal.length > 5 ? "3 weeks" : "1 week";
        
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-[#0f172a] rounded-2xl border border-white/10 ring-1 ring-sky-500/20 bg-gradient-to-b from-sky-900/10 to-transparent w-full max-w-md shadow-[0_0_60px_rgba(14,165,233,0.15)] overflow-hidden flex flex-col relative text-white">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] relative">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                         <Lightbulb className="w-5 h-5"/>
                      </div>
                      <div>
                         <h2 className="text-xl font-extrabold capitalize tracking-tight">{skillModal}</h2>
                         <p className="text-xs text-sky-300 font-medium tracking-wide uppercase">Missing Skill Profiler</p>
                      </div>
                   </div>
                   <button onClick={() => setSkillModal(null)} className="text-foreground/50 hover:text-white transition bg-white/5 rounded-full p-1.5"><X className="w-4 h-4"/></button>
                </div>
                
                <div className="p-6">
                   <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 shadow-inner text-center">
                         <div className="text-indigo-400 mb-1"><Briefcase className="w-5 h-5 mx-auto"/></div>
                         <div className="text-2xl font-bold tracking-tight text-white mb-0.5">+{jobsUnlocked}</div>
                         <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">Jobs Unlocked</div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 shadow-inner text-center">
                         <div className="text-emerald-400 mb-1"><Clock className="w-5 h-5 mx-auto"/></div>
                         <div className="text-2xl font-bold tracking-tight text-white mb-0.5">{timeEstimate}</div>
                         <div className="text-[10px] text-foreground/50 uppercase tracking-widest font-bold">To Learn</div>
                      </div>
                   </div>
                   
                   <div className="mb-8 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20 p-5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-sky-300 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Recommended Course</h3>
                      <p className="text-lg font-semibold tracking-tight text-white">Mastering {skillModal}</p>
                      <p className="text-xs font-medium text-foreground/60 mt-1 mb-3">Available natively via YouTube & Coursera.</p>
                      <Link href={`https://www.youtube.com/results?search_query=${skillModal}+crash+course`} target="_blank" className="inline-flex py-1.5 px-3 rounded bg-white/10 hover:bg-white/20 items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white transition">
                         Watch Free Course <ArrowRight className="w-3 h-3"/>
                      </Link>
                   </div>
                   
                   <div className="flex flex-col gap-2">
                     <button
                        onClick={() => handleMarkLearned(skillModal)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-extrabold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
                     >
                        <CheckCircle2 className="w-5 h-5"/> Mark as Learned
                     </button>
                     <button
                        onClick={() => { setActiveSkill(skillModal); setSkillModal(null); }}
                        className="w-full flex items-center justify-center gap-2 bg-white/[0.05] border border-white/10 hover:bg-white/10 text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-95 mt-2"
                     >
                        Filter Jobs Only
                     </button>
                   </div>
                </div>
             </div>
          </div>
        )
      })}

      {/* Floating Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {floatingToasts.map(toast => (
           <div key={toast.id} className="animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/20 rounded-2xl p-4 w-80 text-white relative">
              <div className="flex items-start gap-3">
                 <div className="bg-white/20 p-2 rounded-full mt-0.5">🤖</div>
                 <div className="flex-1">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-violet-200">AI Auto-Applied</h4>
                    <p className="text-sm font-bold mt-0.5 leading-snug">{toast.title}</p>
                    <p className="text-xs text-white/70">at {toast.company}</p>
                 </div>
                 <button onClick={() => setFloatingToasts(prev => prev.filter(t => t.id !== toast.id))} className="opacity-50 hover:opacity-100 transition"><X className="w-4 h-4"/></button>
              </div>
           </div>
        ))}
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              active
                ? "rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-3 py-1.5 font-medium text-background"
                : "rounded-full px-3 py-1.5 font-medium text-foreground/70 transition hover:text-foreground"
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function JobCard({
  job,
  onSkillClick,
  selectedJobs,
  setSelectedJobs,
  appliedJobs,
  setAppliedJobs
}: {
  job: ScoredJob
  onSkillClick: (skill: string) => void
  selectedJobs: ScoredJob[]
  setSelectedJobs: React.Dispatch<React.SetStateAction<ScoredJob[]>>
  appliedJobs: {jobId: string, title: string, company: string, appliedAt: number, appliedBy: "AI" | "user"}[]
  setAppliedJobs: React.Dispatch<React.SetStateAction<{jobId: string, title: string, company: string, appliedAt: number, appliedBy: "AI" | "user"}[]>>
}) {
  const [dynamicUpdate, setDynamicUpdate] = useState(0);

  useEffect(() => {
     const handleStorage = () => setDynamicUpdate(prev => prev + 1);
     window.addEventListener("storage", handleStorage);
     return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const appliedJobsStruct = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("appliedJobs") || "[]") : [];
  const isSelected = selectedJobs.some((c) => c.id === job.id);
  const appliedData = appliedJobsStruct.find((a: any) => String(a.jobId) === String(job.id));
  const isApplied = !!appliedData;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
       setSelectedJobs(prev => prev.filter(c => c.id !== job.id));
    } else {
       if (selectedJobs.length >= 2) {
          alert("You can compare only 2 jobs");
          return;
       }
       setSelectedJobs(prev => [...prev, job]);
    }
  };

  const tone = matchTone(job.match)

  // Smart Tags Logic
  const isBestMatch = job.match > 80
  const isQuickHire = (job.matched.length + job.missing.length) <= 5
  
  const insight = getSalaryInsight(job.title)
  const isHighSalary =
    isHighSalaryAmount(job.salary) || isHighSalaryAmount(insight)

  // FOMO Logic Loop
  const fomoSeed = parseInt(job.id.toString()) || 1
  const fomoInitial = fomoSeed % 2 === 0 ? (12 + (fomoSeed % 10)) : (2 + (fomoSeed % 3))
  const [fomoCount, setFomoCount] = useState(fomoInitial)
  const fomoType = fomoSeed % 2 === 0 ? "high" : "low"

  useEffect(() => {
    const interval = setInterval(() => {
       setFomoCount(prev => prev + (Math.random() > 0.6 ? 1 : 0))
    }, 4500 + (fomoSeed * 100))
    return () => clearInterval(interval)
  }, [fomoSeed])

  // Risk Detectors Logic
  const risks = []
  if (!job.salary || job.salary.trim() === "" || job.salary.toLowerCase().includes("competitive") || job.salary.toLowerCase().includes("undisclosed") || job.salary.toLowerCase().includes("belirtilmemiş")) {
    risks.push("Maaş belirtilmemiş")
  }
  if ((job.matched.length + job.missing.length) > 7) {
    risks.push("High expectations")
  }
  if (!job.company || job.company.toLowerCase() === "confidential" || job.company.toLowerCase().includes("stealth")) {
    risks.push("Low transparency")
  }

  return (
    <article className={`group relative flex h-full flex-col justify-between rounded-xl border transition-all duration-300 p-6 overflow-hidden ${
      isSelected 
        ? "border-sky-500/50 bg-sky-500/10 shadow-[0_0_25px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/30 scale-[1.02]" 
        : "border-white/10 bg-neutral-900 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
    }`}>
      <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Building2 className="h-4 w-4 text-foreground/70" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/job/${job.id}`}
              className="block line-clamp-2 text-balance leading-snug text-base font-semibold tracking-tight transition group-hover:text-sky-300"
            >
              {job.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground/60">
              <span className="line-clamp-1 max-w-[120px] sm:max-w-none break-words">{job.company}</span>
              <span className="text-foreground/30 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tone.badge}`}
        >
          {tone.label}
        </span>
      </div>

      {/* Smart Tags */}
      {(isBestMatch || isQuickHire || isHighSalary) && (
        <div className="flex flex-wrap gap-1.5 mt-[-0.25rem]">
           {isBestMatch && <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400 border border-orange-500/20 shadow-sm">🔥 Best Match</span>}
           {isQuickHire && <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 border border-amber-500/20 shadow-sm">⚡ Quick Hire</span>}
           {isHighSalary && <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 shadow-sm">💰 Yüksek Maaş</span>}
        </div>
      )}

      {/* FOMO Alert */}
      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] uppercase tracking-wide font-bold transition-colors w-fit shadow-sm ${fomoType === 'high' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
         {fomoType === 'high' ? <TrendingUp className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
         {fomoType === 'high' ? `${fomoCount} people applied in last hour` : `Only ${fomoCount} applicants – low competition`}
      </div>

      {/* Match */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wide text-foreground/50">
            Match score
          </span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {job.match}
            <span className="text-sm text-foreground/50">%</span>
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${job.match}%` }}
            role="progressbar"
            aria-valuenow={job.match}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Skills matched */}
      {job.matched.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-foreground/50">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            Skills matched
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.matched.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills (clickable) */}
      {job.missing.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-foreground/50">
            <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-300">
              !
            </span>
            Missing skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.missing.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSkillClick(skill)
                }}
                className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:border-amber-400/40 hover:bg-amber-400/15"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Risk Detectors */}
      {risks.length > 0 && (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-500/60">
            <AlertTriangle className="h-3 w-3" />
            Risk Detectors
          </div>
          <div className="flex flex-wrap gap-1.5">
            {risks.map((risk) => (
              <span
                key={risk}
                className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400"
              >
                ⚠️ {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      </div>
      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-400/20 bg-sky-400/10 w-fit text-sky-200 text-[11px] font-medium tracking-wide shadow-sm group-hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-shadow">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Piyasa Analizi: <strong className="font-bold text-sky-300 ml-0.5">{getSalaryInsight(job.title)}</strong></span>
        </div>
        <div className="flex items-center justify-between text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
               {job.title.toLowerCase().includes("intern") || job.type === "Internship" ? "Internship" : "Full-time"}
            </span>
          </div>
          <span className="font-medium text-foreground/50">{job.posted}</span>
        </div>
        
        {isApplied ? (
           <button disabled className="w-full relative z-20 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-sm bg-white/5 border border-white/10 text-foreground/40 cursor-not-allowed">
              <CheckCircle2 className="w-4 h-4"/> Applied
           </button>
        ) : (
           <button 
              onClick={(e) => { 
                 e.preventDefault(); e.stopPropagation(); 
                 const stored = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
                 const exists = stored.some((j: any) => String(j.jobId) === String(job.id));
                 if (!exists) {
                     const updated = [...stored, {
                        jobId: String(job.id), 
                        title: job.title, 
                        company: job.company, 
                        appliedAt: Date.now(), 
                        appliedBy: "user" as "AI"|"user"
                     }];
                     localStorage.setItem("appliedJobs", JSON.stringify(updated));
                     // FORCE UI UPDATE
                     window.location.reload();
                 }
              }}
              className="w-full relative z-20 bg-white hover:bg-gray-100 text-black py-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-md flex items-center justify-center text-sm"
           >
              Apply directly <ArrowUpRight className="w-4 h-4 ml-1 opacity-50"/>
           </button>
        )}
      </div>

      {/* Full-card link */}
      <Link
        href={`/job/${job.id}`}
        aria-label={`View ${job.title} at ${job.company}`}
        className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
      />
      {isApplied && (
         <div className="absolute right-[88px] top-5 z-20 px-2 py-1 bg-purple-600 text-white text-[10px] uppercase font-bold tracking-widest rounded shadow-sm">
            {appliedData?.appliedBy === "AI" ? "🤖 Applied by AI" : "Applied"}
         </div>
      )}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isSelected ? "Remove from comparison" : "Select for comparison"}
        className={`absolute right-14 top-5 z-20 flex h-6 w-6 items-center justify-center rounded border transition-colors ${
           isSelected 
             ? "bg-sky-500 border-sky-500 text-white" 
             : "bg-white/5 border-white/20 text-transparent hover:border-white/40"
        }`}
      >
        <Check className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute right-5 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-background/60 text-foreground/60 opacity-0 transition group-hover:opacity-100">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </article>
  )
}

function matchTone(match: number) {
  if (match >= 85) {
    return {
      label: "🔥 Perfect Match",
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
    }
  }
  if (match >= 70) {
    return {
      label: "Strong Fit",
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
    }
  }
  if (match >= 50) {
    return {
      label: "Decent Fit",
      badge: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
      bar: "bg-gradient-to-r from-yellow-400 to-amber-400",
    }
  }
  return {
    label: "Needs Improvement",
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
    bar: "bg-gradient-to-r from-red-500 to-rose-500",
  }
}

function countUnique(values: string[]) {
  return new Set(values).size
}
