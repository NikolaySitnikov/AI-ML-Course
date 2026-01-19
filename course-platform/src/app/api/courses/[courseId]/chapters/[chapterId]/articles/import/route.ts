import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ courseId: string; chapterId: string }>;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Split text into multiple articles
// Articles are separated by a blank line followed by # heading
// Consecutive # lines stay together as one article
function splitByArticles(text: string): string[] {
  const lines = text.split("\n");
  const articles: string[] = [];
  let currentArticle: string[] = [];
  let lastLineWasEmpty = true; // Treat start of file as having a blank line before

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isH1 = line.startsWith("# ");
    const isEmpty = line.trim() === "";

    // Start a new article if:
    // - This is an H1 heading AND
    // - The previous line was empty (or this is the start)
    if (isH1 && lastLineWasEmpty && currentArticle.length > 0) {
      // Save the current article (excluding trailing empty lines)
      const trimmedArticle = trimTrailingEmptyLines(currentArticle);
      if (trimmedArticle.length > 0) {
        articles.push(trimmedArticle.join("\n"));
      }
      currentArticle = [line];
    } else {
      currentArticle.push(line);
    }

    lastLineWasEmpty = isEmpty;
  }

  // Don't forget the last article
  const trimmedArticle = trimTrailingEmptyLines(currentArticle);
  if (trimmedArticle.length > 0) {
    articles.push(trimmedArticle.join("\n"));
  }

  return articles;
}

function trimTrailingEmptyLines(lines: string[]): string[] {
  const result = [...lines];
  while (result.length > 0 && result[result.length - 1].trim() === "") {
    result.pop();
  }
  return result;
}

// Parse markdown content to extract title and body
function parseMarkdownArticle(content: string): { title: string; body: string } {
  const lines = content.trim().split("\n");
  let title = "";
  let bodyStartIndex = 0;

  // Look for H1 heading as title
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("# ")) {
      title = line.replace(/^#\s+/, "");
      bodyStartIndex = i + 1;
      break;
    }
    // If first non-empty line is not a heading, use it as title
    if (line && !title) {
      title = line;
      bodyStartIndex = i + 1;
      break;
    }
  }

  // Skip empty lines after title
  while (bodyStartIndex < lines.length && !lines[bodyStartIndex].trim()) {
    bodyStartIndex++;
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();

  return { title, body };
}

// Convert markdown to Tiptap JSON format
function markdownToTiptap(markdown: string): object {
  const lines = markdown.split("\n");
  const content: object[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Empty line - skip
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      content.push({
        type: "heading",
        attrs: { level: 3 },
        content: parseInlineFormatting(line.replace(/^###\s+/, "")),
      });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: parseInlineFormatting(line.replace(/^##\s+/, "")),
      });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      content.push({
        type: "heading",
        attrs: { level: 1 },
        content: parseInlineFormatting(line.replace(/^#\s+/, "")),
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    // Table (lines starting with |)
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableRows: string[][] = [];
      let hasHeaderSeparator = false;
      let headerSeparatorIndex = -1;

      // Collect all table lines
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const rowLine = lines[i].trim();
        // Parse cells: split by | and filter empty strings from edges
        const cells = rowLine
          .split("|")
          .slice(1, -1) // Remove first and last empty strings from split
          .map((cell) => cell.trim());

        // Check if this is a separator row (|---|---|---|)
        // Separator cells only contain -, :, and spaces
        const isSeparator = cells.every((cell) => /^[\s\-:]+$/.test(cell) && cell.includes("-"));
        if (isSeparator) {
          hasHeaderSeparator = true;
          headerSeparatorIndex = tableRows.length;
          i++;
          continue;
        }

        tableRows.push(cells);
        i++;
      }

      if (tableRows.length > 0) {
        // Determine max columns
        const maxCols = Math.max(...tableRows.map((row) => row.length));

        // Build table content
        const tableContent: object[] = [];

        tableRows.forEach((row, rowIndex) => {
          // First row is header if we found a separator after it
          const isHeader = hasHeaderSeparator && rowIndex === 0;
          const cellType = isHeader ? "tableHeader" : "tableCell";

          const rowCells: object[] = [];
          for (let col = 0; col < maxCols; col++) {
            const cellText = row[col] || "";
            rowCells.push({
              type: cellType,
              attrs: { colspan: 1, rowspan: 1 },
              content: cellText
                ? [
                    {
                      type: "paragraph",
                      content: parseInlineFormatting(cellText),
                    },
                  ]
                : [{ type: "paragraph" }],
            });
          }

          tableContent.push({
            type: "tableRow",
            content: rowCells,
          });
        });

        content.push({
          type: "table",
          content: tableContent,
        });
      }
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || null;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      content.push({
        type: "codeBlock",
        attrs: { language },
        content: codeLines.length > 0 ? [{ type: "text", text: codeLines.join("\n") }] : undefined,
      });
      i++; // Skip closing ```
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInlineFormatting(quoteLines.join(" ")),
          },
        ],
      });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const listItems: object[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        const itemText = lines[i].replace(/^[-*]\s+/, "");
        listItems.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineFormatting(itemText),
            },
          ],
        });
        i++;
      }
      content.push({
        type: "bulletList",
        content: listItems,
      });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: object[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const itemText = lines[i].replace(/^\d+\.\s*/, "");
        listItems.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineFormatting(itemText),
            },
          ],
        });
        i++;
      }
      content.push({
        type: "orderedList",
        content: listItems,
      });
      continue;
    }

    // Regular paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      lines[i].trim() !== "---"
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      const text = paragraphLines.join(" ");
      content.push({
        type: "paragraph",
        content: parseInlineFormatting(text),
      });
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

// Parse inline formatting (bold, italic, code, links)
function parseInlineFormatting(text: string): object[] {
  const result: object[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Bold and italic ***text***
    let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (match) {
      result.push({
        type: "text",
        marks: [{ type: "bold" }, { type: "italic" }],
        text: match[1],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold **text**
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      result.push({
        type: "text",
        marks: [{ type: "bold" }],
        text: match[1],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic *text* (but not at word boundaries to avoid false matches)
    match = remaining.match(/^\*([^*]+)\*/);
    if (match) {
      result.push({
        type: "text",
        marks: [{ type: "italic" }],
        text: match[1],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code `text`
    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      result.push({
        type: "text",
        marks: [{ type: "code" }],
        text: match[1],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Link [text](url)
    match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      result.push({
        type: "text",
        marks: [{ type: "link", attrs: { href: match[2], target: "_blank" } }],
        text: match[1],
      });
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/[\*`\[]/);
    if (nextSpecial === -1) {
      // No more special characters, add rest as plain text
      if (remaining) {
        result.push({ type: "text", text: remaining });
      }
      break;
    } else if (nextSpecial === 0) {
      // Special character at start but didn't match patterns, treat as plain text
      result.push({ type: "text", text: remaining[0] });
      remaining = remaining.slice(1);
    } else {
      // Add plain text up to special character
      result.push({ type: "text", text: remaining.slice(0, nextSpecial) });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return result.length > 0 ? result : [{ type: "text", text: "" }];
}

// POST /api/courses/[courseId]/chapters/[chapterId]/articles/import
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string | null; // "single" or "multiple"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Verify chapter belongs to course
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const text = await file.text();
    const articles: { title: string; slug: string; content: object }[] = [];

    if (mode === "multiple") {
      // Split by H1 headings that are preceded by a blank line (or start of file)
      // This allows consecutive # lines to stay together as one article
      const sections = splitByArticles(text);

      for (const section of sections) {
        const { title, body } = parseMarkdownArticle(section);
        if (title) {
          articles.push({
            title,
            slug: generateSlug(title),
            content: markdownToTiptap(body),
          });
        }
      }
    } else {
      // Single article from entire file
      const { title, body } = parseMarkdownArticle(text);
      if (title) {
        articles.push({
          title,
          slug: generateSlug(title),
          content: markdownToTiptap(body),
        });
      }
    }

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "Could not parse any articles from the file" },
        { status: 400 }
      );
    }

    // Get the highest order number
    const lastArticle = await db.article.findFirst({
      where: { chapterId },
      orderBy: { order: "desc" },
    });
    let nextOrder = lastArticle ? lastArticle.order + 1 : 0;

    // Create articles
    const createdArticles = [];
    for (const articleData of articles) {
      // Check for slug conflicts and make unique if needed
      let slug = articleData.slug;
      let slugSuffix = 1;
      while (
        await db.article.findFirst({
          where: { chapterId, slug },
        })
      ) {
        slug = `${articleData.slug}-${slugSuffix}`;
        slugSuffix++;
      }

      const article = await db.article.create({
        data: {
          title: articleData.title,
          slug,
          content: articleData.content,
          published: false,
          order: nextOrder++,
          chapterId,
        },
      });
      createdArticles.push(article);
    }

    return NextResponse.json({
      success: true,
      count: createdArticles.length,
      articles: createdArticles,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import articles" }, { status: 500 });
  }
}
