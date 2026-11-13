"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3,
  Calculator, CalendarDays, RefreshCw, ShoppingBasket, Wallet
} from "lucide-react";

type Metrics = {
  cpiYearOverYearRate?: number;
  cpiMonthOverMonthRate?: number;
  foodRate?: number;
  coreRate?: number;
  cpiIndex?: number;
  year?: number;
  month?: number;
  period?: string;
  indexBase?: string;
  source?: string;
  [key: string]: unknown;
};

type AssistantSource = { title: string; url: string };
type DashboardMessage = { role: "assistant" | "user"; text: string; sources?: AssistantSource[] };

const formatPercent = (value?: number) => typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) + "%" : "—";
const formatNumber = (value?: number) => typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—";

function DashboardAssistantCard() {
  const [messages, setMessages] = useState<DashboardMessage[]>([
    {
      role: "assistant",
      text: "Hi — I can help interpret Nigeria’s inflation data, compare CPI sources, and explain what a price change means for household budgets."
    }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState("Gemini · server-side");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const submitQuestion = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    const nextMessages: DashboardMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const history = nextMessages.slice(-20, -1).map((message) => ({
        role: message.role,
        content: message.text,
      }));

      const response = await fetch(API_BASE_URL + "/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "The AI assistant is currently unavailable.");
      }

      const sources = Array.isArray(data?.sources)
        ? data.sources.filter((source: AssistantSource) => typeof source?.title === "string" && typeof source?.url === "string")
        : [];

      setProvider(data?.providerLabel || "Gemini · server-side");
      setMessages((current) => [...current, { role: "assistant", text: data?.answer || "I do not have a reliable answer for that yet.", sources }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not respond.");
      setMessages((current) => [...current, { role: "assistant", text: err instanceof Error ? err.message : "The assistant could not respond right now." }]);
    } finally {
      setBusy(false);
    }
  }, [busy, messages]);

  const examples = [
    "What is the latest inflation trend in Nigeria?",
    "How does inflation affect ₦100,000?",
    "Compare NBS and World Bank inflation data",
    "What should I watch in the next CPI release?"
  ];

  return (
    <article className="mt-4 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efeee9] pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#df542c]">AI RESEARCH ASSISTANT</div>
          <h2 className="mt-2 text-base font-semibold tracking-tight text-[#191a19]">Ask Naira Tracker</h2>
        </div>
        <div className="rounded-full bg-[#f4f4f1] px-3 py-1.5 text-[10px] font-semibold text-stone-600">{provider}</div>
      </div>

      <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={message.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-sm bg-[#191a19] px-4 py-3 text-sm leading-6 text-white" : "max-w-[85%] rounded-2xl rounded-bl-sm bg-[#f5f3ef] px-4 py-3 text-sm leading-6 text-[#1d1d1b]"}>
              <div className="whitespace-pre-wrap">{message.text}</div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 border-t border-black/5 pt-2">
                  <div className="mb-2 text-[10px] uppercase tracking-[.12em] text-stone-500">Sources</div>
                  <div className="space-y-1">
                    {message.sources.map((source, sourceIndex) => (
                      <a key={`${source.url}-${sourceIndex}`} href={source.url} target="_blank" rel="noreferrer" className="block text-[11px] text-stone-600 underline underline-offset-2 hover:text-[#df542c]">
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-[#f5f3ef] px-4 py-3 text-xs text-stone-500">Thinking… checking CPI context and web sources when needed.</div>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setInput(example)}
            className="rounded-full border border-[#e6e2d9] px-3 py-1.5 text-[10px] text-stone-600 transition hover:bg-stone-50"
          >
            {example}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitQuestion(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about inflation, budgets, or Nigeria’s price data…"
          className="min-w-0 flex-1 rounded-full border border-[#e6e2d9] bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-[#d8c49c]"
          aria-label="Ask an inflation question"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="rounded-full bg-[#191a19] px-4 py-3 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </article>
  );
}

function MetricCard({ label, value, note, icon: Icon, accent = false }: {
  label: string; value: string; note: string; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-5 min-w-0 ${accent ? "bg-[#e95024] border-[#e95024] text-white" : "bg-white border-[#e9e8e4] text-[#191a19]"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-medium ${accent ? "text-white/80" : "text-stone-500"}`}>{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-full ${accent ? "bg-white/15" : "bg-[#f3f3f1] text-stone-700"}`}><Icon size={15}/></span>
      </div>
      <div className="mt-7 text-[clamp(27px,3vw,38px)] font-semibold tracking-[-.055em] tabular-nums">{value}</div>
      <div className={`mt-2 text-[11px] ${accent ? "text-white/75" : "text-stone-500"}`}>{note}</div>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, savedCalculations } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [nbsReleases, setNbsReleases] = useState<{ releases?: { title: string; downloadUrl: string }[] } | null>(null);
  const [worldBank, setWorldBank] = useState<{ observations?: { year: number; value: number }[] } | null>(null);
  const [unReference, setUnReference] = useState<{ dataXml?: string; sourceUrl?: string; fromYear?: number; toYear?: number } | null>(null);
  const [sourceErrors, setSourceErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(API_BASE_URL + "/api/v1/inflation/latest", { cache: "no-store" });
      if (!response.ok) throw new Error("Inflation data is currently unavailable (HTTP " + response.status + ").");
      const payload = await response.json();
      setMetrics(payload?.data || payload?.metrics || payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the data service.");
      setMetrics(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.allSettled([
      fetch(API_BASE_URL + "/api/v1/statistics/nbs/cpi/releases", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("NBS unavailable"); return r.json(); }),
      fetch(API_BASE_URL + "/api/v1/statistics/world-bank?indicator=FP.CPI.TOTL.ZG&from=2000", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("World Bank unavailable"); return r.json(); }),
      fetch(API_BASE_URL + "/api/v1/statistics/un/cpi?from=2015", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("UN unavailable"); return r.json(); }),
    ]).then(results => {
      if (!active) return;
      const errors: string[] = [];
      if (results[0].status === "fulfilled") setNbsReleases(results[0].value); else errors.push("NBS");
      if (results[1].status === "fulfilled") setWorldBank(results[1].value); else errors.push("World Bank");
      if (results[2].status === "fulfilled") setUnReference(results[2].value); else errors.push("UN");
      setSourceErrors(errors);
    });
    return () => { active = false; };
  }, [user]);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";
  const period = metrics?.period || (metrics?.month && metrics?.year ? `${metrics.month}/${metrics.year}` : "Reporting period unavailable");
  const comparison = useMemo(() => [
    { label: "CPI change · year over year", value: metrics?.cpiYearOverYearRate, color: "#e95024", icon: Activity },
    { label: "CPI change · month over month", value: metrics?.cpiMonthOverMonthRate, color: "#222321", icon: BarChart3 },
    { label: "NBS food inflation", value: metrics?.foodRate, color: "#b7a17a", icon: ShoppingBasket },
    { label: "NBS core inflation", value: metrics?.coreRate, color: "#b7a17a", icon: ShoppingBasket },
  ], [metrics]);
  const largest = Math.max(0, ...comparison.map(item => typeof item.value === "number" ? item.value : 0));

  if (authLoading || (!user && !authLoading)) {
    return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Loading your workspace…</div>;
  }

  return (
    <AppLayout>
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#df542c]">{period}</div>
          <h1 className="mt-2 text-3xl sm:text-[40px] font-semibold tracking-[-.055em] text-[#191a19]">Good morning, {firstName}.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Your view of Nigeria’s prices, inflation and purchasing power — with the source period kept in sight.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/explorer" className="inline-flex items-center gap-2 rounded-full border border-[#e5e4df] bg-white px-4 py-2.5 text-xs font-semibold hover:bg-stone-50"><BarChart3 size={14}/> Explore data</Link>
          <Link href="/calculator" className="inline-flex items-center gap-2 rounded-full bg-[#191a19] px-4 py-2.5 text-xs font-semibold text-white hover:bg-black"><Calculator size={14}/> New calculation</Link>
          <button onClick={() => { setRefreshing(true); load(); }} disabled={refreshing} className="inline-flex items-center gap-2 rounded-full border border-[#e5e4df] bg-white px-3 py-2.5 text-xs font-semibold hover:bg-stone-50 disabled:opacity-50" aria-label="Refresh inflation data"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""}/></button>
        </div>
      </div>

      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4"><div className="text-sm font-semibold text-red-900">Latest inflation data could not be loaded.</div><p className="mt-1 text-xs text-red-800">{error} No figures are substituted or estimated.</p><button onClick={() => { setRefreshing(true); load(); }} className="mt-3 text-xs font-semibold underline">Try again</button></div>}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article className="xl:col-span-7 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
          <div><div className="text-xs font-medium text-stone-500">CPI change vs the same month last year</div><p className="mt-1 text-[11px] text-stone-400">UN monthly CPI index · {period}</p></div>
          <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wide ${loading ? "bg-stone-100 text-stone-500" : metrics ? "bg-[#eaf3ed] text-[#32734a]" : "bg-stone-100 text-stone-500"}`}>{loading ? "UPDATING" : metrics ? "UN MBS DATA" : "NO DATA"}</span>
          </div>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-5xl sm:text-6xl font-semibold tracking-[-.07em] tabular-nums">{loading ? "…" : formatPercent(metrics?.cpiYearOverYearRate)}</div><p className="mt-3 text-xs text-stone-500">UN CPI index change (year over year)</p></div>
            <div className="w-full max-w-[230px] rounded-xl bg-[#f5f5f2] p-4">
              <div className="text-[10px] uppercase tracking-[.13em] text-stone-500">UN CPI index</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{loading ? "…" : formatNumber(metrics?.cpiIndex)}</div>
              <div className="mt-1 text-[10px] text-stone-400">{metrics?.indexBase || "Index base not supplied"}</div>
            </div>
          </div>
          <div className="mt-8 border-t border-[#efeee9] pt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-stone-400">
            <span>PERIOD: {period}</span><span>SOURCE: {metrics?.source ? String(metrics.source) : "Source metadata not supplied"}</span>
          </div>
        </article>

        <article className="xl:col-span-5 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold tracking-tight">Inflation breakdown</h2><p className="mt-1 text-[11px] text-stone-500">Compare the latest available categories</p></div><span className="grid h-8 w-8 place-items-center rounded-full bg-[#f4f4f1]"><Activity size={15}/></span></div>
          <div className="mt-7 space-y-6">
            {comparison.map(({label,value,color,icon:Icon}) => {
              const width = typeof value === "number" && largest > 0 ? Math.max(2, (value / largest) * 100) : 0;
              return <div key={label}><div className="mb-2 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-stone-600"><Icon size={14}/>{label}</span><strong className="text-sm tabular-nums">{loading ? "…" : formatPercent(value)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#f0f0ed]"><div className="h-full rounded-full transition-all" style={{ width: loading ? "0%" : width + "%", backgroundColor: color }}/></div></div>;
            })}
          </div>
          <p className="mt-7 border-t border-[#efeee9] pt-4 text-[10px] leading-5 text-stone-400">Bars compare the values returned for this reporting period; they are not a historical trend.</p>
        </article>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="CPI month-over-month" value={loading ? "…" : formatPercent(metrics?.cpiMonthOverMonthRate)} note="Calculated from UN monthly index" icon={Activity} accent/>
        <MetricCard label="NBS food inflation" value={loading ? "…" : formatPercent(metrics?.foodRate)} note="Unavailable from the connected UN source" icon={ShoppingBasket}/>
        <MetricCard label="NBS core inflation" value={loading ? "…" : formatPercent(metrics?.coreRate)} note="Unavailable from the connected UN source" icon={BarChart3}/>
      </section>

      <DashboardAssistantCard />

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <article className="xl:col-span-7 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold tracking-tight">Your research desk</h2><p className="mt-1 text-[11px] text-stone-500">Tools to understand what changing prices mean in practice.</p></div><span className="text-[10px] uppercase tracking-[.14em] text-stone-400">TOOLS</span></div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {href:"/money-lab",title:"Money Lab",desc:"Stress-test your budget, protect salary, and track personal prices privately.",icon:Wallet},
              {href:"/calculator",title:"Purchasing power",desc:"Compare what money could buy across years.",icon:Calculator},
              {href:"/salary-check",title:"Salary audit",desc:"Check how pay has changed against inflation.",icon:Wallet},
              {href:"/commodities",title:"Market prices",desc:"Explore food and household price movements.",icon:ShoppingBasket},
              {href:"/explorer",title:"Inflation explorer",desc:"Inspect published CPI series and periods.",icon:Activity},
            ].map(({href,title,desc,icon:Icon})=><Link key={href} href={href} className="group rounded-xl border border-[#ecebe7] p-4 transition-colors hover:border-[#e95024]/40 hover:bg-[#faf9f6]"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f4f1] text-stone-700"><Icon size={17}/></span><ArrowRight size={15} className="text-stone-400 transition-transform group-hover:translate-x-1"/></div><h3 className="mt-5 text-sm font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-stone-500">{desc}</p></Link>)}
          </div>
        </article>

        <article className="xl:col-span-5 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold tracking-tight">Saved calculations</h2><p className="mt-1 text-[11px] text-stone-500">Your recent personal research</p></div><Link href="/scenarios" className="text-xs font-semibold text-stone-600 underline underline-offset-4">View all</Link></div>
          {savedCalculations.length === 0 ? <div className="py-10 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f4f4f1] text-stone-600"><CalendarDays size={18}/></div><p className="mt-3 text-sm font-semibold">Nothing saved yet</p><p className="mx-auto mt-1 max-w-[230px] text-xs leading-5 text-stone-500">Save a purchasing-power calculation and it will appear here.</p><Link href="/calculator" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#191a19] px-4 py-2.5 text-xs font-semibold text-white">Start calculating <ArrowRight size={13}/></Link></div> : <div className="mt-3 divide-y divide-[#efeee9]">{savedCalculations.slice(0,5).map(item=><div key={item.id} className="flex items-center justify-between gap-3 py-4"><div className="min-w-0"><div className="truncate text-xs font-semibold">{item.title}</div><div className="mt-1 text-[10px] text-stone-400">{item.baseYear} <ArrowRight className="mx-1 inline" size={10}/> {item.targetYear}</div></div><div className="shrink-0 text-right"><div className="text-sm font-semibold tabular-nums">₦{item.equivalentAmount.toLocaleString("en-NG")}</div><div className="text-[10px] text-stone-400">equivalent value</div></div></div>)}</div>}
        </article>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e9e8e4] bg-[#f0f0ed] p-5"><div className="flex items-center gap-2 text-xs font-semibold"><ArrowUpRight size={15}/> Read the rate carefully</div><p className="mt-2 text-xs leading-6 text-stone-600">Inflation measures the rate at which prices change. It is not a direct measure of every household’s personal cost of living. Compare categories and reporting periods before drawing conclusions.</p></div>
        <div className="rounded-2xl border border-[#e9e8e4] bg-white p-5"><div className="flex items-center gap-2 text-xs font-semibold"><ArrowDownRight size={15}/> Follow the source</div><p className="mt-2 text-xs leading-6 text-stone-500">UN CPI index changes are separate from NBS headline, food and core inflation rates. Where the connected source does not publish a figure, Naira Tracker leaves it blank rather than inventing one.</p></div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-base font-semibold tracking-tight">Official statistics & independent checks</h2><p className="mt-1 text-[11px] text-stone-500">Three public sources, with publisher, frequency and reference period kept separate.</p></div>
          <span className="rounded-full bg-[#f4f4f1] px-3 py-1.5 text-[10px] font-semibold text-stone-600">NO API KEYS</span>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <article className="rounded-xl border border-[#ecebe7] bg-[#faf9f6] p-4">
            <div className="text-xs font-semibold">National Bureau of Statistics</div><div className="mt-1 text-[10px] uppercase tracking-wide text-[#df542c]">Primary · monthly CPI</div>
            <p className="mt-3 text-xs leading-5 text-stone-600">Official CPI publication archive. NBS remains the publisher of headline, food and core inflation.</p>
            <p className="mt-3 text-[11px] font-semibold">{nbsReleases?.releases?.length ? nbsReleases.releases.length + " release download links discovered" : "Release catalogue not yet retrieved"}</p>
            {nbsReleases?.releases?.slice(0,2).map((r,i)=><a key={i} href={r.downloadUrl} target="_blank" rel="noreferrer" className="mt-2 block break-words text-[10px] text-stone-500 underline">{r.title}</a>)}
            <a className="mt-3 inline-block text-[10px] font-semibold underline" href="https://microdata.nigerianstat.gov.ng/index.php/catalog/154/related-materials" target="_blank" rel="noreferrer">Open original NBS catalogue</a>
          </article>
          <article className="rounded-xl border border-[#ecebe7] bg-[#faf9f6] p-4">
            <div className="text-xs font-semibold">World Bank Indicators</div><div className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">Secondary · annual macro data</div>
            <p className="mt-3 text-xs leading-5 text-stone-600">Annual consumer-price inflation series for long-run context; not a substitute for monthly NBS CPI.</p>
            <p className="mt-3 text-[11px] font-semibold">{worldBank?.observations?.length ? worldBank.observations.length + " annual observations" : "Annual series unavailable"}</p>
            {worldBank?.observations?.length ? <p className="mt-1 text-[10px] text-stone-500">Latest: {worldBank.observations[worldBank.observations.length-1].year} · {worldBank.observations[worldBank.observations.length-1].value.toFixed(2)}%</p> : null}
            <a className="mt-3 inline-block text-[10px] font-semibold underline" href="https://api.worldbank.org/v2/country/NGA/indicator/FP.CPI.TOTL.ZG?format=json" target="_blank" rel="noreferrer">Open World Bank series</a>
          </article>
          <article className="rounded-xl border border-[#ecebe7] bg-[#faf9f6] p-4">
            <div className="text-xs font-semibold">UN Statistics Division</div><div className="mt-1 text-[10px] uppercase tracking-wide text-stone-500">Independent · monthly CPI reference</div>
            <p className="mt-3 text-xs leading-5 text-stone-600">A separate international CPI index series. Its index base and footnotes must remain separate from NBS values.</p>
            <p className="mt-3 text-[11px] font-semibold">{unReference?.dataXml ? "Reference response received · " + unReference.fromYear + "–" + unReference.toYear : "UN reference series unavailable"}</p>
            <a className="mt-3 inline-block text-[10px] font-semibold underline" href={unReference?.sourceUrl || "https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099"} target="_blank" rel="noreferrer">Open UN data reference</a>
          </article>
        </div>
        {sourceErrors.length > 0 && <p className="mt-3 text-[10px] text-amber-700">Some source checks could not load: {sourceErrors.join(", ")}. Missing observations are not estimated.</p>}
        <p className="mt-4 border-t border-[#efeee9] pt-3 text-[10px] leading-5 text-stone-400">Method note: World Bank is annual; NBS and UN are monthly. Do not splice index levels across different base years or methodology breaks.</p>
      </section>
    </AppLayout>
  );
}
