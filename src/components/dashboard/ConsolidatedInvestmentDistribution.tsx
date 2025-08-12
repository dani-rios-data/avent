import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [leftChartBrands, setLeftChartBrands] = useState<string[]>([]);
  const [rightChartBrands, setRightChartBrands] = useState<string[]>([]);
  const [publishersSelectedBrands, setPublishersSelectedBrands] = useState<string[]>([]);

  // Get unique years for selection
  const uniqueYears = useMemo(() => {
    const years = Array.from(new Set(data.map(row => row.year))).filter(Boolean);
    return years.sort();
  }, [data]);

  // Filter data by selected year
  const yearFilteredData = useMemo(() => {
    if (selectedYear === "all") return data;
    return data.filter(row => row.year === selectedYear);
  }, [data, selectedYear]);

  // Get unique brands from year-filtered data
  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(yearFilteredData.map(row => row["brand root"]))).filter(Boolean);
    return brands.sort();
  }, [yearFilteredData]);

  // Initialize defaults: All Brands vs Avent
  useMemo(() => {
    if (leftChartBrands.length === 0) {
      setLeftChartBrands(uniqueBrands); // All brands by default
    }
    if (rightChartBrands.length === 0) {
      const aventBrands = uniqueBrands.filter(brand => 
        brand.toLowerCase().includes("avent")
      );
      setRightChartBrands(aventBrands.length > 0 ? aventBrands : [uniqueBrands[0] || ""]);
    }
    if (publishersSelectedBrands.length === 0) {
      setPublishersSelectedBrands(uniqueBrands); // All brands by default for publishers
    }
  }, [uniqueBrands, leftChartBrands, rightChartBrands, publishersSelectedBrands]);


  // Calculate publishers spend data for selected brands
  const publishersSpendData = useMemo(() => {
    const filteredData = publishersSelectedBrands.length === uniqueBrands.length 
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
  }, [yearFilteredData, publishersSelectedBrands, uniqueBrands]);


  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-blue-600">
            {`Spend: $${formatNumber(data.value)}M`}
          </p>
          <p className="text-sm text-gray-600">
            {`${data.percentage.toFixed(1)}% of total`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom formatting function for spend values
  const formatSpendValue = (spend: number, originalSpend: number) => {
    if (originalSpend >= 1000000) {
      // Show in millions with M suffix if 1M or more
      return `${formatNumber(spend)}M`;
    } else if (originalSpend >= 1000) {
      // Show in thousands with K suffix if 1K or more but less than 1M
      return `${(originalSpend / 1000).toFixed(0)}K`;
    } else {
      // Show raw value if less than 1K
      return `${originalSpend.toFixed(0)}`;
    }
  };

  const TopPublishersContent = () => {
    // Calculate distribution for left chart (selected brands)
    const leftPublishersData = useMemo(() => {
      const filteredData = leftChartBrands.length === uniqueBrands.length 
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
    }, [yearFilteredData, leftChartBrands, uniqueBrands]);

    // Calculate distribution for right chart (selected brands)
    const rightPublishersData = useMemo(() => {
      const filteredData = yearFilteredData.filter(row => 
        rightChartBrands.includes(row["brand root"])
      );

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
            Publisher ranking comparison {selectedYear !== "all" && `- ${selectedYear}`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Chart - Publishers Ranking */}
          <Card className="bg-white border-border shadow-soft rounded-2xl">
            <CardHeader className="pb-4">
              {/* Left Chart Selector */}
              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-gray-700">
                      Select Brands:
                    </label>
                  </div>
                  <MultiSelect
                    options={uniqueBrands}
                    selected={leftChartBrands}
                    onChange={setLeftChartBrands}
                    placeholder="Select brands..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-600 font-medium">
                      {leftChartBrands.length === uniqueBrands.length ? "All Brands" : `${leftChartBrands.length} brand${leftChartBrands.length === 1 ? '' : 's'} selected`}
                    </div>
                    <button
                      onClick={() => setLeftChartBrands(uniqueBrands)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                    >
                      Select All
                    </button>
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {leftChartBrands.length === uniqueBrands.length ? "All Brands (Gross)" : 
                 leftChartBrands.length === 1 ? leftChartBrands[0] :
                 `${leftChartBrands.length} Selected Brands`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Top 30 Publishers - Total: ${formatNumber(leftPublishersData.reduce((sum, item) => sum + item.spend, 0))}M
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
              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-gray-700">
                      Select Brands:
                    </label>
                  </div>
                  <MultiSelect
                    options={uniqueBrands}
                    selected={rightChartBrands}
                    onChange={setRightChartBrands}
                    placeholder="Select brands..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-600 font-medium">
                      {rightChartBrands.length} brand{rightChartBrands.length === 1 ? '' : 's'} selected
                    </div>
                    <button
                      onClick={() => {
                        const aventBrands = uniqueBrands.filter(brand => 
                          brand.toLowerCase().includes("avent")
                        );
                        setRightChartBrands(aventBrands);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                    >
                      Select Avent
                    </button>
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {rightChartBrands.length === 1 ? rightChartBrands[0] : 
                 `${rightChartBrands.length} Selected Brands`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Top 30 Publishers - Total: ${formatNumber(rightPublishersData.reduce((sum, item) => sum + item.spend, 0))}M
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


  const DonutChartContent = ({ title, type }: { title: string, type: string }) => {
    // Calculate distribution for left chart (selected brands)
    const leftChartData = useMemo(() => {
      const field = type === "Channel" ? "channel" : "placement";
      const filteredData = leftChartBrands.length === uniqueBrands.length 
        ? yearFilteredData 
        : yearFilteredData.filter(row => leftChartBrands.includes(row["brand root"]));

      const spends = filteredData.reduce((acc, row) => {
        const key = row[field as keyof DataRow] as string;
        if (!key) return acc;
        
        acc[key] = (acc[key] || 0) + (Number(row["spend (usd)"]) || 0);
        return acc;
      }, {} as Record<string, number>);

      const totalSpend = Object.values(spends).reduce((sum, spend) => sum + spend, 0);

      return Object.entries(spends)
        .map(([key, spend]) => ({
          name: key,
          value: spend / 1000000, // Convert to millions
          percentage: ((spend / totalSpend) * 100),
        }))
        .sort((a, b) => b.value - a.value);
    }, [yearFilteredData, leftChartBrands, type, uniqueBrands]);

    // Calculate distribution for right chart (selected brands)
    const rightChartData = useMemo(() => {
      const field = type === "Channel" ? "channel" : "placement";
      const filteredData = yearFilteredData.filter(row => 
        rightChartBrands.includes(row["brand root"])
      );

      const spends = filteredData.reduce((acc, row) => {
        const key = row[field as keyof DataRow] as string;
        if (!key) return acc;
        
        acc[key] = (acc[key] || 0) + (Number(row["spend (usd)"]) || 0);
        return acc;
      }, {} as Record<string, number>);

      const totalSpend = Object.values(spends).reduce((sum, spend) => sum + spend, 0);

      return Object.entries(spends)
        .map(([key, spend]) => ({
          name: key,
          value: spend / 1000000, // Convert to millions
          percentage: ((spend / totalSpend) * 100),
        }))
        .sort((a, b) => b.value - a.value);
    }, [yearFilteredData, rightChartBrands, type]);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {type} breakdown comparison {selectedYear !== "all" && `- ${selectedYear}`}
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Chart */}
          <Card className="bg-white border-border shadow-soft rounded-2xl">
            <CardHeader className="pb-4">
              {/* Left Chart Selector */}
              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-gray-700">
                      Select Brands:
                    </label>
                  </div>
                  <MultiSelect
                    options={uniqueBrands}
                    selected={leftChartBrands}
                    onChange={setLeftChartBrands}
                    placeholder="Select brands..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-600 font-medium">
                      {leftChartBrands.length === uniqueBrands.length ? "All Brands" : `${leftChartBrands.length} brand${leftChartBrands.length === 1 ? '' : 's'} selected`}
                    </div>
                    <button
                      onClick={() => setLeftChartBrands(uniqueBrands)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                    >
                      Select All
                    </button>
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {leftChartBrands.length === uniqueBrands.length ? "All Brands (Gross)" : 
                 leftChartBrands.length === 1 ? leftChartBrands[0] :
                 `${leftChartBrands.length} Selected Brands`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Total spend: ${formatNumber(leftChartData.reduce((sum, item) => sum + item.value, 0))}M
              </p>
            </CardHeader>
            <CardContent>
              {leftChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leftChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {leftChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-left-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomDonutTooltip />} />
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
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground text-sm">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Chart */}
          <Card className="bg-white border-border shadow-soft rounded-2xl">
            <CardHeader className="pb-4">
              {/* Right Chart Selector */}
              <div className="space-y-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-medium text-gray-700">
                      Select Brands:
                    </label>
                  </div>
                  <MultiSelect
                    options={uniqueBrands}
                    selected={rightChartBrands}
                    onChange={setRightChartBrands}
                    placeholder="Select brands..."
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-600 font-medium">
                      {rightChartBrands.length} brand{rightChartBrands.length === 1 ? '' : 's'} selected
                    </div>
                    <button
                      onClick={() => {
                        const aventBrands = uniqueBrands.filter(brand => 
                          brand.toLowerCase().includes("avent")
                        );
                        setRightChartBrands(aventBrands);
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                    >
                      Select Avent
                    </button>
                  </div>
                </div>
              </div>

              <CardTitle className="text-md font-semibold text-foreground text-center mb-2">
                {rightChartBrands.length === 1 ? rightChartBrands[0] : 
                 `${rightChartBrands.length} Selected Brands`}
              </CardTitle>

              <p className="text-xs text-muted-foreground text-center">
                Total spend: ${formatNumber(rightChartData.reduce((sum, item) => sum + item.value, 0))}M
              </p>
            </CardHeader>
            <CardContent>
              {rightChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rightChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {rightChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-right-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomDonutTooltip />} />
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

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg py-2 px-4 mb-4 w-full">
          <h2 className="text-sm font-semibold text-amber-800 font-sans text-center">
            Investment Distribution Analysis
          </h2>
        </div>
      </div>

      {/* Year Selector */}
      <div className="bg-warm-cream border-border shadow-soft rounded-2xl p-4">
        <div className="flex flex-col gap-1 w-48">
          <label className="text-xs font-medium text-foreground">Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full bg-white border-border rounded-xl">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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