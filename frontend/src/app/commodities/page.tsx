"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import { Search, Filter } from "lucide-react";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  ALL:          { label: "All",           color: "#9ca3af" },
  FOOD_STAPLES: { label: "Food Staples",  color: "#f59e0b" },
  ENERGY_FUEL:  { label: "Energy / Fuel", color: "#f43f5e" },
  HOUSING:      { label: "Housing",       color: "#06b6d4" },
};

export default function CommoditiesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<{ itemName: string; category: string; price: number; unit: string; marketState: string; recordDate: string; sourceUrl: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("ALL");

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/v1/inflation/commodities`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error(`The commodity data service returned HTTP ${response.status}.`);
        return response.json();
      })
      .then(setItems)
      .catch(cause => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load market observations.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = i.itemName.toLowerCase().includes(search.toLowerCase()) || i.marketState.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "ALL" || i.category === cat;
    return matchSearch && matchCat;
  });

  if (authLoading || !user) return null;

  return (
    <AppLayout title="Market prices" subtitle="Recent commodity observations with traceable sources only.">
      <p className="mb-5 max-w-3xl text-sm leading-6 text-stone-500">Only records from the last 90 days with an original source URL are displayed. Historical sample prices are excluded; the connected service currently has no automated commodity feed.</p>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div>}
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6b7280" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search commodities or states…"
            className="w-full rounded-xl border border-[#d6d3ca] bg-white px-4 py-3 pl-10 text-sm text-[#171713] outline-none placeholder:text-stone-500 focus:border-[#b38a45] focus:ring-2 focus:ring-[#b38a45]/20"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 shrink-0" style={{ color: "#6b7280" }} />
          {Object.entries(CATEGORIES).map(([key, { label, color }]) => (
            <button key={key} onClick={() => setCat(key)}
              className="px-3 py-2 rounded-[9px] text-[12px] font-semibold transition"
              style={cat === key
                ? { background: `${color}20`, color, border: `1px solid ${color}40` }
                : { background: "rgba(255,255,255,0.04)", color: "#9ca3af", border: "1px solid rgba(255,255,255,0.08)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Items", val: items.length, color: "#10b981" },
          { label: "Filtered", val: filtered.length, color: "#06b6d4" },
          { label: "States Covered", val: Array.from(new Set(items.map(i => i.marketState))).length, color: "#8b5cf6" },
        ].map(({ label, val, color }) => (
          <div key={label} className="glass rounded-[12px] p-3 text-center" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-[22px] font-black" style={{ color }}>{val}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-[18px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-5 space-y-2">{Array(8).fill(0).map((_,i) => <div key={i} className="skeleton h-12 rounded-[8px]" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-[13px]" style={{ color: "#6b7280" }}>
              {items.length ? "No verified items match your search." : "No recent verified commodity prices are available from the connected data service."}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Market</th>
                  <th className="text-right">Price (₦)</th>
                  <th>Observed</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const catInfo = CATEGORIES[item.category] || CATEGORIES.ALL;
                  return (
                    <tr key={i}>
                      <td className="font-medium text-[#f9fafb]">{item.itemName}</td>
                      <td>
                        <span className="badge" style={{ background: `${catInfo.color}15`, color: catInfo.color, border: `1px solid ${catInfo.color}25` }}>
                          {catInfo.label}
                        </span>
                      </td>
                      <td className="font-mono text-[12px]">{item.unit}</td>
                      <td>{item.marketState}</td>
                      <td className="text-right font-mono font-bold" style={{ color: "#10b981" }}>
                        ₦{item.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap text-xs">{new Date(item.recordDate).toLocaleDateString("en-NG")}</td>
                      <td>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-xs underline">Original source</a>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
