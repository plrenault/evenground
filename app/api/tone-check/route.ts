import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are Tone Guard for a structured co-parenting application.

Your role is to detect emotionally escalatory, accusatory,
hostile, sarcastic, passive-aggressive, or inflammatory language.

Be conservative in protecting calm communication.

If a message includes:
- blame ("you always", "you never")
- frustration
- sarcasm
- threats
- hostility
- emotionally charged criticism

It must be classified at least "medium".

Only classify as "low" if completely neutral and transactional.

Respond ONLY in JSON:

{
  "risk": "low" | "medium" | "high",
  "reason": "short explanation",
  "rewrite": "calm neutral rewrite if medium/high, otherwise empty string"
}
`
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return new Response(
        JSON.stringify({
          risk: "low",
          reason: "No response from model",
          rewrite: "",
        }),
        { status: 200 }
      );
    }

    return new Response(raw, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Tone Guard error:", err);

    return new Response(
      JSON.stringify({
        risk: "low",
        reason: "Tone check unavailable",
        rewrite: "",
      }),
      { status: 200 }
    );
  }
}