# Guidewire AI Testing — Architecture & Production Guide

## System Overview

Three independent AI agents sit behind Next.js API routes, each calling Claude with a domain-specific prompt and returning structured output to the React UI.

```
┌──────────────────────────────────────────────┐
│           Browser  (React 19)                │
│  Tab 1: TestCaseGenerator                    │
│  Tab 2: TestDataGenerator                    │
│  Tab 3: DefectAnalyzer                       │
└──────────┬───────────────────────────────────┘
           │ HTTP POST
┌──────────▼───────────────────────────────────┐
│       Next.js 15  API Routes                 │
│  Agent 1: /api/generate-testcases            │
│  Agent 2: /api/generate-testdata             │
│  Agent 3: /api/analyze-defect                │
└──────────┬───────────────────────────────────┘
           │ HTTPS + ANTHROPIC_API_KEY
┌──────────▼───────────────────────────────────┐
│       Anthropic Claude API                   │
│       model: claude-opus-4-5                 │
│       max_tokens: 2048                       │
└──────────────────────────────────────────────┘
```

---

## The Three Accelerators

| # | Agent | Route | Persona in Prompt | Key Inputs | Output Formats |
|---|-------|-------|-------------------|------------|----------------|
| 1 | **Test Case Generator** | `POST /api/generate-testcases` | Expert GW QA Engineer | module, format, priority, scenario | BDD/Gherkin, Step-by-Step, Test Matrix |
| 2 | **Test Data Synthesizer** | `POST /api/generate-testdata` | GW Test Data Specialist | center, product, count, format, notes | JSON, Markdown Table, CSV |
| 3 | **Defect Intelligence** | `POST /api/analyze-defect` | Senior GW Technical Consultant | description, errorLog, severity, gwCenter | 6-section structured report |

### Agent Request Flow

```
User fills form
      │
      ▼
React component  ──POST──▶  Next.js API Route
                                   │
                              Build prompt
                              (persona + context
                               + domain rules
                               + output contract)
                                   │
                                   ▼
                            Claude Opus 4.5
                            max_tokens: 2048
                                   │
                              Extract text
                                   │
                                   ▼
                            { result: "..." }
                                   │
      ◀──────────────────────────────
Render + copy-to-clipboard
```

### Prompt Engineering Pattern

Every agent prompt has four layers:

1. **Persona** — e.g. "You are an expert Guidewire QA engineer with deep knowledge of PolicyCenter, ClaimCenter, and BillingCenter."
2. **Task Context** — user-supplied fields injected via template literals
3. **Domain Rules** — Guidewire-specific instructions (GOSU rules, PCF screens, workflow states, business rules)
4. **Output Contract** — exact format specification (Gherkin syntax, JSON array, markdown sections)

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.0 |
| Framework | Next.js | 15.0 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS | 3.4 |
| AI / LLM | Anthropic Claude | Opus 4.5 |
| SDK | `@anthropic-ai/sdk` | latest |
| Deployment | Vercel | — |

---

## How to Productionise It

### Phase 1 — Foundation (Week 1–2)

| Item | Action |
|------|--------|
| **Authentication** | Add NextAuth.js with org SSO (Azure AD / Okta). Protect all `/api/*` routes via `next/middleware`. |
| **Input Validation** | Add Zod schemas to all API routes — validate before prompt injection. |
| **Rate Limiting** | `@upstash/ratelimit` per user token budget + Vercel Firewall Rules for IP throttling. |
| **CI/CD Pipeline** | GitHub Actions: lint → type-check → unit tests → Vercel preview → prod promotion on merge to main. |

### Phase 2 — Reliability (Week 3–4)

| Item | Action |
|------|--------|
| **Structured Logging** | Emit JSON logs per request (user, agent, prompt hash, token counts, latency). Ship to Datadog or Vercel Logs. |
| **Response Caching** | Hash prompt inputs → cache in Upstash Redis (TTL 1h). Saves 60–80% API costs for repeated queries. |
| **Secrets Management** | Rotate `ANTHROPIC_API_KEY` regularly. For enterprise, pull from HashiCorp Vault or AWS Secrets Manager. |
| **Cost Monitoring** | Track token usage per user in PostgreSQL. Alert at 80% of monthly budget. |

### Phase 3 — Scale (Week 5–8)

| Item | Action |
|------|--------|
| **Model Tiering** | Defect analysis → `claude-opus-4-5` (accuracy). Bulk test data → `claude-haiku-4-5` (cost). |
| **Async Processing** | Large requests (50+ records) → queue job, return job ID, poll/webhook on completion (BullMQ + Redis). |
| **Prompt Registry** | Version-control prompt templates in DB. A/B test versions. Roll back on quality regression. |
| **Export Integrations** | PDF (jsPDF), Excel (xlsx), Jira API for defect logging, Azure DevOps for test cases. |

### Phase 4 — Growth (Month 3+)

| Item | Action |
|------|--------|
| **Fine-tuned Model** | Fine-tune on Guidewire-specific QA data for higher accuracy at lower cost. |
| **Multi-Agent Orchestration** | Use Claude's tool-use / Agents SDK to chain agents (e.g., generate test case → generate test data → log to Jira). |
| **Regression Impact Analyzer** | Given a code diff, predict which test suites are affected (new agent). |
| **Conversational QA Chatbot** | Persistent conversation agent for GW best-practice Q&A (new agent). |

---

## Security Checklist

| Control | MVP Status | Production Action |
|---------|-----------|-------------------|
| API Key Exposure | ✅ Server-side only | Add rotation policy + Vault |
| Authentication | ❌ Missing | NextAuth.js + org SSO |
| Input Validation | ⚠️ Basic JSON parse | Add Zod schemas |
| Prompt Injection | ⚠️ Partial | Sanitise user input before injection |
| Rate Limiting | ❌ Missing | Upstash + Vercel Firewall |
| CORS Policy | ❌ Default only | Explicit headers in API routes |
| Audit Logging | ❌ Missing | Log all AI calls with user + timestamp |
| Secrets in VCS | ✅ `.env.local` excluded | Add secret scanning in CI |

---

## Future Agent Ecosystem

```
Current Agents
├── 🧪 Test Case Generator
├── 🗄️ Test Data Synthesizer
└── 🐛 Defect Intelligence Agent

Roadmap Agents
├── 🔄 Regression Impact Analyzer
├── 📝 Manual → Automated Script Converter
├── 📊 Test Coverage Advisor
├── 💬 GW QA Chatbot
└── 🔗 Jira Integration Agent

Future: Multi-Agent Orchestrator
└── Claude Agents SDK coordinating all agents
    for end-to-end QA workflow automation
```

---

> **Interactive diagram:** open `docs/architecture.html` in a browser for the full visual architecture with Mermaid diagrams.
