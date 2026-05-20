export type UserRole = "JOB_SEEKER" | "COMPANY" | "ADMIN"

export type StoredUser = {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  companyName?: string
  companyVerificationId?: string
  verified?: boolean
  createdAt: number
}

export type StoredJob = {
  id: string
  title: string
  department: string
  requiredSkills: string[]
  description: string
  companyId: string
  companyName: string
  location: string
  salary: string
  postedAt: number
}

export type StoredApplication = {
  id: string
  jobId: string
  companyId: string
  companyName: string
  jobTitle: string
  seekerId: string
  seekerName: string
  matchScore: number
  cvFileName: string
  appliedAt: number
}

const USERS_KEY = "users"
const JOBS_KEY = "jobs"
const APPLICATIONS_KEY = "applications"
const CURRENT_USER_KEY = "currentUser"

export const ADMIN_EMAIL = "admin@skillmatch.com"
export const ADMIN_PASSWORD = "admin123"

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, [])
}

export function saveUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users)
}

export function getJobs(): StoredJob[] {
  return readJson<StoredJob[]>(JOBS_KEY, [])
}

export function saveJobs(jobs: StoredJob[]) {
  writeJson(JOBS_KEY, jobs)
}

export function getApplications(): StoredApplication[] {
  return readJson<StoredApplication[]>(APPLICATIONS_KEY, [])
}

export function saveApplications(apps: StoredApplication[]) {
  writeJson(APPLICATIONS_KEY, apps)
}

export function getCurrentUser(): StoredUser | null {
  return readJson<StoredUser | null>(CURRENT_USER_KEY, null)
}

export function setCurrentUser(user: StoredUser | null) {
  if (user) writeJson(CURRENT_USER_KEY, user)
  else localStorage.removeItem(CURRENT_USER_KEY)
}

export function seedJobsIfEmpty() {
  if (typeof window === "undefined") return
  const existing = getJobs()
  if (existing.length > 0) return

  const seed: StoredJob[] = [
    {
      id: "job-trendyol-fe",
      title: "Kıdemli Frontend Mühendisi",
      department: "ML Engineer",
      requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind"],
      description: "Trendyol e-ticaret platformunda yüksek trafikli arayüzler geliştirin.",
      companyId: "company-trendyol",
      companyName: "Trendyol",
      location: "İstanbul, Türkiye",
      salary: "₺95.000 – ₺125.000 / ay",
      postedAt: Date.now() - 86400000 * 2,
    },
    {
      id: "job-getir-platform",
      title: "Full-Stack Platform Mühendisi",
      department: "Python",
      requiredSkills: ["Node.js", "PostgreSQL", "React", "AWS"],
      description: "Getir büyüme ekibinde ölçeklenebilir servisler tasarlayın.",
      companyId: "company-getir",
      companyName: "Getir",
      location: "İstanbul, Türkiye",
      salary: "₺110.000 – ₺140.000 / ay",
      postedAt: Date.now() - 86400000 * 5,
    },
    {
      id: "job-aselsan-analyst",
      title: "Veri Analisti",
      department: "Analyst",
      requiredSkills: ["SQL", "Python", "Tableau", "Pandas"],
      description: "Aselsan Ar-Ge veri setlerinden operasyonel içgörüler üretin.",
      companyId: "company-aselsan",
      companyName: "Aselsan",
      location: "Ankara, Türkiye",
      salary: "₺70.000 – ₺90.000 / ay",
      postedAt: Date.now() - 86400000,
    },
    {
      id: "job-turkcell-ml",
      title: "Makine Öğrenimi Mühendisi",
      department: "ML Engineer",
      requiredSkills: ["Python", "PyTorch", "MLOps", "SQL"],
      description: "Turkcell dijital ürünlerinde üretim ML modelleri geliştirin.",
      companyId: "company-turkcell",
      companyName: "Turkcell",
      location: "İzmir, Türkiye",
      salary: "₺120.000 – ₺155.000 / ay",
      postedAt: Date.now() - 3600000,
    },
  ]
  saveJobs(seed)
}

export function computeMatchScore(cvText: string, requiredSkills: string[]): number {
  const haystack = cvText.toLowerCase()
  if (!requiredSkills.length) return 72
  let hits = 0
  for (const skill of requiredSkills) {
    const needle = skill.trim().toLowerCase()
    if (needle && haystack.includes(needle)) hits++
  }
  const ratio = hits / requiredSkills.length
  const base = 58 + Math.round(ratio * 37)
  return Math.min(95, Math.max(60, base))
}

export function routeForRole(role: UserRole): string {
  if (role === "ADMIN") return "/admin"
  if (role === "COMPANY") return "/company"
  return "/dashboard"
}

/** Header "Ana Sayfa" target from active session */
export function getHomeHref(): string {
  if (typeof window === "undefined") return "/register"
  const user = getCurrentUser()
  if (!user) return "/register"
  return routeForRole(user.role)
}
