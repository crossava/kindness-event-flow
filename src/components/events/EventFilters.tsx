import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { russianContent } from "@/lib/localization/russianContent";

interface EventFiltersProps {
  onCategoryChange: (category: string) => void;
  onSearch: (searchText: string) => void;
  selectedCategory: string;
}

const categories = [
  { id: "all", nameKey: "all" },
  { id: "animals", nameKey: "animals" },
  { id: "environment", nameKey: "environment" },
  { id: "health", nameKey: "health" },
  { id: "education", nameKey: "education" },
  { id: "poverty", nameKey: "poverty" },
  { id: "community", nameKey: "community" },
];

export const EventFilters = ({
  onCategoryChange,
  onSearch,
  selectedCategory,
}: EventFiltersProps) => {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const { common, categories: categoryLabels } = russianContent;

  return (
    <div className="mb-8 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={`${common.search}...`}
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-charity-muted",
              selectedCategory === category.id &&
                "bg-charity-primary text-white hover:bg-charity-primary/90"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.id === "all"
              ? common.all
              : categoryLabels[category.nameKey as keyof typeof categoryLabels]}
          </Badge>
        ))}
      </div>
    </div>
  );
};
