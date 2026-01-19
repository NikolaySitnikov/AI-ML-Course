"use client";

import { useMemo } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface ArticleContentProps {
  content: object | null;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const html = useMemo(() => {
    if (!content || Object.keys(content).length === 0) {
      return "<p class='text-muted-foreground'>No content yet.</p>";
    }

    try {
      return generateHTML(content as Parameters<typeof generateHTML>[0], [
        StarterKit.configure({
          codeBlock: false,
        }),
        Link.configure({
          openOnClick: true,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-4",
          },
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: "bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto",
          },
        }),
      ]);
    } catch {
      return "<p class='text-muted-foreground'>Error rendering content.</p>";
    }
  }, [content]);

  return (
    <div
      className="prose-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
