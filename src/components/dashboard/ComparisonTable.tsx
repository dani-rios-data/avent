import { useMemo } from "react";

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

interface ComparisonTableProps {
  data: DataRow[];
  selectedBrands: string[];
}

const ComparisonTable = ({ data, selectedBrands }: ComparisonTableProps) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const processedData = useMemo(() => {
    // Group data by brand, year, and month
    const groupedData: Record<string, Record<string, Record<string, number>>> = {};
    
    data.forEach(row => {
      const brand = row["brand root"];
      const year = row.year;
      const monthYear = row["month-year"];
      
      // Extract month from month-year (e.g., "Jan 2024" -> "Jan")
      const monthName = monthYear.split(' ')[0];
      
      if (!groupedData[brand]) {
        groupedData[brand] = {};
      }
      
      if (!groupedData[brand][year]) {
        groupedData[brand][year] = {};
      }
      
      if (!groupedData[brand][year][monthName]) {
        groupedData[brand][year][monthName] = 0;
      }
      
      groupedData[brand][year][monthName] += row["spend (usd)"];
    });
    
    // Calculate YoY growth for each brand and month
    const result: Record<string, Record<string, { "2024": number; "2025": number; yoy: number }>> = {};
    
    selectedBrands.forEach(brand => {
      result[brand] = {};
      
      months.forEach(month => {
        const value2024 = groupedData[brand]?.["2024"]?.[month] || 0;
        const value2025 = groupedData[brand]?.["2025"]?.[month] || 0;
        
        // Calculate YoY percentage growth
        let yoyGrowth = 0;
        if (value2024 > 0) {
          yoyGrowth = ((value2025 - value2024) / value2024) * 100;
        } else if (value2025 > 0) {
          yoyGrowth = 100; // If no data in 2024 but exists in 2025, it's 100% growth
        }
        
        result[brand][month] = {
          "2024": value2024,
          "2025": value2025,
          yoy: yoyGrowth
        };
      });
    });
    
    return result;
  }, [data, selectedBrands]);

  const formatCurrency = (value: number) => {
    if (value === 0) return "-";
    return `$${Math.round(value).toLocaleString()}`;
  };

  const formatYoY = (value: number) => {
    if (value === 0) return "-";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value)}%`;
  };

  const getYoYColor = (value: number) => {
    if (value === 0) return "text-gray-500";
    return value > 0 ? "text-green-600" : "text-red-500";
  };

  return (
    <div className="bg-white border border-border shadow-soft rounded-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        <table className="min-w-full">
          <thead>
            {/* First header row - Brand names */}
            <tr className="bg-muted/30">
              <th 
                rowSpan={2} 
                className="font-medium text-blue-800 bg-blue-50 px-4 py-2 text-left border-r border-gray-200 sticky left-0 z-10 text-sm"
                style={{ minWidth: '100px' }}
              >
                Month
              </th>
              {selectedBrands.map((brand, index) => (
                <th 
                  key={brand}
                  colSpan={3}
                  className="font-medium text-amber-800 bg-yellow-50 px-4 py-2 text-center border-r border-gray-200 text-sm"
                  style={{ minWidth: '300px' }}
                >
                  {brand}
                </th>
              ))}
            </tr>
            
            {/* Second header row - Year and YoY columns */}
            <tr className="bg-muted/30">
              {selectedBrands.map((brand) => (
                <>
                  <th 
                    key={`${brand}-2024`}
                    className="font-medium text-amber-700 bg-yellow-50 px-4 py-1 text-center border-r border-gray-100 text-xs"
                    style={{ minWidth: '120px' }}
                  >
                    2024
                  </th>
                  <th 
                    key={`${brand}-2025`}
                    className="font-medium text-amber-700 bg-yellow-50 px-4 py-1 text-center border-r border-gray-100 text-xs"
                    style={{ minWidth: '120px' }}
                  >
                    2025
                  </th>
                  <th 
                    key={`${brand}-yoy`}
                    className="font-medium text-amber-700 bg-yellow-50 px-4 py-1 text-center border-r border-gray-200 text-xs"
                    style={{ minWidth: '80px' }}
                  >
                    YoY
                  </th>
                </>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {months.map((month, monthIndex) => (
              <tr key={month} className="hover:bg-muted/20 border-b border-gray-100">
                <td className="font-medium px-4 py-2 text-blue-800 bg-blue-50 border-r border-gray-200 sticky left-0 z-10 text-sm">
                  {month}
                </td>
                {selectedBrands.map((brand) => {
                  const monthData = processedData[brand]?.[month];
                  return (
                    <>
                      <td 
                        key={`${brand}-2024-${month}`}
                        className="px-4 py-2 text-right font-medium border-r border-gray-100 text-xs"
                      >
                        {formatCurrency(monthData?.["2024"] || 0)}
                      </td>
                      <td 
                        key={`${brand}-2025-${month}`}
                        className="px-4 py-2 text-right font-medium border-r border-gray-100 text-xs"
                      >
                        {formatCurrency(monthData?.["2025"] || 0)}
                      </td>
                      <td 
                        key={`${brand}-yoy-${month}`}
                        className={`px-4 py-2 text-right font-medium border-r border-gray-200 text-xs ${getYoYColor(monthData?.yoy || 0)}`}
                      >
                        {formatYoY(monthData?.yoy || 0)}
                      </td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;