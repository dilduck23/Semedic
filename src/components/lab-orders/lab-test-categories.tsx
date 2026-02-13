"use client";

import { cn } from "@/lib/utils";
import { LAB_CATEGORIES } from "@/lib/constants";

interface LabTestCategoriesProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function LabTestCategories({ selected, onSelect }: LabTestCategoriesProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {LAB_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selected === category
              ? "bg-[#2A388F] text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
