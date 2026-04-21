"use client";

import { useState } from "react";

type Flashcard = {
  question: string;
  answer: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type ResultType = {
  summary: string;
  key_points: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!notes.trim()) {
      setError("Please paste your study notes first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      const text = await res.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error("Server returned something invalid");
}

if (!res.ok) {
  throw new Error(data.error || "Something went wrong");
}

setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl p-8 md:p-12 border border-white/10">
          <h1 className="text-4xl md:text-6xl font-bold text-center">Smart Notes</h1>
          <p className="text-center text-slate-300 mt-4 text-lg">
            Turn long notes into summaries, flashcards, and quizzes.
          </p>

          <div className="mt-8">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-64 rounded-2xl bg-slate-900/80 border border-slate-700 p-4 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Paste your study notes here..."
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition px-6 py-3 text-lg font-semibold text-slate-950 shadow-lg disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate Study Pack"}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-red-400">{error}</p>
          )}
        </div>

        {result && (
          <div className="mt-10 grid gap-6">
            <section className="rounded-3xl bg-white/10 border border-white/10 p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-3">Summary</h2>
              <p className="text-slate-200 leading-7">{result.summary}</p>
            </section>

            <section className="rounded-3xl bg-white/10 border border-white/10 p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-3">Key Points</h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-200">
                {result.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl bg-white/10 border border-white/10 p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {result.flashcards.map((card, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-900/70 border border-slate-700 p-4"
                  >
                    <p className="font-semibold text-cyan-300">Q: {card.question}</p>
                    <p className="mt-2 text-slate-200">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white/10 border border-white/10 p-6 shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Quiz</h2>
              <div className="space-y-5">
                {result.quiz.map((q, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-900/70 border border-slate-700 p-4"
                  >
                    <p className="font-semibold text-white">
                      {index + 1}. {q.question}
                    </p>
                    <ul className="mt-3 space-y-2 text-slate-200">
                      {q.options.map((option, i) => (
                        <li key={i}>• {option}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-cyan-300">
                      Correct answer: {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}