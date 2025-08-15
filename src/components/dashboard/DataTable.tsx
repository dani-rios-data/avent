import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableData {
  [key: string]: string | number;
}

interface DataTableProps {
  title: string;
  data: TableData[];
  columns: { key: string; label: string; type?: "currency" | "number" | "percentage" }[];
  className?: string;
}

const DataTable = ({ title, data, columns, className = "" }: DataTableProps) => {
  const formatValue = (value: string | number, type?: string) => {
    if (typeof value === 'number') {
      switch (type) {
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'number':
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toLocaleString();
        case 'percentage':
          if (value === 0) return "-";
          const sign = value > 0 ? "+" : "";
          return `${sign}${value.toFixed(1)}%`;
        default:
          return value.toLocaleString();
      }
    }
    return value;
  };

  const getYoYColor = (value: number) => {
    if (value === 0) return "text-gray-500";
    return value > 0 ? "text-green-600" : "text-red-500";
  };

  const getGradientStyle = (value: number, max: number, type: 'green' | 'blue') => {
    const intensity = (value / max) * 100;
    const baseColor = type === 'green' ? '140, 40%' : '210, 60%';
    const lightness = 90 - (intensity * 0.3); // From 90% to 60% lightness
    return {
      backgroundColor: `hsl(${baseColor}, ${lightness}%)`
    };
  };

  // Calculate max values for percentage columns
  const spendMax = Math.max(...data.map(row => typeof row['% Spend'] === 'number' ? row['% Spend'] : 0));
  const impressionsMax = Math.max(...data.map(row => typeof row['% Impressions'] === 'number' ? row['% Impressions'] : 0));

  return (
    <div className={`bg-white border border-border shadow-soft rounded-2xl overflow-hidden overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300 ${className}`}>
      {title && (
        <div className="p-6 pb-4">
          <div className="bg-yellow-50 border border-yellow-400 rounded-lg py-1 px-4 w-full">
            <div className="text-sm font-semibold text-amber-800 font-sans text-center">
              {title}
            </div>
          </div>
        </div>
      )}
      <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/30">
                {columns.map((column, index) => (
                  <TableHead 
                    key={column.key} 
                    className={`font-semibold min-w-32 px-4 ${
                      index === 0 
                        ? 'text-blue-800 bg-blue-50 sticky left-0 z-10' 
                        : 'text-amber-800 bg-yellow-50'
                    }`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={column.key} 
                      className={`font-medium min-w-32 px-4 ${
                        colIndex === 0 ? 'text-blue-800 bg-blue-50 sticky left-0 z-10' : ''
                      } ${
                        column.type === 'percentage' && column.key.includes('YoY') && typeof row[column.key] === 'number'
                          ? getYoYColor(row[column.key] as number)
                          : ''
                      }`}
                      style={
                        column.key === '% Spend' && typeof row[column.key] === 'number' 
                          ? getGradientStyle(row[column.key] as number, spendMax, 'green')
                          : column.key === '% Impressions' && typeof row[column.key] === 'number'
                          ? getGradientStyle(row[column.key] as number, impressionsMax, 'blue')
                          : {}
                      }
                    >
                      {formatValue(row[column.key], column.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;