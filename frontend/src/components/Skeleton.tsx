"use client";
import React from "react";

export function MetricCardSkeleton() {
  return (
    <div className="skeleton rounded-[16px] h-[120px]" />
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-[18px] p-5" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-5 w-48 rounded-[6px]" />
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-7 w-10 rounded-[8px]" />)}
        </div>
      </div>
      <div className="skeleton rounded-[12px] h-72" />
      <div className="skeleton h-4 w-72 rounded-[6px] mt-4" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="glass rounded-[18px] overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="skeleton h-5 w-40 rounded-[6px]" />
        <div className="skeleton h-3 w-64 rounded-[6px] mt-2" />
      </div>
      <div className="p-4 space-y-2">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="skeleton h-11 rounded-[8px]" />
        ))}
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="glass rounded-[18px] p-6 space-y-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="skeleton h-5 w-48 rounded-[6px]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-10 rounded-[10px]" />
        <div className="skeleton h-10 rounded-[10px]" />
      </div>
      <div className="skeleton h-10 rounded-[10px]" />
      <div className="skeleton h-24 rounded-[12px]" />
      <div className="skeleton h-10 rounded-[10px]" />
    </div>
  );
}
