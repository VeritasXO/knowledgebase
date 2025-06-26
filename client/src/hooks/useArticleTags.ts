import { ArticleTag } from "@shared/schemas/validation/articles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Hook to get all tags for an article
export function useArticleTags(articleId: string) {
  return useQuery({
    queryKey: ["articleTags", articleId],
    queryFn: async () => {
      if (!articleId) {
        return [];
      }
      const { data } = await axios.get(`/api/admin/article-tags/${articleId}`);
      return data;
    },
    enabled: !!articleId,
  });
}

// The API calls below would require implementing additional endpoints
// on the server. For now, these mutations will work with the article
// form directly and update tags as part of the article update.

// Hook to add a tag to an article
export function useAddArticleTag(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<ArticleTag, "id">) => {
      const { data } = await axios.post(
        `/api/admin/article-tags/${articleId}`,
        tag,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articleTags", articleId] });
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
    },
  });
}

// Hook to update a tag
export function useUpdateArticleTag(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: ArticleTag) => {
      const { data } = await axios.put(
        `/api/admin/article-tags/${tag.id}`,
        tag,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articleTags", articleId] });
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
    },
  });
}

// Hook to delete a tag
export function useDeleteArticleTag(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      const { data } = await axios.delete(`/api/admin/article-tags/${tagId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articleTags", articleId] });
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
    },
  });
}
