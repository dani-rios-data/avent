import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { MultiSelectWithTotals } from "@/components/ui/multi-select-with-totals";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/utils";

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
}

interface ChartDataItem {
  name: string;
  value: number;
}

const CHART_COLORS = [
  "#7DD3FC",
  "#86EFAC",
  "#FDE047",
  "#FDA4AF",
  "#C4B5FD",
  "#67E8F9",
  "#FCA5A5",
  "#FDBA74",
  "#D8B4FE",
  "#6EE7B7",
  "#93C5FD",
  "#F9A8D4",
  "#A7F3D0",
  "#FEF08A",
  "#DBEAFE",
];

const StableDonutChart: React.FC<{ chartData: ChartDataItem[]; chartId: string }> = ({ chartData, chartId }) => {
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "300px", position: "relative" }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`${chartId}-${entry.name}-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${formatNumber(value * 1000000)}`,
              name,
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) =>
              value.length > 20 ? `${value.substring(0, 20)}...` : value
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface DistributionCardProps {
  chartId: string;
  type: "Channel" | "Placement";
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  data: DataRow[];
  brandsWithSpend: { brand: string; totalSpend: number }[];
  tabId: string;
}

const DistributionCard: React.FC<DistributionCardProps> = ({
  chartId,
  type,
  selectedBrands,
  onBrandsChange,
  data,
  brandsWithSpend,
  tabId,
}) => {
  const chartData = useMemo(() => {
    const field = type === "Channel" ? "channel" : "placement";
    const filteredData =
      selectedBrands.length === 0
        ? data
        : data.filter((row) => selectedBrands.includes(row["brand root"]));
    if (filteredData.length === 0) return [];
    const spends = filteredData.reduce((acc, row) => {
      const key = row[field as keyof DataRow] as string;
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + (Number(row["spend (usd)"]) || 0);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(spends)
      .map(([name, value]) => ({ name, value: value / 1000000 }))
      .sort((a, b) => b.value - a.value);
  }, [data, selectedBrands, type]);

  return (
    <Card className="bg-white border-border shadow-soft rounded-2xl">
      <CardHeader className="pb-4">
        <div className="mb-4">
          <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-foreground">Brand</label>
              <MultiSelectWithTotals
                key={`${chartId}-${tabId}`}
                options={brandsWithSpend}
                selected={selectedBrands}
                onChange={onBrandsChange}
                placeholder="All Brands"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
          {selectedBrands.length === 0
            ? "All Brands (Gross)"
            : selectedBrands.length === 1
            ? selectedBrands[0]
            : `${selectedBrands.length} brands selected`}
        </CardTitle>

        <p className="text-xs text-muted-foreground text-center">
          Total spend: ${
            formatNumber(
              chartData.reduce((sum, item) => sum + item.value, 0) * 1000000
            )
          }
        </p>
      </CardHeader>
      <CardContent>
        <StableDonutChart chartData={chartData} chartId={chartId} />
      </CardContent>
    </Card>
  );
};

interface ComparisonProps {
  title: string;
  type: "Channel" | "Placement";
  leftChartBrands: string[];
  rightChartBrands: string[];
  onLeftBrandsChange: (brands: string[]) => void;
  onRightBrandsChange: (brands: string[]) => void;
  leftBrandsWithSpend: { brand: string; totalSpend: number }[];
  rightBrandsWithSpend: { brand: string; totalSpend: number }[];
  data: DataRow[];
  tabId: string;
}

const DistributionComparison: React.FC<ComparisonProps> = ({
  title,
  type,
  leftChartBrands,
  rightChartBrands,
  onLeftBrandsChange,
  onRightBrandsChange,
  leftBrandsWithSpend,
  rightBrandsWithSpend,
  data,
  tabId,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground">{type} breakdown comparison</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DistributionCard
        chartId={`left-chart-${type.toLowerCase()}`}
        type={type}
        selectedBrands={leftChartBrands}
        onBrandsChange={onLeftBrandsChange}
        data={data}
        brandsWithSpend={leftBrandsWithSpend}
        tabId={tabId}
      />
      <DistributionCard
        chartId={`right-chart-${type.toLowerCase()}`}
        type={type}
        selectedBrands={rightChartBrands}
        onBrandsChange={onRightBrandsChange}
        data={data}
        brandsWithSpend={rightBrandsWithSpend}
        tabId={tabId}
      />
    </div>
  </div>
);

interface TopPublishersCardProps {
  chartId: string;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  brandsWithSpend: { brand: string; totalSpend: number }[];
  data: DataRow[];
  tabId: string;
}

const TopPublishersCard: React.FC<TopPublishersCardProps> = ({
  chartId,
  selectedBrands,
  onBrandsChange,
  brandsWithSpend,
  data,
  tabId,
}) => {
  const publishersRankingData = useMemo(() => {
    const filteredData =
      selectedBrands.length === 0
        ? data
        : data.filter((row) => selectedBrands.includes(row["brand root"]));
    const publisherSpends = filteredData.reduce((acc, row) => {
      const publisher = row.publisher;
      if (!publisher) return acc;
      acc[publisher] =
        (acc[publisher] || 0) + (Number(row["spend (usd)"]) || 0);
      return acc;
    }, {} as Record<string, number>);
    const totalSpend = Object.values(publisherSpends).reduce(
      (sum, spend) => sum + spend,
      0
    );
    return Object.entries(publisherSpends)
      .map(([publisher, spend]) => ({
        name: publisher,
        spend: spend / 1000000,
        originalSpend: spend,
        percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.originalSpend - a.originalSpend)
      .slice(0, 30);
  }, [data, selectedBrands]);

  const formatSpendValue = (originalSpend: number) => {
    if (originalSpend >= 1000000) return `${(originalSpend / 1000000).toFixed(1)}M`;
    if (originalSpend >= 1000) return `${(originalSpend / 1000).toFixed(0)}K`;
    return originalSpend.toFixed(0);
  };

  const formatTotalValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  return (
    <Card className="bg-white border-border shadow-soft rounded-2xl">
      <CardHeader className="pb-4">
        <div className="mb-4">
          <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
            <div className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-foreground">
                Brand
              </label>
              <MultiSelectWithTotals
                key={`${chartId}-${tabId}`}
                options={brandsWithSpend}
                selected={selectedBrands}
                onChange={onBrandsChange}
                placeholder="All Brands"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
          {selectedBrands.length === 0
            ? "All Brands (Gross)"
            : selectedBrands.length === 1
            ? selectedBrands[0]
            : `${selectedBrands.length} brands selected`}
        </CardTitle>

        <p className="text-xs text-muted-foreground text-center">
          Top 30 Publishers - Total: $
          {formatTotalValue(
            publishersRankingData.reduce((sum, item) => sum + item.spend, 0)
          )}
        </p>
      </CardHeader>
      <CardContent>
        {publishersRankingData.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {publishersRankingData.map((publisher, index) => {
              const maxSpend = publishersRankingData[0]?.spend || 1;
              const percentage = (publisher.spend / maxSpend) * 100;
              return (
                <div
                  key={publisher.name}
                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div
                    className="flex-shrink-0 w-32 text-xs font-semibold text-gray-800 truncate"
                    title={publisher.name}
                  >
                    {publisher.name}
                  </div>
                  <TooltipProvider delayDuration={100}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 relative cursor-pointer">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className="h-4 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Share: {publisher.percentage.toFixed(1)}%
                        </p>
                        <p className="text-xs">
                          Spend: ${formatSpendValue(publisher.originalSpend)}
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground text-sm">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TopPublishersComparisonProps {
  leftSelectedBrands: string[];
  rightSelectedBrands: string[];
  onLeftBrandsChange: (brands: string[]) => void;
  onRightBrandsChange: (brands: string[]) => void;
  leftBrandsWithSpend: { brand: string; totalSpend: number }[];
  rightBrandsWithSpend: { brand: string; totalSpend: number }[];
  data: DataRow[];
  tabId: string;
}

const TopPublishersComparison: React.FC<TopPublishersComparisonProps> = ({
  leftSelectedBrands,
  rightSelectedBrands,
  onLeftBrandsChange,
  onRightBrandsChange,
  leftBrandsWithSpend,
  rightBrandsWithSpend,
  data,
  tabId,
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Top Publishers by Spend
      </h2>
      <p className="text-sm text-muted-foreground">
        Publisher ranking by selected brands
      </p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopPublishersCard
        chartId="left-top-publishers"
        selectedBrands={leftSelectedBrands}
        onBrandsChange={onLeftBrandsChange}
        brandsWithSpend={leftBrandsWithSpend}
        data={data}
        tabId={tabId}
      />
      <TopPublishersCard
        chartId="right-top-publishers"
        selectedBrands={rightSelectedBrands}
        onBrandsChange={onRightBrandsChange}
        brandsWithSpend={rightBrandsWithSpend}
        data={data}
        tabId={tabId}
      />
    </div>
  </div>
);

interface ConsolidatedInvestmentDistributionProps {
  data: DataRow[];
  tabId?: string;
}

const ConsolidatedInvestmentDistribution: React.FC<ConsolidatedInvestmentDistributionProps> = ({
  data,
  tabId = "default",
}) => {
  const [activeTab, setActiveTab] = useState("channels");
  const [channelLeftChartBrands, setChannelLeftChartBrands] = useState<string[]>([]);
  const [channelRightChartBrands, setChannelRightChartBrands] = useState<string[]>([]);
  const [placementLeftChartBrands, setPlacementLeftChartBrands] = useState<string[]>([]);
  const [placementRightChartBrands, setPlacementRightChartBrands] = useState<string[]>([]);
  const [publishersLeftSelectedBrands, setPublishersLeftSelectedBrands] = useState<string[]>([]);
  const [publishersRightSelectedBrands, setPublishersRightSelectedBrands] = useState<string[]>([]);

  const [isChannelLeftInit, setIsChannelLeftInit] = useState(false);
  const [isChannelRightInit, setIsChannelRightInit] = useState(false);
  const [isPlacementLeftInit, setIsPlacementLeftInit] = useState(false);
  const [isPlacementRightInit, setIsPlacementRightInit] = useState(false);
  const [isPublishersLeftInit, setIsPublishersLeftInit] = useState(false);
  const [isPublishersRightInit, setIsPublishersRightInit] = useState(false);

  useEffect(() => {
    console.log(`🔄 ConsolidatedInvestmentDistribution MOUNTED - TabId: ${tabId}`);
    return () => {
      console.log(`💀 ConsolidatedInvestmentDistribution UNMOUNTED - TabId: ${tabId}`);
    };
  }, [tabId]);

  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(data.map((row) => row["brand root"]))).filter(Boolean);
    return brands.sort();
  }, [data]);

  const createBrandsWithSpend = useCallback(() => {
    const spendByBrand = data.reduce((acc, row) => {
      const brand = row["brand root"];
      const spend = Number(row["spend (usd)"]) || 0;
      acc[brand] = (acc[brand] || 0) + spend;
      return acc;
    }, {} as Record<string, number>);

    return uniqueBrands
      .map((brand) => ({ brand, totalSpend: spendByBrand[brand] || 0 }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [data, uniqueBrands]);

  const channelLeftBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);
  const channelRightBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);
  const placementLeftBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);
  const placementRightBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);
  const publishersLeftBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);
  const publishersRightBrandsWithSpend = useMemo(() => createBrandsWithSpend(), [createBrandsWithSpend]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isChannelLeftInit) {
      setChannelLeftChartBrands([]);
      setIsChannelLeftInit(true);
    }
  }, [uniqueBrands.length, isChannelLeftInit]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isPlacementLeftInit) {
      setPlacementLeftChartBrands([]);
      setIsPlacementLeftInit(true);
    }
  }, [uniqueBrands.length, isPlacementLeftInit]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isChannelRightInit) {
      const aventBrands = uniqueBrands.filter((brand) => brand.toLowerCase().includes("avent"));
      if (aventBrands.length > 0) {
        setChannelRightChartBrands([aventBrands[0]]);
      } else {
        const topBrand = channelRightBrandsWithSpend[0]?.brand;
        setChannelRightChartBrands(topBrand ? [topBrand] : []);
      }
      setIsChannelRightInit(true);
    }
  }, [uniqueBrands, isChannelRightInit, channelRightBrandsWithSpend]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isPlacementRightInit) {
      const aventBrands = uniqueBrands.filter((brand) => brand.toLowerCase().includes("avent"));
      if (aventBrands.length > 0) {
        setPlacementRightChartBrands([aventBrands[0]]);
      } else {
        const topBrand = placementRightBrandsWithSpend[0]?.brand;
        setPlacementRightChartBrands(topBrand ? [topBrand] : []);
      }
      setIsPlacementRightInit(true);
    }
  }, [uniqueBrands, isPlacementRightInit, placementRightBrandsWithSpend]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isPublishersLeftInit) {
      setPublishersLeftSelectedBrands([]);
      setIsPublishersLeftInit(true);
    }
  }, [uniqueBrands.length, isPublishersLeftInit]);

  useEffect(() => {
    if (uniqueBrands.length > 0 && !isPublishersRightInit) {
      const aventBrands = uniqueBrands.filter((brand) =>
        brand.toLowerCase().includes("avent")
      );
      if (aventBrands.length > 0) {
        setPublishersRightSelectedBrands([aventBrands[0]]);
      } else {
        const topBrand = publishersRightBrandsWithSpend[0]?.brand;
        setPublishersRightSelectedBrands(topBrand ? [topBrand] : []);
      }
      setIsPublishersRightInit(true);
    }
  }, [uniqueBrands, isPublishersRightInit, publishersRightBrandsWithSpend]);

  const handleChannelLeftChartBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`⬅️ Channel Left Chart Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setChannelLeftChartBrands([...newBrands]);
    },
    [tabId]
  );

  const handleChannelRightChartBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`➡️ Channel Right Chart Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setChannelRightChartBrands([...newBrands]);
    },
    [tabId]
  );

  const handlePlacementLeftChartBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`⬅️ Placement Left Chart Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setPlacementLeftChartBrands([...newBrands]);
    },
    [tabId]
  );

  const handlePlacementRightChartBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`➡️ Placement Right Chart Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setPlacementRightChartBrands([...newBrands]);
    },
    [tabId]
  );

  const handlePublishersLeftSelectedBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`⬅️ Publishers Left Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setPublishersLeftSelectedBrands([...newBrands]);
    },
    [tabId]
  );

  const handlePublishersRightSelectedBrandsChange = useCallback(
    (newBrands: string[]) => {
      console.log(`➡️ Publishers Right Brands Change - TabId: ${tabId}`, {
        to: newBrands,
      });
      setPublishersRightSelectedBrands([...newBrands]);
    },
    [tabId]
  );

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg py-2 px-4 mb-4 w-full">
          <h2 className="text-sm font-semibold text-amber-800 font-sans text-center">
            Investment Distribution Analysis
          </h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-white to-gray-50 shadow-soft rounded-2xl p-1 border border-gray-200">
          <TabsTrigger
            value="channels"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-100 data-[state=active]:to-emerald-100 data-[state=active]:text-green-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200"
          >
            Channel Distribution
          </TabsTrigger>
          <TabsTrigger
            value="placements"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-100 data-[state=active]:to-amber-100 data-[state=active]:text-orange-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200"
          >
            Placement Distribution
          </TabsTrigger>
          <TabsTrigger
            value="publishers"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-rose-100 data-[state=active]:text-pink-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200"
          >
            Top Publishers by Spend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-6">
          <DistributionComparison
            title="Brand Spend Distribution by Channel"
            type="Channel"
            leftChartBrands={channelLeftChartBrands}
            rightChartBrands={channelRightChartBrands}
            onLeftBrandsChange={handleChannelLeftChartBrandsChange}
            onRightBrandsChange={handleChannelRightChartBrandsChange}
            leftBrandsWithSpend={channelLeftBrandsWithSpend}
            rightBrandsWithSpend={channelRightBrandsWithSpend}
            data={data}
            tabId={tabId}
          />
        </TabsContent>

        <TabsContent value="placements" className="mt-6">
          <DistributionComparison
            title="Brand Spend Distribution by Placement"
            type="Placement"
            leftChartBrands={placementLeftChartBrands}
            rightChartBrands={placementRightChartBrands}
            onLeftBrandsChange={handlePlacementLeftChartBrandsChange}
            onRightBrandsChange={handlePlacementRightChartBrandsChange}
            leftBrandsWithSpend={placementLeftBrandsWithSpend}
            rightBrandsWithSpend={placementRightBrandsWithSpend}
            data={data}
            tabId={tabId}
          />
        </TabsContent>

        <TabsContent value="publishers" className="mt-6">
          <TopPublishersComparison
            data={data}
            leftSelectedBrands={publishersLeftSelectedBrands}
            rightSelectedBrands={publishersRightSelectedBrands}
            onLeftBrandsChange={handlePublishersLeftSelectedBrandsChange}
            onRightBrandsChange={handlePublishersRightSelectedBrandsChange}
            leftBrandsWithSpend={publishersLeftBrandsWithSpend}
            rightBrandsWithSpend={publishersRightBrandsWithSpend}
            tabId={tabId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedInvestmentDistribution;
