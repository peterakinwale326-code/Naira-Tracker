"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(255,255,255,0.82)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.08)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-12 sm:h-14">
          
          {/* Apple-style minimalist logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-semibold text-xs tracking-tight">
              ₦
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#1d1d1f]">
              Naira<span className="text-[#86868b] font-normal">Tracker</span>
            </span>
          </Link>

          {/* Desktop Nav Links (Apple minimal navigation) */}
          <div className="hidden md:flex items-center gap-7 text-[12px] font-normal text-[#1d1d1f]/80">
            <Link href="/#features" className="hover:text-[#0071e3] transition-colors">
              Overview
            </Link>
            <Link href="/#calculator" className="hover:text-[#0071e3] transition-colors">
              Calculator
            </Link>
            <Link href="/#trends" className="hover:text-[#0071e3] transition-colors">
              CPI Index
            </Link>
            <Link href="/#pricing" className="hover:text-[#0071e3] transition-colors">
              Pricing
            </Link>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#1d1d1f] bg-[#f5f5f7] border border-[rgba(0,0,0,0.08)] hover:bg-[#e8e8ed] transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#0071e3]" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-[11px] text-[#1d1d1f]">
                  <div className="w-4 h-4 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[9px] font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-normal text-[#1d1d1f] hover:text-[#0071e3] px-2.5 py-1 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98] transition-all duration-150 shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#1d1d1f]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(0,0,0,0.08)] bg-white/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2.5 text-xs text-[#1d1d1f]">
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>Overview</Link>
            <Link href="/#calculator" onClick={() => setMobileMenuOpen(false)}>Calculator</Link>
            <Link href="/#trends" onClick={() => setMobileMenuOpen(false)}>CPI Index</Link>
            <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          </div>

          <div className="pt-3 border-t border-[rgba(0,0,0,0.08)]">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium bg-[#0071e3] text-white"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-1.5 text-xs text-[#86868b]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs text-[#1d1d1f] bg-[#f5f5f7] rounded-full"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-medium bg-[#0071e3] text-white rounded-full"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
