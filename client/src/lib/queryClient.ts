import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const json = await res.json();

    if (json) {
      throw new Error(json.message);
    }

    const text = await res.text();

    throw new Error(text || res.statusText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { on401?: UnauthorizedBehavior },
): Promise<any> {
  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {},
  };

  // Handle query parameters for GET requests
  if (
    (method === "GET" || method === "HEAD") &&
    data &&
    typeof data === "object"
  ) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    // Append query parameters to the URL
    const queryString = params.toString();
    if (queryString) {
      url = `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
    }
  } else if (method !== "GET" && method !== "HEAD" && data) {
    config.headers = { "Content-Type": "application/json" };
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);

  if (options?.on401 === "returnNull" && res.status === 401) {
    return null;
  }

  await throwIfResNotOk(res);

  // For GET requests that expect JSON data
  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json();
  }

  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
