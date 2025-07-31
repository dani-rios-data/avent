import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";

interface FilterBarProps {
  data: any[];
  selectedYears: string[];
  selectedMonths: string[];
  onYearChange: (years: string[]) => void;
  onMonthChange: (months: string[]) => void;
}

const FilterBar = ({
  data,
  selectedYears,
  selectedMonths,
  onYearChange,
  onMonthChange
}: FilterBarProps) => {
  const { years, availableMonths } = useMemo(() => {
    const years = [...new Set(data.map(row => row.year))].sort().reverse(); // Newest first
    
    // Filter months based on selected years
    const filteredData = selectedYears.length > 0 
      ? data.filter(row => selectedYears.includes(row.year))
      : data;
    
    const availableMonths = [...new Set(filteredData.map(row => row["month-year"]))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Newest first
    
    return { years, availableMonths };
  }, [data, selectedYears]);


  return (
    <Card className="bg-warm-cream border-border shadow-soft rounded-2xl p-4 sticky top-0 z-10">
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-medium text-foreground">Year</label>
          <MultiSelect
            options={years}
            selected={selectedYears}
            onChange={onYearChange}
            placeholder="All Years"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[200px]">
          <label className="text-xs font-medium text-foreground">Month</label>
          <MultiSelect
            options={availableMonths}
            selected={selectedMonths}
            onChange={onMonthChange}
            placeholder="All Months"
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};

export default FilterBar;