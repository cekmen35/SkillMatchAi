"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AnaSayfaLink } from "@/components/ana-sayfa-link"
import {
  Building2,
  CheckCircle2,
  LogOut,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import {
  getApplications,
  getCurrentUser,
  getUsers,
  saveUsers,
  setCurrentUser,
  type StoredUser,
} from "@/lib/skillmatch-storage"

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<StoredUser[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const current = getCurrentUser()
    if (!current || current.role !== "ADMIN") {
      router.replace("/register")
      return
    }
    setUsers(getUsers())
    setReady(true)
  }, [router])

  const companies = useMemo(
    () => users.filter((u) => u.role === "COMPANY"),
    [users],
  )
  const seekers = useMemo(
    () => users.filter((u) => u.role === "JOB_SEEKER"),
    [users],
  )
  const totalApplications = getApplications().length

  const toggleVerify = (companyId: string) => {
    const updated = users.map((u) =>
      u.id === companyId ? { ...u, verified: !u.verified } : u,
    )
    saveUsers(updated)
    setUsers(updated)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    router.push("/register")
  }

  if (!ready) {
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
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold">Admin Kontrol Merkezi</h1>
              <p className="text-xs text-muted-foreground">SkillMatch AI · Sistem geneli</p>
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

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users className="h-5 w-5 text-sky-400" />}
            label="Toplam Kayıtlı Kullanıcı"
            value={String(users.length)}
          />
          <StatCard
            icon={<Building2 className="h-5 w-5 text-emerald-400" />}
            label="Toplam Şirket"
            value={String(companies.length)}
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5 text-violet-400" />}
            label="AI Başvuru İşlendi"
            value={String(totalApplications)}
          />
        </div>

        <section className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur">
          <h2 className="mb-4 text-base font-semibold">Kayıtlı Şirketler</h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Şirket</th>
                  <th className="px-4 py-3">E-posta</th>
                  <th className="px-4 py-3">Doğrulama ID</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-medium">{c.companyName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {c.companyVerificationId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {c.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Onaylı
                        </span>
                      ) : (
                        <span className="text-amber-400">Beklemede</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => toggleVerify(c.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          c.verified
                            ? "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                      >
                        {c.verified ? "Onayı Kaldır" : "Onayla / Doğrula"}
                      </button>
                    </td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Henüz kayıtlı şirket yok. İş arayan: {seekers.length}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="mb-2">{icon}</div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
