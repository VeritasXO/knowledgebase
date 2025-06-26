import { apiRequest } from "@/lib/queryClient";
import type { UserWithoutPassword } from "@shared/schemas/db";
import { useQuery } from "@tanstack/react-query";

export function useUserAccount() {
  return useQuery<UserWithoutPassword>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      return apiRequest("GET", "/api/auth/me");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
