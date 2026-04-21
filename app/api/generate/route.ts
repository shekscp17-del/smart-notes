import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API key is missing. Check environment variables." },
        { status: 500 }
      );
    }

    const { notes } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "Please provide some notes." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a study assistant.

Given the student's notes, create:
1. A short summary
2. 5 key points
3. 5 flashcards
4. 5 multiple-choice quiz questions

Return ONLY valid JSON in this exact format:
{
  "summary": "string",
  "key_points": ["string", "string", "string", "string", "string"],
  "flashcards": [
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" },
    { "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    },
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    },
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    },
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    },
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string"
    }
  ]
}

Notes:
${notes}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model returned invalid JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating study materials." },
      { status: 500 }
    );
  }
}