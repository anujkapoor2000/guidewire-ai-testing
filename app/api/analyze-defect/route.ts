import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description, errorLog, severity, gwCenter } = await req.json();

    const prompt = `You are a senior Guidewire technical consultant and QA expert specializing in defect analysis.

Analyze the following defect and provide a comprehensive report:

**Severity:** ${severity}
**Guidewire Center:** ${gwCenter}
**Defect Description:** ${description}
${errorLog ? `**Error Log / Stack Trace:**\n\`\`\`\n${errorLog}\n\`\`\`` : ""}

Provide a structured analysis with the following sections:

## 1. 🔍 Root Cause Analysis
Identify the most likely root cause(s) based on the description and logs.

## 2. 🏗️ Affected Components
List the Guidewire components, screens, rules, or workflows likely involved.

## 3. 🔧 Recommended Fix Approach
Step-by-step guidance on how to investigate and fix the issue.

## 4. 🧪 Verification Test Cases
2-3 specific test cases to verify the fix.

## 5. ⚠️ Regression Risk Areas
Which other areas/modules should be regression tested after the fix.

## 6. 💡 Prevention Tips
Best practices to prevent similar issues in the future.

Be specific to Guidewire's architecture (GOSU rules, PCF screens, workflow states, business rules, etc.).`;

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
