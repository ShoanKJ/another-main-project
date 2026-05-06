import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, context } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const systemContext = `You are an expert AI career coach and interview assistant built into an AI Mock Interview app. 
You are helpful, encouraging, and concise.

Here is the user's interview history and performance data:
${context}

Use this data to give personalized advice. If the user asks about their performance, weakest areas, or what to improve — reference their actual data.
Keep responses short and conversational (2-4 sentences max unless asked for more).`;

    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "Got it! I'm ready to help with personalized career advice and interview coaching." }],
        },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;

    // STREAMING — sends chunks as they arrive
    const result = await chat.sendMessageStream(lastMessage);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}