// app/api/generate-prompt/route.ts
import { NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";

if (!process.env.COHERE_API_KEY) {
  throw new Error("Missing COHERE_API_KEY in environment variables");
}

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY!,
});

const DEFAULT_MODEL = process.env.COHERE_MODEL || "command-a-03-2025";

// 🔹 Category-specific role instructions
const categoryInstructions: Record<string, string> = {
  writing:
    "You are an expert creative writer. Generate engaging writing prompts for narratives, essays, or analyses.",
  coding:
    "You are an expert software engineer. Generate prompts for coding projects, algorithms, or system design tasks.",
  art: "You are an expert artist. Generate prompts for digital art, illustrations, or creative designs.",
  fun: "You are an expert game designer. Generate prompts for playful or interactive experiences.",
  business:
    "You are a business strategist. Generate prompts for business plans, pitches, or strategy development.",
  education:
    "You are an educator. Generate prompts for courses, lessons, or educational activities.",
};

// 🔹 Few-shot examples to guide outputs
const fewShotExamples: Record<string, string> = {
  writing: `
Example:
{
  "title": "Dystopian City Story",
  "prompt": "Write a narrative set in a futuristic dystopian city where technology controls daily life. Explore themes of resistance, freedom, and identity.",
  "category": "writing"
}`,
  coding: `
Example:
{
  "title": "Weather App with React",
  "prompt": "Build a weather application using React and OpenWeather API. Include features like location-based forecasts, error handling, and responsive design.",
  "category": "coding"
}`,
  art: `
Example:
{
  "title": "Futuristic Cyberpunk Portrait",
  "prompt": "Create a digital artwork of a cyberpunk-inspired character with neon lights, futuristic armor, and a vibrant city background.",
  "category": "art"
}`,
  business: `
Example:
{
  "title": "AI Startup Business Plan",
  "prompt": "Develop a business plan for a startup leveraging AI to optimize supply chain logistics. Include market analysis, key features, and revenue strategy.",
  "category": "business"
}`,
  education: `
Example:
{
  "title": "Intro to Machine Learning Course",
  "prompt": "Design a 6-week course introducing students to machine learning basics with Python. Include weekly topics, practical exercises, and assessments.",
  "category": "education"
}`,
  fun: `
Example:
{
  "title": "Escape Room Challenge",
  "prompt": "Design a puzzle for a virtual escape room where players must solve math and logic challenges to unlock the next stage.",
  "category": "fun"
}`,
};

type RequestPayload = {
  topic: string;
  category: string;
};

export async function POST(request: Request) {
  try {
    const { topic, category } = (await request.json()) as RequestPayload;

    if (!topic?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: "Topic and category are required." },
        { status: 400 }
      );
    }

    const normalizedCategory = category.toLowerCase();
    const instructions =
      categoryInstructions[normalizedCategory] || categoryInstructions.fun;
    const example = fewShotExamples[normalizedCategory] || fewShotExamples.fun;

    // Compose structured prompt with few-shot example
    const userPrompt = `${instructions}
Your task: Generate a JSON object representing a single high-quality AI prompt.

The JSON must have this structure:
{
  "title": "short descriptive title",
  "prompt": "the actual AI-ready prompt text",
  "category": "${normalizedCategory}"
}

Make sure the prompt is:
- Clear and engaging
- Specific (not vague)
- Useful as input for AI models like ChatGPT, Claude, or Gemini
- Inspired by the topic: "${topic}"

${example}
Now generate the JSON for this topic.
`;

    const response = await cohere.chat({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an AI prompt generator. Always respond with valid JSON containing a 'title', 'prompt', and 'category'.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    let generated: string;

    if (typeof response.message?.content === "string") {
      generated = response.message.content;
    } else if (Array.isArray(response.message?.content)) {
      generated = response.message.content
        .map((c: any) => (typeof c.text === "string" ? c.text : ""))
        .join(" ");
    } else {
      generated = "";
    }

    // Try to parse JSON from output
    let parsed;
    try {
      parsed = JSON.parse(generated);
    } catch {
      parsed = { title: "Untitled", prompt: generated, category };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while generating prompt",
      },
      { status: 500 }
    );
  }
}
