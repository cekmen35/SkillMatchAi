import type { Metadata } from "next"
import { InterviewClient } from "./interview-client"

export const metadata: Metadata = {
  title: "Interview Practice — SkillMatch AI",
  description:
    "Practice interview questions and get instant feedback on your answers.",
}

export default function InterviewPage() {
  return <InterviewClient />
}
