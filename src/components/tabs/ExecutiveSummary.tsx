import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCSVData } from "@/hooks/useCSVData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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

const ExecutiveSummary = ({ brandData }: ExecutiveSummaryProps) => {
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

  const spendByBrand = useMemo(() => {
    const totals: Record<string, { focus: number; other: number }> = {};
    brandData.forEach((row) => {
      const brand = row["brand root"];
      const spend = row["spend (usd)"] || 0;
      if (!totals[brand]) totals[brand] = { focus: 0, other: 0 };
      if (row.focus_vs_other === "focus") totals[brand].focus += spend;
      else totals[brand].other += spend;
    });
    return Object.entries(totals).map(([brand, values]) => ({
      brand,
      focus: values.focus,
      other: values.other,
    }));
  }, [brandData]);

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
    return Object.entries(totals).map(([brand, values]) => ({
      brand,
      focus: values.focus,
      other: values.other,
    }));
  }, [instagramDataRaw, tiktokDataRaw]);

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
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-semibold mb-4">Ad Spend Distribution</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spendByBrand.map(({ brand, focus, other }) => (
            <Card key={brand}>
              <CardHeader className="pb-0 text-center">
                <CardTitle className="text-sm font-medium">{brand}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Breast Pumps", value: focus },
                          { name: "Other", value: other },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={2}
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Focus in Social Media Posts</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {postsByBrand.map(({ brand, focus, other }) => (
            <Card key={`post-${brand}`}>
              <CardHeader className="pb-0 text-center">
                <CardTitle className="text-sm font-medium">{brand}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Breast Pump Posts", value: focus },
                          { name: "Other Posts", value: other },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={2}
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExecutiveSummary;
