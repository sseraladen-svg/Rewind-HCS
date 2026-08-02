import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ZAI from "z-ai-web-dev-sdk";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const { entries, birthYear } = await req.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Need at least one journal entry to analyze" },
        { status: 400 }
      );
    }

    const recentEntries = entries.slice(0, 20).map((e: Record<string, unknown>) => ({
      date: e.createdAt || e.date || "unknown",
      mood: e.mood || "none",
      weather: e.weather || "none",
      preview: typeof e.content === "string" ? e.content.slice(0, 120) : "",
    }));

    const moodCounts: Record<string, number> = {};
    for (const e of entries) {
      const m = (e as Record<string, unknown>).mood as string || "none";
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    }
    const totalEntries = entries.length;
    const topMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0];

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `You are a warm, empathetic journaling companion for a nostalgia app called "Rewind". The user was born in ${birthYear || "the 90s"}. You analyze their journal entries and provide gentle, supportive insights. Keep responses concise (under 200 words total). Never be clinical or robotic. Use a warm, human tone. Respond with valid JSON only — no markdown, no code fences. Format: {"moodSummary":"...","patterns":["..."],"suggestion":"...","reflection":"..."}`,
        },
        {
          role: "user",
          content: `Here are my recent ${totalEntries} journal entries. My most common mood is "${topMood?.[0] || "unknown"}" (${topMood?.[1] || 0} times out of ${totalEntries}). Recent entries:\n${JSON.stringify(recentEntries, null, 1)}`,
        },
      ],
      thinking: { type: "disabled" },
    });

    let content = completion.choices[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let insights;
    try {
      insights = JSON.parse(content);
    } catch {
      insights = {
        moodSummary: `You've written ${totalEntries} entries, with "${topMood?.[0] || "unknown"}" being your most frequent mood.`,
        patterns: ["Keep writing to discover more patterns."],
        suggestion: "Try journaling at the same time each day to build a habit.",
        reflection: "Every entry you write is a small act of self-care.",
      };
    }

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("[ai/insights]", error);
    return NextResponse.json(
      { error: "Could not generate insights right now. Try again in a moment." },
      { status: 500 }
    );
  }
}