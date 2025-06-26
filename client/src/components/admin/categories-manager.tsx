import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useDepartments,
  useUpdateCategory,
} from "@/hooks/useStructure";
import { createSlug } from "@/lib/utils";
import { CategoryForm } from "@shared/schemas/validation/departments";
import { Edit, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../ui/spinner";

export function CategoriesManager() {
  const { toast } = useToast();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    departmentId: "",
  });

  // Queries
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: categories, isLoading: categoriesLoading } =
    useCategories(selectedDepartmentId);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(
    editCategoryId || "",
    selectedDepartmentId,
  );
  const deleteCategory = useDeleteCategory();

  // Handle form input change
  const handleInputChange = (field: keyof CategoryForm, value: string) => {
    const updatedFormData = { ...formData, [field]: value };

    // Auto-generate slug from name if name changes and slug hasn't been manually edited
    if (
      field === "name" &&
      (formData.slug === createSlug(formData.name) || formData.slug === "")
    ) {
      updatedFormData.slug = createSlug(value);
    }

    setFormData(updatedFormData);
  };

  // Reset and prepare form for creating a new category
  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      departmentId: selectedDepartmentId,
    });
    setIsCreating(true);
  };

  // Reset and prepare form for editing an existing category
  const handleOpenEditDialog = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        departmentId: category.departmentId,
      });
      setEditCategoryId(categoryId);
      setIsEditing(true);
    }
  };

  // Handle create category submission
  const handleCreateCategory = async () => {
    try {
      await createCategory.mutateAsync(formData);
      toast({
        title: "Category created",
        description: "Category was created successfully",
      });
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  // Handle update category submission
  const handleUpdateCategory = async () => {
    if (!editCategoryId) return;

    try {
      await updateCategory.mutateAsync(formData);
      toast({
        title: "Category updated",
        description: "Category was updated successfully",
      });
      setIsEditing(false);
      setEditCategoryId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({
        title: "Category deleted",
        description: "Category and its articles were deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const isLoading = departmentsLoading;
  const isCategoriesLoading = categoriesLoading && !!selectedDepartmentId;

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <h2 className="text-2xl font-semibold">Categories</h2>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
          <Select
            value={selectedDepartmentId}
            onValueChange={(value) => setSelectedDepartmentId(value)}
          >
            <SelectTrigger className="w-full md:w-[200px]">
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

          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenCreateDialog}
                disabled={!selectedDepartmentId}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your articles
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      handleInputChange("departmentId", value)
                    }
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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="category-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly identifier (auto-generated from name)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={
                    createCategory.isPending ||
                    !formData.name ||
                    !formData.slug ||
                    !formData.departmentId
                  }
                >
                  {createCategory.isPending ? (
                    <Spinner className="mr-2" />
                  ) : null}
                  Create Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedDepartmentId ? (
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-4">
              Please select a department to manage its categories
            </p>
          </CardContent>
        </Card>
      ) : isCategoriesLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end space-x-2">
                <Dialog
                  open={isEditing && editCategoryId === category.id}
                  onOpenChange={(open) => {
                    setIsEditing(open);
                    if (!open) setEditCategoryId(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditDialog(category.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Category</DialogTitle>
                      <DialogDescription>
                        Update category information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Department</Label>
                        <Select
                          value={formData.departmentId}
                          onValueChange={(value) =>
                            handleInputChange("departmentId", value)
                          }
                          disabled={updateCategory.isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map((department) => (
                              <SelectItem
                                key={department.id}
                                value={department.id}
                              >
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          disabled={updateCategory.isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-slug">Slug</Label>
                        <Input
                          id="edit-slug"
                          value={formData.slug}
                          onChange={(e) =>
                            handleInputChange("slug", e.target.value)
                          }
                          disabled={updateCategory.isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={formData.description || ""}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          rows={3}
                          disabled={updateCategory.isPending}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditCategoryId(null);
                        }}
                        disabled={updateCategory.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateCategory}
                        disabled={
                          updateCategory.isPending ||
                          !formData.name ||
                          !formData.slug ||
                          !formData.departmentId
                        }
                      >
                        {updateCategory.isPending ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the category and all articles within
                        it. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        {deleteCategory.isPending ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}

          {categories?.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <p className="text-muted-foreground mb-4">
                  No categories created for this department
                </p>
                <Button onClick={handleOpenCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
