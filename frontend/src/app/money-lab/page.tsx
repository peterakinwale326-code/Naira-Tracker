"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, ArrowDown, ArrowUp, Download, FileUp, Gauge, Lightbulb,
  LineChart, LockKeyhole, Plus, RotateCcw, Send, ShieldAlert, Trash2, Wallet,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import {
  CATEGORY_LABELS, MONEY_LAB_STORAGE_KEY,
  calculatePriceChange, compareCpiSnapshots, createDefaultMoneyLabState, parseMoneyLabState,
  projectAnnualExpense, readMoneyLabState, weightedInflation,
  type BudgetCategory, type CpiObservation, type MoneyLabState, type PriceEntry,
} from "@/lib/money-lab";

type TrendResponse = CpiObservation[];

const money = (value: number) => Number.isFinite(value) ? `₦${Math.round(value).toLocaleString("en-NG")}` : "—";
const percent = (value: number | null) => value === null || !Number.isFinite(value) ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const categoryOrder: BudgetCategory[] = ["food", "transport", "housing", "other"];
const cardClass = "rounded-2xl border border-[#e9e8e4] bg-white p-5 sm:p-6";
const inputClass = "w-full rounded-lg border border-[#ddd9cf] bg-white px-3 py-2.5 text-sm text-[#171713] outline-none focus:border-[#b38a45] focus:ring-2 focus:ring-[#b38a45]/15";

function monthNumber(period: string) {
  const [year, month] = period.split("-").map(Number);
  return year * 12 + month;
}

function Button({ children, onClick, type = "button", disabled = false, secondary = false }: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; secondary?: boolean;
}) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${secondary ? "border border-[#e5e1d7] bg-white text-[#34342e] hover:bg-stone-50" : "bg-[#191a19] text-white hover:bg-black"}`}>{children}</button>;
}

export default function MoneyLabPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<MoneyLabState | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [trends, setTrends] = useState<TrendResponse>([]);
  const [loadingCpi, setLoadingCpi] = useState(true);
  const [cpiError, setCpiError] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState("");
  const [basePeriod, setBasePeriod] = useState("");
  const [targetPeriod, setTargetPeriod] = useState("");
  const [amount, setAmount] = useState("100000");
  const [salary, setSalary] = useState("");
  const [diaryItem, setDiaryItem] = useState("");
  const [diaryCategory, setDiaryCategory] = useState<BudgetCategory>("food");
  const [diaryPrice, setDiaryPrice] = useState("");
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().slice(0, 10));
  const [diaryError, setDiaryError] = useState<string | null>(null);
  const [analystQuestion, setAnalystQuestion] = useState("");
  const [analystAnswer, setAnalystAnswer] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user?.id) {
      setState(null);
      setStorageReady(false);
      return;
    }
    try {
      setState(readMoneyLabState(window.localStorage.getItem(`${MONEY_LAB_STORAGE_KEY}:${user.id}`)));
    } catch (error) {
      setFileError(error instanceof Error ? `Saved local data could not be read: ${error.message}` : "Saved local data could not be read.");
      setState(null);
    } finally {
      setStorageReady(true);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!storageReady || !state || !user?.id) return;
    try {
      window.localStorage.setItem(`${MONEY_LAB_STORAGE_KEY}:${user.id}`, JSON.stringify(state));
    } catch {
      setFileError("Your browser could not save Money Lab data. Export a backup before leaving this page.");
    }
  }, [state, storageReady, user?.id]);

  useEffect(() => {
    if (!storageReady || !state) return;
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/v1/inflation/trends`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`CPI readings could not be loaded (HTTP ${response.status}).`);
        return response.json() as Promise<TrendResponse>;
      })
      .then(rows => {
        if (!Array.isArray(rows) || !rows.every(row =>
          typeof row.period === "string" && Number.isFinite(row.cpiIndex) && typeof row.indexBase === "string"
        )) throw new Error("The CPI service returned an unsupported data format.");
        const ordered = [...rows].sort((a, b) => a.period.localeCompare(b.period));
        setTrends(ordered);
        const nextSnapshot = ordered.map(({ period, year, month, cpiIndex, indexBase, source, sourceUrl }) =>
          ({ period, year, month, cpiIndex, indexBase, source, sourceUrl }));
        setState(current => current ? ({
          ...current,
          cpiSnapshot: nextSnapshot,
          snapshotCapturedAt: new Date().toISOString(),
          revisionNotice: current.cpiSnapshot.length
            ? compareCpiSnapshots(current.cpiSnapshot, nextSnapshot)
            : current.revisionNotice,
        }) : current);
        setCpiError(null);
      })
      .catch(error => {
        if (!controller.signal.aborted) setCpiError(error instanceof Error ? error.message : "Could not load CPI data.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCpi(false);
      });
    return () => controller.abort();
  }, [state?.version, storageReady]);

  const indexBases = useMemo(() => Array.from(new Set(trends.map(row => row.indexBase))), [trends]);
  const latestBase = trends[trends.length - 1]?.indexBase || "";
  const activeBase = indexBases.includes(selectedBase) ? selectedBase : latestBase;
  const comparableRows = useMemo(
    () => trends.filter(row => row.indexBase === activeBase),
    [activeBase, trends],
  );
  const baseObservation = comparableRows.find(row => row.period === basePeriod) || comparableRows[0];
  const targetObservation = comparableRows.find(row => row.period === targetPeriod) || comparableRows[comparableRows.length - 1];
  const parsedAmount = Number(amount);
  const timeMachineResult = Number.isFinite(parsedAmount) && parsedAmount > 0 && baseObservation && targetObservation && baseObservation.cpiIndex > 0
    ? parsedAmount * targetObservation.cpiIndex / baseObservation.cpiIndex
    : null;

  useEffect(() => {
    if (!comparableRows.length) return;
    if (!comparableRows.some(row => row.period === basePeriod)) setBasePeriod(comparableRows[0].period);
    if (!comparableRows.some(row => row.period === targetPeriod)) setTargetPeriod(comparableRows[comparableRows.length - 1].period);
  }, [basePeriod, comparableRows, targetPeriod]);

  const personalInflation = state
    ? weightedInflation(state.monthlyExpenses, state.annualRates)
    : null;
  const monthlySpend = state
    ? categoryOrder.reduce((sum, category) => sum + state.monthlyExpenses[category], 0)
    : 0;
  const projectedMonthlySpend = state
    ? categoryOrder.reduce((sum, category) => sum + projectAnnualExpense(state.monthlyExpenses[category], state.annualRates[category], state.scenarioYears), 0)
    : 0;
  const projectedRemaining = state ? state.monthlyIncome - projectedMonthlySpend : 0;
  const salaryProtection = salary && Number.isFinite(Number(salary)) && baseObservation && targetObservation && baseObservation.period !== targetObservation.period && baseObservation.cpiIndex > 0
    ? Number(salary) * targetObservation.cpiIndex / baseObservation.cpiIndex
    : null;
  const salaryGap = salaryProtection === null ? null : salaryProtection - Number(salary);
  const chartRows = comparableRows.filter(row => row.period <= (targetObservation?.period || ""));
  const chartValues = chartRows.map(row => row.cpiIndex);
  const chartMin = Math.min(...chartValues, 0);
  const chartMax = Math.max(...chartValues, 1);
  const chartPoints = chartRows.map((row, index) => {
    const x = chartRows.length < 2 ? 50 : index / (chartRows.length - 1) * 100;
    const y = 90 - ((row.cpiIndex - chartMin) / (chartMax - chartMin || 1)) * 80;
    return `${x},${y}`;
  }).join(" ");

  const persist = (update: (current: MoneyLabState) => MoneyLabState) => {
    setState(current => current ? update(current) : current);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 1800);
  };

  const addDiaryEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const price = Number(diaryPrice);
    if (!diaryItem.trim() || !Number.isFinite(price) || price <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(diaryDate)) {
      setDiaryError("Enter an item, a positive price, and a valid observation date.");
      return;
    }
    setDiaryError(null);
    persist(current => ({
      ...current,
      priceDiary: [{
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        item: diaryItem.trim().slice(0, 100),
        category: diaryCategory,
        price,
        date: diaryDate,
      }, ...current.priceDiary].slice(0, 5000),
    }));
    setDiaryItem("");
    setDiaryPrice("");
  };

  const exportBackup = () => {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `naira-tracker-money-lab-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFileError(null);
  };

  const importBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      setFileError("Backup file is too large (maximum 1 MB).");
      return;
    }
    try {
      const restored = parseMoneyLabState(JSON.parse(await file.text()));
      setState(restored);
      setFileError(null);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 1800);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Could not import that backup.");
    }
  };

  const answerAnalyst = (event: React.FormEvent) => {
    event.preventDefault();
    const question = analystQuestion.trim().toLowerCase();
    if (!question) return;
    const latest = trends[trends.length - 1];
    let response: string;
    if (/salary|pay|wage|raise|protect/.test(question)) {
      response = salaryProtection === null
        ? "Enter a salary and choose comparable CPI periods in the Time Machine section. I can calculate the CPI-adjusted salary from those index values."
        : `Using the selected ${baseObservation?.period}–${targetObservation?.period} CPI index ratio, ${money(Number(salary))} would need to be about ${money(salaryProtection)} to match the index change. The gap is ${money(Math.max(0, salaryGap || 0))}. This is a CPI-based comparison, not a wage forecast.`;
    } else if (/budget|basket|spend|household|stress/.test(question)) {
      response = personalInflation === null
        ? "Add monthly spending amounts and scenario rates to the Budget Stress Test. The estimated basket change is weighted by your entered spending; it is not an official CPI rate."
        : `Your entered budget totals ${money(monthlySpend)} per month. Under your own category assumptions, its weighted annual scenario is ${percent(personalInflation)}; after ${state?.scenarioYears} year(s), projected monthly spending is ${money(projectedMonthlySpend)}. These are scenario calculations, not a forecast.`;
    } else if (/diary|price|receipt|record/.test(question)) {
      response = `Your on-device diary contains ${state?.priceDiary.length || 0} manually entered price observations. Entries are personal notes and are not independently verified or used as national market prices.`;
    } else if (/source|revision|period|provenance/.test(question)) {
      response = latest
        ? `The latest loaded observation is ${latest.period}: index ${latest.cpiIndex.toLocaleString("en-NG")} (${latest.indexBase}), from ${latest.source || "the connected CPI source"}. ${state?.snapshotCapturedAt ? `This browser last compared a source snapshot at ${new Date(state.snapshotCapturedAt).toLocaleString()}.` : "There is no earlier local snapshot to compare."} Check the original source link below the provenance section.`
        : "CPI data is not loaded right now. I won't invent a value; try refreshing the page when the connected first-party data endpoint is available.";
    } else if (/inflation|cpi|index|time|value|naira/.test(question)) {
      response = latest
        ? `The latest loaded CPI observation is ${latest.period}, with index ${latest.cpiIndex.toLocaleString("en-NG")} (${latest.indexBase}). An index level is not an inflation rate; compare matching periods within the same index base. This reference series is separate from NBS headline, food and core rates.`
        : "CPI data is not available in this browser session. I won't substitute a figure.";
    } else {
      response = "I’m a local, rule-based Money Lab analyst—not a general LLM. Ask about the loaded CPI source, your entered budget, salary comparison, or personal price diary. Your question is processed in this browser.";
    }
    setAnalystAnswer(response);
    setAnalystQuestion("");
  };

  if (authLoading || !user || !storageReady) {
    return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Loading your private Money Lab…</div>;
  }
  if (!state) {
    return <AppLayout title="Money Lab" subtitle="Your local data needs attention.">
      <div role="alert" className="nt-card max-w-2xl border-amber-200 bg-amber-50">
        <h1 className="text-lg font-semibold">Could not load your local Money Lab data</h1>
        <p className="mt-2 text-sm leading-6 text-amber-900">{fileError || "The saved data is unreadable. You can start with a clean local workspace; this will replace the damaged Money Lab entry for this account in this browser."}</p>
        <button type="button" className="nt-button mt-4" onClick={() => {
          window.localStorage.removeItem(`${MONEY_LAB_STORAGE_KEY}:${user.id}`);
          setFileError(null);
          setState(createDefaultMoneyLabState());
        }}>Start a clean local workspace</button>
      </div>
    </AppLayout>;
  }

  const groupedDiary = new Map<string, PriceEntry[]>();
  for (const entry of state.priceDiary) {
    const key = entry.item.toLocaleLowerCase();
    groupedDiary.set(key, [...(groupedDiary.get(key) || []), entry]);
  }

  return (
    <AppLayout title="Money Lab" subtitle="Local-first tools to model how prices affect your household.">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="nt-eyebrow">Personal tools · private by design</div>
          <h1 className="nt-heading">Your Money Lab</h1>
          <p className="nt-subtitle max-w-3xl">Model purchasing power, household budgets and your own price observations. Budget and diary records stay in this browser unless you export them.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button secondary onClick={exportBackup}><Download size={14}/> Export backup</Button>
          <Button secondary onClick={() => importRef.current?.click()}><FileUp size={14}/> Import backup</Button>
          <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={importBackup}/>
        </div>
      </div>
      {(fileError || cpiError) && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">{fileError || cpiError}</div>}
      {savedNotice && <div role="status" className="mb-4 text-xs font-semibold text-emerald-800">Saved on this device.</div>}

      <section className={`${cardClass} mb-5 overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="nt-card-meta">01 / Naira Time Machine</div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">What would this amount look like?</h2>
            <p className="nt-subtitle mt-1 max-w-2xl">Compare only CPI readings that share the same index base. Values are an index-based estimate, not a price quote or NBS calculator.</p>
          </div>
          <span className="nt-pill"><Activity size={12}/>{loadingCpi ? "Loading CPI" : `${comparableRows.length} comparable periods`}</span>
        </div>
        {cpiError && <p className="mt-4 text-xs text-amber-800">The time machine is paused because source data did not load. No substitute observations are used.</p>}
        {!cpiError && comparableRows.length > 1 && (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="grid gap-1.5 text-xs font-semibold">Amount (₦)<input className={inputClass} type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)}/></label>
              <label className="grid gap-1.5 text-xs font-semibold">Index series<select className={inputClass} value={activeBase} onChange={event => { setSelectedBase(event.target.value); setBasePeriod(""); setTargetPeriod(""); }}>{indexBases.map(base => <option key={base} value={base}>{base}</option>)}</select></label>
              <label className="grid gap-1.5 text-xs font-semibold">Starting period<select className={inputClass} value={baseObservation?.period || ""} onChange={event => setBasePeriod(event.target.value)}>{comparableRows.filter(row => !targetObservation || row.period < targetObservation.period).map(row => <option key={row.period} value={row.period}>{row.period}</option>)}</select></label>
              <label className="grid gap-1.5 text-xs font-semibold">Target period<select className={inputClass} value={targetObservation?.period || ""} onChange={event => setTargetPeriod(event.target.value)}>{comparableRows.filter(row => !baseObservation || row.period > baseObservation.period).map(row => <option key={row.period} value={row.period}>{row.period}</option>)}</select></label>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-xl bg-[#f7f6f2] p-4">
                <div className="flex justify-between gap-3 text-[10px] text-stone-500"><span>{chartRows[0]?.period}</span><span>{targetObservation?.period}</span></div>
                <svg viewBox="0 0 100 100" className="mt-2 h-40 w-full overflow-visible" role="img" aria-label={`CPI index trend for base ${activeBase}`}>
                  <line x1="0" y1="90" x2="100" y2="90" stroke="#dedbd2" strokeWidth="0.7"/>
                  {chartRows.length > 1 && <polyline points={chartPoints} fill="none" stroke="#df542c" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/>}
                  {chartRows.length > 0 && <circle cx={chartRows.length < 2 ? 50 : 100} cy={chartRows.length < 2 ? 50 : 90 - ((chartRows[chartRows.length - 1].cpiIndex - chartMin) / (chartMax - chartMin || 1)) * 80} r="2" fill="#df542c"/>}
                </svg>
                <div className="text-[10px] text-stone-500">Published index observations · same base only</div>
              </div>
              <div className="flex flex-col justify-center rounded-xl bg-[#191a19] p-5 text-white">
                <div className="text-[10px] uppercase tracking-[.15em] text-white/60">Index-adjusted amount</div>
                <div className="mt-2 text-3xl font-semibold tabular-nums">{Number(amount) > 0 && timeMachineResult !== null ? money(timeMachineResult) : "—"}</div>
                <div className="mt-2 text-xs text-white/65">{baseObservation?.period} → {targetObservation?.period}</div>
                {baseObservation && targetObservation && <div className="mt-4 border-t border-white/15 pt-3 text-xs text-white/70">Index movement: {percent((targetObservation.cpiIndex / baseObservation.cpiIndex - 1) * 100)}</div>}
              </div>
            </div>
            {targetObservation?.sourceUrl && <a className="mt-4 inline-block text-[10px] text-stone-500 underline underline-offset-2" href={targetObservation.sourceUrl} target="_blank" rel="noreferrer">Open original data source</a>}
          </>
        )}
        {!loadingCpi && !cpiError && comparableRows.length < 2 && <p className="mt-4 text-sm text-stone-500">At least two comparable CPI observations are required. No index change is estimated from a single reading.</p>}
      </section>

      <section className={`${cardClass} mb-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><div className="nt-card-meta">02 / Budget stress & scenario simulator</div><h2 className="mt-2 text-xl font-semibold tracking-tight">Test your own assumptions</h2><p className="nt-subtitle mt-1">Enter monthly spending and annual price-change assumptions. Nothing here is an official category inflation rate or forecast.</p></div>
          <span className="nt-pill"><LockKeyhole size={12}/> Stored on this device</span>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold">Monthly take-home income<input className={inputClass} type="number" min="0" value={state.monthlyIncome || ""} placeholder="₦0" onChange={event => persist(current => ({...current, monthlyIncome: Math.max(0, Number(event.target.value) || 0)}))}/></label>
          <label className="grid gap-1.5 text-xs font-semibold">Scenario horizon<select className={inputClass} value={state.scenarioYears} onChange={event => persist(current => ({...current, scenarioYears: Number(event.target.value)}))}>{[1,2,3,5,10].map(year => <option key={year} value={year}>{year} year{year > 1 ? "s" : ""}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold">Alert threshold<select className={inputClass} value={state.alertThreshold} onChange={event => persist(current => ({...current, alertThreshold: Number(event.target.value)}))}>{[5,10,15,20,25,30].map(value => <option key={value} value={value}>{value}% personal basket scenario</option>)}</select></label>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="nt-table min-w-[640px]">
            <thead><tr><th>Spending category</th><th>Monthly spend (₦)</th><th>Annual what-if rate</th><th>Monthly cost in {state.scenarioYears}y</th></tr></thead>
            <tbody>{categoryOrder.map(category => <tr key={category}>
              <td className="font-semibold">{CATEGORY_LABELS[category]}</td>
              <td><input aria-label={`${CATEGORY_LABELS[category]} monthly spend`} className={`${inputClass} max-w-48`} type="number" min="0" value={state.monthlyExpenses[category] || ""} placeholder="₦0" onChange={event => persist(current => ({...current, monthlyExpenses: {...current.monthlyExpenses, [category]: Math.max(0, Number(event.target.value) || 0)}}))}/></td>
              <td><div className="flex items-center gap-2"><input aria-label={`${CATEGORY_LABELS[category]} scenario rate`} className={`${inputClass} max-w-32`} type="number" min="-100" max="500" step="0.5" value={state.annualRates[category]} onChange={event => persist(current => ({...current, annualRates: {...current.annualRates, [category]: Math.max(-100, Math.min(500, Number(event.target.value) || 0))}}))}/><span className="text-xs text-stone-500">%</span></div></td>
              <td className="font-semibold tabular-nums">{money(projectAnnualExpense(state.monthlyExpenses[category], state.annualRates[category], state.scenarioYears))}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#f7f6f2] p-4"><div className="text-[10px] uppercase tracking-wide text-stone-500">Current monthly spend</div><div className="mt-2 text-xl font-semibold">{money(monthlySpend)}</div></div>
          <div className="rounded-xl bg-[#f7f6f2] p-4"><div className="text-[10px] uppercase tracking-wide text-stone-500">Weighted basket scenario</div><div className="mt-2 text-xl font-semibold">{personalInflation === null ? "Add spending" : percent(personalInflation)}</div><p className="mt-1 text-[10px] text-stone-500">Based on your spending weights and assumptions</p></div>
          <div className={`rounded-xl p-4 ${projectedRemaining < 0 && state.monthlyIncome > 0 ? "bg-[#fbefed]" : "bg-[#eff4ef]"}`}><div className="text-[10px] uppercase tracking-wide text-stone-500">Income after scenario spend</div><div className="mt-2 text-xl font-semibold">{state.monthlyIncome ? money(projectedRemaining) : "Add income"}</div><p className="mt-1 text-[10px] text-stone-500">Monthly cost after {state.scenarioYears}y at entered rates</p></div>
        </div>
        {personalInflation !== null && personalInflation >= state.alertThreshold && <div role="status" className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldAlert size={16} className="mt-0.5 shrink-0"/><span>Your entered basket scenario is above your {state.alertThreshold}% local alert threshold. This is a private assumption-based alert, not an observed inflation release.</span></div>}
      </section>

      <section className={`${cardClass} mb-5`}>
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3ead8] text-[#80602d]"><Wallet size={18}/></span><div><div className="nt-card-meta">03 / Salary protection calculator</div><h2 className="mt-1 text-xl font-semibold tracking-tight">What salary keeps pace with the selected CPI change?</h2><p className="nt-subtitle mt-1">This compares two periods from the selected matching index base; it does not make a wage recommendation.</p></div></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1.5 text-xs font-semibold">Salary in {baseObservation?.period || "starting period"} (₦)<input className={inputClass} type="number" min="1" value={salary} placeholder="Enter salary" onChange={event => setSalary(event.target.value)}/></label>
          <div className="rounded-xl bg-[#f7f6f2] px-5 py-4 sm:min-w-64"><div className="text-[10px] uppercase tracking-wide text-stone-500">CPI-adjusted target in {targetObservation?.period || "target period"}</div><div className="mt-1 text-2xl font-semibold">{salaryProtection !== null && Number(salary) > 0 ? money(salaryProtection) : "—"}</div>{salaryGap !== null && <div className="mt-1 text-xs text-stone-500">Change needed: {salaryGap >= 0 ? "+" : ""}{money(salaryGap)}</div>}</div>
        </div>
      </section>

      <section className={`${cardClass} mb-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="nt-card-meta">04 / Personal price diary</div><h2 className="mt-2 text-xl font-semibold tracking-tight">Keep your own local price history</h2><p className="nt-subtitle mt-1">Entries are user-reported and stored only in this browser. They are not verified market prices and are not uploaded.</p></div><span className="nt-pill"><LockKeyhole size={12}/>{state.priceDiary.length} local record{state.priceDiary.length === 1 ? "" : "s"}</span></div>
        <form onSubmit={addDiaryEntry} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr_.8fr_auto] lg:items-end">
          <label className="grid gap-1.5 text-xs font-semibold">Item<input className={inputClass} maxLength={100} value={diaryItem} onChange={event => setDiaryItem(event.target.value)} placeholder="e.g. 1kg rice"/></label>
          <label className="grid gap-1.5 text-xs font-semibold">Category<select className={inputClass} value={diaryCategory} onChange={event => setDiaryCategory(event.target.value as BudgetCategory)}>{categoryOrder.map(category => <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>)}</select></label>
          <label className="grid gap-1.5 text-xs font-semibold">Price (₦)<input className={inputClass} type="number" min="0.01" step="0.01" value={diaryPrice} onChange={event => setDiaryPrice(event.target.value)} placeholder="0.00"/></label>
          <label className="grid gap-1.5 text-xs font-semibold">Date<input className={inputClass} type="date" value={diaryDate} onChange={event => setDiaryDate(event.target.value)}/></label>
          <Button type="submit"><Plus size={14}/>Add price</Button>
        </form>
        {diaryError && <p role="alert" className="mt-3 text-xs text-red-700">{diaryError}</p>}
        {state.priceDiary.length === 0 ? <div className="mt-5 rounded-xl bg-[#f7f6f2] p-6 text-center text-xs text-stone-500">No personal prices yet. Add an observation from your own shopping.</div> : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {Array.from(groupedDiary.entries()).map(([key, entries]) => {
              const change = calculatePriceChange(entries);
              return <article key={key} className="rounded-xl border border-[#ecebe7] p-4">
                <div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold">{entries[0].item}</div><div className="mt-1 text-[10px] text-stone-500">{CATEGORY_LABELS[entries[0].category]} · {entries.length} observation{entries.length === 1 ? "" : "s"}</div></div><button aria-label={`Delete ${entries[0].item} price history`} title="Delete item history" onClick={() => persist(current => ({...current, priceDiary: current.priceDiary.filter(item => item.item.toLocaleLowerCase() !== key)}))} className="rounded-full p-2 text-stone-500 hover:bg-stone-100"><Trash2 size={14}/></button></div>
                <div className="mt-4 flex items-end justify-between gap-4"><div><div className="text-[10px] text-stone-500">Latest recorded price</div><div className="mt-1 text-xl font-semibold">{money([...entries].sort((a,b)=>b.date.localeCompare(a.date))[0].price)}</div><div className="text-[10px] text-stone-500">{[...entries].sort((a,b)=>b.date.localeCompare(a.date))[0].date}</div></div><div className="text-right"><div className="text-[10px] text-stone-500">Change across your records</div><div className={`mt-1 inline-flex items-center gap-1 text-sm font-semibold ${(change?.changePercent || 0) > 0 ? "text-red-700" : "text-emerald-800"}`}>{(change?.changePercent || 0) > 0 ? <ArrowUp size={14}/> : <ArrowDown size={14}/>} {change ? percent(change.changePercent) : "Need 2 records"}</div></div></div>
                <div className="mt-3 border-t border-[#efeee9] pt-3 text-[10px] text-stone-500">{change ? `${change.first.date} ${money(change.first.price)} → ${change.latest.date} ${money(change.latest.price)}` : "Add another dated observation to compare prices."}</div>
              </article>;
            })}
          </div>
        )}
      </section>

      <section className="mb-5 grid gap-5 lg:grid-cols-2">
        <article className={cardClass}>
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f4f1]"><Lightbulb size={17}/></span><div><div className="nt-card-meta">05 / Built-in analyst</div><h2 className="mt-1 text-lg font-semibold">Ask about this data</h2><p className="nt-subtitle mt-1">Rule-based answers from this page only. No model, API key, or external service.</p></div></div>
          <form onSubmit={answerAnalyst} className="mt-4 flex gap-2"><input className={inputClass} value={analystQuestion} onChange={event => setAnalystQuestion(event.target.value)} placeholder="Ask about CPI, salary, budget or diary…"/><Button type="submit" disabled={!analystQuestion.trim()}><Send size={14}/></Button></form>
          {analystAnswer && <div role="status" className="mt-4 rounded-xl bg-[#f7f6f2] p-4 text-xs leading-6 text-stone-700">{analystAnswer}</div>}
        </article>
        <article className={cardClass}>
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f4f1]"><LineChart size={17}/></span><div><div className="nt-card-meta">06 / Data provenance & revision check</div><h2 className="mt-1 text-lg font-semibold">Source snapshot</h2><p className="nt-subtitle mt-1">Compare current CPI observations against the last snapshot saved in this browser.</p></div></div>
          <div className="mt-4 rounded-xl bg-[#f7f6f2] p-4"><div className="text-[10px] uppercase tracking-wide text-stone-500">Last source check</div><div className="mt-1 text-sm font-semibold">{state.snapshotCapturedAt ? new Date(state.snapshotCapturedAt).toLocaleString() : loadingCpi ? "Checking source…" : "No local snapshot yet"}</div><div className="mt-1 text-[10px] text-stone-500">{state.cpiSnapshot.length} observations stored as a comparison baseline</div></div>
          {state.revisionNotice.length > 0 ? <div className="mt-3 max-h-36 space-y-2 overflow-auto text-[11px] leading-5 text-amber-900">{state.revisionNotice.slice(0, 8).map((change, index) => <div key={`${change}-${index}`} className="flex gap-2"><RotateCcw size={13} className="mt-1 shrink-0"/>{change}</div>)}</div> : <p className="mt-3 text-[11px] leading-5 text-stone-500">{state.snapshotCapturedAt ? "No revisions or removals detected since the previous local snapshot." : "A revision comparison will be available after another visit with a saved snapshot."}</p>}
          {state.cpiSnapshot.at(-1)?.sourceUrl && <a className="mt-4 inline-block text-[10px] font-semibold underline underline-offset-2" href={state.cpiSnapshot.at(-1)?.sourceUrl} target="_blank" rel="noreferrer">Open original publisher</a>}
        </article>
      </section>

      <div className="rounded-xl border border-[#e9e8e4] bg-[#f0f0ed] p-4 text-[10px] leading-5 text-stone-600">
        <div className="flex items-center gap-2 font-semibold text-stone-800"><Gauge size={14}/> Data and privacy note</div>
        <p className="mt-1">CPI is retrieved from the app’s existing data endpoint; the endpoint may fetch its published source. Your income, spending, assumptions and diary entries are not sent to it and remain in this browser. Private records can be lost when browser storage is cleared, so use Export backup if needed. Scenario rates are user assumptions—not predictions. The CPI series may contain methodology/base breaks; comparisons are restricted to matching index bases.</p>
      </div>
    </AppLayout>
  );
}
