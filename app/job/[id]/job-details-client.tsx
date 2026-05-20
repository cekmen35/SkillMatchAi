"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Banknote,
  Eye,
  GraduationCap,
  Loader2,
  MapPin,
  Play,
  Sparkles,
  Target,
  Timer,
  X,
  XCircle,
  Youtube,
} from "lucide-react"

type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  match: number
  summary: string
  description: string[]
  responsibilities: string[]
  requirements: string[]
  matched: string[]
  missing: string[]
}

const JOB_BY_ID: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Trendyol",
    location: "Uzaktan · Türkiye",
    type: "Tam zamanlı",
    salary: "₺95.000 – ₺125.000 / ay",
    posted: "2 gün önce",
    match: 92,
    summary:
      "Trendyol'un ürün yüzeyinin yeni neslini küçük ve kıdemli bir ekiple birlikte inşa edin. Uçtan uca özellik sahipliği, tasarım sistemi ve ölçeklenen frontend mimarisine katkı sağlayın.",
    description: [
      "Trendyol, operasyon ekiplerinin karmaşık veriyi net iş akışlarına dönüştürmesine yardımcı olan Türkiye'nin önde gelen e-ticaret ve teknoloji şirketidir.",
      "Kıdemli Frontend Mühendisi olarak tasarım ve ürün ekipleriyle yakın çalışarak her gün binlerce kullanıcıya ulaşan arayüzler geliştireceksiniz.",
    ],
    responsibilities: [
      "Design and ship major product surfaces from first sketch to launch.",
      "Own the component library and design system patterns across the app.",
      "Raise the bar on accessibility, performance, and test coverage.",
      "Mentor engineers and drive frontend architecture conversations.",
    ],
    requirements: [
      "5+ years of production experience with React and TypeScript.",
      "Strong fundamentals in HTML, CSS, and modern browser APIs.",
      "Experience shipping complex UIs with measurable product impact.",
      "A taste for craft, consistency, and thoughtful UX details.",
    ],
    matched: ["React", "TypeScript", "Next.js", "Tailwind", "Testing"],
    missing: ["GraphQL", "Playwright"],
  },
  "2": {
    id: "2",
    title: "Full-Stack Engineer, Platform",
    company: "Getir",
    location: "İstanbul, Türkiye",
    type: "Hibrit",
    salary: "₺110.000 – ₺140.000 / ay",
    posted: "5 gün önce",
    match: 86,
    summary: "Getir'de makine öğrenimi altyapımızı destekleyen çekirdek platformu geliştirin. Sağlam backend servisleri ile etkileşimli arayüzleri birleştiren yüksek etkili bir rol.",
    description: ["Getir, hızlı teslimat ve dijital ürünlerde ölçeklenebilir mimari ile güçlü kullanıcı deneyimini bir araya getiren full-stack mühendisler arıyor."],
    responsibilities: ["Develop and maintain core APIs.", "Build real-time dashboards for model monitoring.", "Coordinate with AI researchers."],
    requirements: ["Extensive Node.js and PostgreSQL experience.", "React expertise.", "AWS and Kubernetes knowledge."],
    matched: ["Node.js", "PostgreSQL", "React", "AWS"],
    missing: ["Kubernetes", "gRPC", "Terraform"],
  },
  "3": {
    id: "3",
    title: "Data Analyst",
    company: "ArgeTech Yazılım",
    location: "Ankara, Türkiye",
    type: "Tam zamanlı",
    salary: "₺70.000 – ₺90.000 / ay",
    posted: "1 gün önce",
    match: 58,
    summary: "E-ticaret ve kurumsal müşterilerin pazarlama harcamalarını büyük veri setlerinden çıkararak anlamlı içgörülere dönüştürün.",
    description: ["ArgeTech Yazılım, Türkiye'deki hızlı büyüyen markalar için analitik çözümler sunar. Bu rol iç veri hatları ve müşteri raporlarına odaklanır."],
    responsibilities: ["Query complex datasets.", "Build Tableau dashboards.", "Present findings to stakeholders."],
    requirements: ["Strong SQL and Python skills.", "Experience with Pandas and dbt.", "Ability to communicate complex data simply."],
    matched: ["SQL", "Tableau"],
    missing: ["Python", "Pandas", "Statistics", "dbt"],
  },
  "4": {
    id: "4",
    title: "Machine Learning Engineer",
    company: "Eczacıbaşı",
    location: "İstanbul, Türkiye",
    type: "Hibrit",
    salary: "₺120.000 – ₺155.000 / ay",
    posted: "3 gün önce",
    match: 62,
    summary: "Sağlık ve yaşam bilimleri verilerinde üretim ortamına hazır ML modelleri geliştirin. Eczacıbaşı, yapay zeka ve Ar-Ge'nin kesişiminde çalışır.",
    description: ["Çok disiplinli bir ekibe katılarak ML modellerini üretime alın ve Ar-Ge süreçlerini hızlandırın."],
    responsibilities: ["Train and optimize deep learning models.", "Build MLOps pipelines.", "Collaborate on research papers."],
    requirements: ["Strong Python.", "Experience with PyTorch or TensorFlow.", "MLOps knowledge (AWS)."],
    matched: ["Python", "SQL", "AWS"],
    missing: ["Machine Learning", "PyTorch", "TensorFlow", "MLOps"],
  },
  "5": {
    id: "5",
    title: "Frontend Engineer, Design Systems",
    company: "Softtech",
    location: "Uzaktan · Türkiye",
    type: "Sözleşmeli",
    salary: "₺800 – ₺1.100 / saat",
    posted: "Bugün",
    match: 88,
    summary: "Softtech'in tasarım sisteminin evrimine öncülük edin. Bileşen API'leri ve erişilebilirlik konusunda uzman bir sözleşmeli rol.",
    description: ["Softtech, finans ve dijital ürünlerde iş birliği yazılımları geliştirir. Merkezi bileşen kütüphanemizi denetleyip yenileyecek uzman arıyoruz."],
    responsibilities: ["Build accessible React components.", "Implement design tokens via Tailwind.", "Automate Figma handoffs with API."],
    requirements: ["Deep React knowledge.", "Expertise in Storybook and Web Accessibility (WCAG).", "Experience with Tailwind and Figma API."],
    matched: ["React", "Storybook", "Accessibility", "Tailwind"],
    missing: ["Design tokens", "Figma API"],
  },
  "6": {
    id: "6",
    title: "AI Research Engineer",
    company: "BulutÇözüm Teknolojileri",
    location: "İzmir, Türkiye",
    type: "Tam zamanlı",
    salary: "₺130.000 – ₺175.000 / ay",
    posted: "4 gün önce",
    match: 48,
    summary: "NLP ve temel modellerin sınırlarını zorlayın. BulutÇözüm, güvenilir yapay zeka çözümlerine odaklanan uygulamalı bir Ar-Ge ekibidir.",
    description: ["Makale okuma ve mimarileri sıfırdan uygulama becerisi beklenir. Büyük ölçekli hesaplama kümelerinde çalışacaksınız."],
    responsibilities: ["Implement novel network architectures.", "Manage long-running GPU training jobs.", "Publish research findings."],
    requirements: ["Deep Learning fundamentals.", "Extensive PyTorch experience.", "Academic background in NLP or ML."],
    matched: ["Python"],
    missing: ["Deep Learning", "Machine Learning", "PyTorch", "NLP", "Research"],
  },
  "7": {
    id: "7",
    title: "Software Engineer, Growth",
    company: "Yemeksepeti",
    location: "İstanbul, Türkiye",
    type: "Hibrit",
    salary: "₺90.000 – ₺110.000 / ay",
    posted: "6 gün önce",
    match: 64,
    summary: "Hızlı A/B testleri ve büyüme döngüleri kurun. Yemeksepeti'nde growth ekibi ürün stratejisinin merkezindedir.",
    description: ["Yemeksepeti hızla ölçeklenen bir dijital platformdur. Growth mühendisi özellikleri ölçümleyecek, landing sayfaları oluşturacak ve hunileri optimize edecek."],
    responsibilities: ["Launch A/B tests.", "Build reporting dashboards via Looker.", "Orchestrate data pipelines in Airflow."],
    requirements: ["Full stack skills (React + Python).", "Strong SQL.", "Experience with dbt, Airflow, and Looker."],
    matched: ["React", "SQL", "Experimentation"],
    missing: ["Python", "Airflow", "dbt", "Looker"],
  }
}

const FALLBACK: Job = JOB_BY_ID["1"]

type SkillGuide = {
  summary: string
  learningTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  youtube: { title: string; channel: string; href: string }
  course: { title: string; provider: string; href: string }
}

const SKILL_GUIDES: Record<string, SkillGuide> = {
  GraphQL: {
    summary:
      "A query language for APIs that lets clients request exactly the data they need from a typed schema.",
    learningTime: "2–3 weeks",
    difficulty: "Intermediate",
    youtube: {
      title: "GraphQL Full Course — Novice to Expert",
      channel: "freeCodeCamp.org",
      href: "https://www.youtube.com/watch?v=ed8SzALpx1Q",
    },
    course: {
      title: "The Modern GraphQL Bootcamp",
      provider: "Udemy",
      href: "https://www.udemy.com/course/graphql-bootcamp/",
    },
  },
  Playwright: {
    summary:
      "A modern end-to-end testing framework for web apps across Chromium, Firefox, and WebKit.",
    learningTime: "1–2 weeks",
    difficulty: "Intermediate",
    youtube: {
      title: "Playwright Tutorial — Crash Course",
      channel: "Traversy Media",
      href: "https://www.youtube.com/watch?v=wawbt1cATsk",
    },
    course: {
      title: "Playwright — From Zero to Hero",
      provider: "Udemy",
      href: "https://www.udemy.com/course/playwright-tutorials/",
    },
  },
}

const GENERIC_GUIDE: SkillGuide = {
  summary:
    "This skill appears in the job description but not on your resume. Closing the gap can meaningfully raise your match score.",
  learningTime: "2–4 weeks",
  difficulty: "Intermediate",
  youtube: {
    title: "Search tutorials on YouTube",
    channel: "YouTube",
    href: "https://www.youtube.com/results?search_query=learn+",
  },
  course: {
    title: "Find a structured course",
    provider: "Coursera",
    href: "https://www.coursera.org/search?query=",
  },
}

type AppliedJob = {
  id: string
  title: string
  company: string
  appliedAt: string
}

type TrackerState = {
  applied: AppliedJob[]
  interviewing: AppliedJob[]
  offer: AppliedJob[]
  rejected: AppliedJob[]
}

const APPLIED_JOBS_STORAGE_KEY = "kanbanTracker"

function parseTracker(raw: string | null): TrackerState {
  const defaultState: TrackerState = { applied: [], interviewing: [], offer: [], rejected: [] }
  try {
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

export function JobDetailsClient({ id }: { id: string }) {
  const [job, setJob] = useState<Job>(JOB_BY_ID[id] ?? FALLBACK)
  const router = useRouter()
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [trackerStore, setTrackerStore] = useState<TrackerState | null>(null)
  const [atsSkills, setAtsSkills] = useState<string[] | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tone = useMemo(() => matchTone(job.match), [job.match])
  
  const isApplied = trackerStore ? Object.values(trackerStore).some(list => list.some((j) => j.id === job.id)) : false
  const applyState = isApplying ? "applying" : isApplied ? "applied" : "idle"

  // Read persisted applies on the client after mount.
  useEffect(() => {
    const stored = parseTracker(localStorage.getItem(APPLIED_JOBS_STORAGE_KEY))
    setTrackerStore(stored)
    
    let currentSkills: string[] = [];
    try {
      const storedAts = localStorage.getItem("atsData")
      if (storedAts) {
         const parsed = JSON.parse(storedAts);
         setAtsSkills(parsed.skills || [])
         currentSkills = (parsed.skills || []).map((s: string) => s.toLowerCase());
      }
      const rawUserSkills = localStorage.getItem("userSkills");
      if (rawUserSkills) {
         const p = JSON.parse(rawUserSkills);
         currentSkills = Array.from(new Set([...currentSkills, ...p.map((s:string) => s.toLowerCase())]));
      }
    } catch {
      // ignore
    }

    try {
       const cached = localStorage.getItem("cachedJobs");
       if (cached) {
           const parsed = JSON.parse(cached);
           const found = parsed.find((p: any) => p.id === id);
           if (found) {
              const required = found.requiredSkills || [];
              const matched: string[] = [];
              const missing: string[] = [];
              required.forEach((r: string) => {
                 if (currentSkills.some(cs => cs.includes(r.toLowerCase()) || r.toLowerCase().includes(cs))) {
                    matched.push(r);
                 } else {
                    missing.push(r);
                 }
              });
              const matchScore = required.length === 0 ? 100 : Math.round((matched.length / required.length) * 100);

              setJob(prev => ({
                 ...prev,
                 id: found.id,
                 title: found.title,
                 company: found.company,
                 location: found.location,
                 type: found.type,
                 salary: found.salary,
                 posted: found.posted,
                 match: matchScore,
                 matched,
                 missing,
                 summary: "This job was dynamically matched against your parsed resume skills using localized semantic calculations.",
                 description: ["We retrieved this job dynamically via external APIs. Proceed to apply to enter our mock recruitment loops."],
                 requirements: required,
                 responsibilities: ["Develop systems dynamically.", "Coordinate with internal teams.", "Maintain infrastructure securely."]
              }));
           }
       }
    } catch {}
  }, [id])

  useEffect(() => {
    if (!trackerStore) return
    try {
      localStorage.setItem(APPLIED_JOBS_STORAGE_KEY, JSON.stringify(trackerStore))
    } catch {
      // ignore (storage disabled / quota exceeded)
    }
  }, [trackerStore])

  const handleApply = () => {
    if (applyState !== "idle") return
    setIsApplying(true)

    const currentInfo = trackerStore ?? { applied: [], interviewing: [], offer: [], rejected: [] }

    if (!isApplied) {
      const entry: AppliedJob = {
        id: job.id,
        title: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
      }
      setTrackerStore({ ...currentInfo, applied: [entry, ...currentInfo.applied] })
    }

    // Brief loading state -> show success. (Redirect removed, user stays to see suggested jobs)
    successTimerRef.current = setTimeout(() => {
      setIsApplying(false)
      setShowToast(true)
    }, 700)
  }

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  // Auto-hide toast (defensive — we redirect before this fires in most cases).
  useEffect(() => {
    if (!showToast) return
    const t = setTimeout(() => setShowToast(false), 2500)
    return () => clearTimeout(t)
  }, [showToast])

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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">SkillMatch AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to jobs
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {/* Hero */}
        <div className="flex flex-col gap-6 border-b border-white/5 pb-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
            <Briefcase className="h-3.5 w-3.5" />
            Job #{job.id}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Building2 className="h-6 w-6 text-foreground/70" />
              </div>
              <div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                  {job.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/70">
                  <span className="font-medium text-foreground/90">{job.company}</span>
                  <span className="text-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                  </span>
                  <span className="text-foreground/30">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {job.posted}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 self-start md:items-end md:self-auto">
              <button
                type="button"
                onClick={handleApply}
                disabled={applyState !== "idle"}
                aria-live="polite"
                className={
                  applyState === "applied"
                    ? "inline-flex min-w-[148px] items-center justify-center gap-2 rounded-full bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30 transition-all duration-300 ease-out disabled:cursor-default"
                    : applyState === "applying"
                      ? "inline-flex min-w-[148px] items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-foreground/70 ring-1 ring-inset ring-white/10 transition-all duration-300 ease-out disabled:cursor-wait"
                      : "inline-flex min-w-[148px] items-center justify-center gap-2 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-5 py-2.5 text-sm font-semibold text-background transition-all duration-300 ease-out hover:opacity-90"
                }
              >
                {applyState === "applied" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Applied
                  </>
                ) : applyState === "applying" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    Apply Now
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {applyState === "applied" && (
                <div className="flex flex-col gap-2.5 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="text-left rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 shadow-sm">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Pattern Insights</span>
                     <p className="text-xs text-indigo-200/80 font-medium leading-relaxed mt-1">This company focuses heavily on {job.title.toLowerCase().includes("frontend") ? "React components and core JS concepts" : job.title.toLowerCase().includes("data") ? "SQL, pipeline orchestration, and data modeling" : "scalable system design and backend architecture"}.</p>
                  </div>
                  
                  {/* Recruiter Interest Simulator */}
                  <div className="text-left rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 shadow-sm animate-in slide-in-from-right-4 fade-in duration-700 fill-mode-backwards delay-200">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Priority Candidate</span>
                     <p className="text-xs text-emerald-200/70 font-medium leading-relaxed mt-1">Recruiters are likely to notice your profile in <strong className="text-emerald-400 font-semibold bg-emerald-400/10 px-1 rounded">{(parseInt(job.id) || 3) % 4 + 2}–{(parseInt(job.id) || 3) % 4 + 4} days</strong> based on your high match score.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/interview?jobId=${job.id}`)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold shadow-lg shadow-emerald-500/20 text-white transition hover:scale-105 active:scale-95"
                  >
                    Start Mock Interview
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            <MetaPill icon={<Briefcase className="h-3.5 w-3.5" />} label={job.type} />
            <MetaPill icon={<Banknote className="h-3.5 w-3.5" />} label={job.salary} />
            <MetaPill icon={<GraduationCap className="h-3.5 w-3.5" />} label="Senior level" />
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: description */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader
                icon={<BookOpen className="h-4 w-4 text-sky-300" />}
                eyebrow="About the role"
                title="What you'll be doing"
              />
              <p className="text-pretty leading-relaxed text-foreground/80">{job.summary}</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/70">
                {job.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {/* Data Insight: Application Timing */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 shadow-inner">
                 <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-400/80 mb-5 border-b border-white/5 pb-3">
                    <Clock className="h-4 w-4 text-sky-400" /> Application Data Insight
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 rounded-xl bg-white/[0.03] border border-white/5 p-4 shadow-sm transition hover:bg-white/[0.05]">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 flex mb-1">Time Elapsed</span>
                       <span className="text-base font-bold text-foreground/90">This job was posted {(parseInt(job.id) || 1) % 4 + 1} days ago</span>
                    </div>
                    <div className="flex-1 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 shadow-sm transition hover:bg-emerald-500/10">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 flex mb-1">Target Window</span>
                       <span className="text-base font-bold text-emerald-400">Best time to apply: {["Tuesday", "Wednesday", "Thursday"][(parseInt(job.id) || 0) % 3]} {["10:00 AM", "11:30 AM", "2:00 PM"][(parseInt(job.id) || 1) % 3]}</span>
                    </div>
                 </div>
                 <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-xs text-orange-200/90 font-medium">
                    <strong className="text-orange-400 tracking-wide uppercase text-[10px] mr-1 border border-orange-400/30 px-1.5 py-0.5 border-dashed rounded">Optimization Tip</strong> 
                    Avoid weekends – response rate drops!
                 </div>
              </div>
            </Card>


            <Card>
              <CardHeader
                icon={<Target className="h-4 w-4 text-sky-300" />}
                eyebrow="Responsibilities"
                title="Day-to-day"
              />
              <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
                {job.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                icon={<GraduationCap className="h-4 w-4 text-sky-300" />}
                eyebrow="Requirements"
                title="What we're looking for"
              />
              <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/80">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right column: match + skills */}
          <aside className="space-y-6">
            <Card>
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-foreground/50">
                  Match score
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tone.badge}`}
                >
                  {tone.label}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-tight tabular-nums">
                  {job.match}
                </span>
                <span className="text-lg text-foreground/50">%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${tone.bar}`}
                  style={{ width: `${job.match}%` }}
                  role="progressbar"
                  aria-valuenow={job.match}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-foreground/60">
                Based on the skills, keywords, and experience signals in your resume compared
                to this job's description.
              </p>
            </Card>

            {atsSkills !== null && (() => {
               const allJobSkills = [...job.matched, ...job.missing]
               const dynamicMissing = allJobSkills.filter(
                 k => !atsSkills.some(s => s.toLowerCase() === k.toLowerCase())
               )
               
               return (
                 <div className={`rounded-2xl border p-5 shadow-sm ${dynamicMissing.length > 0 ? "border-rose-500/20 bg-rose-500/[0.03]" : "border-emerald-500/20 bg-emerald-500/[0.03]"}`}>
                   <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${dynamicMissing.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {dynamicMissing.length > 0 ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      Why you may not qualify
                   </h3>
                   {dynamicMissing.length > 0 ? (
                      <div className="text-sm text-foreground/80 leading-relaxed">
                         <span className="font-medium text-rose-300">❌ Missing:</span> {dynamicMissing.join(", ")}
                      </div>
                   ) : (
                      <div className="text-sm text-emerald-400 leading-relaxed flex items-center gap-2 font-medium">
                         You are a strong match for this role
                      </div>
                   )}
                 </div>
               )
            })()}

            <Card>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/50">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Skills matched
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-foreground/60">
                  {job.matched.length}
                </span>
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
            </Card>

            <Card>
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/50">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-300">
                  !
                </span>
                Missing skills
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-foreground/60">
                  {job.missing.length}
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-foreground/60">
                Click any skill to see a quick guide on how to add it.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.missing.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setActiveSkill(skill)}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:border-amber-400/40 hover:bg-amber-400/15"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </Card>
          </aside>
        </div>

        {/* Suggested Jobs */}
        {applyState === "applied" && (
          <div className="mt-16 pt-12 border-t border-white/5">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              More roles you might like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(JOB_BY_ID)
                .filter((j) => j.id !== job.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map((suggested) => (
                  <Link
                    key={suggested.id}
                    href={`/job/${suggested.id}`}
                    className="block group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05] hover:border-white/20 relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <Building2 className="h-4 w-4 text-foreground/70" />
                      </div>
                      <div className="min-w-0">
                        <p className="block truncate text-sm font-semibold tracking-tight transition group-hover:text-sky-300">
                          {suggested.title}
                        </p>
                        <div className="mt-1 text-xs text-foreground/60 truncate">
                          {suggested.company} · {suggested.location}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-400">{suggested.match}% match</span>
                      <span className="text-[10px] text-foreground/50 border border-white/10 px-2 py-[1px] rounded-full">{suggested.type}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </section>

      <SkillModal
        skill={activeSkill}
        onClose={() => setActiveSkill(null)}
      />

      {/* Success toast */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4 transition-all duration-300 ease-out ${
          showToast
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-200 shadow-lg backdrop-blur">
           <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/25">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          Applied Successfully
          <span className="hidden text-xs text-emerald-300/70 sm:inline">
            You can now start your mock interview!
          </span>
        </div>
      </div>
    </main>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">{children}</div>
  )
}

function CardHeader({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-foreground/50">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  )
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
      {icon}
      {label}
    </span>
  )
}

function SkillModal({
  skill,
  onClose,
}: {
  skill: string | null
  onClose: () => void
}) {
  const open = skill !== null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || !skill) return null

  const base = SKILL_GUIDES[skill] ?? GENERIC_GUIDE
  // Fill in the skill name for the generic fallback so search URLs work.
  const guide: SkillGuide = SKILL_GUIDES[skill]
    ? base
    : {
        ...base,
        youtube: {
          ...base.youtube,
          href: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            `learn ${skill}`,
          )}`,
        },
        course: {
          ...base.course,
          href: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        },
      }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.16_0_0)] shadow-2xl">
        {/* Accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(56,189,248,0.25), transparent 70%)",
          }}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                Learn this skill
              </div>
              <h3
                id="skill-modal-title"
                className="mt-3 text-2xl font-semibold tracking-tight"
              >
                {skill}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">
                {guide.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/70 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta row: learning time + difficulty */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
                <Timer className="h-3.5 w-3.5" />
                Learning time
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {guide.learningTime}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
                <GraduationCap className="h-3.5 w-3.5" />
                Difficulty
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {guide.difficulty}
              </div>
            </div>
          </div>

          {/* Resource links */}
          <div className="mt-5 space-y-2.5">
            <a
              href={guide.youtube.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-red-400/30 hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                <Youtube className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
                  <Play className="h-3 w-3 fill-current" />
                  YouTube
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                  {guide.youtube.title}
                </span>
                <span className="block truncate text-xs text-foreground/50">
                  {guide.youtube.channel}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition group-hover:text-foreground" />
            </a>

            <a
              href={guide.course.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-sky-400/30 hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/50">
                  <GraduationCap className="h-3 w-3" />
                  Course
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                  {guide.course.title}
                </span>
                <span className="block truncate text-xs text-foreground/50">
                  {guide.course.provider}
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition group-hover:text-foreground" />
            </a>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground/80 transition hover:bg-white/10"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90"
            >
              Got it
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function matchTone(match: number) {
  if (match >= 85) {
    return {
      label: "Strong fit",
      badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
    }
  }
  if (match >= 70) {
    return {
      label: "Good fit",
      badge: "border-sky-400/30 bg-sky-400/10 text-sky-300",
      bar: "bg-gradient-to-r from-sky-400 to-cyan-400",
    }
  }
  return {
    label: "Stretch",
    badge: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    bar: "bg-gradient-to-r from-amber-400 to-orange-400",
  }
}
