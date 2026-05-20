import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { question, userAnswer, jobRole } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY is not configured in environment variables." 
      }, { status: 500 });
    }

    const promptText = `
You are an expert technical interviewer.
Ask a question for a ${jobRole || "Software Engineer"}.

Context:
- Previous Question: ${question || "None"}
- Candidate's Answer: ${userAnswer || "None"}

If userAnswer is provided:
- Give feedback on the candidate's answer
- Ask a follow-up question based on the answer
- Keep it short and realistic

Return your response strictly as a raw JSON object only. Do not include markdown wrappers. Schema:
{
  "nextQuestion": "The next question you want to ask",
  "feedback": "Your concise feedback on the answer (leave empty if no answer was provided)",
  "score": <number 1-10 evaluating the answer, 0 if no answer>
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      throw new Error("Invalid response from Gemini API");
    }

    const parsed = JSON.parse(rawText);

    return NextResponse.json({
        nextQuestion: parsed.nextQuestion || "Could you tell me more about your experience?",
        feedback: parsed.feedback || "",
        score: parsed.score || 0
    });

  } catch (error: any) {
    console.error("Interview API Error:", error);
    return NextResponse.json({ 
        error: "Failed to process interview response",
        details: error.message
    }, { status: 500 });
  }
}
