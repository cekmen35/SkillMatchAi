"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AnaSayfaLink } from "@/components/ana-sayfa-link"
import {
  Briefcase,
  Building2,
  LogOut,
  PlusCircle,
  Sparkles,
  Users,
} from "lucide-react"
import {
  getApplications,
  getCurrentUser,
  getJobs,
  saveJobs,
  setCurrentUser,
  type StoredApplication,
  type StoredJob,
  type StoredUser,
} from "@/lib/skillmatch-storage"

const DEPARTMENTS = ["ML Engineer", "Python", "Analyst"] as const

export default function CompanyPage() {
  const router = useRouter()
  const [user, setUser] = useState<StoredUser | null>(null)
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState<(typeof DEPARTMENTS)[number]>("ML Engineer")
  const [skills, setSkills] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("İstanbul, Türkiye")
  const [salary, setSalary] = useState("₺90.000 – ₺120.000 / ay")
  const [jobs, setJobs] = useState<StoredJob[]>([])
  const [applications, setApplications] = useState<StoredApplication[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    const current = getCurrentUser()
    if (!current || current.role !== "COMPANY") {
      router.replace("/register")
      return
    }
    setUser(current)
    refreshData(current)
  }, [router])

  const refreshData = (company: StoredUser) => {
    const allJobs = getJobs().filter((j) => j.companyId === company.id)
    const allApps = getApplications()
      .filter((a) => a.companyId === company.id)
      .sort((a, b) => b.matchScore - a.matchScore)
    setJobs(allJobs)
    setApplications(allApps)
  }

  const rankedApplications = useMemo(
    () => [...applications].sort((a, b) => b.matchScore - a.matchScore),
    [applications],
  )

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!title.trim() || !skills.trim() || !description.trim()) {
      setMessage("Lütfen tüm ilan alanlarını doldurun.")
      return
    }

    const requiredSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const newJob: StoredJob = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      department,
      requiredSkills,
      description: description.trim(),
      companyId: user.id,
      companyName: user.companyName || user.name,
      location: location.trim(),
      salary: salary.trim(),
      postedAt: Date.now(),
    }

    const allJobs = getJobs()
    allJobs.unshift(newJob)
    saveJobs(allJobs)
    setTitle("")
    setSkills("")
    setDescription("")
    setMessage("İlan başarıyla yayınlandı.")
    refreshData(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push("/register")
  }

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Yükleniyor...
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 text-background">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">{user.companyName}</h1>
              <p className="text-xs text-muted-foreground">
                Şirket Paneli · {user.companyVerificationId || "Doğrulama bekleniyor"}
              </p>
            </div>
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

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <PlusCircle className="h-5 w-5 text-sky-400" />
            İlan Yayınla
          </h2>
          <form onSubmit={handlePostJob} className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="İlan başlığı (ör. Backend Mühendisi)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none focus:border-sky-400/50"
              required
            />
            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value as (typeof DEPARTMENTS)[number])
              }
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Gerekli beceriler (virgülle): React, Python, SQL"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none"
              required
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Konum"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none"
            />
            <input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Maaş aralığı (₺)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İş tanımı..."
              rows={4}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm outline-none"
              required
            />
            {message && (
              <p className="text-sm text-emerald-300">{message}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 py-3 text-sm font-bold text-black"
            >
              İlanı Kaydet
            </button>
          </form>

          <div className="mt-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Aktif İlanlarınız ({jobs.length})
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {jobs.slice(0, 5).map((j) => (
                <li key={j.id} className="rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                  <span className="font-medium text-foreground">{j.title}</span>
                  <span className="ml-2 text-xs">· {j.department}</span>
                </li>
              ))}
              {jobs.length === 0 && <li>Henüz ilan yok.</li>}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Users className="h-5 w-5 text-emerald-400" />
            Gelen Başvurular
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              AI eşleşme skoruna göre sıralı
            </span>
          </h2>

          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Aday</th>
                  <th className="px-4 py-3">Pozisyon</th>
                  <th className="px-4 py-3">Skor</th>
                  <th className="px-4 py-3">CV</th>
                </tr>
              </thead>
              <tbody>
                {rankedApplications.map((app, index) => (
                  <tr
                    key={app.id}
                    className="border-t border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium">
                      {index === 0 && (
                        <Sparkles className="mr-1 inline h-3.5 w-3.5 text-amber-400" />
                      )}
                      {app.seekerName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{app.jobTitle}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          app.matchScore >= 85
                            ? "bg-emerald-500/20 text-emerald-300"
                            : app.matchScore >= 70
                              ? "bg-sky-500/20 text-sky-300"
                              : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        %{app.matchScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {app.cvFileName}
                    </td>
                  </tr>
                ))}
                {rankedApplications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Bu şirkete ait ilanlara henüz başvuru yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="mx-auto max-w-6xl px-6 pb-8 text-center text-xs text-muted-foreground">
        <Briefcase className="mx-auto mb-1 h-4 w-4 opacity-50" />
        SkillMatch AI · Şirket işe alım paneli
      </footer>
    </main>
  )
}
