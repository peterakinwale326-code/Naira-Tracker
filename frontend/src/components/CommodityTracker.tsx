"use client";

import React, { useState } from "react";
import { TableSkeleton } from "./Skeleton";
import { Search, MapPin, Filter } from "lucide-react";

interface Commodity {
  id?: string;
  itemName: string;
  category: string;
  price: number;
  unit: string;
  marketState: string;
  recordDate: string;
  sourceUrl: string | null;
}

interface Props {
  commodities: Commodity[];
  isLoading?: boolean;
}

export function CommodityTracker({ commodities, isLoading = false }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  if (isLoading) {
    return <TableSkeleton />;
  }

  const filtered = commodities.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.marketState.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { label: "All Items", key: "ALL" },
    { label: "Food Staples", key: "FOOD_STAPLES" },
    { label: "Energy & Fuel", key: "ENERGY_FUEL" },
    { label: "Housing & Building", key: "HOUSING" },
  ];

  return (
    <div className="bg-white border border-zinc-200/90 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden font-sans">
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Recent Commodity Observations
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
              SOURCE DATA
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Only records within the latest 90 days are eligible to display.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search commodity or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            />
          </div>

          <div className="flex items-center p-0.5 bg-zinc-200/70 rounded border border-zinc-300/60 text-xs font-mono">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory(c.key)}
                className={`px-2 py-1 rounded transition text-[11px] ${
                  selectedCategory === c.key
                    ? "bg-white text-zinc-900 font-bold shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actual Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200/80 text-[11px] font-mono uppercase text-zinc-500">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Commodity Description</th>
              <th className="py-2.5 px-3 font-semibold">Category</th>
              <th className="py-2.5 px-3 font-semibold">Market state</th>
              <th className="py-2.5 px-3 font-semibold">Unit</th>
              <th className="py-2.5 px-4 font-semibold text-right">Price (₦)</th>
              <th className="py-2.5 px-3 font-semibold">Observed</th>
              <th className="py-2.5 px-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs font-mono">
                  No recent commodity observations are available.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/70 transition">
                  <td className="py-3 px-4 font-medium text-zinc-900">
                    {item.itemName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                      {item.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-600">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      {item.marketState}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                    {item.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 text-sm tabular-nums">
                    ₦{item.price.toLocaleString("en-NG")}
                  </td>
                  <td className="whitespace-nowrap py-3 px-3 text-zinc-500">{new Date(item.recordDate).toLocaleDateString("en-NG")}</td>
                  <td>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-xs underline">Original source</a>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center text-[11px] font-mono text-zinc-500">
        <span>{filtered.length} recent observations shown</span>
        <span>Trend comparisons unavailable</span>
      </div>
    </div>
  );
}
