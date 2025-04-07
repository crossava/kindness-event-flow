
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EventFiltersProps {
  onCategoryChange: (category: string) => void;
  onSearch: (searchText: string) => void;
  selectedCategory: string;
}

const categories = [
  { id: "all", name: "All Categories" },
  { id: "animals", name: "Animals" },
  { id: "environment", name: "Environment" },
  { id: "health", name: "Health" },
  { id: "education", name: "Education" },
  { id: "poverty", name: "Poverty" },
  { id: "community", name: "Community" },
];

export const EventFilters = ({ 
  onCategoryChange, 
  onSearch,
  selectedCategory,
}: EventFiltersProps) => {
  const [searchText, setSearchText] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search events..."
          value={searchText}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </form>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge 
            key={category.id} 
            variant="outline"
            className={cn(
              "cursor-pointer hover:bg-charity-muted",
              selectedCategory === category.id && "bg-charity-primary text-white hover:bg-charity-primary/90"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};
