"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Database, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type AdminOverview = {
  userCount: number;
  adminCount: number;
  totalCalculations: number;
  generatedAt: string;
  recentUsers: Array<{
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    createdAt: string;
  }>;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/admin/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token || !user || user.role !== "ADMIN") return;

    const loadOverview = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Admin access is unavailable right now.");
        }

        const payload = await res.json();
        setOverview(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load admin stats.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [token, user]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Checking admin access…</div>;
  }

  return (
    <AppLayout title="Naira Tracker / Admin" subtitle="Restricted operations console">
      <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#df542c]">Admin access</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em] text-[#191a19]">Platform administration</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e2d9] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-stone-600">
          <ShieldCheck size={14} /> Hidden from end users
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {!loading && overview && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Users" value={String(overview.userCount)} hint="Accounts in the platform" />
          <StatCard icon={ShieldCheck} label="Admins" value={String(overview.adminCount)} hint="Privileged operators" />
          <StatCard icon={Database} label="Saved calculations" value={String(overview.totalCalculations)} hint="Stored forecast records" />
          <StatCard icon={TrendingUp} label="Updated" value={new Date(overview.generatedAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })} hint="Snapshot timestamp" />
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 text-base font-semibold text-[#191a19]">
          <Activity size={16} /> Recent user activity
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-[#efeee9]">
          <table className="min-w-full divide-y divide-[#efeee9] text-left text-sm">
            <thead className="bg-[#f8f7f5] text-[10px] uppercase tracking-[.14em] text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeee9]">
              {overview?.recentUsers.length ? (
                overview.recentUsers.map((person) => (
                  <tr key={person.id} className="hover:bg-[#faf9f6]">
                    <td className="px-4 py-3 font-medium text-[#191a19]">{person.name}</td>
                    <td className="px-4 py-3 text-stone-600">{person.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${person.role === "ADMIN" ? "bg-[#fff3e8] text-[#a65918]" : "bg-[#edf7ef] text-[#2d6a3f]"}`}>
                        {person.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">{new Date(person.createdAt).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-stone-500">No users have signed up yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-[#e9e8e4] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-stone-500">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f1] text-stone-700">
          <Icon size={15} />
        </span>
      </div>
      <div className="mt-6 text-3xl font-semibold tracking-[-.055em] text-[#191a19]">{value}</div>
      <div className="mt-2 text-[11px] text-stone-500">{hint}</div>
    </article>
  );
}
