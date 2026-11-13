"use client";

import React, { useState } from "react";
import { ChartSkeleton } from "./Skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendPoint {
  period: string;
  year: number;
  month: number;
  cpiIndex: number;
  cpiYearOverYearRate: number | null;
  cpiMonthOverMonthRate: number | null;
}

interface Props {
  data: TrendPoint[];
  isLoading?: boolean;
}

export function InflationChart({ data, isLoading = false }: Props) {
  const [timeframe, setTimeframe] = useState<"3Y" | "5Y" | "10Y" | "ALL">("10Y");

  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Filter based on timeframe
  const currentYear = new Date().getFullYear();
  const filteredData = data.filter((d) => {
    if (timeframe === "3Y") return d.year >= currentYear - 3;
    if (timeframe === "5Y") return d.year >= currentYear - 5;
    if (timeframe === "10Y") return d.year >= currentYear - 10;
    return true;
  });

  const chartData = filteredData.map((d) => ({
    label: d.period,
    cpiIndex: d.cpiIndex,
    "CPI change (YoY)": d.cpiYearOverYearRate,
    "CPI change (MoM)": d.cpiMonthOverMonthRate,
  }));

  return (
    <div className="bg-white border border-zinc-200/90 rounded-lg p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-sans">
      {/* Header with Timeframe Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-zinc-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              Historical Inflation Disparity Series
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
              YoY % CHANGE
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            CPI index and percentage changes calculated from monthly index readings.
          </p>
        </div>

        {/* Timeframe switch */}
        <div className="flex items-center p-0.5 bg-zinc-100 rounded border border-zinc-200 text-xs font-mono">
          {(["3Y", "5Y", "10Y", "ALL"] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                timeframe === tf
                  ? "bg-white text-zinc-900 font-bold shadow-xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#e4e4e7" vertical={false} />
            <XAxis dataKey="label" stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }} />
            <YAxis yAxisId="rate" stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }} unit="%" />
            <YAxis yAxisId="index" orientation="right" stroke="#71717a" tick={{ fill: "#71717a", fontSize: 11, fontFamily: "monospace" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "0.375rem",
                color: "#fafafa",
                fontFamily: "monospace",
                fontSize: "11px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif", paddingTop: "8px" }}
            />
            <Line
              yAxisId="index"
              type="monotone"
              dataKey="cpiIndex"
              name="CPI index"
              stroke="#09090b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="CPI change (YoY)"
              stroke="#d97706"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="CPI change (MoM)"
              stroke="#0f766e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-zinc-500 font-mono gap-1">
        <span>UN CPI index · YoY and MoM changes</span>
        <span>Source: United Nations Statistics Division</span>
      </div>
    </div>
  );
}
