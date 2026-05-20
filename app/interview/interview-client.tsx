"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useRef } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lightbulb,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Shuffle,
  Sparkles,
  Volume2,
  XCircle,
  User,
  Mail,
  X,
} from "lucide-react"

// ---------- Types ----------

type QType = "Conceptual" | "Practical" | "Scenario"

type Question = {
  id: string
  skill: string
  type: QType
  prompt: string
  keywords: string[]
  tip: string
}

type RoleKey =
  | "Frontend Engineer"
  | "Backend Engineer"
  | "Full Stack Engineer"
  | "Data Analyst"
  | "ML Engineer"
  | "DevOps Engineer"

// ---------- Role → default skill profile ----------

const ROLE_SKILLS: Record<RoleKey, string[]> = {
  "Frontend Engineer": ["react", "javascript", "typescript", "css", "html"],
  "Backend Engineer": ["node", "python", "sql", "api", "databases"],
  "Full Stack Engineer": ["react", "node", "typescript", "sql", "api"],
  "Data Analyst": ["python", "sql", "data analysis", "pandas", "visualization"],
  "ML Engineer": ["machine learning", "python", "deep learning", "statistics"],
  "DevOps Engineer": ["docker", "kubernetes", "aws", "ci/cd", "linux"],
}

const ROLES: RoleKey[] = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Analyst",
  "ML Engineer",
  "DevOps Engineer",
]

// ---------- Question bank ----------

const QUESTION_BANK: Question[] = [
  // React
  {
    id: "react-1",
    skill: "react",
    type: "Conceptual",
    prompt: "Explain useEffect in React. When does it run, and what is the dependency array for?",
    keywords: ["render", "dependency", "mount", "cleanup", "side effect"],
    tip: "Mention that it runs after render, and explain how the dependency array controls re-execution.",
  },
  {
    id: "react-2",
    skill: "react",
    type: "Practical",
    prompt: "How would you optimize a React component that re-renders too often?",
    keywords: ["memo", "usememo", "usecallback", "key", "profiler"],
    tip: "Start with measuring via the Profiler, then apply memoization only where it pays off.",
  },
  {
    id: "react-3",
    skill: "react",
    type: "Scenario",
    prompt:
      "A form with 20 fields feels laggy on every keystroke. Walk through how you would diagnose and fix it.",
    keywords: ["controlled", "debounce", "split", "memo", "state"],
    tip: "Isolate state, split the tree, and avoid re-rendering the whole form on every keystroke.",
  },

  // JavaScript / TypeScript
  {
    id: "js-1",
    skill: "javascript",
    type: "Conceptual",
    prompt: "What is the difference between == and === in JavaScript?",
    keywords: ["type", "coercion", "strict", "equality"],
    tip: "Always explain type coercion and give a concrete example where == gives a surprising result.",
  },
  {
    id: "ts-1",
    skill: "typescript",
    type: "Conceptual",
    prompt: "What is the difference between an interface and a type in TypeScript?",
    keywords: ["extend", "merge", "union", "declaration"],
    tip: "Mention declaration merging for interfaces and union/intersection flexibility for types.",
  },
  {
    id: "ts-2",
    skill: "typescript",
    type: "Practical",
    prompt: "How would you type a function that accepts any array and returns its last element?",
    keywords: ["generic", "array", "undefined", "inference"],
    tip: "Use a generic `<T>` and handle the empty-array case returning `T | undefined`.",
  },

  // CSS / HTML
  {
    id: "css-1",
    skill: "css",
    type: "Conceptual",
    prompt: "Explain the difference between flexbox and grid. When would you choose one over the other?",
    keywords: ["one dimension", "two dimension", "row", "column", "layout"],
    tip: "Flexbox is great for 1D layouts; grid shines for 2D layouts where rows and columns both matter.",
  },
  {
    id: "html-1",
    skill: "html",
    type: "Conceptual",
    prompt: "Why is semantic HTML important, and can you give three examples?",
    keywords: ["accessibility", "seo", "screen reader", "header", "main", "nav"],
    tip: "Tie it back to accessibility and SEO, and name tags like `<main>`, `<nav>`, and `<article>`.",
  },

  // Node / API
  {
    id: "node-1",
    skill: "node",
    type: "Conceptual",
    prompt: "How does Node's event loop work, and why is it important?",
    keywords: ["non-blocking", "queue", "callback", "single thread", "io"],
    tip: "Emphasize the single-threaded, non-blocking model and why that suits I/O-heavy work.",
  },
  {
    id: "api-1",
    skill: "api",
    type: "Scenario",
    prompt:
      "Your REST endpoint sometimes returns 500 errors under load. Walk through how you would debug it.",
    keywords: ["logs", "metrics", "timeout", "retry", "database", "cache"],
    tip: "Structure it as reproduce → measure → isolate → fix → verify. Mention metrics and logs early.",
  },

  // SQL / Databases
  {
    id: "sql-1",
    skill: "sql",
    type: "Conceptual",
    prompt: "What is the difference between an INNER JOIN and a LEFT JOIN?",
    keywords: ["rows", "match", "null", "left table"],
    tip: "Draw the two tables mentally and state what happens to unmatched rows in each case.",
  },
  {
    id: "sql-2",
    skill: "sql",
    type: "Practical",
    prompt: "A query is slow on a large table. What are the first things you check?",
    keywords: ["index", "explain", "plan", "where", "limit"],
    tip: "Start with EXPLAIN, look at indexes, and check for full table scans or missing filters.",
  },
  {
    id: "db-1",
    skill: "databases",
    type: "Scenario",
    prompt:
      "You're designing a schema for a small e-commerce app. Walk me through your tables and relationships.",
    keywords: ["users", "orders", "products", "foreign key", "normalization"],
    tip: "Focus on entities, relationships, and at least one trade-off (normalization vs. query speed).",
  },

  // Python
  {
    id: "py-1",
    skill: "python",
    type: "Conceptual",
    prompt: "What is the difference between a list and a tuple in Python?",
    keywords: ["mutable", "immutable", "ordered", "hashable"],
    tip: "Mutability is the headline answer; also mention that tuples can be used as dict keys.",
  },
  {
    id: "py-2",
    skill: "python",
    type: "Practical",
    prompt: "How would you read a 10GB CSV file in Python without running out of memory?",
    keywords: ["chunk", "iterator", "pandas", "generator", "stream"],
    tip: "Mention chunked reading (`pandas.read_csv(chunksize=...)`) or a generator-based approach.",
  },

  // Data analysis
  {
    id: "da-1",
    skill: "data analysis",
    type: "Scenario",
    prompt: "How would you handle missing data in a dataset before training a model?",
    keywords: ["drop", "impute", "mean", "median", "context", "bias"],
    tip: "Explain that the choice depends on the column, distribution, and downstream task.",
  },
  {
    id: "da-2",
    skill: "pandas",
    type: "Practical",
    prompt: "In pandas, how would you compute the average revenue per customer from a transactions DataFrame?",
    keywords: ["groupby", "agg", "mean", "customer"],
    tip: "Reach for `groupby('customer_id')['amount'].mean()` and mention handling of missing values.",
  },
  {
    id: "viz-1",
    skill: "visualization",
    type: "Conceptual",
    prompt: "When would you use a bar chart versus a line chart versus a scatter plot?",
    keywords: ["category", "time", "relationship", "distribution"],
    tip: "Tie each chart to a data shape: categories, time series, or relationship between variables.",
  },

  // Machine learning
  {
    id: "ml-1",
    skill: "machine learning",
    type: "Conceptual",
    prompt: "What is overfitting in machine learning, and how can you reduce it?",
    keywords: ["generalize", "regularization", "validation", "cross", "data"],
    tip: "Define it first, then name at least three mitigations (more data, regularization, CV).",
  },
  {
    id: "ml-2",
    skill: "machine learning",
    type: "Practical",
    prompt: "How would you decide between logistic regression and a random forest for a classification task?",
    keywords: ["interpretability", "features", "nonlinear", "baseline"],
    tip: "Start with the problem constraints (interpretability, size, non-linearity) and pick accordingly.",
  },
  {
    id: "ml-3",
    skill: "machine learning",
    type: "Scenario",
    prompt:
      "Your model performs great on training data but poorly in production. What do you investigate?",
    keywords: ["drift", "leak", "distribution", "overfit", "features"],
    tip: "Think about data drift, feature leakage, and the gap between training and serving data.",
  },
  {
    id: "dl-1",
    skill: "deep learning",
    type: "Conceptual",
    prompt: "Why do we use activation functions in neural networks?",
    keywords: ["non-linear", "gradient", "relu", "sigmoid"],
    tip: "Without non-linearities, a deep network collapses to a linear model. Give a concrete example.",
  },
  {
    id: "stats-1",
    skill: "statistics",
    type: "Conceptual",
    prompt: "What is the difference between correlation and causation?",
    keywords: ["relationship", "cause", "confounding", "experiment"],
    tip: "Give one relatable example and mention confounding variables.",
  },

  // DevOps
  {
    id: "docker-1",
    skill: "docker",
    type: "Conceptual",
    prompt: "What is the difference between a Docker image and a container?",
    keywords: ["blueprint", "instance", "immutable", "runtime"],
    tip: "Image is the blueprint; the container is the running instance. Keep it concise.",
  },
  {
    id: "k8s-1",
    skill: "kubernetes",
    type: "Scenario",
    prompt: "A pod keeps crashing in production. How would you debug it?",
    keywords: ["logs", "events", "describe", "resources", "restart"],
    tip: "Walk through `kubectl logs`, `describe`, and look at events and resource limits.",
  },
  {
    id: "aws-1",
    skill: "aws",
    type: "Conceptual",
    prompt: "What is the difference between S3, EBS, and EFS?",
    keywords: ["object", "block", "file", "storage"],
    tip: "Object vs. block vs. file storage — and a one-line example use case for each.",
  },
  {
    id: "cicd-1",
    skill: "ci/cd",
    type: "Practical",
    prompt: "Describe a simple CI/CD pipeline you would set up for a web app.",
    keywords: ["test", "build", "deploy", "preview", "rollback"],
    tip: "Cover test → build → deploy, and mention preview environments and rollback strategy.",
  },
  {
    id: "linux-1",
    skill: "linux",
    type: "Practical",
    prompt: "How would you find which process is using port 8080 on a Linux server?",
    keywords: ["lsof", "ss", "netstat", "pid"],
    tip: "Mention `lsof -i :8080` or `ss -ltnp | grep 8080`.",
  },
]

// ---------- Helpers ----------

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Normalise common skill aliases so the question bank matches.
function normalizeSkill(s: string): string {
  const k = s.trim().toLowerCase()
  const map: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    "node.js": "node",
    nodejs: "node",
    reactjs: "react",
    "react.js": "react",
    ml: "machine learning",
    dl: "deep learning",
    k8s: "kubernetes",
    postgres: "sql",
    postgresql: "sql",
    mysql: "sql",
    db: "databases",
    rest: "api",
    "data viz": "visualization",
    matplotlib: "visualization",
    "scikit-learn": "machine learning",
    sklearn: "machine learning",
    tensorflow: "deep learning",
    pytorch: "deep learning",
    "ci-cd": "ci/cd",
    cicd: "ci/cd",
  }
  return map[k] ?? k
}

function pickRole(skills: string[]): RoleKey {
  // Infer the most relevant role from user skills.
  const scores: Record<RoleKey, number> = {
    "Frontend Engineer": 0,
    "Backend Engineer": 0,
    "Full Stack Engineer": 0,
    "Data Analyst": 0,
    "ML Engineer": 0,
    "DevOps Engineer": 0,
  }
  for (const s of skills) {
    for (const r of ROLES) {
      if (ROLE_SKILLS[r].includes(s)) scores[r] += 1
    }
  }
  let best: RoleKey = "Full Stack Engineer"
  let max = -1
  for (const r of ROLES) {
    if (scores[r] > max) {
      max = scores[r]
      best = r
    }
  }
  return best
}

function buildQuestions(role: RoleKey, userSkills: string[]): Question[] {
  const target = new Set<string>([
    ...ROLE_SKILLS[role],
    ...userSkills.map(normalizeSkill),
  ])

  // Score each question: matches the role's skills or the user's skills.
  const scored = QUESTION_BANK.map((q) => ({
    q,
    score: target.has(q.skill) ? 2 : 0,
  }))

  // Keep matching questions, deeply shuffling them so chronological bank order doesn't lock rendering dynamically
  let pool = shuffle(scored.filter((x) => x.score > 0).map((x) => x.q))
  // Ensure we have a large enough pool relative to constraints so shuffle actually works 
  // to give different questions across multiple practice sessions!
  if (pool.length < 15) {
    const fallback = shuffle(QUESTION_BANK).filter((q) => !pool.find((p) => p.id === q.id))
    for (const q of fallback.slice(0, 15 - pool.length)) {
      pool.push(q)
    }
  }

  // Ensure a mix of types: at least one of each if available.
  const byType: Record<QType, Question[]> = {
    Conceptual: shuffle(pool.filter((q) => q.type === "Conceptual")),
    Practical: shuffle(pool.filter((q) => q.type === "Practical")),
    Scenario: shuffle(pool.filter((q) => q.type === "Scenario")),
  }

  const count = 4 + Math.floor(Math.random() * 3) // 4, 5, or 6
  const picked: Question[] = []
  const types: QType[] = ["Conceptual", "Practical", "Scenario"]
  for (const t of types) {
    if (byType[t].length > 0) picked.push(byType[t].shift()!)
  }
  const rest = shuffle([
    ...byType.Conceptual,
    ...byType.Practical,
    ...byType.Scenario,
  ])
  while (picked.length < count && rest.length > 0) {
    picked.push(rest.shift()!)
  }

  return shuffle(picked).slice(0, count)
}

// ---------- Feedback ----------

type Feedback = {
  verdict: "Good answer" | "Needs improvement"
  tip: string
}

function evaluate(answer: string, question: Question): Feedback {
  const text = answer.trim()
  const lower = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const matched = question.keywords.filter((k) => lower.includes(k.toLowerCase()))
  const coverage = matched.length / Math.max(1, question.keywords.length)

  // Good = enough length AND at least ~40% keyword coverage.
  const isGood = wordCount >= 40 && coverage >= 0.4

  let tip = question.tip
  if (!isGood) {
    if (wordCount < 40) {
      tip = `Try to expand your answer to at least 50–80 words. ${question.tip}`
    } else if (coverage < 0.4) {
      const missing = question.keywords
        .filter((k) => !matched.includes(k))
        .slice(0, 2)
      if (missing.length > 0) {
        tip = `Try touching on ideas like ${missing.join(" and ")}. ${question.tip}`
      }
    }
  }

  return {
    verdict: isGood ? "Good answer" : "Needs improvement",
    tip,
  }
}

// ---------- Components ----------

type AnswerRecord = {
  question: Question
  answer: string
  feedback: Feedback
}

export function InterviewClient() {
  const [role, setRole] = useState<RoleKey>("Full Stack Engineer")
  const [skills, setSkills] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [ready, setReady] = useState(false)

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [history, setHistory] = useState<AnswerRecord[]>([])
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)

  // Job Progress Tracking
  const [jobId, setJobId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJobId(new URLSearchParams(window.location.search).get("jobId"))
    }
  }, [])

  const goodAnswers = history.filter((h) => h.feedback.verdict === "Good answer").length
  const scorePct = Math.round((goodAnswers / (questions.length || 1)) * 100) || 0

  useEffect(() => {
    if (showResults && scorePct > 70 && jobId) {
       try {
         const prog = JSON.parse(localStorage.getItem("jobProgress") || "{}")
         prog[jobId] = "round2"
         localStorage.setItem("jobProgress", JSON.stringify(prog))
       } catch {}
    }
  }, [showResults, scorePct, jobId])

  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setAnswer((prev) => prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim())
          }
        }
        recognitionRef.current.onerror = () => setIsRecording(false)
        recognitionRef.current.onend = () => setIsRecording(false)
      }
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsRecording(true)
        } catch (e) {
          console.error(e)
        }
      } else {
        alert("Your browser does not support Speech Recognition. Please try Chrome.")
      }
    }
  }

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setTimeout(() => {
         const utterance = new SpeechSynthesisUtterance(text)
         utterance.rate = 1.05
         utterance.onstart = () => setIsSpeaking(true)
         utterance.onend = () => setIsSpeaking(false)
         utterance.onerror = () => setIsSpeaking(false)
         window.speechSynthesis.speak(utterance)
      }, 50)
    }
  }

  // Auto-trigger bot voice when a new question hits the layout
  useEffect(() => {
    if (ready && questions[index] && history.length === index) {
      const timer = setTimeout(() => {
         speak(questions[index].prompt)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [index, ready, questions.length, history.length])

  // Load user skills + infer role on mount.
  useEffect(() => {
    let userSkills: string[] = []
    try {
      const raw = localStorage.getItem("userSkills")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          userSkills = parsed
            .filter((s): s is string => typeof s === "string")
            .map(normalizeSkill)
        }
      }
    } catch {
      // ignore
    }
    const inferred = pickRole(userSkills)
    setSkills(userSkills)
    setRole(inferred)
    setQuestions(buildQuestions(inferred, userSkills))
    setReady(true)
  }, [])

  const question = questions[index]
  const wordCount = useMemo(
    () => answer.trim().split(/\s+/).filter(Boolean).length,
    [answer],
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || !question) return
    setSubmitting(true)
    
    try {
      const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question.prompt, userAnswer: answer, jobRole: role })
      });
      
      let conf = Math.min(100, Math.floor((answer.length / 100) * 50));
      const matched = question.keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length;
      conf += Math.min(50, Math.floor((matched / Math.max(question.keywords.length, 1)) * 50));
      setConfidence(conf);

      // Handle confidence formatting
      if (!res.ok) throw new Error("API Route blocked");
      const data = await res.json();
      
      const verdict = (data.score && data.score < 7) ? "Needs improvement" : "Good answer";
      const newFB = { verdict, comment: data.feedback || "Great response." };
      setHistory((prev) => [...prev, { question, answer, feedback: newFB }]);
      
      if (index < questions.length - 1 && data.nextQuestion) {
          setQuestions(prev => {
              const updated = [...prev];
              updated[index + 1].prompt = data.nextQuestion;
              updated[index + 1].type = "Dynamic AI";
              return updated;
          });
      }
      setSubmitting(false)
    } catch (err) {
      // Graceful fallback to localized mathematical pattern mapping if offline
      const fb = evaluate(answer, question)
      setHistory((prev) => [...prev, { question, answer, feedback: fb }])
      setSubmitting(false)
    }
  }

  function handleNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      setAnswer("")
      setConfidence(null)
    } else {
      setShowResults(true)
    }
  }

  function handleReset() {
    setAnswer("")
  }

  function regenerate(nextRole: RoleKey) {
    setRole(nextRole)
    setQuestions(buildQuestions(nextRole, skills))
    setIndex(0)
    setAnswer("")
    setHistory([])
    setShowResults(false)
  }

  const isLast = ready && questions.length > 0 && index === questions.length - 1

  if (showResults) {
    const scoreOutOf10 = Math.round((goodAnswers / questions.length) * 10)

    const strengths = Array.from(new Set(history.filter(h => h.feedback.verdict === "Good answer").map(h => h.question.skill)))
    const weaknesses = Array.from(new Set(history.filter(h => h.feedback.verdict === "Needs improvement").map(h => h.question.skill)))

    const fullText = history.map(h => h.answer).join(" ").toLowerCase()
    
    // Analytics Metrics
    const fillerWordBank = ["um", "uh", "like", "literally", "basically", "actually"]
    const fillerCount = fullText.split(/\s+/).filter(word => fillerWordBank.includes(word.replace(/[^a-z]/g, ''))).length
    
    const totalWords = fullText.split(/\s+/).filter(Boolean).length
    const avgWords = totalWords / (questions.length || 1)
    const confidenceScore = Math.min(10, Math.max(1, Math.round(avgWords / 8)))
    
    const allKeywords = Array.from(new Set(questions.flatMap(q => q.keywords)))
    const missingKeywords = allKeywords.filter(k => !fullText.includes(k.toLowerCase())).slice(0, 5)

    return (
      <div className="relative min-h-dvh bg-background text-foreground">
        {/* Background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] fixed"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full blur-3xl fixed"
          style={{
            background:
              "radial-gradient(closest-side, rgba(56,189,248,0.18), transparent 70%)",
          }}
        />

        <div className="relative">
          <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-foreground/70 transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Interview Results
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-6 py-10 pb-24">
            <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center shadow-2xl backdrop-blur-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-teal-400/20 mb-6 border border-sky-400/30">
                <Sparkles className="h-8 w-8 text-sky-400" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Interview Complete</h1>
              <p className="mt-4 text-foreground/70 text-lg mb-4">
                Your Score: <strong className="text-foreground text-2xl">{scoreOutOf10}</strong> <span className="text-sm">/ 10</span> <span className="text-sm opacity-50 ml-2">({scorePct}%)</span>
              </p>

              {/* Progress System Injection */}
              <div className="mt-6 mb-12 max-w-xl mx-auto items-center flex flex-col text-center">
                {scorePct > 70 ? (
                  <div className="w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold text-emerald-400">You passed Round 1 🎉</h3>
                    <p className="text-sm font-medium text-emerald-200/80 mt-1 mb-5">Next Round unlocked. Your progress has been saved to your dashboard.</p>
                    <button 
                       onClick={() => setShowEmailModal(true)}
                       className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-5 py-2 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition"
                    >
                       <Mail className="w-4 h-4" /> View Next Steps Email
                    </button>
                  </div>
                ) : (
                  <div className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold text-amber-400">Good effort!</h3>
                    <p className="text-sm font-medium text-amber-200/80 mt-1">You need above 70% to pass Round 1. Keep practicing to boost your score.</p>
                  </div>
                )}
                
                {/* Timeline UI */}
                <div className="mt-12 mb-4 flex items-center justify-between w-full max-w-sm mx-auto relative px-2">
                   <div className="absolute top-1/2 left-6 right-6 h-1 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
                   <div className="absolute top-1/2 left-6 right-6 h-1 bg-emerald-500 -translate-y-1/2 z-0 origin-left transition-all duration-1000 ease-out" style={{ width: scorePct > 70 ? '50%' : '15%' }} />
                   
                   <div className="flex flex-col items-center gap-2 z-10 relative">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-4 ring-[#111827]"><CheckCircle2 className="w-5 h-5"/></div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 absolute -bottom-7 tracking-widest whitespace-nowrap">Applied</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 z-10 relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-[#111827] transition-all duration-700 ${scorePct > 70 ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]'}`}>{scorePct > 70 ? <CheckCircle2 className="w-5 h-5"/> : <span className="text-[11px] font-bold">R1</span>}</div>
                      <span className={`text-[10px] uppercase font-bold absolute -bottom-7 tracking-widest whitespace-nowrap ${scorePct > 70 ? 'text-emerald-400' : 'text-sky-400'}`}>Round 1</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 z-10 relative">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-[#111827] transition-all duration-700 delay-500 ${scorePct > 70 ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'bg-[#1e293b] border border-white/10 text-white/30'}`}><span className="text-[11px] font-bold">R2</span></div>
                      <span className={`text-[10px] uppercase font-bold absolute -bottom-7 tracking-widest whitespace-nowrap ${scorePct > 70 ? 'text-sky-400' : 'text-foreground/30'}`}>Round 2</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 z-10 relative">
                      <div className="h-8 w-8 rounded-full bg-[#1e293b] border border-white/10 text-white/30 flex items-center justify-center ring-4 ring-[#111827]"><Sparkles className="w-4 h-4"/></div>
                      <span className="text-[10px] uppercase font-bold absolute -bottom-7 tracking-widest text-foreground/30">Offer</span>
                   </div>
                </div>
             </div>
              
             <div className="mt-8 flex flex-col items-center gap-4 text-left w-full mx-auto">
                 <div className="uppercase tracking-widest text-[10px] font-bold text-foreground/50 self-center">Performance Analytics</div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="rounded-2xl bg-white/[0.02] p-5 border border-white/5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-sky-400" /> Confidence Score</h3>
                    <div className="text-2xl font-bold text-sky-400">{confidenceScore}<span className="text-sm text-foreground/50 font-medium">/10</span></div>
                    <p className="text-xs text-foreground/50 mt-1">Based on detail and length</p>
                  </div>
                  
                  <div className="rounded-2xl bg-white/[0.02] p-5 border border-white/5 shadow-sm">
                    <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2 mb-3"><MicOff className="w-4 h-4 text-amber-400" /> Filler Words</h3>
                    <div className="text-2xl font-bold text-amber-400">{fillerCount}</div>
                    <p className="text-xs text-foreground/50 mt-1">Words like 'um', 'like', 'uh'</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-500/5 p-5 border border-emerald-500/20 shadow-sm">
                    <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4" /> Strengths</h3>
                    <ul className="text-sm text-emerald-200/80 space-y-1.5 list-disc list-inside px-1">
                      {strengths.length > 0 ? strengths.map(s => <li key={s} className="capitalize">Strong in {s}</li>) : <li className="text-xs text-emerald-200/50 list-none">None identified</li>}
                    </ul>
                  </div>
                  
                  <div className="rounded-2xl bg-rose-500/5 p-5 border border-rose-500/20 shadow-sm">
                    <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-3"><XCircle className="w-4 h-4" /> Weak Areas</h3>
                    <ul className="text-sm text-rose-200/80 space-y-1.5 list-disc list-inside px-1">
                      {weaknesses.length > 0 ? weaknesses.map(s => <li key={s} className="capitalize">Needs improvement in {s}</li>) : <li className="text-xs text-rose-200/50 list-none">None identified</li>}
                    </ul>
                    {missingKeywords.length > 0 && <div className="mt-4 pt-3 border-t border-rose-500/20 text-xs font-semibold text-rose-300 flex flex-col gap-1.5">
                       <span className="uppercase tracking-wide text-[10px] text-rose-400/80">Missing Keywords</span>
                       <span className="capitalize">{missingKeywords.join(", ")}</span>
                    </div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {history.map((record, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                  <div className="text-[11px] uppercase tracking-wide text-foreground/50 mb-3 flex items-center justify-between">
                    <span>Question {i + 1}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5">{record.question.type} · {record.question.skill}</span>
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-foreground/90">{record.question.prompt}</h3>
                  <div className="mt-5 rounded-xl border border-white/5 bg-background/50 p-5 text-sm leading-relaxed text-foreground/80">
                    <div className="font-medium text-foreground/50 mb-2 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      Your Answer
                    </div>
                    {record.answer}
                  </div>

                  <div className={`mt-5 rounded-xl border p-5 ${record.feedback.verdict === "Good answer" ? "border-emerald-400/20 bg-emerald-400/[0.05]" : "border-amber-400/20 bg-amber-400/[0.05]"}`}>
                    <div className="flex items-center gap-2 mb-3">
                       {record.feedback.verdict === "Good answer" ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          </div>
                       ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20">
                            <XCircle className="h-3 w-3 text-amber-400" />
                          </div>
                       )}
                       <span className={`font-semibold text-sm ${record.feedback.verdict === "Good answer" ? "text-emerald-300" : "text-amber-300"}`}>{record.feedback.verdict}</span>
                    </div>
                    <div className="text-sm leading-relaxed text-foreground/80">
                       <strong className="font-medium text-foreground/90">Explanation & Tip: </strong>
                       {record.feedback.tip}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center border-b border-white/5 pb-16">
              <button
                 onClick={() => regenerate(role)}
                 className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-inset ring-sky-400/30 bg-sky-500/10 px-8 py-3.5 font-bold text-sky-300 transition-all hover:bg-sky-500/20 hover:scale-105"
              >
                 <RefreshCw className="h-4 w-4" />
                 Retry Interview
              </button>
            </div>

            {/* Suggested Jobs */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-400" />
                  Your matching roles
                </h2>
                <Link href="/dashboard" className="text-sm font-medium text-sky-400 hover:text-sky-300">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "2", title: "Full-Stack Engineer", company: "Getir", location: "İstanbul, Türkiye", type: "Hibrit", match: 86 },
                  { id: "1", title: "Senior Frontend Engineer", company: "Trendyol", location: "Uzaktan · Türkiye", type: "Tam zamanlı", match: 92 },
                  { id: "7", title: "Software Engineer, Growth", company: "Yemeksepeti", location: "İstanbul, Türkiye", type: "Hibrit", match: 64 },
                ].map((suggested) => (
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
          </main>
          
          {/* Email Simulation Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
               <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-800 border border-slate-200 ring-1 ring-black/5">
                  <div className="bg-slate-100 border-b border-slate-200 p-4 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <Mail className="w-5 h-5 text-slate-500" />
                         <span className="font-semibold text-sm tracking-wide text-slate-700">Inbox</span>
                     </div>
                     <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
                  </div>
                  <div className="p-7">
                     <h2 className="text-xl font-bold mb-5 text-slate-900 border-b border-slate-100 pb-4">Subject: Interview Invitation</h2>
                     <div className="space-y-3 text-[15px] text-slate-600 leading-relaxed font-medium">
                       <p>Hi there,</p>
                       <p>Congratulations! You are shortlisted for <strong className="text-indigo-600 font-bold">Round 2</strong>.</p>
                       <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-5 shadow-sm">
                          <p className="mb-2"><strong className="text-slate-800 uppercase tracking-widest text-[11px] mr-2">Date:</strong> Friday, 11:00 AM</p>
                          <p><strong className="text-slate-800 uppercase tracking-widest text-[11px] mr-2">Mode:</strong> Virtual Zoom</p>
                       </div>
                       <p>Please confirm your availability by clicking one of the options below.</p>
                     </div>
                     <div className="mt-8 flex items-center gap-3">
                        <button onClick={() => setShowEmailModal(false)} className="flex-1 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:scale-95 text-white font-bold py-3 rounded-lg transition-all text-sm tracking-wide uppercase">Accept</button>
                        <button onClick={() => setShowEmailModal(false)} className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-lg transition-all text-sm tracking-wide uppercase active:scale-95">Reschedule</button>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, #000 40%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.18), transparent 70%)",
        }}
      />

      <div className="relative">
        {/* Header */}
        <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/70 transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-foreground/70">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            Interview practice
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-3xl px-6 py-10">
          {/* Role / skills strip */}
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-foreground/50">
                Practicing for
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <select
                  aria-label="Select job role"
                  value={role}
                  onChange={(e) => regenerate(e.target.value as RoleKey)}
                  className="rounded-lg border border-white/10 bg-background/40 px-2.5 py-1.5 text-sm font-semibold text-foreground focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[oklch(0.16_0_0)]">
                      {r}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-foreground/50">
                  {skills.length > 0
                    ? `Using ${skills.length} skill${skills.length === 1 ? "" : "s"} from your resume`
                    : "Using role defaults — analyze a resume for personalized questions"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => regenerate(role)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-white/10"
            >
              <Shuffle className="h-3.5 w-3.5" />
              New set
            </button>
          </div>

          {/* Loading state */}
          {!ready || !question ? (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center"
            >
              <RefreshCw className="h-6 w-6 animate-spin text-sky-300" aria-hidden />
              <p className="text-sm font-medium">Generating interview questions…</p>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-6 flex items-center justify-between text-xs text-foreground/60">
                <span>
                  Question {index + 1} of {questions.length}
                </span>
                <span>
                  {question.type} · {question.skill}
                </span>
              </div>
              <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 transition-all"
                  style={{ width: `${((index + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* AI Interviewer Chat Thread */}
              <div className="flex flex-col gap-8 p-2 sm:p-4">
                 
                 {/* AI Bot Question (Centered Layout) */}
                 <div className="flex flex-col items-center gap-6 mt-4 mb-8">
                    <div className="flex flex-col items-center gap-4 relative">
                       <div className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-sky-500 transition-all duration-300 ${isSpeaking ? 'shadow-[0_0_40px_rgba(56,189,248,0.8)] scale-110 animate-[pulse_1.5s_ease-in-out_infinite] ring-4 ring-sky-500/50' : 'shadow-[0_0_15px_rgba(56,189,248,0.4)]'}`}>
                          <Sparkles className={`h-10 w-10 text-white ${isSpeaking ? 'animate-bounce' : ''}`} />
                       </div>
                       {isSpeaking && (
                          <span className="absolute -bottom-6 whitespace-nowrap rounded-full border border-sky-400/50 bg-background/90 px-3 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-1.5">
                             <Volume2 className="w-3 h-3"/> Speaking...
                          </span>
                       )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 w-full max-w-2xl mt-4">
                       <div className="text-xs font-bold text-sky-400 flex items-center gap-2 tracking-widest uppercase mb-1">
                          AI Interviewer
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                       </div>
                       <h1 className="text-pretty text-2xl sm:text-3xl font-bold leading-relaxed tracking-tight text-white mb-2 text-center text-balance">
                          {question.prompt}
                       </h1>
                       <button 
                         onClick={() => speak(question.prompt)}
                         className="p-2 rounded-full bg-white/5 hover:bg-white/10 shrink-0 border border-white/10 group transition flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground/50 hover:text-sky-300"
                         title="Replay Voice"
                       >
                          <Volume2 className="h-3.5 w-3.5" /> Replay audio
                       </button>
                    </div>
                 </div>

                {history.length > index ? (
                  <div className="flex flex-col gap-8 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* User Answer Chat */}
                    <div className="flex gap-4 sm:gap-6 flex-row-reverse">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                          <User className="h-5 w-5 text-white/50" />
                       </div>
                       <div className="flex-1 rounded-3xl rounded-tr-none border border-sky-500/20 bg-sky-500/10 p-6 sm:p-8 shadow-sm">
                          <div className="text-[10px] uppercase font-bold text-sky-300/50 mb-3 text-right tracking-widest">You</div>
                          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed text-right">{history[index].answer}</p>
                       </div>
                    </div>

                    {/* AI Feedback Chat */}
                    <div className="flex gap-4 sm:gap-6">
                       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-sky-400 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                          <Sparkles className="h-6 w-6 text-black" />
                       </div>
                       <div className={
                         history[index].feedback.verdict === "Good answer"
                           ? "flex-1 rounded-3xl rounded-tl-none border border-emerald-400/20 bg-emerald-400/[0.08] p-6 sm:p-8 shadow-sm"
                           : "flex-1 rounded-3xl rounded-tl-none border border-amber-400/20 bg-amber-400/[0.08] p-6 sm:p-8 shadow-sm"
                       }>
                         <div className="flex items-center gap-3 mb-5">
                           {history[index].feedback.verdict === "Good answer" ? (
                             <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                               <CheckCircle2 className="h-4 w-4" />
                             </span>
                           ) : (
                             <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                               <XCircle className="h-4 w-4" />
                             </span>
                           )}
                           <div className={
                             history[index].feedback.verdict === "Good answer"
                               ? "text-sm font-bold text-emerald-300 tracking-widest uppercase"
                               : "text-sm font-bold text-amber-300 tracking-widest uppercase"
                           }>
                             {history[index].feedback.verdict}
                           </div>
                         </div>
                         <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-foreground/80 mt-2">
                           <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                           <span className="leading-relaxed text-foreground/70"><span className="font-semibold text-foreground/90 uppercase text-[10px] tracking-widest mr-2 block mb-1">AI Recommendation</span> {history[index].feedback.tip}</span>
                         </div>

                         {confidence !== null && (
                           <div className="mt-6 rounded-2xl border border-white/5 bg-background/50 p-5">
                             <div className="flex justify-between items-center mb-3">
                               <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Performance Logic</span>
                               <span className="text-sm font-semibold text-emerald-400">Confidence: {confidence}%</span>
                             </div>
                             <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner">
                               <div className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${confidence}%` }} />
                             </div>
                           </div>
                         )}

                         <div className="flex justify-end mt-8 border-t border-white/5 pt-6">
                           <button
                             type="button"
                             onClick={handleNext}
                             className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 px-8 py-3 text-sm font-bold text-background transition hover:opacity-90 shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:scale-[1.02]"
                           >
                             {isLast ? "View Final Results" : "Next Question"}
                             <ArrowRight className="h-4 w-4" />
                           </button>
                         </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end w-full animate-in fade-in slide-in-from-bottom-4 pb-12">
                    <form onSubmit={handleSubmit} className="w-full flex-1 rounded-3xl rounded-tr-none border border-white/10 bg-white/[0.02] p-6 sm:p-8 shadow-sm relative">
                      <div className="absolute top-[-20px] right-[-20px] flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] border border-white/10 shadow-xl">
                          <User className="h-5 w-5 text-foreground/60" />
                      </div>
                      <label htmlFor="answer" className="sr-only">
                      Your answer
                    </label>
                    <textarea
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here. Aim for 60–120 words with a concrete example."
                      rows={8}
                      className="w-full resize-y rounded-xl border border-white/10 bg-background/40 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-foreground/40 focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                    />

                    <div className="mt-3 flex items-center justify-between text-xs text-foreground/50">
                      <span>{wordCount} words</span>
                      {answer.length > 0 && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="inline-flex items-center gap-1 text-foreground/60 transition hover:text-foreground"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                         <button
                           type="button"
                           onClick={toggleRecording}
                           className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border px-6 py-2.5 text-sm font-semibold transition ${isRecording ? "border-rose-400/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-pulse" : "border-white/10 bg-white/5 text-foreground hover:bg-white/10 hover:text-white"}`}
                         >
                           {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                           {isRecording ? "Stop Recording" : "Speak Answer"}
                         </button>
                      <button
                        type="submit"
                        disabled={!answer.trim() || submitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-foreground transition hover:opacity-90 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 hover:text-white"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            Submit Answer
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
