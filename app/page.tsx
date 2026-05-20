import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, FileText, Sparkles, Target, Zap } from "lucide-react"

export default function Page() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Background gradient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-10%] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-500/25 via-cyan-400/15 to-transparent blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[700px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
        <div
          className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
        />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-teal-400 text-background">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            SkillMatch <span className="text-muted-foreground">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <Link href="/ats" className="transition-colors hover:text-foreground">
            ATS Scan
          </Link>
        </nav>
        <Link
          href="/create-resume"
          className="hidden text-sm font-medium text-foreground/90 transition-colors hover:text-foreground md:inline-flex"
        >
          Get started
          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center md:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI-powered resume intelligence
        </span>

        <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Match your skills to the{" "}
          <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-300 bg-clip-text text-transparent">
            jobs you deserve
          </span>
          .
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          SkillMatch AI scans your resume against any job description, scores
          your ATS compatibility in seconds, and helps you craft a resume that
          actually gets interviews.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group relative h-12 w-full overflow-hidden rounded-full bg-gradient-to-r from-sky-400 to-teal-400 px-7 text-sm font-medium text-background shadow-[0_0_40px_-10px_rgba(56,189,248,0.6)] transition-transform hover:scale-[1.02] hover:from-sky-300 hover:to-teal-300 sm:w-auto"
          >
            <Link href="/ats">
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Upload Resume
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 w-full rounded-full border-border/70 bg-card/40 px-7 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-card/70 sm:w-auto"
          >
            <Link href="/create-resume">
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Resume
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Free to start · No credit card required
        </p>
      </section>

      {/* Feature grid */}
      <section
        id="features"
        className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3"
      >
        {[
          {
            icon: Target,
            title: "ATS Match Score",
            desc: "See exactly how your resume stacks up against any job description, with a score and targeted fixes.",
          },
          {
            icon: Sparkles,
            title: "AI Resume Builder",
            desc: "Generate recruiter-ready resumes from a few prompts, tailored to the role you're chasing.",
          },
          {
            icon: Zap,
            title: "Keyword Intelligence",
            desc: "Surface the skills, tools, and phrases hiring systems are scanning for — and weave them in naturally.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur transition-colors hover:bg-card/60"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400/20 to-teal-400/20 text-sky-300 ring-1 ring-inset ring-sky-400/20">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-base font-semibold tracking-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border/60 px-6 py-8 text-xs text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} SkillMatch AI. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms
          </a>
          <a href="#" className="hover:text-foreground">
            Contact
          </a>
        </div>
      </footer>
    </main>
  )
}
