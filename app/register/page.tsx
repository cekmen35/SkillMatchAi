"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Building2, Lock, Mail, Sparkles, User, UserPlus } from "lucide-react"
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getUsers,
  routeForRole,
  saveUsers,
  seedJobsIfEmpty,
  setCurrentUser,
  type StoredUser,
  type UserRole,
} from "@/lib/skillmatch-storage"

type AuthView = "signin" | "signup"

export default function RegisterPage() {
  const router = useRouter()
  const [view, setView] = useState<AuthView>("signin")
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY">("JOB_SEEKER")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [verificationId, setVerificationId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      seedJobsIfEmpty()
      const normalizedEmail = email.trim().toLowerCase()
      if (!name.trim() || !normalizedEmail || password.length < 6) {
        setError("Lütfen tüm alanları doldurun (şifre en az 6 karakter).")
        return
      }

      if (role === "COMPANY") {
        if (!companyName.trim()) {
          setError("Şirket adı zorunludur.")
          return
        }
        if (!/^COMP-\d{4}$/i.test(verificationId.trim())) {
          setError("Şirket doğrulama ID formatı: COMP-1234")
          return
        }
      }

      const users = getUsers()
      if (users.some((u) => u.email === normalizedEmail)) {
        setError("Bu e-posta ile kayıtlı bir hesap zaten var.")
        return
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email: normalizedEmail,
        password,
        role,
        name: name.trim(),
        companyName: role === "COMPANY" ? companyName.trim() : undefined,
        companyVerificationId:
          role === "COMPANY" ? verificationId.trim().toUpperCase() : undefined,
        verified: role === "COMPANY" ? false : undefined,
        createdAt: Date.now(),
      }

      users.push(newUser)
      saveUsers(users)
      setCurrentUser(newUser)
      router.push(routeForRole(newUser.role))
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      seedJobsIfEmpty()
      const normalizedEmail = email.trim().toLowerCase()

      if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: StoredUser = {
          id: "admin-1",
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: "ADMIN",
          name: "İBRAHİM ÇEKMEN",
          createdAt: Date.now(),
        }
        setCurrentUser(adminUser)
        router.push("/admin")
        return
      }

      const users = getUsers()
      const found = users.find(
        (u) => u.email === normalizedEmail && u.password === password,
      )

      if (!found) {
        setError("E-posta veya şifre hatalı.")
        return
      }

      setCurrentUser(found)
      router.push(routeForRole(found.role))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_55%)]"
      />
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
              <Sparkles className="h-4 w-4" />
            </span>
            SkillMatch <span className="text-muted-foreground">AI</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Türkiye teknoloji pazarı için AI destekli kariyer platformu
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/40 p-6 shadow-xl backdrop-blur">
          <div className="mb-6 flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => {
                setView("signin")
                setError("")
              }}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                view === "signin"
                  ? "bg-gradient-to-r from-sky-400 to-teal-400 text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setView("signup")
                setError("")
              }}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                view === "signup"
                  ? "bg-gradient-to-r from-sky-400 to-teal-400 text-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <form
            onSubmit={view === "signup" ? handleSignUp : handleSignIn}
            className="space-y-4"
          >
            {view === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <RoleButton
                    active={role === "JOB_SEEKER"}
                    label="İş Arayan"
                    onClick={() => setRole("JOB_SEEKER")}
                  />
                  <RoleButton
                    active={role === "COMPANY"}
                    label="Şirket"
                    onClick={() => setRole("COMPANY")}
                  />
                </div>

                <Field
                  icon={<User className="h-4 w-4" />}
                  label={role === "COMPANY" ? "Yetkili Adı" : "Ad Soyad"}
                  value={name}
                  onChange={setName}
                  placeholder="Ayşe Yılmaz"
                />

                {role === "COMPANY" && (
                  <>
                    <Field
                      icon={<Building2 className="h-4 w-4" />}
                      label="Şirket Adı"
                      value={companyName}
                      onChange={setCompanyName}
                      placeholder="Trendyol"
                    />
                    <Field
                      icon={<Lock className="h-4 w-4" />}
                      label="Şirket Doğrulama ID"
                      value={verificationId}
                      onChange={setVerificationId}
                      placeholder="COMP-1234"
                    />
                  </>
                )}
              </>
            )}

            <Field
              icon={<Mail className="h-4 w-4" />}
              label="E-posta"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="ornek@email.com"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-teal-400 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {loading
                ? "İşleniyor..."
                : view === "signup"
                  ? "Kayıt Ol"
                  : "Giriş Yap"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}
          </p>
        </div>
      </div>
    </main>
  )
}

function RoleButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-wide transition ${
        active
          ? "border-sky-400/40 bg-sky-500/15 text-sky-300"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          required
        />
      </div>
    </label>
  )
}
