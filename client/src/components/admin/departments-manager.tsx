import { DepartmentImageUpload } from "@/components/admin/department-image-upload";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCategories,
  useCreateCategory,
  useCreateDepartment,
  useDeleteCategory,
  useDeleteDepartment,
  useDepartments,
  useUpdateCategory,
  useUpdateDepartment,
} from "@/hooks/useStructure";
import { createSlug } from "@/lib/utils";
import {
  CategoryForm,
  DepartmentForm,
} from "@shared/schemas/validation/departments";
import { Plus } from "lucide-react";
import { useState } from "react";

export function DepartmentsCategoriesManager() {
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false); // Department dialog state
  const [isDeptCreating, setIsDeptCreating] = useState(false);
  const [isDeptEditing, setIsDeptEditing] = useState(false);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [deptFormData, setDeptFormData] = useState<DepartmentForm>({
    name: "",
    slug: "",
    description: "",
    image: undefined,
  });

  // Category dialog state
  const [isCatCreating, setIsCatCreating] = useState(false);
  const [isCatEditing, setIsCatEditing] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catFormData, setCatFormData] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    departmentId: "",
  });

  // Queries and Mutations
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: categories, isLoading: categoriesLoading } = useCategories(
    selectedDepartment?.id || "",
  );

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment(editDeptId || "");
  const deleteDepartment = useDeleteDepartment();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(
    editCatId || "",
    selectedDepartment?.id || "",
  );
  const deleteCategory = useDeleteCategory();

  // Department handlers
  const handleDeptInputChange = (
    field: keyof DepartmentForm,
    value: string,
  ) => {
    const updatedFormData = { ...deptFormData, [field]: value };

    // Auto-generate slug from name if name changes and slug hasn't been manually edited
    if (
      field === "name" &&
      (deptFormData.slug === createSlug(deptFormData.name) ||
        deptFormData.slug === "")
    ) {
      updatedFormData.slug = createSlug(value);
    }

    setDeptFormData(updatedFormData);
  };

  const handleOpenCreateDeptDialog = () => {
    setDeptFormData({
      name: "",
      slug: "",
      description: "",
      image: undefined,
    });
    setIsDeptCreating(true);
  };

  const handleOpenEditDeptDialog = (departmentId: string) => {
    const department = departments?.find((d) => d.id === departmentId);
    if (department) {
      setDeptFormData({
        name: department.name,
        slug: department.slug,
        description: department.description || "",
        image: department.image || "",
      });
      setEditDeptId(departmentId);
      setIsDeptEditing(true);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      await createDepartment.mutateAsync(deptFormData);
      toast({
        title: "Department created",
        description: "Department was created successfully",
      });
      setIsDeptCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create department",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editDeptId) return;

    try {
      await updateDepartment.mutateAsync(deptFormData);
      toast({
        title: "Department updated",
        description: "Department was updated successfully",
      });
      setIsDeptEditing(false);
      setEditDeptId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await deleteDepartment.mutateAsync(id);
      toast({
        title: "Department deleted",
        description: "Department and its categories were deleted successfully",
      });
      setIsCategoriesDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      });
    }
  };

  // Category handlers
  const handleCatInputChange = (field: keyof CategoryForm, value: string) => {
    const updatedFormData = { ...catFormData, [field]: value };

    // Auto-generate slug from name if name changes and slug hasn't been manually edited
    if (
      field === "name" &&
      (catFormData.slug === createSlug(catFormData.name) ||
        catFormData.slug === "")
    ) {
      updatedFormData.slug = createSlug(value);
    }

    setCatFormData(updatedFormData);
  };

  const handleOpenCreateCatDialog = () => {
    setCatFormData({
      name: "",
      slug: "",
      description: "",
      departmentId: selectedDepartment?.id || "",
    });
    setIsCatCreating(true);
  };

  const handleOpenEditCatDialog = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    if (category) {
      setCatFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        departmentId: category.departmentId,
      });
      setEditCatId(categoryId);
      setIsCatEditing(true);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory.mutateAsync(catFormData);
      toast({
        title: "Category created",
        description: "Category was created successfully",
      });
      setIsCatCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editCatId) return;

    try {
      await updateCategory.mutateAsync(catFormData);
      toast({
        title: "Category updated",
        description: "Category was updated successfully",
      });
      setIsCatEditing(false);
      setEditCatId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({
        title: "Category deleted",
        description: "Category was deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  // Handle opening the department's categories dialog
  const openDepartmentCategories = (department: {
    id: string;
    name: string;
  }) => {
    setSelectedDepartment(department);
    setIsCategoriesDialogOpen(true);
  };

  if (departmentsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Dialog open={isDeptCreating} onOpenChange={setIsDeptCreating}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDeptDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Department</DialogTitle>
              <DialogDescription>
                Add a new department to organize your articles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={deptFormData.name}
                  onChange={(e) =>
                    handleDeptInputChange("name", e.target.value)
                  }
                  placeholder="Department name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={deptFormData.slug}
                  onChange={(e) =>
                    handleDeptInputChange("slug", e.target.value)
                  }
                  placeholder="department-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={deptFormData.description || ""}
                  onChange={(e) =>
                    handleDeptInputChange("description", e.target.value)
                  }
                  placeholder="Brief description of this department"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Department Image</Label>
                <DepartmentImageUpload
                  value={deptFormData.image || null}
                  onChange={(imageUrl) =>
                    handleDeptInputChange("image", imageUrl || "")
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeptCreating(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateDepartment}
                disabled={
                  createDepartment.isPending ||
                  !deptFormData.name ||
                  !deptFormData.slug
                }
              >
                {createDepartment.isPending ? (
                  <Spinner className="mr-2" />
                ) : null}
                Create Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {" "}
        {departments?.map((department) => (
          <Card key={department.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{department.name}</CardTitle>
              <CardDescription>{department.description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end space-x-2 pt-1">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openDepartmentCategories({
                    id: department.id,
                    name: department.name,
                  });
                }}
              >
                View
              </Button>
              <Dialog
                open={isDeptEditing}
                onOpenChange={(open) => {
                  setIsDeptEditing(open);
                  if (!open) setEditDeptId(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditDeptDialog(department.id);
                    }}
                  >
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Department</DialogTitle>
                    <DialogDescription>
                      Update department information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={deptFormData.name}
                        onChange={(e) =>
                          handleDeptInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-slug">Slug</Label>
                      <Input
                        id="edit-slug"
                        value={deptFormData.slug}
                        onChange={(e) =>
                          handleDeptInputChange("slug", e.target.value)
                        }
                      />
                    </div>{" "}
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={deptFormData.description || ""}
                        onChange={(e) =>
                          handleDeptInputChange("description", e.target.value)
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-image">Department Image</Label>{" "}
                      <DepartmentImageUpload
                        value={deptFormData.image || null}
                        onChange={(imageUrl) =>
                          handleDeptInputChange("image", imageUrl || "")
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeptEditing(false);
                        setEditDeptId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateDepartment}
                      disabled={
                        updateDepartment.isPending ||
                        !deptFormData.name ||
                        !deptFormData.slug
                      }
                    >
                      {updateDepartment.isPending ? (
                        <Spinner className="mr-2" />
                      ) : null}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete the department, all its categories, and
                      all articles within those categories. This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDeleteDepartment(department.id)}
                    >
                      {deleteDepartment.isPending ? (
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
        {departments?.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-4">
                No departments created yet
              </p>
              <Button onClick={handleOpenCreateDeptDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Department
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Categories Dialog modal */}
      <Dialog
        open={isCategoriesDialogOpen}
        onOpenChange={setIsCategoriesDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDepartment?.name}: Categories</DialogTitle>
            <DialogDescription>
              Manage categories for {selectedDepartment?.name} department
            </DialogDescription>
          </DialogHeader>
          {/* Create category dialog */}
          <Dialog open={isCatCreating} onOpenChange={setIsCatCreating}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to {selectedDepartment?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={catFormData.name}
                    onChange={(e) =>
                      handleCatInputChange("name", e.target.value)
                    }
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={catFormData.slug}
                    onChange={(e) =>
                      handleCatInputChange("slug", e.target.value)
                    }
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
                    value={catFormData.description || ""}
                    onChange={(e) =>
                      handleCatInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCatCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={
                    createCategory.isPending ||
                    !catFormData.name ||
                    !catFormData.slug
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
          {/* List of categories */}
          <div className="space-y-4 mt-4">
            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : categories?.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">
                  No categories in this department
                </p>
                <Button onClick={handleOpenCreateCatDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Category
                </Button>
              </div>
            ) : (
              categories?.map((category) => (
                <Card key={category.id} className="w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end space-x-2 pt-1">
                    <Dialog
                      open={isCatEditing && editCatId === category.id}
                      onOpenChange={(open) => {
                        setIsCatEditing(open);
                        if (!open) setEditCatId(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => handleOpenEditCatDialog(category.id)}
                        >
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
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={catFormData.name}
                              onChange={(e) =>
                                handleCatInputChange("name", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug</Label>
                            <Input
                              id="edit-slug"
                              value={catFormData.slug}
                              onChange={(e) =>
                                handleCatInputChange("slug", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              value={catFormData.description || ""}
                              onChange={(e) =>
                                handleCatInputChange(
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCatEditing(false);
                              setEditCatId(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateCategory}
                            disabled={
                              updateCategory.isPending ||
                              !catFormData.name ||
                              !catFormData.slug
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
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the category and all articles
                            within it. This action cannot be undone.
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
              ))
            )}
          </div>{" "}
          {/* Category modal footer - contains only Add Category button */}
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button onClick={handleOpenCreateCatDialog}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
