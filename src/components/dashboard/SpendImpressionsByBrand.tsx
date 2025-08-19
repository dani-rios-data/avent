import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelectWithTotals } from "@/components/ui/multi-select-with-totals";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList, Cell } from "recharts";
import { formatNumber } from "@/lib/utils";
import DataTable from "./DataTable";
import { Star, Heart } from "lucide-react";

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

interface SpendImpressionsByBrandProps {
  data: DataRow[];
  title?: string;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: {
    year: string;
    _impressions: Record<string, number>;
    _totalSpend: number;
    [brand: string]: string | number | Record<string, number>;
  };
}

const BRAND_COLORS = [
  "hsl(345, 100%, 70%)", // blush-pink
  "hsl(45, 100%, 70%)",  // pale-yellow  
  "hsl(15, 100%, 70%)",  // soft-peach
  "hsl(270, 50%, 70%)",  // lavender
  "hsl(150, 50%, 70%)",  // mint
  "hsl(200, 50%, 70%)",  // soft-blue
  "hsl(30, 50%, 70%)",   // warm orange
  "hsl(180, 50%, 70%)",  // teal
  "hsl(300, 50%, 70%)",  // purple
  "hsl(120, 50%, 70%)",  // green
];

const SpendImpressionsByBrand = ({ data, title = "Brand" }: SpendImpressionsByBrandProps) => {
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

  const allBrands = useMemo(() => {
    return allBrandsWithSpend.map(item => item.brand);
  }, [allBrandsWithSpend]);

  const [selectedSpendBrands, setSelectedSpendBrands] = useState<string[]>([]);

  // Update selected brands when allBrands changes
  useMemo(() => {
    if (allBrands.length > 0 && selectedSpendBrands.length === 0) {
      setSelectedSpendBrands(allBrands.slice(0, 15));
    }
  }, [allBrands, selectedSpendBrands.length]);

  const spendChartData = useMemo(() => {
    const yearData = data.reduce((acc, row) => {
      const year = row.year;
      const brand = row["brand root"];
      
      if (!acc[year]) {
        acc[year] = { year, _impressions: {}, _totalSpend: 0 };
      }
      
      if (!acc[year][brand]) {
        acc[year][brand] = 0;
        acc[year]._impressions[brand] = 0;
      }
      
      acc[year][brand] += row["spend (usd)"];
      acc[year]._impressions[brand] += row.impressions;
      acc[year]._totalSpend += row["spend (usd)"];
      
      return acc;
    }, {} as Record<string, { year: string; _impressions: Record<string, number>; _totalSpend: number; [brand: string]: number }>);

    // Sort brands within each year by their individual year values
    return Object.values(yearData)
      .sort((a, b) => String(a.year).localeCompare(String(b.year)))
      .map((yearData) => {
        const sortedYearData = { 
          year: yearData.year, 
          _impressions: yearData._impressions,
          _totalSpend: yearData._totalSpend 
        };
        
        // Get all brands for this year and sort by value (highest first)
        const brandEntries = Object.entries(yearData)
          .filter(([key]) => !key.startsWith('_') && key !== 'year')
          .sort(([, a], [, b]) => (b as number) - (a as number));
        
        // Add sorted brands back to the year data
        brandEntries.forEach(([brand, value]) => {
          sortedYearData[brand] = value;
        });
        
        return sortedYearData;
      });
  }, [data]);

  const spendTableData = useMemo(() => {
    return spendChartData.map((yearData) => {
      const row: Record<string, string | number> = { Year: yearData.year };
      selectedSpendBrands.forEach(brand => {
        row[brand] = yearData[brand] || 0;
      });
      return row;
    }).sort((a, b) => String(a.Year).localeCompare(String(b.Year)));
  }, [spendChartData, selectedSpendBrands]);

  const spendTableColumns = useMemo(() => {
    const columns = [{ key: "Year", label: "Year" }];
    selectedSpendBrands.forEach(brand => {
      columns.push({ 
        key: brand, 
        label: brand, 
        type: "currency" as const 
      });
    });
    return columns;
  }, [selectedSpendBrands]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length > 0) {
      // Get the specific bar data that's being hovered
      const hoveredEntry = payload[0];
      
      const brand = hoveredEntry.dataKey;
      const spend = hoveredEntry.value;
      const yearData = hoveredEntry.payload;
      const totalSpend = yearData._totalSpend;
      const impressions = yearData._impressions[brand] || 0;
      const totalImpressions = Object.values(yearData._impressions).reduce((sum: number, val: number) => sum + (val || 0), 0);
      const spendPercentage = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;
      const impressionsPercentage = totalImpressions > 0 ? (impressions / totalImpressions) * 100 : 0;

      // Only show tooltip if the bar has actual data
      if (!spend || spend === 0) {
        return null;
      }

      return (
        <div className="bg-white p-4 border border-gray-300 rounded-xl shadow-2xl max-w-xs" style={{ 
          backgroundColor: '#ffffff', 
          opacity: 1, 
          zIndex: 99999 
        }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <div className="font-semibold text-gray-800">{label}</div>
              <div className="text-sm text-gray-600">•</div>
              <div className="font-medium text-gray-700">{brand}</div>
              {brand === "Avent" && (
                <Heart className="w-4 h-4 text-teal-600 fill-teal-600" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-gray-600">Spend:</span>
                <span className="font-semibold text-lg" style={{ color: hoveredEntry.color }}>
                  ${formatNumber(spend)}
                </span>
                <span className="text-sm text-gray-500">
                  ({spendPercentage.toFixed(1)}%)
                </span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-gray-600">Impressions:</span>
                <span className="font-medium text-gray-700">
                  {formatNumber(impressions)}
                </span>
                <span className="text-sm text-gray-500">
                  ({impressionsPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label component for Avent bars
  const AventLabel = (props: { x: number; y: number; width: number; value: number }) => {
    const { x, y, width, value } = props;
    
    // Only show if there's a value
    if (!value || value === 0) {
      return null;
    }
    
    return (
      <g>
        {/* Background circle */}
        <circle
          cx={x + width / 2}
          cy={y - 15}
          r="12"
          fill="#e0f2fe"
        />
        {/* Heart emoji */}
        <text
          x={x + width / 2}
          y={y - 10}
          textAnchor="middle"
          fontSize="14"
          fill="#dc2626"
        >
          💙
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="bg-yellow-50 border border-yellow-400 rounded-lg py-2 px-4 mb-4 w-full">
          <h2 className="text-sm font-semibold text-amber-800 font-sans text-center">
            Annual Advertising Spend Analysis
          </h2>
        </div>
      </div>

      {/* Spend Chart */}
      <div className="space-y-4">
        <Card className="bg-white border-border shadow-soft rounded-2xl overflow-visible">
          <CardHeader className="pb-4">
            <div className="flex justify-end items-center gap-3">
              <span className="text-black font-bold text-sm">{title}</span>
              <div className="w-80">
                <MultiSelectWithTotals
                  options={allBrandsWithSpend}
                  selected={selectedSpendBrands}
                  onChange={setSelectedSpendBrands}
                  placeholder={`Select ${title.toLowerCase()}s...`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-visible">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendChartData} barCategoryGap="5%" maxBarSize={40}>
                <XAxis 
                  dataKey="year" 
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
                  shared={false}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  wrapperStyle={{ 
                    zIndex: 99999
                  }}
                />
                {selectedSpendBrands
                  .sort((a, b) => {
                    // Calculate total spend for each brand across all years to maintain consistent order
                    const totalA = spendChartData.reduce((sum, yearData) => sum + (yearData[a] || 0), 0);
                    const totalB = spendChartData.reduce((sum, yearData) => sum + (yearData[b] || 0), 0);
                    return totalB - totalA; // Highest first
                  })
                  .map((brand, index) => (
                    <Bar
                      key={brand}
                      dataKey={brand}
                      fill={brand === "Avent" ? "hsl(173, 58%, 39%)" : BRAND_COLORS[index % BRAND_COLORS.length]}
                      stroke={brand === "Avent" ? "hsl(173, 58%, 29%)" : "none"}
                      strokeWidth={brand === "Avent" ? 2 : 0}
                      radius={[6, 6, 0, 0]}
                    >
                      {brand === "Avent" && (
                        <LabelList 
                          content={AventLabel}
                          position="top"
                        />
                      )}
                    </Bar>
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spend Table */}
        <DataTable
          title=""
          data={spendTableData}
          columns={spendTableColumns}
        />
      </div>
    </div>
  );
};

export default SpendImpressionsByBrand;