"use client";

import { useState } from "react";
import { Database, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import clsx from "clsx";

const PRODUCTS = [
  "Personal Auto",
  "Homeowners",
  "Commercial Auto",
  "Workers Compensation",
  "General Liability",
  "Umbrella",
  "Inland Marine",
];

const CENTERS = ["PolicyCenter", "ClaimCenter", "BillingCenter"];
const FORMATS_DATA = ["JSON", "Table", "CSV-ready"];

export default function TestDataGenerator() {
  const [center, setCenter]     = useState("PolicyCenter");
  const [product, setProduct]   = useState("Personal Auto");
  const [count, setCount]       = useState(3);
  const [format, setFormat]     = useState("JSON");
  const [notes, setNotes]       = useState("");
  const [result, setResult]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate-testdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ center, product, count, format, notes }),
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
        <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
          <Database size={22} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Test Data Generator</h2>
          <p className="text-gray-400 text-sm">Generate realistic insurance test data for Guidewire modules</p>
        </div>
      </div>

      {/* Form */}
      <div className="card space-y-5">
        {/* Center */}
        <div>
          <label className="label">Guidewire Center</label>
          <div className="flex flex-wrap gap-2">
            {CENTERS.map((c) => (
              <button
                key={c}
                onClick={() => setCenter(c)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  center === c
                    ? "bg-emerald-700 border-emerald-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <label className="label">Insurance Product / Line of Business</label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((p) => (
              <button
                key={p}
                onClick={() => setProduct(p)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  product === p
                    ? "bg-emerald-700 border-emerald-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Count & Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Number of Records</label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Output Format</label>
            <div className="flex gap-2">
              {FORMATS_DATA.map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                    format === f
                      ? "bg-emerald-700 border-emerald-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Special Requirements <span className="text-gray-500">(optional)</span></label>
          <textarea
            className="input-field resize-none"
            rows={2}
            placeholder="e.g. Include edge cases like high-risk drivers, multi-vehicle policies, or out-of-state addresses..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={loading} className="btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            {loading ? "Generating..." : "Generate Test Data"}
          </button>
          {result && (
            <button onClick={handleGenerate} disabled={loading} className="btn-secondary">
              <RefreshCw size={14} />
              Regenerate
            </button>
          )}
        </div>
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
            <h3 className="font-semibold text-white">
              Generated Test Data
              <span className="ml-2 badge bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                {count} record{count > 1 ? "s" : ""}
              </span>
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
