"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";

export default function AtsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Completely Frontend Locally Mocked Bypass
    setTimeout(() => {
      try {
        localStorage.setItem("resumeFileName", file.name);

        const techBank = ["React", "Node.js", "Python", "TypeScript", "AWS", "Docker", "Next.js", "Tailwind CSS"];
        const missingBank = ["Kubernetes", "System Design", "Rust", "Go", "CI/CD", "Redis", "Microservices"];

        const mockData = {
           score: Math.floor(Math.random() * 20) + 75,
           skills: techBank.sort(() => 0.5 - Math.random()).slice(0, 4),
           missing: missingBank.sort(() => 0.5 - Math.random()).slice(0, 3)
        };

        localStorage.setItem("atsData", JSON.stringify(mockData));
        localStorage.setItem("userSkills", JSON.stringify(mockData.skills));

        router.push("/ats-analysis");
      } catch (err) {
        setError("Local processing error occurred.");
        setIsAnalyzing(false);
      }
    }, 1500); // UI visual loading simulator
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground transition-colors duration-500">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground border border-border rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden">
        
        {/* If analyzing, show a dramatic background pulse */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-2xl pointer-events-none" />
        )}

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ATS Resume Scan</h1>
          <p className="text-muted-foreground text-sm">
            Upload your resume to get instant ATS compatibility feedback.
          </p>
        </div>
        
        <div className="space-y-6 relative z-10">
          <div className={`relative group transition-opacity duration-300 ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              disabled={isAnalyzing}
            />
            <label
              htmlFor="resume-upload"
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {file ? (
                <>
                  <FileText className="w-10 h-10 mb-3 text-primary" />
                  <span className="font-medium text-center">{file.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">Click to change file</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium group-hover:text-primary transition-colors">Select a file</span>
                  <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT</span>
                </>
              )}
            </label>
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-medium rounded-xl transition-all duration-300 ${
              isAnalyzing 
                ? "bg-primary/80 text-primary-foreground cursor-wait scale-[0.98]" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">Analyzing Resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Resume
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
