import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleTag } from "@shared/schemas/validation/articles";
import { Plus, X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface TagsInputProps {
  id?: string;
  value: ArticleTag[];
  onChange: (tags: ArticleTag[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagsInput({
  id,
  value,
  onChange,
  placeholder = "Add a tag...",
  maxTags = 5,
  className = "",
}: TagsInputProps) {
  const [tagInput, setTagInput] = useState("");

  // Add a new tag
  const addTag = () => {
    // Prevent empty tags and trim whitespace
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    // Check if we've reached the maximum number of tags
    if (value.length >= maxTags) {
      return;
    }

    // Prevent duplicate tags (case insensitive)
    if (value.some((t) => t.name.toLowerCase() === trimmedTag.toLowerCase())) {
      setTagInput("");
      return;
    }

    // Add tag and reset input
    const newTags = [...value, { name: trimmedTag }];
    onChange(newTags);
    setTagInput("");
  };

  // Handle Enter key to add tag
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };
  // Remove a tag by index
  const removeTag = (indexToRemove: number) => {
    const newTags = value.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge key={tag.id || index} variant="secondary" className="text-sm">
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {value.length === 0 && (
          <span className="text-sm text-muted-foreground">
            No tags added yet
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          id={id}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow"
          disabled={value.length >= maxTags}
        />
        <Button
          type="button"
          onClick={addTag}
          size="sm"
          variant="outline"
          disabled={!tagInput.trim() || value.length >= maxTags}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      {value.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum of {maxTags} tags reached
        </p>
      )}
    </div>
  );
}
