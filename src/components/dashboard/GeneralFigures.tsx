import { useMemo } from "react";
import MetricCard from "./MetricCard";
import { DollarSign, BarChart3, Tags, Users } from "lucide-react";

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

interface GeneralFiguresProps {
  data: DataRow[];
}

const GeneralFigures = ({ data }: GeneralFiguresProps) => {
  const metrics = useMemo(() => {
    const totalSpend = data.reduce((sum, row) => sum + row["spend (usd)"], 0);
    const totalImpressions = data.reduce((sum, row) => sum + row.impressions, 0);
    
    const uniqueBrands = new Set(data.map(row => row["brand root"])).size;
    const uniquePublishers = new Set(data.map(row => row.publisher)).size;

    return {
      totalSpend,
      totalImpressions,
      uniqueBrands,
      uniquePublishers
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Total Spend"
          value={metrics.totalSpend}
          icon={DollarSign}
          type="currency"
          color="#ff6b9d"
        />
        
        <MetricCard
          title="Total Impressions"
          value={metrics.totalImpressions}
          icon={BarChart3}
          color="#4ecdc4"
        />
        
        <MetricCard
          title="Unique Brands"
          value={metrics.uniqueBrands}
          icon={Tags}
          color="#a78bfa"
        />
        
        <MetricCard
          title="Unique Publishers"
          value={metrics.uniquePublishers}
          icon={Users}
          color="#fbbf24"
        />
      </div>
    </div>
  );
};

export default GeneralFigures;