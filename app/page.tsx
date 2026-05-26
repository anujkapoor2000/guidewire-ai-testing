"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import TestCaseGenerator from "@/components/TestCaseGenerator";
import TestDataGenerator from "@/components/TestDataGenerator";
import DefectAnalyzer from "@/components/DefectAnalyzer";
import { FlaskConical, Database, Bug } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { id: "testcase",  label: "Test Case Generator", icon: FlaskConical, color: "text-blue-400" },
  { id: "testdata",  label: "Test Data Generator",  icon: Database,     color: "text-emerald-400" },
  { id: "defect",    label: "Defect Analyzer",       icon: Bug,          color: "text-rose-400" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("testcase");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-brand-900/20 to-gray-950 border-b border-gray-800 py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="badge bg-brand-900/60 text-brand-300 border border-brand-700 mb-4">
            Powered by Claude AI
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Guidewire AI Testing Suite
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Accelerate QA for PolicyCenter, ClaimCenter & BillingCenter with intelligent
            test generation, data creation, and defect analysis.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-gray-800 text-white shadow"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                )}
              >
                <Icon size={16} className={activeTab === tab.id ? tab.color : ""} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {activeTab === "testcase" && <TestCaseGenerator />}
        {activeTab === "testdata"  && <TestDataGenerator />}
        {activeTab === "defect"    && <DefectAnalyzer />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-gray-600 text-sm">
        Guidewire AI Testing Suite — Built with Next.js & Claude AI
      </footer>
    </div>
  );
}
