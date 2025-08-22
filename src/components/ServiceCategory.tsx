import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceCategoryProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const ServiceCategory = ({ categories, selectedCategory, onCategorySelect }: ServiceCategoryProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Service Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "All" ? "hero" : "outline"}
          size="sm"
          onClick={() => onCategorySelect("All")}
          className="h-8"
        >
          All Services
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "service" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(category)}
            className="h-8"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategory;