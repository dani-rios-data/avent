import { useState, useMemo } from "react";
import FilterBar from "../dashboard/FilterBar";
import { MultiSelect } from "../ui/multi-select";
import { useCSVData } from "@/hooks/useCSVData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DataRow {
  "month-year": string;
  year: string;
  advertiser: string;
  "brand root": string;
  "category level 2": string;
  "category level 3": string;
  "category level 8": string;
  channel: string;
  placement: string;
  publisher: string;
  impressions: number;
  "spend (usd)": number;
  focus_vs_other: string;
}

interface SocialRow {
  company: string;
  focus_vs_other: string;
}

interface ExecutiveSummaryProps {
  brandData: DataRow[];
}

const COLORS = ["#EA899A", "#CBD5E1"];

const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${value}`;
};

const ExecutiveSummary = ({ brandData }: ExecutiveSummaryProps) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const {
    data: instagramDataRaw,
    loading: instagramLoading,
    error: instagramError,
  } = useCSVData<SocialRow>("/SM_IG_Breast_Pump_Brands_plus_focus.csv");
  const {
    data: tiktokDataRaw,
    loading: tiktokLoading,
    error: tiktokError,
  } = useCSVData<SocialRow>("/SM_TikTok_Breast_Pump_Brands_plus_focus.csv");

  const filteredBrandData = useMemo(() => {
    return brandData.filter((row) => {
      const yearMatch =
        selectedYears.length === 0 || selectedYears.includes(row.year);
      const monthMatch =
        selectedMonths.length === 0 || selectedMonths.includes(row["month-year"]);
      return yearMatch && monthMatch;
    });
  }, [brandData, selectedYears, selectedMonths]);

  const brandOptions = useMemo(() => {
    return [
      ...new Set(filteredBrandData.map((row) => row["brand root"]).filter(Boolean)),
    ].sort();
  }, [filteredBrandData]);

  const spendByBrand = useMemo(() => {
    const totals: Record<string, { focus: number; other: number }> = {};
    filteredBrandData.forEach((row) => {
      const brand = row["brand root"];
      const spend = row["spend (usd)"] || 0;
      if (!totals[brand]) totals[brand] = { focus: 0, other: 0 };
      if (row.focus_vs_other === "focus") totals[brand].focus += spend;
      else totals[brand].other += spend;
    });
    let results = Object.entries(totals).map(([brand, values]) => ({
      brand,
      focus: values.focus,
      other: values.other,
    }));
    if (selectedBrands.length > 0) {
      results = results.filter((item) => selectedBrands.includes(item.brand));
    }
    return results;
  }, [filteredBrandData, selectedBrands]);

  const maxSpend = useMemo(
    () => Math.max(...spendByBrand.map((d) => d.focus + d.other), 0),
    [spendByBrand]
  );

  const postsByBrand = useMemo(() => {
    const combined = [
      ...(instagramDataRaw || []),
      ...(tiktokDataRaw || []),
    ];
    const totals: Record<string, { focus: number; other: number }> = {};
    combined.forEach((row: SocialRow) => {
      const brand = row.company;
      if (!brand) return;
      if (!totals[brand]) totals[brand] = { focus: 0, other: 0 };
      if (row.focus_vs_other === "focus") totals[brand].focus += 1;
      else totals[brand].other += 1;
    });
    let results = Object.entries(totals).map(([brand, values]) => ({
      brand,
      focus: values.focus,
      other: values.other,
    }));
    if (selectedCompanies.length > 0) {
      results = results.filter((item) =>
        selectedCompanies.includes(item.brand)
      );
    }
    return results;
  }, [instagramDataRaw, tiktokDataRaw, selectedCompanies]);

  const maxPosts = useMemo(
    () => Math.max(...postsByBrand.map((d) => d.focus + d.other), 0),
    [postsByBrand]
  );

  const companyOptions = useMemo(() => {
    return [
      ...new Set(
        postsByBrand.map((row) => row.brand).filter(Boolean)
      ),
    ].sort();
  }, [postsByBrand]);

  const createTooltip = (formatter: (v: number) => string) => {
    return ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const total = payload.reduce(
          (sum: number, entry: any) => sum + Number(entry.value),
          0
        );
        return (
          <div className="bg-white p-2 border rounded">
            <p className="font-medium">{label}</p>
            {payload.map((entry: any) => (
              <p key={entry.name} style={{ color: entry.color }}>
                {entry.name}: {formatter(Number(entry.value))} (
                {((Number(entry.value) / total) * 100).toFixed(1)}%)
              </p>
            ))}
            <p className="mt-1 font-medium">
              Total: {formatter(total)}
            </p>
          </div>
        );
      }
      return null;
    };
  };

  const currencyTooltip = createTooltip((v) => `$${formatNumber(v)}`);
  const countTooltip = createTooltip((v) => v.toLocaleString());

  if (instagramLoading || tiktokLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading summary...
      </div>
    );
  }

  if (instagramError || tiktokError) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Error loading social media data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 font-medium">
          Dataset covers advertising data from January 1, 2024 to July 22, 2025
        </p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800 font-medium">
          This view shows global ad data, not limited to breast pumps
        </p>
      </div>

      <FilterBar
        data={brandData}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        onYearChange={setSelectedYears}
        onMonthChange={setSelectedMonths}
      />

      <section>
        <h2 className="text-lg font-semibold mb-4">Ad Spend Distribution</h2>
        <div className="max-w-sm mb-4">
          <MultiSelect
            options={brandOptions}
            selected={selectedBrands}
            onChange={setSelectedBrands}
            placeholder="All Brands"
          />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByBrand}>
              <XAxis dataKey="brand" />
              <YAxis
                domain={[0, maxSpend]}
                tickFormatter={(v) => `$${formatNumber(Number(v))}`}
              />
              <Tooltip content={currencyTooltip} />
              <Legend />
              <Bar
                dataKey="focus"
                stackId="a"
                fill={COLORS[0]}
                name="Breast Pumps"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Focus in Social Media Posts</h2>
        <div className="max-w-sm mb-4">
          <MultiSelect
            options={companyOptions}
            selected={selectedCompanies}
            onChange={setSelectedCompanies}
            placeholder="All Companies"
          />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={postsByBrand}>
              <XAxis dataKey="brand" />
              <YAxis
                domain={[0, maxPosts]}
                tickFormatter={(v) => formatNumber(Number(v))}
              />
              <Tooltip content={countTooltip} />
              <Legend />
              <Bar
                dataKey="focus"
                stackId="a"
                fill={COLORS[0]}
                name="Breast Pump Posts"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other Posts"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default ExecutiveSummary;
