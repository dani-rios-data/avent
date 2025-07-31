import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { formatNumber } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartsProps {
  title: string;
  data: ChartData[];
  type?: "bar" | "line" | "donut";
  dataKey?: string;
  className?: string;
  colors?: string[];
}

const PASTEL_COLORS = [
  "hsl(345, 100%, 85%)", // blush-pink
  "hsl(45, 100%, 85%)",  // pale-yellow  
  "hsl(15, 100%, 85%)",  // soft-peach
  "hsl(270, 50%, 85%)",  // lavender
  "hsl(150, 50%, 85%)",  // mint
  "hsl(200, 50%, 85%)",  // soft-blue
];

const Charts = ({ 
  title, 
  data, 
  type = "bar", 
  dataKey = "value", 
  className = "",
  colors = PASTEL_COLORS 
}: ChartsProps) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis 
                dataKey="name" 
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
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey={dataKey} 
                fill={colors[0]} 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={`bg-white border-border shadow-soft rounded-2xl ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default Charts;