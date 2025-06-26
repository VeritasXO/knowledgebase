import { Text } from "lucide-react";

interface WordCountProps {
  content: string;
}

export function WordCount({ content }: WordCountProps) {
  // Calculate word count
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Calculate reading time (average reading speed: 200 words per minute)
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <Text className="h-3.5 w-3.5 mr-1" />
      <span className="mr-2">
        {wordCount} {wordCount === 1 ? "word" : "words"}
      </span>
      <span>
        ~{readingTimeMinutes} {readingTimeMinutes === 1 ? "min" : "mins"} read
      </span>
    </div>
  );
}
