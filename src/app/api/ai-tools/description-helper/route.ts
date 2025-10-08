import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateDescriptionPrompt } from "./generateDescriptionPrompt";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiDescriptionInput } from "@/lib/zod/schemas";
import z from "zod";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { title, description } = aiDescriptionInput.parse(body);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Metadata payload is not valid JSON." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512, // for ~4 sentances max
      },
    });

    const prompt = generateDescriptionPrompt(title, description);

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json(
      {
        request: description,
        query: response,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error("Unexpected error handling description helper", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
