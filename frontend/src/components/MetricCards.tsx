"use client";

import React from "react";
import { MetricCardSkeleton } from "./Skeleton";
interface MetricCardsProps {
  headlineRate: number | null;
  foodRate: number | null;
  coreRate: number | null;
  cpiIndex: number | null;
  indexBase?: string;
  year: number;
  month: number;
  isLoading?: boolean;
}

export function MetricCards({
  headlineRate,
  foodRate,
  coreRate,
  cpiIndex,
  indexBase,
  year,
  month,
  isLoading = false,
}: MetricCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabel = monthNames[month - 1] || "—";
  const formattedRate = (value: number | null) => value === null ? "—" : `${value.toFixed(2)}%`;

  const cardStyle: React.CSSProperties = {
    background: "#111113",
    border: "1px solid #222226",
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

      {/* 1. Headline CPI */}
      <div style={cardStyle} className="hover:border-[#333336] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6e6e73" }}>CPI change · YoY</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: "#1a1a1d", color: "#6e6e73", border: "1px solid #2a2a2d" }}
          >
            UN CPI
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[32px] font-bold font-mono tabular-nums" style={{ color: "#f5f5f7", letterSpacing: "-0.02em" }}>
            {formattedRate(headlineRate)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-3" style={{ borderTop: "1px solid #1a1a1d", color: "#6e6e73" }}>
          <span>{monthLabel} {year}</span>
          <span style={{ color: "#3a3a3d" }}>UN CPI YoY</span>
        </div>
      </div>

      {/* 2. Food Sub-Index */}
      <div style={cardStyle} className="hover:border-[#ff6a2b]/30 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6e6e73" }}>Food Sub-Index</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,106,43,0.1)", color: "#ff6a2b", border: "1px solid rgba(255,106,43,0.2)" }}
          >
            FOOD BASKET
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[32px] font-bold font-mono tabular-nums" style={{ color: "#ff6a2b", letterSpacing: "-0.02em" }}>
            {formattedRate(foodRate)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-3" style={{ borderTop: "1px solid #1a1a1d", color: "#6e6e73" }}>
          <span>NBS food series</span>
          <span style={{ color: "#ff6a2b" }}>Unavailable</span>
        </div>
      </div>

      {/* 3. Core Inflation */}
      <div style={cardStyle} className="hover:border-[#333336] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6e6e73" }}>Core Inflation</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: "#1a1a1d", color: "#6e6e73", border: "1px solid #2a2a2d" }}
          >
            EX-PRODUCE
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[32px] font-bold font-mono tabular-nums" style={{ color: "#f5f5f7", letterSpacing: "-0.02em" }}>
            {formattedRate(coreRate)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-3" style={{ borderTop: "1px solid #1a1a1d", color: "#6e6e73" }}>
          <span>NBS core series</span>
          <span style={{ color: "#3a3a3d" }}>Unavailable</span>
        </div>
      </div>

      {/* 4. Composite CPI */}
      <div style={cardStyle} className="hover:border-[#333336] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6e6e73" }}>Composite Base CPI</span>
          <span
            className="text-[10px] font-mono px-2 py-0.5 rounded-full"
            style={{ background: "#1a1a1d", color: "#6e6e73", border: "1px solid #2a2a2d" }}
          >
            {indexBase || "Base not supplied"}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[32px] font-bold font-mono tabular-nums" style={{ color: "#f5f5f7", letterSpacing: "-0.02em" }}>
            {cpiIndex === null ? "—" : cpiIndex.toFixed(3)}
          </span>
          <span className="text-xs font-mono" style={{ color: "#6e6e73" }}>pts</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono pt-3" style={{ borderTop: "1px solid #1a1a1d", color: "#6e6e73" }}>
          <span>UN CPI reference</span>
          <span className="text-emerald-500">Published</span>
        </div>
      </div>

    </div>
  );
}
