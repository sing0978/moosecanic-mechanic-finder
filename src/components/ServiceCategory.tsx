import { Button } from "@/components/ui/button";
import { ServiceCategory as ServiceCategoryType } from "@/types/mechanic";
import * as LucideIcons from "lucide-react";

interface ServiceCategoryProps {
  categories: ServiceCategoryType[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const ServiceCategory = ({ categories, selectedCategory, onCategorySelect }: ServiceCategoryProps) => {
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Wrench;
    return IconComponent;
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Service Categories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect("all")}
          className="h-9"
        >
          <LucideIcons.Grid3X3 className="h-4 w-4 mr-2" />
          All Services
        </Button>
        {categories.map((category) => {
          const IconComponent = getIcon(category.icon_name);
          return (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              onClick={() => onCategorySelect(category.slug)}
              className="h-9"
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategory;