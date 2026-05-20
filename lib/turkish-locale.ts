/** Shared Turkish market defaults for mock data and API fallbacks */

export const DEFAULT_LOCATION = "İstanbul, Türkiye"
export const REMOTE_LOCATION = "Uzaktan · Türkiye"
export const UNKNOWN_COMPANY = "Bilinmeyen Şirket"
export const SALARY_UNDISCLOSED = "Maaş belirtilmemiş"

/** Normalize API job location for Turkish UI when city/country is missing or US-centric */
export function formatJobLocation(job: {
  job_city?: string | null
  job_state?: string | null
  job_country?: string | null
  job_is_remote?: boolean
}): string {
  if (job.job_is_remote) return REMOTE_LOCATION
  if (job.job_city) {
    const region = job.job_state || job.job_country || "Türkiye"
    return `${job.job_city}, ${region}`
  }
  return DEFAULT_LOCATION
}

function normalizeTryAmount(value: number): number {
  return value < 500 ? Math.round(value * 1000) : Math.round(value)
}

export function formatJobSalary(min?: number | null, max?: number | null): string {
  if (min != null && max != null) {
    const lo = normalizeTryAmount(min)
    const hi = normalizeTryAmount(max)
    return `₺${lo.toLocaleString("tr-TR")} – ₺${hi.toLocaleString("tr-TR")} / ay`
  }
  if (min != null) return `₺${normalizeTryAmount(min).toLocaleString("tr-TR")}+ / ay`
  return SALARY_UNDISCLOSED
}

/** Parse ₺95.000 style strings into numeric TL amounts */
export function parseSalaryAmount(salary: string): number {
  const matches = salary.match(/\d[\d.]*/g)
  if (!matches?.length) return 0
  const values = matches
    .map((m) => parseInt(m.replace(/\./g, ""), 10))
    .filter((n) => !Number.isNaN(n))
  return values.length ? Math.max(...values) : 0
}

/** Role-based market salary band for job cards (monthly, TRY) */
export function getSalaryInsight(title: string): string {
  const t = title.toLowerCase()
  if (t.includes("intern") || t.includes("staj")) return "₺35.000 – ₺55.000 / ay"
  if (t.includes("machine learning") || t.includes("ai ") || t.includes("research"))
    return "₺120.000 – ₺175.000 / ay"
  if (t.includes("data") || t.includes("analyst")) return "₺70.000 – ₺100.000 / ay"
  if (t.includes("full-stack") || t.includes("full stack")) return "₺90.000 – ₺130.000 / ay"
  if (t.includes("frontend") || t.includes("front-end")) return "₺85.000 – ₺125.000 / ay"
  if (t.includes("backend") || t.includes("back-end")) return "₺95.000 – ₺140.000 / ay"
  if (t.includes("devops") || t.includes("cloud")) return "₺100.000 – ₺150.000 / ay"
  return "₺75.000 – ₺110.000 / ay"
}

/** High salary threshold for Turkish tech market (monthly TRY) */
export function isHighSalaryAmount(amount: string): boolean {
  return parseSalaryAmount(amount) >= 100_000
}
