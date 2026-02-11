import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: NextRequest) {
  const track = request.nextUrl.searchParams.get("track");
  const artist = request.nextUrl.searchParams.get("artist");

  if (!track || !artist) {
    return NextResponse.json(
      { error: "Query parameters 'track' and 'artist' are required" },
      { status: 400 }
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `What specific songs would people say "this reminds me of..." when hearing "${track}" by ${artist}?

Think deeply about this. I need songs that listeners genuinely confuse or associate with this track — NOT just songs with a similar mood or from the same genre.

Focus on songs that share:
- The SAME melodic hooks, riffs, or instrumental patterns (e.g. similar plucked guitar melody, same synth lead style, matching vocal melody contour)
- The SAME production techniques and sound design (e.g. same type of drop, same drum pattern, same mix style)
- Similar chord progressions that make them sound like the same song
- Actual samples — songs that sample this track or are sampled by it
- The same specific subgenre and era — not just "electronic" but the exact style (e.g. tropical house, melodic dubstep, etc.)

Search your knowledge for:
- YouTube comments where people say "this sounds like..." or "this reminds me of..." for this song
- Reddit threads (r/tipofmytongue, r/music, r/ifyoulikeblank) comparing this song to others
- Forum posts, blog articles, or "if you like X you'll love Y" lists that mention this song
- Songs by artists in the exact same scene/movement who made tracks with nearly identical production

Do NOT include:
- Songs that are just the same genre but sound completely different
- Famous songs that are loosely related by mood
- Songs by the same artist (unless they genuinely sound alike)

Give me 10-15 songs, prioritized by how likely someone is to actually confuse them with or be reminded of "${track}" by ${artist}.

Respond ONLY with valid JSON in this exact format, no other text:
[
  {"name": "Song Name", "artist": "Artist Name", "reason": "Brief specific reason — what exactly sounds similar"},
  ...
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON array from the response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ suggestions: [] });
    }

    let suggestions: { name: string; artist: string; reason: string }[] = [];
    try {
      suggestions = JSON.parse(jsonMatch[0]);
    } catch {
      // Gemini sometimes produces malformed JSON — try to clean it up
      try {
        const cleaned = jsonMatch[0]
          .replace(/,\s*]/g, "]")          // remove trailing commas before ]
          .replace(/,\s*}/g, "}")          // remove trailing commas before }
          .replace(/[\x00-\x1F]+/g, " ")   // strip control characters
          .replace(/"\s*\n\s*"/g, '", "'); // fix broken string continuations
        suggestions = JSON.parse(cleaned);
      } catch {
        // If still broken, return empty rather than 500
        console.error("Failed to parse Gemini JSON, raw text:", text.slice(0, 500));
        return NextResponse.json({ suggestions: [] });
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Gemini similar error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
