import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCategories,
  useCategoryDetails,
  useDepartments,
} from "@/hooks/useStructure";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  onDepartmentChange?: (departmentId: string) => void;
}

export function CategorySelector({
  value,
  onChange,
  onDepartmentChange,
}: CategorySelectorProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [departmentWithCategory, setDepartmentWithCategory] = useState<
    string | null
  >(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Get departments
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  // Get direct category details if we have a value
  const { data: categoryDetails } = useCategoryDetails(value || undefined);

  // Set the department ID when category details are loaded
  useEffect(() => {
    if (categoryDetails?.departmentId && !selectedDepartmentId) {
      setSelectedDepartmentId(categoryDetails.departmentId);
      setDepartmentWithCategory(categoryDetails.departmentId);
      setIsInitialized(true);
    }
  }, [categoryDetails, selectedDepartmentId]);

  // Get categories for selected department
  const { data: categories, isLoading: categoriesLoading } =
    useCategories(selectedDepartmentId);
  // When a department is selected, update the state
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    // Reset the selected category when a new department is selected
    onChange("");
    // Call the optional onDepartmentChange callback
    if (onDepartmentChange) {
      onDepartmentChange(departmentId);
    }
  };
  // Use an effect to find and set the department ID for a selected category
  useEffect(() => {
    // Skip if we're already initialized or don't have a value or departments data
    // Also skip if categoryDetails already provided the department ID
    if (
      isInitialized ||
      !value ||
      !departments ||
      categoryDetails?.departmentId
    ) {
      return;
    }

    // If we previously found the department, use it
    if (departmentWithCategory) {
      setSelectedDepartmentId(departmentWithCategory);
      setIsInitialized(true);
      return;
    }

    // We need to load categories for each department to find where our category belongs
    const checkDepartments = async () => {
      for (const department of departments) {
        try {
          // Make API request to get categories for this department
          const response = await fetch(
            `/api/admin/structure/departments/${department.id}/categories`,
          );
          if (!response.ok) continue;

          const departmentCategories = await response.json();

          // Check if our category is in this department
          if (departmentCategories.some((cat: any) => cat.id === value)) {
            setDepartmentWithCategory(department.id);
            setSelectedDepartmentId(department.id);
            setIsInitialized(true);
            return;
          }
        } catch (error) {
          console.error("Error checking department categories:", error);
        }
      }
      // If we've checked all departments and still haven't found the category, mark as initialized anyway
      setIsInitialized(true);
    };

    checkDepartments();
  }, [
    departments,
    value,
    selectedDepartmentId,
    departmentWithCategory,
    isInitialized,
    categoryDetails,
  ]);

  // Track when value changes to potentially reset initialization state
  useEffect(() => {
    if (!isInitialized || !value) return;

    // If value changes after initialization, we need to check if department needs to be updated
    if (
      !selectedDepartmentId ||
      (categories && !categories.some((cat) => cat.id === value))
    ) {
      setIsInitialized(false);
      setDepartmentWithCategory(null);
    }
  }, [value, categories, selectedDepartmentId, isInitialized]);

  if (departmentsLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          value={selectedDepartmentId}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments?.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={value}
          onValueChange={onChange}
          disabled={!selectedDepartmentId || categoriesLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
            {categories?.length === 0 && (
              <SelectItem value="none" disabled>
                No categories available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {categoriesLoading && <Spinner className="mt-2" />}
      </div>
    </div>
  );
}
