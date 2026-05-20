import type { Metadata } from "next"
import HistoryClient from "./history-client"

export const metadata: Metadata = {
  title: "History — SkillMatch AI",
  description: "Review jobs you've applied to and roles you've saved for later.",
}

export default function HistoryPage() {
  return <HistoryClient />
}
