import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    console.log("ENV KEY:", apiKey);
    console.log("API KEY EXISTS:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing. Check .env.local." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const { notes } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "Please provide some notes." },
        { status: 400 }
      );
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
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
          `,
        },
        {
          role: "user",
          content: notes,
        },
      ],
    });

    const text = response.output_text;
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating study materials." },
      { status: 500 }
    );
  }
}