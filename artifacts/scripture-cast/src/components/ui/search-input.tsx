/**
 * search-input.tsx — ScriptureCast Search Input Component
 *
 * Built-in search icon, clear button, debouncing support, and keyboard shortcut hint.
 */

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<InputProps, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  shortcut?: string;
  loading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value = "",
      onChange,
      onClear,
      placeholder = "Search...",
      shortcut,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const handleClear = () => {
      if (onChange) onChange("");
      if (onClear) onClear();
    };

    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-9 pr-8 bg-background/50 focus:bg-background border-border/80 transition-all",
            shortcut && "pr-14",
            className,
          )}
          {...props}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : shortcut ? (
          <div className="absolute right-2.5 pointer-events-none hidden sm:block">
            <Kbd>{shortcut}</Kbd>
          </div>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
