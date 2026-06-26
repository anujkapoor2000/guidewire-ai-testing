import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description, errorLog, severity, gwCenter } = await req.json();

    // Retrieve known defect patterns and root causes relevant to this defect
    const query = [description, errorLog, gwCenter, "defect root cause fix"].filter(Boolean).join(" ");
    const internalContext = retrieveContext(query);

    const prompt = `${internalContext}You are a senior Guidewire technical consultant and QA expert specialising in defect analysis.

Analyse the following defect and provide a comprehensive report:

**Severity:** ${severity}
**Guidewire Center:** ${gwCenter}
**Defect Description:** ${description}
${errorLog ? `**Error Log / Stack Trace:**\n\`\`\`\n${errorLog}\n\`\`\`` : ""}

Cross-reference the internal knowledge base above — if a known defect pattern matches, reference it explicitly (e.g. "This matches pattern PC-DEF-001").

Provide a structured analysis with the following sections:

## 1. Root Cause Analysis
Identify the most likely root cause(s) based on the description, logs, and known patterns.

## 2. Affected Components
List the Guidewire components, PCF screens, GOSU rules, or workflows likely involved.

## 3. Recommended Fix Approach
Step-by-step guidance on how to investigate and resolve the issue.

## 4. Verification Test Cases
2-3 specific test cases to verify the fix, using our internal test case naming conventions.

## 5. Regression Risk Areas
Which other modules or workflows should be regression tested after the fix.

## 6. Prevention Tips
Best practices or configuration checks to prevent recurrence.`;

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
