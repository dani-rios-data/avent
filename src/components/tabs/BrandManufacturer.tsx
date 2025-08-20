import { useState, useMemo } from "react";
import FilterBar from "../dashboard/FilterBar";
import SpendImpressionsByBrand from "../dashboard/SpendImpressionsByBrand";
import GeneralFigures from "../dashboard/GeneralFigures";
import Timeline from "../dashboard/Timeline";
import ConsolidatedInvestmentDistribution from "../dashboard/ConsolidatedInvestmentDistribution";

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

interface BrandManufacturerProps {
  data: DataRow[];
}

const BrandManufacturer = ({ data }: BrandManufacturerProps) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(row.year);
      const monthMatch = selectedMonths.length === 0 || selectedMonths.includes(row["month-year"]);
      return yearMatch && monthMatch;
    });
  }, [data, selectedYears, selectedMonths]);

  return (
    <div className="space-y-6">
      {/* Data Range Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800 font-medium">
          Dataset covers advertising data from January 1, 2024 to July 22, 2025
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        data={data}
        selectedYears={selectedYears}
        selectedMonths={selectedMonths}
        onYearChange={setSelectedYears}
        onMonthChange={setSelectedMonths}
      />

      {/* General Figures */}
      <GeneralFigures data={filteredData} />

      {/* Section 1: Spend and Impressions by Brand, by Year */}
      <SpendImpressionsByBrand 
        data={filteredData} 
        title="Brand"
      />

      {/* Timeline Section */}
      <Timeline 
        data={filteredData} 
        title="Brand"
      />

      {/* Investment Distribution Analysis */}
      <ConsolidatedInvestmentDistribution key="brand-manufacturer-investment" data={filteredData} tabId="brand-manufacturer" />
    </div>
  );
};

export default BrandManufacturer;