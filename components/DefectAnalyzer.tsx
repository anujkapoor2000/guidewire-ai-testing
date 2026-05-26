"use client";

import { useState } from "react";
import { Bug, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const SEVERITIES = ["Critical", "High", "Medium", "Low", "Unknown"];
const GW_CENTERS_DEF = ["PolicyCenter", "ClaimCenter", "BillingCenter", "ContactManager", "Unknown"];

export default function DefectAnalyzer() {
  const [description, setDescription] = useState("");
  const [errorLog, setErrorLog]       = useState("");
  const [severity, setSeverity]       = useState("Unknown");
  const [gwCenter, setGwCenter]       = useState("Unknown");
  const [result, setResult]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [copied, setCopied]           = useState(false);
  const [error, setError]             = useState("");

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/analyze-defect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, errorLog, severity, gwCenter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze");
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

  const severityColor: Record<string, string> = {
    Critical: "bg-red-700 border-red-600",
    High:     "bg-orange-700 border-orange-600",
    Medium:   "bg-yellow-700 border-yellow-600",
    Low:      "bg-green-700 border-green-600",
    Unknown:  "bg-gray-700 border-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
          <Bug size={22} className="text-rose-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Defect Analyzer</h2>
          <p className="text-gray-400 text-sm">AI-powered root cause analysis and fix recommendations</p>
        </div>
      </div>

      {/* Form */}
      <div className="card space-y-5">
        {/* Severity & Center */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Severity</label>
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all text-white",
                    severity === s ? severityColor[s] : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Guidewire Center</label>
            <div className="flex flex-wrap gap-2">
              {GW_CENTERS_DEF.map((c) => (
                <button
                  key={c}
                  onClick={() => setGwCenter(c)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    gwCenter === c
                      ? "bg-rose-700 border-rose-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defect Description */}
        <div>
          <label className="label">Defect Description *</label>
          <textarea
            className="input-field resize-none"
            rows={4}
            placeholder="Describe the defect in detail. e.g. When submitting a new Personal Auto policy in PolicyCenter, the premium calculation returns $0 for drivers with more than 3 vehicles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Error Log */}
        <div>
          <label className="label">
            Error Log / Stack Trace <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            className="input-field resize-none font-mono text-xs"
            rows={5}
            placeholder="Paste error logs, stack traces, or exception messages here..."
            value={errorLog}
            onChange={(e) => setErrorLog(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !description.trim()}
          className="btn-primary bg-rose-700 hover:bg-rose-600 shadow-rose-900/40"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
          {loading ? "Analyzing..." : "Analyze Defect"}
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
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bug size={16} className="text-rose-400" />
              Analysis Report
            </h3>
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
