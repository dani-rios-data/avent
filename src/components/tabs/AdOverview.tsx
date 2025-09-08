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
import { BarChart3, Share2 } from "lucide-react";

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

interface AdOverviewProps {
  brandData: DataRow[];
  dmeData: DataRow[];
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

const AdOverview = ({ brandData, dmeData }: AdOverviewProps) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
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

  const filteredDMEData = useMemo(() => {
    return dmeData.filter((row) => {
      const yearMatch =
        selectedYears.length === 0 || selectedYears.includes(row.year);
      const monthMatch =
        selectedMonths.length === 0 || selectedMonths.includes(row["month-year"]);
      return yearMatch && monthMatch;
    });
  }, [dmeData, selectedYears, selectedMonths]);

  const brandOptions = useMemo(() => {
    return [
      ...new Set(filteredBrandData.map((row) => row["brand root"]).filter(Boolean)),
    ].sort();
  }, [filteredBrandData]);

  const dmeOptions = useMemo(() => {
    return [
      ...new Set(filteredDMEData.map((row) => row["brand root"]).filter(Boolean)),
    ].sort();
  }, [filteredDMEData]);

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
    results.sort(
      (a, b) => b.focus + b.other - (a.focus + a.other)
    );
    return results;
  }, [filteredBrandData, selectedBrands]);

  const maxSpend = useMemo(
    () => Math.max(...spendByBrand.map((d) => d.focus + d.other), 0),
    [spendByBrand]
  );

  const spendByProvider = useMemo(() => {
    const totals: Record<string, { focus: number; other: number }> = {};
    filteredDMEData.forEach((row) => {
      const provider = row["brand root"];
      const spend = row["spend (usd)"] || 0;
      if (!totals[provider]) totals[provider] = { focus: 0, other: 0 };
      if (row.focus_vs_other === "focus") totals[provider].focus += spend;
      else totals[provider].other += spend;
    });
    let results = Object.entries(totals).map(([provider, values]) => ({
      provider,
      focus: values.focus,
      other: values.other,
    }));
    if (selectedProviders.length > 0) {
      results = results.filter((item) => selectedProviders.includes(item.provider));
    }
    return results;
  }, [filteredDMEData, selectedProviders]);

  const maxDmeSpend = useMemo(
    () => Math.max(...spendByProvider.map((d) => d.focus + d.other), 0),
    [spendByProvider]
  );

  const instagramPostsByBrand = useMemo(() => {
    const totals: Record<string, { focus: number; other: number }> = {};
    (instagramDataRaw || []).forEach((row: SocialRow) => {
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
      results = results.filter((item) => selectedCompanies.includes(item.brand));
    }
    return results;
  }, [instagramDataRaw, selectedCompanies]);

  const tiktokPostsByBrand = useMemo(() => {
    const totals: Record<string, { focus: number; other: number }> = {};
    (tiktokDataRaw || []).forEach((row: SocialRow) => {
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
      results = results.filter((item) => selectedCompanies.includes(item.brand));
    }
    return results;
  }, [tiktokDataRaw, selectedCompanies]);

  const maxInstagramPosts = useMemo(
    () => Math.max(...instagramPostsByBrand.map((d) => d.focus + d.other), 0),
    [instagramPostsByBrand]
  );

  const maxTiktokPosts = useMemo(
    () => Math.max(...tiktokPostsByBrand.map((d) => d.focus + d.other), 0),
    [tiktokPostsByBrand]
  );

  const companyOptions = useMemo(() => {
    const set = new Set<string>();
    (instagramDataRaw || []).forEach((row) => row.company && set.add(row.company));
    (tiktokDataRaw || []).forEach((row) => row.company && set.add(row.company));
    return Array.from(set).sort();
  }, [instagramDataRaw, tiktokDataRaw]);

  const createTooltip = (formatter: (v: number) => string) => {
    return ({
      active,
      payload,
      label,
    }: {
      active?: boolean;
      payload?: { name: string; color: string; value: number }[];
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        const total = payload.reduce(
          (sum: number, entry) => sum + Number(entry.value),
          0
        );
        return (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm space-y-1">
            <p className="font-semibold text-foreground">{label}</p>
            {payload.map((entry) => (
              <p key={entry.name} className="flex items-center gap-2" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>
                  {entry.name}: {formatter(Number(entry.value))} (
                  {((Number(entry.value) / total) * 100).toFixed(1)}%)
                </span>
              </p>
            ))}
            <p className="pt-1 font-semibold text-foreground">
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
        data={[...brandData, ...dmeData]}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        onYearChange={setSelectedYears}
        onMonthChange={setSelectedMonths}
      />

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Ad Spend Distribution
        </h2>

        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
          Brand Manufacturer
        </h3>
        <div className="max-w-sm mb-4">
          <MultiSelect
            options={brandOptions}
            selected={selectedBrands}
            onChange={setSelectedBrands}
            placeholder="All Brands"
          />
        </div>
        <div className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByBrand} barCategoryGap={32}>
              <XAxis dataKey="brand" tick={{ fill: "#4B5563", fontSize: 11 }} />
              <YAxis
                domain={[0, maxSpend]}
                tick={{ fill: "#4B5563", fontSize: 11 }}
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
                barSize={20}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
          DME Providers
        </h3>
        <div className="max-w-sm mb-4">
          <MultiSelect
            options={dmeOptions}
            selected={selectedProviders}
            onChange={setSelectedProviders}
            placeholder="All Providers"
          />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByProvider} barCategoryGap={32}>
              <XAxis dataKey="provider" tick={{ fill: "#4B5563", fontSize: 11 }} />
              <YAxis
                domain={[0, maxDmeSpend]}
                tick={{ fill: "#4B5563", fontSize: 11 }}
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
                barSize={20}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Focus in Social Media Posts
        </h2>
        <div className="max-w-sm mb-4">
          <MultiSelect
            options={companyOptions}
            selected={selectedCompanies}
            onChange={setSelectedCompanies}
            placeholder="All Companies"
          />
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
          Instagram
        </h3>
        <div className="h-80 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instagramPostsByBrand} barCategoryGap={32}>
              <XAxis dataKey="brand" tick={{ fill: "#4B5563", fontSize: 11 }} />
              <YAxis
                domain={[0, maxInstagramPosts]}
                tick={{ fill: "#4B5563", fontSize: 11 }}
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
                barSize={20}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other Posts"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
          TikTok
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tiktokPostsByBrand} barCategoryGap={32}>
              <XAxis dataKey="brand" tick={{ fill: "#4B5563", fontSize: 11 }} />
              <YAxis
                domain={[0, maxTiktokPosts]}
                tick={{ fill: "#4B5563", fontSize: 11 }}
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
                barSize={20}
              />
              <Bar
                dataKey="other"
                stackId="a"
                fill={COLORS[1]}
                name="Other Posts"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default AdOverview;
