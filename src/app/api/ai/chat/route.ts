import { NextRequest } from "next/server";
import { getAIRecommendation } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, mode = "GENERAL" } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { ok: false, error: "Missing prompt" },
        { status: 400 }
      );
    }

    const aiResponse = await getAIRecommendation(
      mode,
      {},
      prompt
    );

    return Response.json({ ok: true, response: aiResponse });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
