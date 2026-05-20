import type { Metadata } from "next"
import { DashboardClient } from "./dashboard-client"

export const metadata: Metadata = {
  title: "Job Matches — SkillMatch AI",
  description: "Personalized job matches ranked by how well your resume fits each role.",
}

export default function DashboardPage() {
  return <DashboardClient />
}
