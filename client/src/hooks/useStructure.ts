import { apiRequest } from "@/lib/queryClient";
import {
  Category,
  CategoryForm,
  Department,
  DepartmentForm,
  DepartmentWithCategories,
} from "@shared/schemas/validation/departments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ====== DEPARTMENTS HOOKS ======

export function useDepartments() {
  return useQuery({
    queryKey: ["/api/admin/structure/departments"],
    queryFn: async (): Promise<Department[]> => {
      return apiRequest("GET", "/api/admin/structure/departments");
    },
  });
}

export function useDepartmentDetails(id?: string) {
  return useQuery({
    queryKey: [`/api/admin/structure/departments/${id}`],
    queryFn: async (): Promise<Department> => {
      return apiRequest("GET", `/api/admin/structure/departments/${id}`);
    },
    enabled: !!id,
  });
}

export function useDepartmentWithCategories(slug?: string) {
  return useQuery({
    queryKey: [`/api/admin/structure/departments/by-slug/${slug}`],
    queryFn: async (): Promise<DepartmentWithCategories> => {
      return apiRequest(
        "GET",
        `/api/admin/structure/departments/by-slug/${slug}`,
      );
    },
    enabled: !!slug,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentForm) => {
      return apiRequest("POST", "/api/admin/structure/departments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure/departments"],
      });
    },
  });
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentForm) => {
      return apiRequest("PUT", `/api/admin/structure/departments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure/departments"],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/structure/departments/${id}`],
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/structure/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure/departments"],
      });
    },
  });
}

// ====== CATEGORIES HOOKS ======

export function useCategories(departmentId: string) {
  return useQuery({
    queryKey: [`/api/admin/structure/departments/${departmentId}/categories`],
    queryFn: async (): Promise<Category[]> => {
      return apiRequest(
        "GET",
        `/api/admin/structure/departments/${departmentId}/categories`,
      );
    },
    enabled: !!departmentId,
  });
}

export function useCategoryDetails(id?: string) {
  return useQuery({
    queryKey: [`/api/admin/structure/categories/${id}`],
    queryFn: async (): Promise<Category> => {
      return apiRequest("GET", `/api/admin/structure/categories/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryForm) => {
      return apiRequest("POST", "/api/admin/structure/categories", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          `/api/admin/structure/departments/${variables.departmentId}/categories`,
        ],
      });
    },
  });
}

export function useUpdateCategory(id: string, departmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryForm) => {
      return apiRequest("PUT", `/api/admin/structure/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          `/api/admin/structure/departments/${departmentId}/categories`,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/admin/structure/categories/${id}`],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/structure/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure"],
      });
    },
  });
}
