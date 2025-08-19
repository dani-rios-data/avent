import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { MultiSelect } from "@/components/ui/multi-select";
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

interface ConsolidatedInvestmentDistributionProps {
  data: DataRow[];
}

const CHART_COLORS = [
  "#7DD3FC", // sky-300 - azul tierno
  "#86EFAC", // green-300 - verde tierno
  "#FDE047", // yellow-300 - amarillo suave
  "#FDA4AF", // rose-300 - rosa tierno
  "#C4B5FD", // violet-300 - violeta suave
  "#67E8F9", // cyan-300 - cyan tierno
  "#FCA5A5", // red-300 - rojo suave
  "#FDBA74", // orange-300 - naranja tierno
  "#D8B4FE", // purple-300 - púrpura suave
  "#6EE7B7", // emerald-300 - esmeralda tierno
  "#93C5FD", // blue-300 - azul claro tierno
  "#F9A8D4", // pink-300 - rosa claro
  "#A7F3D0", // emerald-200 - verde muy suave
  "#FEF08A", // yellow-200 - amarillo muy tierno
  "#DBEAFE", // blue-200 - azul muy suave
];

const ConsolidatedInvestmentDistribution = ({ data }: ConsolidatedInvestmentDistributionProps) => {
  const [activeTab, setActiveTab] = useState("channels");
  const [leftChartBrands, setLeftChartBrands] = useState<string[]>([]);
  const [rightChartBrands, setRightChartBrands] = useState<string[]>([]);
  const [publishersSelectedBrands, setPublishersSelectedBrands] = useState<string[]>([]);

  // Use data directly since it's already filtered by global selectors
  const yearFilteredData = data;

  // Get unique brands from year-filtered data
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(yearFilteredData.map(row => row["brand root"]))).filter(Boolean);
    return brands.sort();
  }, [yearFilteredData]);

  // Initialize defaults: All Brands vs Avent or top brand if Avent is missing
  const uniqueBrandsKey = uniqueBrands.join(',');
  useEffect(() => {
    if (uniqueBrands.length > 0) {
      if (leftChartBrands.length === 0) {
        setLeftChartBrands([]); // All brands by default (empty array means all)
      }
      if (rightChartBrands.length === 0) {
        const aventBrands = uniqueBrands.filter(brand =>
          brand.toLowerCase().includes("avent")
        );
        if (aventBrands.length > 0) {
          setRightChartBrands([aventBrands[0]]);
        } else {
          // Find brand with highest total spend
          const spendByBrand = yearFilteredData.reduce((acc, row) => {
            const brand = row["brand root"];
            const spend = Number(row["spend (usd)"]) || 0;
            acc[brand] = (acc[brand] || 0) + spend;
            return acc;
          }, {} as Record<string, number>);
          const topBrand = Object.entries(spendByBrand)
            .sort((a, b) => b[1] - a[1])[0]?.[0];
          setRightChartBrands(topBrand ? [topBrand] : []);
        }
      }
      if (publishersSelectedBrands.length === 0) {
        setPublishersSelectedBrands([]); // All brands by default for publishers
      }
    }
  }, [uniqueBrandsKey, uniqueBrands, leftChartBrands.length, rightChartBrands.length, publishersSelectedBrands.length, yearFilteredData]);

  const TopPublishersContent = () => {
    // Calculate distribution for publishers (using independent state)
    const publishersRankingData = useMemo(() => {
      const filteredData = publishersSelectedBrands.length === 0 
        ? yearFilteredData 
        : yearFilteredData.filter(row => publishersSelectedBrands.includes(row["brand root"]));

      const publisherSpends = filteredData.reduce((acc, row) => {
        const publisher = row.publisher;
        if (!publisher) return acc;
        
        acc[publisher] = (acc[publisher] || 0) + (Number(row["spend (usd)"]) || 0);
        return acc;
      }, {} as Record<string, number>);

      const totalSpend = Object.values(publisherSpends).reduce((sum, spend) => sum + spend, 0);

      return Object.entries(publisherSpends)
        .map(([publisher, spend]) => ({
          name: publisher,
          spend: spend / 1000000, // Convert to millions for display calculation
          originalSpend: spend, // Keep original value for formatting and percentage
          percentage: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
        }))
        .sort((a, b) => b.originalSpend - a.originalSpend)
        .slice(0, 30); // Top 30
    }, [publishersSelectedBrands]);

    const formatSpendValue = (spend: number, originalSpend: number) => {
      if (originalSpend >= 1000000) {
        return `${(originalSpend / 1000000).toFixed(1)}M`;
      } else if (originalSpend >= 1000) {
        return `${(originalSpend / 1000).toFixed(0)}K`;
      } else {
        return originalSpend.toFixed(0);
      }
    };

    const formatDonutValue = (value: number) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
      } else {
        return value.toFixed(0);
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Top Publishers by Spend</h2>
          <p className="text-sm text-muted-foreground">
            Publisher ranking by selected brands
          </p>
        </div>

        {/* Single Publishers Chart with Independent Selector */}
        <Card className="bg-white border-border shadow-soft rounded-2xl">
          <CardHeader className="pb-4">
            {/* Publishers Chart Selector */}
            <div className="mb-4">
              <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <label className="text-xs font-medium text-foreground">Brand</label>
                  <MultiSelect
                    options={uniqueBrands}
                    selected={publishersSelectedBrands}
                    onChange={setPublishersSelectedBrands}
                    placeholder="All Brands"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
              {publishersSelectedBrands.length === 0 ? "All Brands (Gross)" : publishersSelectedBrands.length === 1 ? publishersSelectedBrands[0] : `${publishersSelectedBrands.length} brands selected`}
            </CardTitle>

            <p className="text-xs text-muted-foreground text-center">
              Top 30 Publishers - Total: ${formatDonutValue(publishersRankingData.reduce((sum, item) => sum + item.spend, 0))}
            </p>
          </CardHeader>
          <CardContent>
            {publishersRankingData.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {publishersRankingData.map((publisher, index) => {
                  const maxSpend = publishersRankingData[0]?.spend || 1;
                  const percentage = (publisher.spend / maxSpend) * 100;
                  
                  return (
                    <div key={publisher.name} className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100 hover:shadow-sm transition-all duration-200">
                      {/* Ranking Number */}
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Publisher Name */}
                      <div className="flex-shrink-0 w-32 text-xs font-semibold text-gray-800 truncate" title={publisher.name}>
                        {publisher.name}
                      </div>
                      
                      {/* Progress Bar */}
                      <TooltipProvider delayDuration={100}>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1 relative cursor-pointer">
                              <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                  className="bg-gradient-to-r from-pink-400 to-rose-400 h-4 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.max(percentage, 2)}%` }}
                                />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800">{publisher.name}</p>
                              <p className="text-sm text-pink-600">
                                Spend: ${formatSpendValue(publisher.spend, publisher.originalSpend)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {publisher.percentage.toFixed(1)}% of total spend
                              </p>
                            </div>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                      
                      {/* Spend Amount */}
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="text-xs font-bold text-pink-700">
                          ${formatSpendValue(publisher.spend, publisher.originalSpend)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground text-sm">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Stable chart component to prevent re-renders
  interface ChartDataItem {
    name: string;
    value: number;
  }
  
  const StableDonutChart = memo(({ chartData, chartId }: { chartData: ChartDataItem[], chartId: string }) => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-sm">No data available</p>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: '300px', position: 'relative' }}>
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
              isAnimationActive={false}
              animationBegin={0}
              animationDuration={0}
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
                name
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  });

  const LeftChart = memo(({
    title,
    type,
    selectedBrands,
    onBrandsChange,
    data 
  }: { 
    title: string, 
    type: string, 
    selectedBrands: string[], 
    onBrandsChange: (brands: string[]) => void,
    data: DataRow[]
  }) => {
    const chartData = useMemo(() => {
      const field = type === "Channel" ? "channel" : "placement";
      
      const filteredData = selectedBrands.length === 0 
        ? data 
        : data.filter(row => selectedBrands.includes(row["brand root"]));

      if (filteredData.length === 0) return [];

      const spends = filteredData.reduce((acc, row) => {
        const key = row[field as keyof DataRow] as string;
        if (!key) return acc;
        
        acc[key] = (acc[key] || 0) + (Number(row["spend (usd)"]) || 0);
        return acc;
      }, {} as Record<string, number>);

      const result = Object.entries(spends)
        .map(([name, value]) => ({
          name,
          value: value / 1000000 // Convert to millions
        }))
        .sort((a, b) => b.value - a.value);
        
      return result;
    }, [data, selectedBrands, type]);

    return (
      <Card className="bg-white border-border shadow-soft rounded-2xl">
        <CardHeader className="pb-4">
          <div className="mb-4">
            <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
              <div className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-xs font-medium text-foreground">Brand</label>
                <MultiSelect
                  options={uniqueBrands}
                  selected={selectedBrands}
                  onChange={onBrandsChange}
                  placeholder="All Brands"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
            {selectedBrands.length === 0 ? "All Brands (Gross)" : selectedBrands.length === 1 ? selectedBrands[0] : `${selectedBrands.length} brands selected`}
          </CardTitle>

          <p className="text-xs text-muted-foreground text-center">
            Total spend: ${formatNumber(chartData.reduce((sum, item) => sum + item.value, 0) * 1000000)}
          </p>
        </CardHeader>
        <CardContent>
          <StableDonutChart chartData={chartData} chartId="left-chart" />
        </CardContent>
      </Card>
    );
  });

  const RightChart = memo(({
    title,
    type,
    selectedBrands,
    onBrandsChange,
    data 
  }: { 
    title: string, 
    type: string, 
    selectedBrands: string[], 
    onBrandsChange: (brands: string[]) => void,
    data: DataRow[]
  }) => {
    const chartData = useMemo(() => {
      const field = type === "Channel" ? "channel" : "placement";
      
      const filteredData = selectedBrands.length === 0 
        ? data 
        : data.filter(row => selectedBrands.includes(row["brand root"]));

      if (filteredData.length === 0) return [];

      const spends = filteredData.reduce((acc, row) => {
        const key = row[field as keyof DataRow] as string;
        if (!key) return acc;
        
        acc[key] = (acc[key] || 0) + (Number(row["spend (usd)"]) || 0);
        return acc;
      }, {} as Record<string, number>);

      const result = Object.entries(spends)
        .map(([name, value]) => ({
          name,
          value: value / 1000000 // Convert to millions
        }))
        .sort((a, b) => b.value - a.value);
        
      return result;
    }, [data, selectedBrands, type]);

    return (
      <Card className="bg-white border-border shadow-soft rounded-2xl">
        <CardHeader className="pb-4">
          <div className="mb-4">
            <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
              <div className="flex flex-col gap-1 min-w-[200px]">
                <label className="text-xs font-medium text-foreground">Brand</label>
                <MultiSelect
                  options={uniqueBrands}
                  selected={selectedBrands}
                  onChange={onBrandsChange}
                  placeholder="All Brands"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
            {selectedBrands.length === 0 ? "All Brands (Gross)" : selectedBrands.length === 1 ? selectedBrands[0] : `${selectedBrands.length} brands selected`}
          </CardTitle>

          <p className="text-xs text-muted-foreground text-center">
            Total spend: ${formatNumber(chartData.reduce((sum, item) => sum + item.value, 0) * 1000000)}
          </p>
        </CardHeader>
        <CardContent>
          <StableDonutChart chartData={chartData} chartId="right-chart" />
        </CardContent>
      </Card>
    );
  });

  const DonutChartContent = ({ title, type }: { title: string, type: string }) => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {type} breakdown comparison
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeftChart
            title={title}
            type={type}
            selectedBrands={leftChartBrands}
            onBrandsChange={setLeftChartBrands}
            data={yearFilteredData}
          />
          
          <RightChart
            title={title}
            type={type}
            selectedBrands={rightChartBrands}
            onBrandsChange={setRightChartBrands}
            data={yearFilteredData}
          />
        </div>
      </div>
    );
  };

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
          <TabsTrigger value="channels" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-100 data-[state=active]:to-emerald-100 data-[state=active]:text-green-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200">
            Channel Distribution
          </TabsTrigger>
          <TabsTrigger value="placements" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-100 data-[state=active]:to-amber-100 data-[state=active]:text-orange-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200">
            Placement Distribution
          </TabsTrigger>
          <TabsTrigger value="publishers" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-rose-100 data-[state=active]:text-pink-800 data-[state=active]:shadow-soft font-semibold transition-all duration-200">
            Top Publishers by Spend
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="mt-6">
          <DonutChartContent 
            title="Brand Spend Distribution by Channel" 
            type="Channel"
          />
        </TabsContent>
        
        <TabsContent value="placements" className="mt-6">
          <DonutChartContent 
            title="Brand Spend Distribution by Placement" 
            type="Placement"
          />
        </TabsContent>
        
        <TabsContent value="publishers" className="mt-6">
          <TopPublishersContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedInvestmentDistribution;