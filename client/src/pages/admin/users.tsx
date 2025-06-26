import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserAccount } from "@/hooks/use-current-user";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatRoleName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ADMIN_ROLES } from "@shared/constants";
import type { UserSelect, UserWithoutPassword } from "@shared/schemas/db";
import {
  AdminPasswordResetFormValues,
  adminPasswordResetSchema,
  InsertUserFormValues,
  insertUserSchema,
  UpdateUserFormValues,
  updateUserSchema,
} from "@shared/schemas/validation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UserManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(
    null,
  );
  const { data: userAccount } = useUserAccount();

  const isAdmin = userAccount?.role === ADMIN_ROLES.ADMIN;

  // Form for editing users
  const updateUserForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      role: ADMIN_ROLES.ADMIN,
    },
  });

  const addUserForm = useForm<InsertUserFormValues>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      password: "",
      email: "",
      role: ADMIN_ROLES.ADMIN,
    },
  });

  // Form for password reset
  const passwordResetForm = useForm<AdminPasswordResetFormValues>({
    resolver: zodResolver(adminPasswordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<UserSelect[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      return apiRequest("GET", "/api/admin/users");
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (values: InsertUserFormValues) => {
      return apiRequest("POST", "/api/admin/users", values);
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "New administrator user has been created successfully",
      });
      setIsAddDialogOpen(false);
      addUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
    },
    onError: (error) => {
      toast({
        title: "Note",
        description: error.message,
      });
      setIsAddDialogOpen(false);
      addUserForm.reset();
      // Refresh users list even on error as the user might have been created
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: UpdateUserFormValues;
    }) => {
      return apiRequest("PUT", `/api/admin/users/${id}`, values);
    },
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "The user has been updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      updateUserForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error) => {
      console.log(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      return apiRequest("PUT", `/api/admin/users/${id}/password-reset`, {
        password,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "The password has been reset successfully",
      });
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      passwordResetForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully",
      });
      setIsDeleteAlertOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard/stats"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission for adding users
  const onAddSubmit = (values: InsertUserFormValues) => {
    createUserMutation.mutate(values);
  };

  // Handle form submission for editing users
  const onEditSubmit = (values: UpdateUserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, values });
    }
  };

  // Handle password reset submission
  const onResetPasswordSubmit = (values: AdminPasswordResetFormValues) => {
    if (selectedUser) {
      resetPasswordMutation.mutate({
        id: selectedUser.id,
        password: values.password,
      });
    }
  };

  // Open edit dialog and populate form
  const handleEditUser = (user: UserWithoutPassword) => {
    setSelectedUser(user);

    updateUserForm.reset({
      email: user.email,
      role: user.role,
    });

    setIsEditDialogOpen(true);
  };

  // Open reset password dialog
  const handleResetPassword = (user: UserWithoutPassword) => {
    setSelectedUser(user);
    passwordResetForm.reset();
    setIsResetPasswordDialogOpen(true);
  };

  // Confirm user deletion
  const confirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  return (
    <AdminLayout
      title="Users"
      description={
        isAdmin
          ? "Manage administrator access."
          : "View administrator accounts."
      }
    >
      <div className="flex justify-end items-center mb-6">
        {isAdmin && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {users.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            users.map((user: UserSelect) => (
              <Card
                key={user.id}
                className="border-l-4 border-l-green-400 dark:border-l-green-600"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div>
                        <CardDescription className="mt-1">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Email:</span>{" "}
                            {user.email}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Created:</span>{" "}
                            {format(user.createdAt, "dd MMM yyyy HH:mm")}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-col">
                      <Badge variant="gray" className={`ml-2`}>
                        {formatRoleName(user.role)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                {userAccount?.role === ADMIN_ROLES.ADMIN && (
                  <CardFooter className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new administrator account
            </DialogDescription>
          </DialogHeader>

          <Form {...addUserForm}>
            <form
              onSubmit={addUserForm.handleSubmit(onAddSubmit)}
              className="space-y-6"
            >
              <FormField
                control={addUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Minimum 8 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ADMIN_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center">
                              {formatRoleName(role)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and access level
            </DialogDescription>
          </DialogHeader>

          <Form {...updateUserForm}>
            <form
              onSubmit={updateUserForm.handleSubmit(onEditSubmit)}
              className="space-y-6"
            >
              <FormField
                control={updateUserForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateUserForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ADMIN_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center">
                              {formatRoleName(role)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex flex-row gap-3 pt-2 justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setIsDeleteAlertOpen(true);
                    }}
                  >
                    Delete
                  </Button>

                  {selectedUser && (
                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        handleResetPassword(selectedUser);
                      }}
                    >
                      Reset Password
                    </Button>
                  )}
                </div>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              {selectedUser && `Reset password for ${selectedUser.email}`}
            </DialogDescription>
          </DialogHeader>

          <Form {...passwordResetForm}>
            <form
              onSubmit={passwordResetForm.handleSubmit(onResetPasswordSubmit)}
              className="space-y-6"
            >
              <FormField
                control={passwordResetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Minimum 8 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordResetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting..."
                    : "Reset Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser &&
                `Are you sure you want to delete ${selectedUser.email}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
