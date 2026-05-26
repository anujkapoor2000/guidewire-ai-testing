import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { module, format, priority, scenario } = await req.json();

    const prompt = `You are an expert Guidewire QA engineer with deep knowledge of PolicyCenter, ClaimCenter, and BillingCenter.

Generate comprehensive test cases for: **${module}**

Requirements:
- Format: ${format}
- Priority: ${priority === "All" ? "Include High, Medium, and Low priority test cases" : `Focus on ${priority} priority test cases`}
${scenario ? `- Specific context: ${scenario}` : ""}

For Gherkin/BDD format, use proper Feature/Scenario/Given/When/Then syntax.
For Step-by-Step, use numbered steps with expected results.
For Test Matrix, use a structured table format.

Include:
1. Happy path / positive test cases
2. Negative / error scenarios
3. Boundary value tests
4. Guidewire-specific validations (business rules, workflow states, etc.)
5. Integration points if applicable

Be specific to Guidewire's UI, workflows, and insurance domain terminology.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const result = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
