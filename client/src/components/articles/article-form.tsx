import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { useCategoryDetails, useDepartments } from "@/hooks/useStructure";
import { ArticleWithTags } from "@/types/article";
import {
  articleFormSchema,
  ArticleTag,
} from "@shared/schemas/validation/articles";
import {
  ArrowLeftIcon,
  BoldIcon,
  Code2Icon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  SeparatorHorizontalIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CategorySelector } from "./category-selector";
import { ImageUploader } from "./image-uploader";
import { MarkdownCheatsheet } from "./markdown-cheatsheet";
import { TagsInput } from "./tags-input";
import { WordCount } from "./word-count";

interface ArticleFormProps {
  article?: ArticleWithTags;
  onCancel: () => void;
  initialCategoryId?: string;
  onSave?: (article: ArticleWithTags) => void;
}

export function ArticleForm({
  article,
  onCancel,
  initialCategoryId = "",
  onSave,
}: ArticleFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast(); // Fetch category details to get department information
  const { data: categoryDetails, refetch: refetchCategoryDetails } =
    useCategoryDetails(categoryId || undefined);
  // Fetch departments list to get department name and slug
  const { data: departments } = useDepartments();

  // Make sure we refetch category details when categoryId changes
  useEffect(() => {
    if (categoryId) {
      refetchCategoryDetails();
    }
  }, [categoryId, refetchCategoryDetails]);

  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle(article?.id || "");

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!article; // Load initial data  // Initialize form based on article or initialCategoryId
  useEffect(() => {
    if (article) {
      // Edit mode - populate form with article data
      setTitle(article.title);
      setContent(article.content);
      setSummary(article.summary || "");
      setCategoryId(article.categoryId || "");
      setIsPinned(article.isPinned);
      setIsPublished(article.isPublished);
      setTags(article.tags || []);
    } else {
      // Create mode - clear form but keep categoryId if provided
      setTitle("");
      setContent("");
      setSummary("");
      setIsPinned(false);
      setIsPublished(false);
      setTags([]);
    }
  }, [article]);
  // Separate effect to handle initialCategoryId changes
  useEffect(() => {
    // Always respect initialCategoryId if it's provided, regardless of article
    if (initialCategoryId) {
      setCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Handle drag-and-drop image uploads
  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Only image files can be dropped here",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Images must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Upload the image
    const formData = new FormData();
    formData.append("image", file);

    toast({
      title: "Uploading image...",
      description: "Please wait while your image is being uploaded",
    });

    try {
      const response = await fetch("/api/admin/uploads/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Insert the image at the cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const imageMarkdown = `![Dropped image](${data.url})`;
        const newContent =
          content.substring(0, cursorPos) +
          imageMarkdown +
          content.substring(cursorPos);
        setContent(newContent);

        // Set cursor position after the inserted image
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = cursorPos + imageMarkdown.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded and inserted",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  // Function to insert markdown formatting at cursor position
  const insertMarkdown = (
    format: string,
    placeholder = "text",
    url?: string,
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    let formattedText = "";

    switch (format) {
      case "bold":
        formattedText = `**${textToInsert}**`;
        break;
      case "italic":
        formattedText = `*${textToInsert}*`;
        break;
      case "link":
        formattedText = `[${textToInsert}](url)`;
        break;
      case "image":
        // If URL is provided, use it directly
        formattedText = `![${textToInsert}](${url || "image-url"})`;
        break;
      case "h1":
        formattedText = `# ${textToInsert}`;
        break;
      case "h2":
        formattedText = `## ${textToInsert}`;
        break;
      case "h3":
        formattedText = `### ${textToInsert}`;
        break;
      case "ul":
        formattedText = `- ${textToInsert}`;
        break;
      case "ol":
        formattedText = `1. ${textToInsert}`;
        break;
      case "code":
        formattedText = `\`\`\`\n${textToInsert}\n\`\`\``;
        break;
      case "quote":
        formattedText = `> ${textToInsert}`;
        break;
      case "hr":
        formattedText = `\n---\n`;
        break;
      default:
        formattedText = textToInsert;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Set focus back to textarea and place cursor after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast({
        title: "Validation Error",
        description: "Please select a category for the article",
        variant: "destructive",
      });
      return;
    }

    const formData = {
      title,
      content,
      summary: summary || undefined,
      categoryId,
      isPinned,
      isPublished,
      tags,
    };

    try {
      // Validate the form data against the schema
      const result = articleFormSchema.safeParse(formData);

      if (!result.success) {
        // Get the first error message
        const errorMessage =
          result.error.errors[0]?.message || "Invalid form data";
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Use the most current category details based on the selected categoryId
      const selectedCategory = categoryDetails;
      // If we can't find the category details, it's a serious error
      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Failed to get category details for the article.",
          variant: "destructive",
        });
        return;
      }

      const selectedDepartment = departments?.find(
        (dept) => dept.id === selectedCategory.departmentId,
      );

      // If we can't find the department details, it's a serious error
      if (!selectedDepartment) {
        toast({
          title: "Error",
          description: "Failed to get department details for the article.",
          variant: "destructive",
        });
        return;
      }

      // Get department and category information
      const departmentName = selectedDepartment.name;
      const departmentSlug = selectedDepartment.slug;
      const categoryName = selectedCategory.name;
      const categorySlug = selectedCategory.slug;
      if (isEditing && article) {
        const updatedArticle = await updateMutation.mutateAsync(formData);

        // Get the latest data for the article from the response
        if (onSave) {
          // Create proper ArticleWithTags structure with required fields
          // Use the most current department and category information
          onSave({
            ...updatedArticle,
            departmentName,
            departmentSlug,
            categoryName,
            categorySlug,
            tags: tags.map((tag) => ({
              ...tag,
              articleId: article.id,
              id:
                tag.id || `temp-${Math.random().toString(36).substring(2, 15)}`,
            })),
          });
        } else {
          onCancel();
        }
      } else {
        const newArticle = await createMutation.mutateAsync(formData);
        if (onSave) {
          // Create proper ArticleWithTags structure with required fields
          onSave({
            ...newArticle,
            departmentName,
            departmentSlug,
            categoryName,
            categorySlug,
            tags: tags.map((tag) => ({
              ...tag,
              articleId: newArticle.id,
              id:
                tag.id || `temp-${Math.random().toString(36).substring(2, 15)}`,
            })),
          });
        } else {
          onCancel();
        }
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: "Failed to save article.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <Button onClick={onCancel}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Article
        </Button>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update" : "Create"} Article</>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {" "}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="title">Title</Label>
            <span
              className={`text-xs ${title.length > 255 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {title.length}/255
            </span>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            required
            minLength={3}
            maxLength={255}
            className={title.length > 255 ? "border-destructive" : ""}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content</Label>
            <div className="flex items-center gap-2">
              <MarkdownCheatsheet />
            </div>
          </div>{" "}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "edit" | "preview")}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-1">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${content.length < 10 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {content.length < 10 ? "Min 10 characters" : ""}
                </span>
                <WordCount content={content} />
              </div>
            </div>

            <TabsContent value="edit" className="space-y-2 mt-2">
              <div className="border rounded-md p-1 bg-muted/50 flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("h1")}
                >
                  <Heading1Icon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("h2")}
                >
                  <Heading2Icon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("h3")}
                >
                  <Heading3Icon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-muted-foreground/20"></div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("bold")}
                >
                  <BoldIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("italic")}
                >
                  <ItalicIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-muted-foreground/20"></div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("ul")}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("ol")}
                >
                  <ListOrderedIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-muted-foreground/20"></div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("link")}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                {/* Image Uploader - allows uploading images directly */}
                <ImageUploader
                  onImageUploaded={(imageUrl) =>
                    insertMarkdown("image", "alt text", imageUrl)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("code")}
                >
                  <Code2Icon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("quote")}
                >
                  <QuoteIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown("hr")}
                >
                  <SeparatorHorizontalIcon className="h-4 w-4" />
                </Button>
              </div>{" "}
              <Textarea
                id="content"
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                placeholder="Write your article content using Markdown... (Drag & drop images here)"
                className={`min-h-[400px] font-mono text-sm ${content.length < 10 ? "border-destructive" : ""}`}
                required
                minLength={10}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-2">
              {content ? (
                <div className="border rounded-md p-4 min-h-[300px] prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center text-muted-foreground">
                  Nothing to preview yet...
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>{" "}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="summary">Summary</Label>
            <span
              className={`text-xs ${summary.length > 500 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {summary.length}/500
            </span>
          </div>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A brief summary of this article"
            className={`min-h-[100px] ${summary.length > 500 ? "border-destructive" : ""}`}
            maxLength={500}
          />
        </div>
        <div className="space-y-2">
          <CategorySelector
            value={categoryId}
            onChange={(newCategoryId) => {
              setCategoryId(newCategoryId);
              // Trigger a refetch if category changes
              if (newCategoryId && newCategoryId !== categoryId) {
                setTimeout(() => refetchCategoryDetails(), 100);
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="tags">Tags</Label>
            <span
              className={`text-xs ${tags.length > 5 ? "text-destructive" : "text-muted-foreground"}`}
            >
              {tags.length}/5
            </span>
          </div>
          <TagsInput
            id="tags"
            value={tags}
            onChange={setTags}
            placeholder="Add tags to this article"
            maxTags={5}
            className={tags.length > 5 ? "border-destructive" : ""}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
            <Label htmlFor="pinned">Pin this article</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">Publish article</Label>
          </div>
        </div>{" "}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={
              isLoading ||
              title.length < 3 ||
              title.length > 255 ||
              content.length < 10 ||
              summary.length > 500 ||
              tags.length > 5
            }
          >
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update" : "Create"} Article</>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
