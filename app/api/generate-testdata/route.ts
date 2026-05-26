import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { center, product, count, format, notes } = await req.json();

    const prompt = `You are an expert Guidewire test data specialist with deep knowledge of insurance data models.

Generate ${count} realistic test data record(s) for:
- Guidewire Center: ${center}
- Insurance Product / Line of Business: ${product}
- Output Format: ${format}
${notes ? `- Special requirements: ${notes}` : ""}

For ${center}, include all relevant fields such as:
${center === "PolicyCenter" ? `
- Policyholder: firstName, lastName, dateOfBirth, SSN (masked), address, phone, email
- Policy: policyNumber, effectiveDate, expirationDate, status, premium
- Product-specific fields for ${product} (vehicles, drivers, properties, etc.)
- Underwriting info: coverages, limits, deductibles
` : ""}
${center === "ClaimCenter" ? `
- Claimant: name, contactInfo, injuryType (if applicable)
- Claim: claimNumber, lossDate, reportedDate, lossType, status
- Policy reference, reserve amounts, assigned adjuster
- Loss location and description
` : ""}
${center === "BillingCenter" ? `
- Account: accountNumber, accountName, billingMethod
- Policy billing info: invoiceDate, dueDate, amount, status
- Payment history, delinquency status if applicable
` : ""}

Make data realistic, varied, and suitable for QA testing. Use realistic US-based insurance data.
${format === "JSON" ? "Output as valid, well-formatted JSON array." : ""}
${format === "Table" ? "Output as a clean markdown table." : ""}
${format === "CSV-ready" ? "Output as CSV with headers on first row." : ""}`;

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
