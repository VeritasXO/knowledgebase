import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircleIcon } from "lucide-react";

interface MarkdownSyntaxEntry {
  description: string;
  syntax: string;
  example: string;
}

const markdownSyntax: MarkdownSyntaxEntry[] = [
  {
    description: "Headings",
    syntax: "# Heading 1\n## Heading 2\n### Heading 3",
    example: "<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>",
  },
  {
    description: "Bold",
    syntax: "**bold text**",
    example: "<strong>bold text</strong>",
  },
  {
    description: "Italic",
    syntax: "*italic text*",
    example: "<em>italic text</em>",
  },
  {
    description: "Blockquote",
    syntax: "> blockquote text",
    example: "<blockquote>blockquote text</blockquote>",
  },
  {
    description: "Ordered List",
    syntax: "1. First item\n2. Second item\n3. Third item",
    example:
      "<ol>\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ol>",
  },
  {
    description: "Unordered List",
    syntax: "- First item\n- Second item\n- Third item",
    example:
      "<ul>\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>",
  },
  {
    description: "Code",
    syntax: "`code`",
    example: "<code>code</code>",
  },
  {
    description: "Code block",
    syntax: "```\ncode block\n```",
    example: "<pre><code>code block</code></pre>",
  },
  {
    description: "Horizontal Rule",
    syntax: "---",
    example: "<hr>",
  },
  {
    description: "Link",
    syntax: "[title](https://www.example.com)",
    example: '<a href="https://www.example.com">title</a>',
  },
  {
    description: "Image",
    syntax: "![alt text](image.jpg)",
    example: '<img src="image.jpg" alt="alt text">',
  },
  {
    description: "Table",
    syntax:
      "| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n| Cell | Cell |",
    example:
      "<table>\n  <thead>\n    <tr>\n      <th>Header</th>\n      <th>Header</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Cell</td>\n      <td>Cell</td>\n    </tr>\n    <tr>\n      <td>Cell</td>\n      <td>Cell</td>\n    </tr>\n  </tbody>\n</table>",
  },
  {
    description: "Task List",
    syntax: "- [x] Task 1\n- [ ] Task 2\n- [ ] Task 3",
    example:
      '<ul>\n  <li><input type="checkbox" checked> Task 1</li>\n  <li><input type="checkbox"> Task 2</li>\n  <li><input type="checkbox"> Task 3</li>\n</ul>',
  },
];

export function MarkdownCheatsheet() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Markdown Help">
          <HelpCircleIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Markdown Cheatsheet</DialogTitle>
          <DialogDescription>
            A quick reference guide for Markdown syntax
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Markdown is a lightweight markup language that allows you to format
            text using simple syntax. Here are some common formatting options
            you can use in your articles.
          </p>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-2 border-b">Element</th>
                  <th className="p-2 border-b">Markdown Syntax</th>
                  <th className="p-2 border-b">Renders as</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {markdownSyntax.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 align-top font-medium">
                      {item.description}
                    </td>
                    <td className="p-2 align-top">
                      <pre className="text-xs bg-muted p-2 rounded">
                        {item.syntax}
                      </pre>
                    </td>
                    <td className="p-2 align-top">
                      <div className="text-xs prose dark:prose-invert max-w-none">
                        <pre>{item.example}</pre>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            You can also use keyboard shortcuts (Ctrl+B for bold, Ctrl+I for
            italic, etc.) when editing your article.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
