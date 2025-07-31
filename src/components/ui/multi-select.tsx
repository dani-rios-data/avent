import { useState, useMemo } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  const handleToggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemoveSelected = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  const allSelected = selected.length === options.length;
  const someSelected = selected.length > 0 && selected.length < options.length;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal rounded-xl border-border"
            disabled={disabled}
          >
            <span className="truncate">
              {selected.length === 0
                ? placeholder
                : selected.length === 1
                ? selected[0]
                : `${selected.length} selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border-border rounded-xl" align="start">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <div className="border-b border-border">
            <div className="flex items-center space-x-2 p-3">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={cn(
                  someSelected && !allSelected && "data-[state=checked]:bg-muted"
                )}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </label>
            </div>
          </div>

          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No options found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className="flex items-center space-x-2 p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleToggleOption(option)}
                >
                  <Checkbox
                    checked={selected.includes(option)}
                    onChange={() => {}} // Controlled by parent click
                  />
                  <label className="text-sm flex-1 cursor-pointer">
                    {option}
                  </label>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}