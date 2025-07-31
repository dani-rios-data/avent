import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  type?: "currency" | "number";
  color?: string;
}

const MetricCard = ({ title, value, icon: Icon, change, trend, className = "", type = "number", color = "#64748b" }: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      let formattedValue = '';
      if (val >= 1000000) {
        formattedValue = `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        formattedValue = `${(val / 1000).toFixed(1)}K`;
      } else {
        formattedValue = val.toLocaleString();
      }
      
      return type === 'currency' ? `$${formattedValue}` : formattedValue;
    }
    return val;
  };

  // Convert hex color to rgba for opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      className={`bg-white rounded-[20px] transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      style={{
        padding: '1.5rem',
        border: '1px solid #f1f5f9',
        borderTop: `3px solid ${color}`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2 capitalize tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
            {formatValue(value)}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div 
            className="flex items-center justify-center"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: hexToRgba(color, 0.1)
            }}
          >
            <Icon 
              style={{ color: color }}
              size={16}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;