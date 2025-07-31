import { useMemo } from "react";
import MetricCard from "../dashboard/MetricCard";
import Charts from "../dashboard/Charts";
import DataTable from "../dashboard/DataTable";
import { DollarSign, Eye, Building, Users } from "lucide-react";

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

interface ExecutiveSummaryProps {
  brandData: DataRow[];
  dmeData: DataRow[];
}

const ExecutiveSummary = ({ brandData, dmeData }: ExecutiveSummaryProps) => {
  return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <p>Executive Summary coming soon...</p>
    </div>
  );
};

export default ExecutiveSummary;