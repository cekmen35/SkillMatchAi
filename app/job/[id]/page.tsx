import type { Metadata } from "next"
import { JobDetailsClient } from "./job-details-client"

export const metadata: Metadata = {
  title: "Job details · SkillMatch AI",
  description:
    "Review how your resume matches this role, see matched and missing skills, and learn how to close the gap.",
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  return <JobDetailsClient id={resolvedParams.id} />
}
