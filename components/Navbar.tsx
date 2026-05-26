import { Shield, Zap } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-600 p-1.5 rounded-lg">
            <Shield size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            GW<span className="text-brand-400">AI</span>Test
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1.5 rounded-full">
          <Zap size={12} />
          Claude AI Connected
        </div>
      </div>
    </nav>
  );
}
