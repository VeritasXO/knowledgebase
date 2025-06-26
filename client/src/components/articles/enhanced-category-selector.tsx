import { useCategories } from "@/hooks/useStructure";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";

interface CategorySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  departmentId?: string;
  allowNull?: boolean;
  nullLabel?: string;
}

export function CategorySelector({
  value = "",
  onChange,
  departmentId,
  allowNull = false,
  nullLabel = "Select a category",
}: CategorySelectorProps) {
  // Get categories for the specific department
  const { data: categories, isLoading } = useCategories(departmentId || "");

  useEffect(() => {
    // Reset selection if the department changes
    if (departmentId) {
      onChange("");
    }
  }, [departmentId, onChange]);

  if (isLoading) {
    return <Spinner className="h-4 w-4" />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder={nullLabel} />
      </SelectTrigger>{" "}
      <SelectContent>
        {allowNull && <SelectItem value="__all__">{nullLabel}</SelectItem>}
        {categories?.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
