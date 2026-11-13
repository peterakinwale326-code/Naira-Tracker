export const BUDGET_CATEGORIES = ["food", "transport", "housing", "other"] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  food: "Food",
  transport: "Transport",
  housing: "Housing",
  other: "Other",
};

export type CpiObservation = {
  period: string;
  year: number;
  month: number;
  cpiIndex: number;
  indexBase: string;
  source: string;
  sourceUrl?: string;
};

export type PriceEntry = {
  id: string;
  item: string;
  category: BudgetCategory;
  price: number;
  date: string;
};

export type MoneyLabState = {
  version: 1;
  monthlyIncome: number;
  monthlyExpenses: Record<BudgetCategory, number>;
  annualRates: Record<BudgetCategory, number>;
  scenarioYears: number;
  alertThreshold: number;
  priceDiary: PriceEntry[];
  cpiSnapshot: CpiObservation[];
  snapshotCapturedAt: string | null;
  revisionNotice: string[];
};

export const MONEY_LAB_STORAGE_KEY = "naira-tracker-money-lab-v1";

export function createDefaultMoneyLabState(): MoneyLabState {
  return {
    version: 1,
    monthlyIncome: 0,
    monthlyExpenses: { food: 0, transport: 0, housing: 0, other: 0 },
    annualRates: { food: 15, transport: 12, housing: 10, other: 8 },
    scenarioYears: 1,
    alertThreshold: 10,
    priceDiary: [],
    cpiSnapshot: [],
    snapshotCapturedAt: null,
    revisionNotice: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000_000_000;
}

function isCategory(value: unknown): value is BudgetCategory {
  return typeof value === "string" && BUDGET_CATEGORIES.includes(value as BudgetCategory);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseMoneyLabState(value: unknown): MoneyLabState {
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("This backup is not a supported Naira Tracker Money Lab file.");
  }
  const expenses = value.monthlyExpenses;
  const defaultRates = { food: 15, transport: 12, housing: 10, other: 8 };
  const annualRates = value.annualRates === undefined ? defaultRates : value.annualRates;
  const scenarioYears = value.scenarioYears === undefined ? 1 : value.scenarioYears;
  if (
    !finiteNonNegative(value.monthlyIncome) ||
    !finiteNonNegative(value.alertThreshold) ||
    value.alertThreshold > 100 ||
    !isRecord(expenses) ||
    !BUDGET_CATEGORIES.every(category => finiteNonNegative(expenses[category])) ||
    !isRecord(annualRates) ||
    !BUDGET_CATEGORIES.every(category =>
      typeof annualRates[category] === "number" &&
      Number.isFinite(annualRates[category]) &&
      annualRates[category] >= -100 &&
      annualRates[category] <= 500
    ) ||
    ![1, 2, 3, 5, 10].includes(scenarioYears as number) ||
    !Array.isArray(value.priceDiary) ||
    value.priceDiary.length > 5000 ||
    !Array.isArray(value.cpiSnapshot) ||
    value.cpiSnapshot.length > 5000 ||
    !Array.isArray(value.revisionNotice) ||
    value.revisionNotice.length > 100
  ) {
    throw new Error("The backup contains invalid or unsupported Money Lab data.");
  }

  const priceDiary = value.priceDiary.map((entry): PriceEntry => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.item !== "string" ||
      !entry.item.trim() ||
      !isCategory(entry.category) ||
      typeof entry.price !== "number" ||
      !Number.isFinite(entry.price) ||
      entry.price <= 0 ||
      typeof entry.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
    ) {
      throw new Error("The backup contains an invalid personal price entry.");
    }
    return {
      id: entry.id,
      item: entry.item.trim().slice(0, 100),
      category: entry.category,
      price: entry.price,
      date: entry.date,
    };
  });

  const cpiSnapshot = value.cpiSnapshot.map((row): CpiObservation => {
    if (
      !isRecord(row) ||
      typeof row.period !== "string" ||
      !Number.isInteger(row.year) ||
      !Number.isInteger(row.month) ||
      typeof row.cpiIndex !== "number" ||
      !Number.isFinite(row.cpiIndex) ||
      row.cpiIndex <= 0 ||
      typeof row.indexBase !== "string" ||
      typeof row.source !== "string" ||
      (row.sourceUrl !== undefined && (typeof row.sourceUrl !== "string" || !isHttpUrl(row.sourceUrl)))
    ) {
      throw new Error("The backup contains an invalid CPI source snapshot.");
    }
    return {
      period: row.period,
      year: row.year as number,
      month: row.month as number,
      cpiIndex: row.cpiIndex,
      indexBase: row.indexBase,
      source: row.source,
      sourceUrl: row.sourceUrl as string | undefined,
    };
  });

  if (value.snapshotCapturedAt !== null && typeof value.snapshotCapturedAt !== "string") {
    throw new Error("The backup contains an invalid snapshot date.");
  }
  return {
    version: 1,
    monthlyIncome: value.monthlyIncome,
    monthlyExpenses: {
      food: expenses.food as number,
      transport: expenses.transport as number,
      housing: expenses.housing as number,
      other: expenses.other as number,
    },
    annualRates: {
      food: annualRates.food as number,
      transport: annualRates.transport as number,
      housing: annualRates.housing as number,
      other: annualRates.other as number,
    },
    scenarioYears: scenarioYears as number,
    alertThreshold: value.alertThreshold,
    priceDiary,
    cpiSnapshot,
    snapshotCapturedAt: value.snapshotCapturedAt as string | null,
    revisionNotice: value.revisionNotice.filter((item): item is string => typeof item === "string").slice(0, 100),
  };
}

export function readMoneyLabState(raw: string | null): MoneyLabState {
  if (!raw) return createDefaultMoneyLabState();
  return parseMoneyLabState(JSON.parse(raw));
}

export function compareCpiSnapshots(previous: CpiObservation[], current: CpiObservation[]) {
  const oldRows = new Map(previous.map(row => [row.period, row]));
  const newRows = new Map(current.map(row => [row.period, row]));
  const changes: string[] = [];

  for (const row of current) {
    const old = oldRows.get(row.period);
    if (!old) {
      if (previous.length) changes.push(`${row.period}: new observation`);
      continue;
    }
    if (old.cpiIndex !== row.cpiIndex || old.indexBase !== row.indexBase) {
      changes.push(`${row.period}: revised from ${old.cpiIndex} (${old.indexBase}) to ${row.cpiIndex} (${row.indexBase})`);
    }
    if (old.source !== row.source || old.sourceUrl !== row.sourceUrl) {
      changes.push(`${row.period}: source or source URL metadata changed`);
    }
  }
  for (const row of previous) {
    if (!newRows.has(row.period)) changes.push(`${row.period}: no longer present in the latest source response`);
  }
  return changes.slice(0, 100);
}

export function weightedInflation(
  expenses: Record<BudgetCategory, number>,
  annualRates: Record<BudgetCategory, number>,
) {
  const total = BUDGET_CATEGORIES.reduce((sum, category) => sum + expenses[category], 0);
  if (total <= 0) return null;
  return BUDGET_CATEGORIES.reduce(
    (sum, category) => sum + expenses[category] / total * annualRates[category],
    0,
  );
}

export function projectAnnualExpense(monthlyExpense: number, annualRate: number, years: number) {
  return monthlyExpense * Math.pow(1 + annualRate / 100, years);
}

export function calculatePriceChange(entries: PriceEntry[]) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2 || sorted[0].price <= 0) return null;
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  return {
    first,
    latest,
    changePercent: ((latest.price / first.price) - 1) * 100,
  };
}
