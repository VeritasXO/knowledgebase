import { queryClient } from "@/lib/queryClient";
import { ArticleWithTags } from "@/types/article";
import { ArticleSelect } from "@shared/schemas/db/articles";
import { ArticleForm } from "@shared/schemas/validation/articles";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

// API response interfaces
export interface ArticlesListResponse {
  articles: ArticleWithTags[];
  total: number;
}

// Base URL for API
const API_URL = "/api/admin/articles";

// Query keys
const ARTICLES_QUERY_KEY = "articles";

/**
 * Fetch a list of articles with optional filtering
 */
export function useArticles(options?: {
  query?: string;
  limit?: number;
  offset?: number;
  authorId?: string;
}) {
  return useQuery<ArticlesListResponse>({
    queryKey: [ARTICLES_QUERY_KEY, options],
    queryFn: async () => {
      const { data } = await axios.get<ArticlesListResponse>(API_URL, {
        params: options,
      });
      return data;
    },
  });
}

/**
 * Fetch an article by ID
 */
export function useArticle(id: string) {
  return useQuery({
    queryKey: [ARTICLES_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data as ArticleWithTags;
    },
    enabled: !!id,
  });
}

/**
 * Fetch an article by slug
 */
export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: [ARTICLES_QUERY_KEY, "slug", slug],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/by-slug/${slug}`);
      return data as ArticleWithTags;
    },
    enabled: !!slug,
  });
}

/**
 * Create a new article
 */
export function useCreateArticle() {
  return useMutation({
    mutationFn: async (article: ArticleForm) => {
      const { data } = await axios.post(API_URL, article);
      return data as ArticleSelect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
    },
  });
}

/**
 * Update an existing article
 */
export function useUpdateArticle(id: string) {
  return useMutation({
    mutationFn: async (article: ArticleForm) => {
      const { data } = await axios.put(`${API_URL}/${id}`, article);
      return data as ArticleSelect;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY, id] });
    },
  });
}

/**
 * Delete an article
 */
export function useDeleteArticle() {
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ARTICLES_QUERY_KEY] });
    },
  });
}

/**
 * Fetch pinned articles
 */
export function usePinnedArticles(limit = 5) {
  return useQuery({
    queryKey: [ARTICLES_QUERY_KEY, "pinned", limit],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/pinned`, {
        params: { limit },
      });
      return data as ArticleSelect[];
    },
  });
}

/**
 * Fetch recent articles
 */
export function useRecentArticles(limit = 5) {
  return useQuery({
    queryKey: [ARTICLES_QUERY_KEY, "recent", limit],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/recent`, {
        params: { limit },
      });
      return data as ArticleSelect[];
    },
  });
}

/**
 * Fetch article statistics
 */
export function useArticleStats() {
  return useQuery({
    queryKey: [ARTICLES_QUERY_KEY, "stats"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/stats`);
      return data as { total: number; published: number; pinned: number };
    },
  });
}
