"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { getHomeHref } from "@/lib/skillmatch-storage"

type AnaSayfaLinkProps = {
  className?: string
}

const defaultClassName =
  "inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"

export function AnaSayfaLink({ className = defaultClassName }: AnaSayfaLinkProps) {
  const [href, setHref] = useState("/register")

  useEffect(() => {
    setHref(getHomeHref())
  }, [])

  return (
    <Link href={href} className={className}>
      <ArrowLeft className="h-3.5 w-3.5" /> Ana Sayfa
    </Link>
  )
}
