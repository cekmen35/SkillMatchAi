import type { Metadata } from "next"
import { CreateResumeClient } from "./create-resume-client"

export const metadata: Metadata = {
  title: "Create Resume | SkillMatch AI",
  description: "Build a clean, ATS-friendly resume in minutes.",
}

export default function CreateResumePage() {
  return <CreateResumeClient />
}
