"use client";

import { useState } from "react";
import { FlaskConical, Loader2, Copy, Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

const GW_MODULES = [
  "PolicyCenter – New Submission",
  "PolicyCenter – Policy Change",
  "PolicyCenter – Renewal",
  "PolicyCenter – Cancellation",
  "PolicyCenter – Reinstatement",
  "ClaimCenter – First Notice of Loss (FNOL)",
  "ClaimCenter – Claim Assignment",
  "ClaimCenter – Reserve Management",
  "ClaimCenter – Payment Processing",
  "ClaimCenter – Subrogation",
  "BillingCenter – Account Creation",
  "BillingCenter – Invoice Generation",
  "BillingCenter – Payment Plans",
  "BillingCenter – Delinquency Processing",
  "ContactManager – Contact Creation",
];

const FORMATS = ["Gherkin / BDD", "Step-by-Step", "Test Matrix"];
const PRIORITIES = ["High", "Medium", "Low", "All"];

export default function TestCaseGenerator() {
  const [module, setModule]       = useState("");
  const [customModule, setCustomModule] = useState("");
  const [format, setFormat]       = useState("Gherkin / BDD");
  const [priority, setPriority]   = useState("All");
  const [scenario, setScenario]   = useState("");
  const [result, setResult]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState("");

  const selectedModule = module === "__custom__" ? customModule : module;

  const handleGenerate = async () => {
    if (!selectedModule.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate-testcases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: selectedModule, format, priority, scenario }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
          <FlaskConical size={22} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Test Case Generator</h2>
          <p className="text-gray-400 text-sm">Generate structured test cases for any Guidewire module</p>
        </div>
      </div>

      {/* Form */}
      <div className="card space-y-5">
        {/* Module Select */}
        <div>
          <label className="label">Guidewire Module *</label>
          <div className="relative">
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="input-field appearance-none pr-10"
            >
              <option value="">Select a module...</option>
              {GW_MODULES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__custom__">✏️ Custom module...</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {module === "__custom__" && (
          <div>
            <label className="label">Custom Module Name</label>
            <input
              className="input-field"
              placeholder="e.g. PolicyCenter – Rewrite"
              value={customModule}
              onChange={(e) => setCustomModule(e.target.value)}
            />
          </div>
        )}

        {/* Format & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Output Format</label>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    format === f
                      ? "bg-brand-600 border-brand-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Priority Filter</label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    priority === p
                      ? "bg-brand-600 border-brand-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional scenario */}
        <div>
          <label className="label">Specific Scenario / Context <span className="text-gray-500">(optional)</span></label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="e.g. Test the happy path for a Personal Auto new submission with a single driver and vehicle..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedModule.trim()}
          className="btn-primary"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
          {loading ? "Generating..." : "Generate Test Cases"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Generated Test Cases</h3>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-gray-950 rounded-xl p-4 text-sm text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed border border-gray-800">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
