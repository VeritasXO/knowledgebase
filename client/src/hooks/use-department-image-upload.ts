import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useDepartmentImageUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post("/api/admin/department-uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate departments query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure/departments"],
      });
    },
  });
}

export function useDepartmentImageDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiRequest(
        "DELETE",
        `/api/admin/department-uploads/${filename}`
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate departments query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/structure/departments"],
      });
    },
  });
}
