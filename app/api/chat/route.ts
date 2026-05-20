import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history, context } = await req.json();

    const systemPrompt = `You are a highly personalized AI career assistant.
Help the user with:
- job selection
- resume improvement
- salary tips
- interview advice

CRITICAL: You must explicitly mention their ATS score, missing skills, or user skills in your answers when relevant to make it highly personalized! 
Example: "Your resume lacks [Missing Skill], adding it can improve your ATS Score of [Score]%."
Give short, helpful answers formatted nicely. Keep it brief.

Context about the User (USE THIS TO PERSONALIZE ANSWERS):
ATS Score: ${context?.score || "Unknown"}%
User Skills: ${context?.skills?.join(", ") || "None"}
Missing Skills: ${context?.missing?.join(", ") || "None"}`;

    // Map history to Ollama / OpenAI standard message format
    const formattedHistory = [
      { role: "system", content: systemPrompt }
    ];

    if (Array.isArray(history)) {
       history.forEach((msg: any) => {
           if (msg.role === "user" || msg.role === "bot") {
               formattedHistory.push({
                   role: msg.role === "bot" ? "assistant" : "user",
                   content: msg.content
               });
           }
       });
    }

    formattedHistory.push({
       role: "user",
       content: message
    });

    // Directly target localized inference endpoints (Ollama)
    // Defaulting to "llama3.2". If user specifically needs Gemma, they can swap the string to "gemma2" natively.
    const response = await fetch(`http://localhost:11434/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2", 
        messages: formattedHistory,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 250 // Max tokens bound
        }
      })
    });

    if (!response.ok) {
       // Deep fallback logic parsing standard boundaries in case LLaMA drops offline locally
       if (response.status !== 200) {
           const replies = [
              "I highly recommend tailoring your resume specifically to the keywords found in each unique job description!",
              "Based on your skill gap, picking up a modern framework could really distinguish your profile.",
              "When negotiating salary, always calculate your base logic via market averages instead of just raw strings.",
              "For interviews, I advise utilizing the STAR method to map your past experiences precisely."
           ];
           return NextResponse.json({ reply: replies[Math.floor(Math.random() * replies.length)] + "\n\n*(Note: Local LLM appears offline. Please ensure Ollama is running on port 11434!)*" });
       }
       throw new Error("Local inference failed.");
    }

    const data = await res.json();
    const reply = data.message?.content || "I'm having trouble thinking right now.";

    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ reply: "I cannot reach your Local LLM. Please make sure Ollama is actively running on http://localhost:11434 with `llama3.2` or `gemma` installed!" });
  }
}
