import type { ServerSettings } from "@shared/schemas/db";
import type { ClientSettings } from "@shared/schemas/validation";
import { useQuery } from "@tanstack/react-query";

// Hook for admin settings (full access)
export function useServerSettings() {
  return useQuery<ServerSettings>({
    queryKey: ["/api/admin/settings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for public settings (limited fields)
export function useClientSettings() {
  return useQuery<ClientSettings>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
