"use client"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, X, Send, Sparkles, User, Minimize2 } from "lucide-react"

type Message = {
  id: string
  role: "user" | "bot"
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "Merhaba! Kariyer asistanınızım. Özgeçmişiniz, mülakat hazırlığı veya İstanbul, Ankara ve İzmir'deki iş eşleşmeleriniz hakkında soru sorabilirsiniz!" }
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
       messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Gather context dynamically from local storage
    let context = {};
    try {
       const raw = localStorage.getItem("atsData");
       if (raw) context = JSON.parse(raw);
    } catch(e) {}

    // Simulated offline AI engine natively mocking neural logic
    setTimeout(() => {
       const lower = userMsg.content.toLowerCase();
       let reply = "Kariyer asistanınızım. 'özgeçmiş', 'iş' veya 'maaş' hakkında soru sorabilirsiniz!";
       
       if (lower.includes("job") || lower.includes("iş") || lower.includes("is ")) {
           reply = "Dashboard'u kontrol etmenizi öneririm! Trendyol, Getir veya Turkcell gibi Türkiye'deki teknoloji şirketlerine göre filtreleyebilir, 'Staj' moduna geçebilir veya 'Otomatik Başvuru' ile profilinizi aktif tutabilirsiniz.";
       } else if (lower.includes("resume") || lower.includes("ats") || lower.includes("özgeçmiş") || lower.includes("cv")) {
           reply = "Özgeçmişinizi güçlendirmek için ATS uyum skorunuzu %75'in üzerine çıkarın. ATS taramasında eksik görünen becerileri eklemek İstanbul ve Ankara'daki ilanlarda eşleşmenizi artırır.";
       } else if (lower.includes("salary") || lower.includes("pay") || lower.includes("maaş")) {
           reply = "Türkiye teknoloji pazarında maaşlar rol, şehir ve beceri eşleşmesine göre değişir. Eksik becerileri tamamlamak (ör. React, TypeScript) İstanbul'daki kıdemli rollerde ₺15–20 bin aylık fark yaratabilir.";
       }

       const botMsg: Message = { 
         id: (Date.now() + 1).toString(), 
         role: "bot", 
         content: reply 
       };
       setMessages(prev => [...prev, botMsg]);
       setIsTyping(false);
    }, Math.random() * 1000 + 1000); // Native 1-2 sec responsive typing indicator
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-transform hover:scale-110 active:scale-95 animate-in slide-in-from-bottom-8 fade-in duration-500"
        aria-label="Open AI Chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-[350px] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/95 text-foreground shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 shadow-sm">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Assistant</h3>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 text-foreground/50 transition hover:bg-white/10 hover:text-white" aria-label="Minimize Chat">
             <Minimize2 className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 text-foreground/50 transition hover:bg-white/10 hover:text-white" aria-label="Close Chat">
             <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Array */}
      <div className="flex h-[400px] flex-col gap-4 overflow-y-auto p-4 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            
            {msg.role === "bot" ? (
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-400">
                  <Sparkles className="h-4 w-4 text-black" />
               </div>
            ) : (
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-400">
                  <User className="h-4 w-4" />
               </div>
            )}
            
            <div className={`max-w-[80%] break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
               msg.role === "user" 
                 ? "bg-sky-500 text-white rounded-tr-sm shadow-sm" 
                 : "bg-white/5 border border-white/5 text-foreground/90 rounded-tl-sm shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex w-full gap-3 flex-row pr-[20%]">
             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 animate-pulse">
                <Sparkles className="h-4 w-4 text-black" />
             </div>
             <div className="bg-white/5 border border-white/5 text-foreground/50 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Form */}
      <div className="border-t border-white/10 bg-white/5 p-4">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about jobs or your resume..."
            className="w-full rounded-full border border-white/10 bg-black/20 py-3 pl-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-sky-400/50 focus:bg-background/80"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:hover:bg-sky-500"
            aria-label="Send Message"
          >
            <Send className="h-3.5 w-3.5 ml-0.5" />
          </button>
        </form>
      </div>

    </div>
  )
}
