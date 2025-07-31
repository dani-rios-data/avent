import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MultiSelectWithTotals } from "@/components/ui/multi-select-with-totals";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber } from "@/lib/utils";
import ComparisonTable from "./ComparisonTable";

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

interface TimelineProps {
  data: DataRow[];
  title?: string;
}

const BRAND_COLORS = [
  "#ff6b9d", // rosa vibrante
  "#4ecdc4", // verde agua
  "#a78bfa", // púrpura suave
  "#fbbf24", // amarillo dorado
  "#ef4444", // rojo
  "#10b981", // verde
  "#3b82f6", // azul
  "#f97316", // naranja
  "#8b5cf6", // violeta
  "#06b6d4", // cyan
];

const Timeline = ({ data, title = "Brand" }: TimelineProps) => {
  const allBrandsWithSpend = useMemo(() => {
    // Calculate total spend for each brand
    const brandSpend = data.reduce((acc, row) => {
      const brand = row["brand root"];
      if (!acc[brand]) {
        acc[brand] = 0;
      }
      acc[brand] += row["spend (usd)"];
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by total spend (highest first)
    return Object.entries(brandSpend)
      .sort(([, a], [, b]) => b - a)
      .map(([brand, totalSpend]) => ({ brand, totalSpend }));
  }, [data]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Update selected brands when allBrands changes
  useMemo(() => {
    if (allBrandsWithSpend.length > 0 && selectedBrands.length === 0) {
      setSelectedBrands(allBrandsWithSpend.slice(0, 8).map(item => item.brand));
    }
  }, [allBrandsWithSpend, selectedBrands.length]);

  const lineChartData = useMemo(() => {
    const monthData = data.reduce((acc, row) => {
      const monthYear = row["month-year"];
      const brand = row["brand root"];
      
      if (!acc[monthYear]) {
        acc[monthYear] = { monthYear };
      }
      
      if (!acc[monthYear][brand]) {
        acc[monthYear][brand] = 0;
      }
      
      acc[monthYear][brand] += row["spend (usd)"];
      
      return acc;
    }, {} as Record<string, any>);

    // Sort by month-year chronologically
    return Object.values(monthData).sort((a: any, b: any) => {
      return new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime();
    });
  }, [data]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      // Calculate total for the month
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-xl min-w-48" style={{ 
          backgroundColor: '#ffffff', 
          opacity: 1, 
          zIndex: 99999 
        }}>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-800 pb-1 border-b border-gray-100">
              {label}
            </div>
            
            <div className="space-y-1">
              {payload.map((entry: any, index: number) => {
                const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600 truncate">{entry.dataKey}</span>
                        {entry.dataKey === "Avent" && (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs tabular-nums flex gap-2">
                      <span className="font-medium text-gray-800">
                        ${formatNumber(entry.value)}
                      </span>
                      <span className="text-gray-500">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Total row */}
              <div className="pt-1 mt-1 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-800">Total</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 tabular-nums">
                    ${formatNumber(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg py-2 px-4 mb-4 w-full">
          <h2 className="text-sm font-semibold text-amber-800 font-sans text-center">
            Spend Over Time by {title}
          </h2>
        </div>
      </div>

      {/* Line Chart */}
      <div className="space-y-4">
        <Card className="bg-white border-border shadow-soft rounded-2xl overflow-visible">
          <CardHeader className="pb-4">
            <div className="flex justify-end items-center gap-3">
              <span className="text-black font-bold text-sm">{title}</span>
              <div className="w-80">
                <MultiSelectWithTotals
                  options={allBrandsWithSpend}
                  selected={selectedBrands}
                  onChange={setSelectedBrands}
                  placeholder={`Select ${title.toLowerCase()}s...`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-visible">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <XAxis 
                  dataKey="monthYear" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(215.4, 16.3%, 46.9%)" }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(215.4, 16.3%, 46.9%)" }}
                  tickFormatter={formatNumber}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  wrapperStyle={{ 
                    zIndex: 99999
                  }}
                />
                {selectedBrands.map((brand, index) => (
                  <Line
                    key={brand}
                    type="monotone"
                    dataKey={brand}
                    stroke={brand === "Avent" ? "hsl(173, 58%, 39%)" : BRAND_COLORS[index % BRAND_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <ComparisonTable
          data={data}
          selectedBrands={selectedBrands}
        />
      </div>
    </div>
  );
};

export default Timeline;