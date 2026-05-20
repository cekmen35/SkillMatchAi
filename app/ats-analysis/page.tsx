"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Briefcase, Loader2, TrendingUp } from "lucide-react";

type AtsData = {
  score: number;
  skills: string[];
  missing: string[];
};

export default function AtsAnalysisPage() {
  const [data, setData] = useState<AtsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  // Safely read from localStorage only on client-side mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atsData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse ATS data:", e);
    } finally {
      // Small delay so the spinner is visible just enough to look intentional
      setTimeout(() => {
        setIsLoading(false);
        // Trigger the fade-in content animation right after loading is false
        setTimeout(() => setShowContent(true), 50);
      }, 400);
    }
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground transition-opacity duration-300">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="relative flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-muted-foreground font-medium tracking-wide">Compiling results...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground block animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-lg font-medium">No results found.</p>
          <p className="text-muted-foreground text-sm">
            It looks like you haven't processed a resume yet.
          </p>
          <button
            onClick={() => router.push("/ats")}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Go back to Upload
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div 
        className={`w-full max-w-3xl bg-card text-card-foreground border border-border rounded-3xl shadow-lg overflow-hidden transition-all duration-700 ease-out transform ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Score Header */}
        <div className="p-10 text-center bg-gradient-to-b from-sky-50 to-transparent dark:from-sky-950/20 dark:to-transparent border-b border-border">
          <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">
            ATS Compatibility Score
          </h1>
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center w-48 h-48 rounded-full bg-background shadow-xl border-8 border-sky-100 dark:border-sky-900/50 transform hover:scale-105 transition-transform duration-500 delay-300">
              <span className="text-7xl font-extrabold bg-gradient-to-br from-sky-400 to-blue-600 bg-clip-text text-transparent">
                {data.score}
              </span>
              <span className="absolute bottom-8 text-sm font-bold text-muted-foreground/50">
                %
              </span>
            </div>
          </div>
          <p className="mt-8 text-xl font-medium">
            {data.score >= 85 
              ? "Excellent Match! You're ready to apply." 
              : data.score >= 70 
              ? "Good Match! A few tweaks could help." 
              : "Needs Improvement. Review the missing skills below."}
          </p>
        </div>

        {/* Skills Section */}
        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Found Skills */}
            <div 
              className={`bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 transition-all duration-700 delay-200 transform ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <h2 className="text-lg font-bold flex items-center gap-2 mb-5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                Skills Matched
              </h2>
              <ul className="space-y-3">
                {data.skills.map((skill, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-200">{skill}</span>
                  </li>
                ))}
                {data.skills.length === 0 && (
                  <li className="text-sm text-emerald-600/70 italic">No skills matched.</li>
                )}
              </ul>
            </div>

            {/* Missing Skills */}
            <div 
              className={`bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl p-6 border border-rose-100 dark:border-rose-900/30 transition-all duration-700 delay-300 transform ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <h2 className="text-lg font-bold flex items-center gap-2 mb-5 text-rose-700 dark:text-rose-400">
                <XCircle className="w-5 h-5" />
                Missing Keywords
              </h2>
              <ul className="space-y-3">
                {data.missing.map((skill, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-medium text-rose-900 dark:text-rose-200">{skill}</span>
                  </li>
                ))}
                {data.missing.length === 0 && (
                  <li className="text-sm text-rose-600/70 italic">None missing!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Resume Score Booster Simulator */}
          {data.missing.length > 0 && (
             <div className={`mt-8 p-8 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 transition-all duration-700 delay-400 transform ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-foreground/90">
                   🚀 Improve Your Resume Score
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {data.missing.map((skill, index) => {
                      // Deterministic algorithm outputting pseudo-random numbers strictly inside [5, 15] boundaries mapping safely without SSR hydration crash risks.
                      const boost = 5 + ((skill.length * 3 + index * 7) % 11);
                      return (
                         <div key={index} className="flex flex-col p-5 rounded-xl border border-white/5 bg-white/[0.03] shadow-sm transition hover:bg-white/[0.05] group">
                            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                               <TrendingUp className="w-3 h-3 text-indigo-400"/> Score Booster
                            </span>
                            <span className="text-base font-medium text-foreground/90 flex flex-wrap items-center gap-x-1 gap-y-1 mt-1">
                               Add <strong className="text-indigo-400 whitespace-nowrap">{skill}</strong> → 
                               <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded whitespace-nowrap">+{boost}% ATS score</span>
                            </span>
                         </div>
                      )
                   })}
                </div>
             </div>
          )}

          {/* Action Footer */}
          <div className={`pt-4 flex justify-center transition-all duration-700 delay-500 transform ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 py-4 px-8 bg-black dark:bg-white dark:text-black text-white font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Briefcase className="w-5 h-5" />
              View Matching Jobs
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
