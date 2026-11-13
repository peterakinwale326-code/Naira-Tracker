"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { FolderOpen, Trash2, Download } from "lucide-react";

export default function ScenariosPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, savedCalculations, fetchSavedCalculations } = useAuth();

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);
  useEffect(() => { if (user) fetchSavedCalculations(); }, [user]);

  const handleExport = () => {
    if (!savedCalculations.length) return;
    const rows = savedCalculations.map(s => [s.title, s.baseYear, s.targetYear, s.amount, s.equivalentAmount, s.lossPercent, new Date(s.createdAt).toLocaleDateString()]);
    const csv = ["Title,Base Year,Target Year,Base Amount,Deflated Amount,Loss %,Date", ...rows.map(r => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `scenarios_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (authLoading || !user) return null;

  const totalLoss = savedCalculations.reduce((acc, s) => acc + s.lossPercent, 0) / (savedCalculations.length || 1);
  const worstScenario = savedCalculations.reduce((w, s) => s.lossPercent > w.lossPercent ? s : w, savedCalculations[0]);

  return (
    <AppLayout title="My Scenarios" subtitle="Your saved inflation deflation models and purchasing power calculations.">
      {/* Summary strip */}
      {savedCalculations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Saved Scenarios", val: savedCalculations.length, color: "#10b981", suffix: "" },
            { label: "Avg Power Loss",  val: totalLoss.toFixed(1),  color: "#f43f5e", suffix: "%" },
            { label: "Worst Case Loss", val: worstScenario?.lossPercent.toFixed(1) || "—", color: "#f59e0b", suffix: "%" },
          ].map(({ label, val, color, suffix }) => (
            <div key={label} className="glass rounded-[14px] p-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#6b7280" }}>{label}</div>
              <div className="text-[28px] font-black tabular-nums" style={{ color, textShadow: `0 0 16px ${color}50` }}>
                {val}{suffix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="glass rounded-[18px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="font-semibold text-[14px] text-[#f9fafb]">Saved Calculations</h3>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>{savedCalculations.length} scenario{savedCalculations.length !== 1 ? "s" : ""} in your portfolio</p>
          </div>
          {savedCalculations.length > 0 && (
            <button onClick={handleExport} className="btn-ghost text-[12px] px-3 py-2 gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>

        {savedCalculations.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FolderOpen className="w-10 h-10 mx-auto" style={{ color: "#2a2a2d" }} />
            <div>
              <p className="text-[14px] text-[#f9fafb] font-semibold">No scenarios saved yet</p>
              <p className="text-[13px] mt-1" style={{ color: "#6b7280" }}>Head to the Calculator and click &quot;Save to Scenarios&quot; to log a calculation.</p>
            </div>
            <button onClick={() => router.push("/calculator")} className="btn-primary text-[13px] px-5 py-2.5 mx-auto inline-flex">
              Open Calculator →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Years</th>
                  <th className="text-right">Base Amount</th>
                  <th className="text-right">Deflated Value</th>
                  <th className="text-right">Power Lost</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {savedCalculations.map(s => (
                  <tr key={s.id}>
                    <td className="font-medium text-[#f9fafb]">{s.title}</td>
                    <td>
                      <span className="badge badge-blue font-mono">{s.baseYear} → {s.targetYear}</span>
                    </td>
                    <td className="text-right font-mono" style={{ color: "#9ca3af" }}>₦{s.amount.toLocaleString()}</td>
                    <td className="text-right font-mono font-bold text-[#f9fafb]">₦{s.equivalentAmount.toLocaleString()}</td>
                    <td className="text-right">
                      <span className="badge badge-red">−{s.lossPercent.toFixed(1)}%</span>
                    </td>
                    <td className="text-right font-mono text-[12px]" style={{ color: "#4b5563" }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
