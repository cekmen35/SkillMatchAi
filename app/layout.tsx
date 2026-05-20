import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Chatbot } from "@/components/chatbot"
import "./globals.css"

export const metadata: Metadata = {
  title: "SkillMatch AI — Match Your Skills, Land Your Dream Job",
  description:
    "SkillMatch AI analyzes your resume against job descriptions, scores ATS compatibility, and helps you craft resumes that get interviews.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Chatbot />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
