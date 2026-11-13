"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, LogOut, FileSpreadsheet } from "lucide-react";

interface Props {
  onExportCsv?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function TerminalHeader({ onExportCsv, onRefresh, isRefreshing }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50" style={{ fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Data-source status strip */}
      <div
        className="px-5 py-2 flex items-center justify-between text-[11px] font-mono overflow-x-auto whitespace-nowrap"
        style={{ background: "#000", borderBottom: "1px solid #1a1a1d" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-bold uppercase tracking-wider text-[#f5f5f7]">Source-linked CPI readings</span>
          </div>
          <div className="flex items-center gap-5" style={{ color: "#6e6e73" }}>
            <span>Monthly CPI observations</span>
            <span>Food/core figures are not connected</span>
          </div>
        </div>
        <span className="hidden md:block" style={{ color: "#3a3a3d" }}>
          SOURCE: UNITED NATIONS STATISTICS DIVISION
        </span>
      </div>

      {/* Main Nav Bar */}
      <div
        style={{
          background: "rgba(0,0,0,0.80)",
          backdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 h-[52px] flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-sm text-[#f5f5f7]">
              <div className="w-[22px] h-[22px] bg-[#ff6a2b] rounded-[5px] flex items-center justify-center text-black font-black text-xs">
                ₦
              </div>
              <span>NGN Inflation Terminal</span>
            </Link>
            <span style={{ color: "#2a2a2d" }}>/</span>
            <span className="hidden sm:inline text-[12px]" style={{ color: "#6e6e73" }}>UN CPI reference data</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh Data"
                className="p-2 rounded-[8px] transition"
                style={{ color: "#6e6e73", border: "1px solid #222226", background: "#111113" }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#ff6a2b]" : ""}`} />
              </button>
            )}

            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition"
                style={{ color: "#a1a1a6", border: "1px solid #222226", background: "#111113" }}
                title="Export CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            <div className="w-px h-4 mx-1" style={{ background: "#222226" }} />

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono hidden md:inline" style={{ color: "#6e6e73" }}>
                  {user.email.split("@")[0]}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-[8px] transition"
                  style={{ color: "#6e6e73" }}
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 hover:text-rose-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-[13px] font-medium transition px-2"
                  style={{ color: "#a1a1a6" }}
                >
                  Sign In
                </Link>
                <Link href="/register" className="pstacks-btn text-[12px] px-4 py-1.5">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
