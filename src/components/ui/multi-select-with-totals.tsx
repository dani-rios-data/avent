import { useState, useMemo, useEffect, useRef, useId } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface BrandWithTotal {
  brand: string;
  totalSpend: number;
}

interface MultiSelectWithTotalsProps {
  options: BrandWithTotal[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectWithTotals({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false
}: MultiSelectWithTotalsProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectAllId = useId();
  const preventCloseRef = useRef(false);

  // Only log when open state changes to reduce verbosity
  useEffect(() => {
    if (open) {
      console.log(`🔄 MultiSelect opened with ${selected.length} selected items`);
    }
  }, [open, selected.length]);


  // Removed auto-close IntersectionObserver to prevent unwanted closing

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option => 
      option.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelectAll = () => {
    console.log(`🔄 Select All clicked - selecting ${selected.length === options.length ? 0 : options.length} items`);
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.brand));
    }
    // Keep popover open after selecting all/deselecting
    preventCloseRef.current = true;
    setOpen(true);
  };

  const handleToggleOption = (brand: string) => {
    console.log(`🔄 Toggle ${brand} - ${selected.includes(brand) ? 'removing' : 'adding'}`);
    console.log(`📞 About to call onChange with new selection...`);
    if (selected.includes(brand)) {
      onChange(selected.filter(item => item !== brand));
    } else {
      onChange([...selected, brand]);
    }
    // Keep popover open after selecting an option
    preventCloseRef.current = true;
    setOpen(true);
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log(`🔄 handleOpenChange called`, { from: open, to: newOpen });
    if (!newOpen && preventCloseRef.current) {
      preventCloseRef.current = false;
      return;
    }
    setOpen(newOpen);
  };

  const allSelected = selected.length === options.length;
  const someSelected = selected.length > 0 && selected.length < options.length;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
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
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-border rounded-xl"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          sideOffset={4}
        >
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
                id={selectAllId}
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={cn(
                  someSelected && !allSelected && "data-[state=checked]:bg-muted"
                )}
              />
              <label
                htmlFor={selectAllId}
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
                  key={option.brand}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={(e) => {
                    console.log(`🖱️ Option div clicked: ${option.brand}`);
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleOption(option.brand);
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <Checkbox
                      id={`option-${option.brand}-${selectAllId}`}
                      checked={selected.includes(option.brand)}
                      onCheckedChange={() => {
                        console.log(`☑️ Checkbox onCheckedChange: ${option.brand}`);
                        handleToggleOption(option.brand);
                      }}
                    />
                    <label 
                      htmlFor={`option-${option.brand}-${selectAllId}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.brand}
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono ml-2">
                    ${formatNumber(option.totalSpend)}
                  </span>
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}