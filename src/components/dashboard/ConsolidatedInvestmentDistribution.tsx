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

  // Initialize defaults: All Brands vs Avent
  useEffect(() => {
    if (uniqueBrands.length > 0) {
      if (leftChartBrands.length === 0) {
        setLeftChartBrands([]); // All brands by default (empty array means all)
      }
      if (rightChartBrands.length === 0) {
        const aventBrands = uniqueBrands.filter(brand => 
          brand.toLowerCase().includes("avent")
        );
        setRightChartBrands(aventBrands.length > 0 ? [aventBrands[0]] : []);
      }
      if (publishersSelectedBrands.length === 0) {
        setPublishersSelectedBrands([]); // All brands by default for publishers
      }
    }
  }, [uniqueBrands.join(','), leftChartBrands.length, rightChartBrands.length, publishersSelectedBrands.length]);


  // Calculate publishers spend data for selected brands
  const publishersSpendData = useMemo(() => {
    const filteredData = publishersSelectedBrands.length === 0 
      ? yearFilteredData 
      : yearFilteredData.filter(row => publishersSelectedBrands.includes(row["brand root"]));

    const publisherSpends = filteredData.reduce((acc, row) => {
      const publisher = row.publisher;
      if (!publisher) return acc;
      
      acc[publisher] = (acc[publisher] || 0) + (Number(row["spend (usd)"]) || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(publisherSpends)
      .map(([publisher, spend]) => ({
        name: publisher,
        spend: spend / 1000000, // Convert to millions
        originalSpend: spend
      }))
      .sort((a, b) => b.spend - a.spend); // Sort by spend descending
  }, [yearFilteredData, publishersSelectedBrands]);


  const CustomDonutTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const originalValue = data.value * 1000000; // Convert back to original USD value
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl min-w-[200px]">
          <div className="border-b border-gray-100 pb-2 mb-2">
            <p className="font-semibold text-gray-900 text-sm">{data.name}</p>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Spend:</span>
              <span className="text-sm font-bold text-blue-600">
                ${formatDonutValue(data.value)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Exact Amount:</span>
              <span className="text-xs font-medium text-gray-700">
                ${originalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Share:</span>
              <span className="text-sm font-bold text-green-600">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="pt-1 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(data.percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }, []);

  // Enhanced formatting function for spend values with B/M/K system
  const formatSpendValue = (spend: number, originalSpend: number) => {
    if (originalSpend >= 1000000000) {
      // Show in billions with B suffix if 1B or more
      return `${(originalSpend / 1000000000).toFixed(1)}B`;
    } else if (originalSpend >= 1000000) {
      // Show in millions with M suffix if 1M or more
      return `${(originalSpend / 1000000).toFixed(1)}M`;
    } else if (originalSpend >= 1000) {
      // Show in thousands with K suffix if 1K or more but less than 1M
      return `${(originalSpend / 1000).toFixed(0)}K`;
    } else {
      // Show raw value if less than 1K
      return `${originalSpend.toFixed(0)}`;
    }
  };

  // Formatting function specifically for donut chart values
  const formatDonutValue = (value: number) => {
    // value is already in millions, so we need to convert back to original value
    const originalValue = value * 1000000;
    
    if (originalValue >= 1000000000) {
      return `${(originalValue / 1000000000).toFixed(1)}B`;
    } else if (originalValue >= 1000000) {
      return `${(originalValue / 1000000).toFixed(1)}M`;
    } else if (originalValue >= 1000) {
      return `${(originalValue / 1000).toFixed(0)}K`;
    } else {
      return `${originalValue.toFixed(0)}`;
    }
  };

  const TopPublishersContent = () => {
    // Calculate distribution for left chart (selected brands)
    const leftPublishersData = useMemo(() => {
      const filteredData = leftChartBrands.length === 0 
        ? yearFilteredData 
        : yearFilteredData.filter(row => leftChartBrands.includes(row["brand root"]));

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
    }, [yearFilteredData, leftChartBrands]);

    // Calculate distribution for right chart (selected brands)
    const rightPublishersData = useMemo(() => {
      const filteredData = rightChartBrands.length === 0 
        ? yearFilteredData 
        : yearFilteredData.filter(row => rightChartBrands.includes(row["brand root"]));

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
    }, [yearFilteredData, rightChartBrands]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Top Publishers by Spend</h2>
          <p className="text-sm text-muted-foreground">
            Publisher ranking comparison
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Chart - Publishers Ranking */}
          <Card className="bg-white border-border shadow-soft rounded-2xl">
            <CardHeader className="pb-4">
              {/* Left Chart Selector */}
              <div className="mb-4">
                <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <label className="text-xs font-medium text-foreground">Brand</label>
                    <MultiSelect
                      options={uniqueBrands}
                      selected={leftChartBrands}
                      onChange={setLeftChartBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {leftChartBrands.length === 0 ? "All Brands (Gross)" : leftChartBrands.length === 1 ? leftChartBrands[0] : `${leftChartBrands.length} brands selected`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Top 30 Publishers - Total: ${formatDonutValue(leftPublishersData.reduce((sum, item) => sum + item.spend, 0))}
              </p>
            </CardHeader>
            <CardContent>
              {leftPublishersData.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {leftPublishersData.map((publisher, index) => {
                    const maxSpend = leftPublishersData[0]?.spend || 1;
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

          {/* Right Chart - Publishers Ranking */}
          <Card className="bg-white border-border shadow-soft rounded-2xl">
            <CardHeader className="pb-4">
              {/* Right Chart Selector */}
              <div className="mb-4">
                <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
                  <div className="flex flex-col gap-1 min-w-[200px]">
                    <label className="text-xs font-medium text-foreground">Brand</label>
                    <MultiSelect
                      options={uniqueBrands}
                      selected={rightChartBrands}
                      onChange={setRightChartBrands}
                      placeholder="All Brands"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {rightChartBrands.length === 0 ? "All Brands (Gross)" : rightChartBrands.length === 1 ? rightChartBrands[0] : `${rightChartBrands.length} brands selected`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Top 30 Publishers - Total: ${formatDonutValue(rightPublishersData.reduce((sum, item) => sum + item.spend, 0))}
              </p>
            </CardHeader>
            <CardContent>
              {rightPublishersData.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {rightPublishersData.map((publisher, index) => {
                    const maxSpend = rightPublishersData[0]?.spend || 1;
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
                  <p className="text-muted-foreground text-sm">Select brands to view data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };


  // Stable chart component to prevent re-renders
  const StableDonutChart = memo(({ chartData, chartId }: { chartData: any[], chartId: string }) => {
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
              content={<CustomDonutTooltip />} 
              isAnimationActive={false}
              animationDuration={0}
              wrapperStyle={{ outline: 'none', border: 'none' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={40}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontSize: '10px', marginLeft: '4px' }}>
                  {value}
                </span>
              )}
              wrapperStyle={{
                fontSize: '10px',
                paddingTop: '10px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    if (prevProps.chartId !== nextProps.chartId) return false;
    if (prevProps.chartData.length !== nextProps.chartData.length) return false;
    
    // Deep comparison of chart data
    for (let i = 0; i < prevProps.chartData.length; i++) {
      const prev = prevProps.chartData[i];
      const next = nextProps.chartData[i];
      if (prev.name !== next.name || prev.value !== next.value || prev.percentage !== next.percentage) {
        return false;
      }
    }
    
    return true;
  });

  // Separate component for left chart to isolate re-renders
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

      const totalSpend = Object.values(spends).reduce((sum, spend) => sum + spend, 0);

      const result = Object.entries(spends)
        .map(([key, spend]) => ({
          name: key,
          value: spend / 1000000,
          percentage: ((spend / totalSpend) * 100),
        }))
        .sort((a, b) => b.value - a.value);
      
      return result;
    }, [data, selectedBrands.join(','), type]);

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
            Total spend: ${formatDonutValue(chartData.reduce((sum, item) => sum + item.value, 0))}
          </p>
        </CardHeader>
        <CardContent>
          <StableDonutChart chartData={chartData} chartId="left-chart" />
        </CardContent>
      </Card>
    );
  });

  // Separate component for right chart to isolate re-renders
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

      const totalSpend = Object.values(spends).reduce((sum, spend) => sum + spend, 0);

      const result = Object.entries(spends)
        .map(([key, spend]) => ({
          name: key,
          value: spend / 1000000,
          percentage: ((spend / totalSpend) * 100),
        }))
        .sort((a, b) => b.value - a.value);
        
      return result;
    }, [data, selectedBrands.join(','), type]);

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
            Total spend: ${formatDonutValue(chartData.reduce((sum, item) => sum + item.value, 0))}
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