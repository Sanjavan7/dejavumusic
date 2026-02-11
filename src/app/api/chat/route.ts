import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { messages, trackContext } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are DejaVu, an AI music expert helping users find songs.

${
  trackContext
    ? `The user identified a song: "${trackContext.trackName}" by "${trackContext.artistName}".`
    : ""
}

The user is trying to find a DIFFERENT song that this one reminds them of. Your job is to help them find it.

You have deep knowledge of music including:
- Songs that share similar samples, melodies, or chord progressions
- Music production styles and their characteristic sounds
- Genre histories and which artists influenced each other
- Common "sounds like" connections between songs

Ask smart follow-up questions:
- Male or female vocals?
- Faster or slower than the identified song?
- When did they hear it? (decade, era)
- Where did they hear it? (radio, TikTok, movie, store)
- Any lyrics they remember, even fragments?
- What instrument or sound is most prominent?

When you suggest a song, explain WHY it might be the one they're thinking of.
Keep responses concise and conversational. You're like a really knowledgeable friend who knows music deeply.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepend system prompt as first user message, then interleave with a
    // model acknowledgment so the real conversation history stays intact.
    const history = [
      { role: "user" as const, parts: [{ text: systemPrompt }] },
      { role: "model" as const, parts: [{ text: "Understood. I'm DejaVu, your music expert. I'm ready to help find that song. What can you tell me?" }] },
      ...messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: (msg.role === "assistant" ? "model" : "user") as "model" | "user",
        parts: [{ text: msg.content }],
      })),
    ];

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
