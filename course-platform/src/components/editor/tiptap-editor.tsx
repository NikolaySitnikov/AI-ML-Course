"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { EditorToolbar } from "./editor-toolbar";
import { ArticleImage } from "./image-extension";

const lowlight = createLowlight(common);

// Store editor reference globally for paste handler
let editorInstance: Editor | null = null;

interface TiptapEditorProps {
  content: string | object | null;
  onChange: (content: object) => void;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing your article content...",
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Placeholder.configure({
        placeholder,
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
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      ArticleImage.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose-article tiptap-editor max-w-none min-h-[400px] focus:outline-none px-4 py-3",
      },
      // Handle paste at the ProseMirror level - this runs BEFORE default paste handling
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        let text = clipboardData.getData("text/plain");
        if (!text) return false;

        // Check if the text has markdown headings
        const hasMarkdownHeadings = /^#{1,6}\s/m.test(text);

        // Check if first line is a title without # prefix but content has ## headings
        // This handles Claude.ai's format where title is plain text + ## for sections
        const lines = text.split("\n");
        const firstLine = lines[0]?.trim();
        const hasH2Headings = /^##\s/m.test(text);
        const firstLineIsPlainTitle = firstLine &&
          !firstLine.startsWith("#") &&
          firstLine.length > 0 &&
          hasH2Headings;

        // If first line looks like a title (no # prefix) but we have ## headings, add # to first line
        if (firstLineIsPlainTitle) {
          lines[0] = `# ${firstLine}`;
          text = lines.join("\n");
        }

        if (hasMarkdownHeadings || firstLineIsPlainTitle) {
          // Use the stored editor instance
          if (!editorInstance) return false;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const storage = editorInstance.storage as any;
          const parser = storage.markdown?.parser;

          if (parser) {
            const html = parser.parse(text);
            editorInstance.commands.insertContent(html);
          } else {
            // Fallback: manual markdown to HTML conversion
            const html = text
              .replace(/^### (.+)$/gm, "<h3>$1</h3>")
              .replace(/^## (.+)$/gm, "<h2>$1</h2>")
              .replace(/^# (.+)$/gm, "<h1>$1</h1>")
              .replace(/^---$/gm, "<hr>")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*([^*]+)\*/g, "<em>$1</em>")
              .replace(/`([^`]+)`/g, "<code>$1</code>")
              .replace(/^(?!<h[1-6]|<hr|<pre|<ul|<ol|<li|<blockquote)(.+)$/gm, "<p>$1</p>")
              .replace(/\n\n/g, "");
            editorInstance.commands.insertContent(html);
          }

          return true; // We handled the paste
        }

        return false; // Let default handling proceed
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Store editor reference for paste handler
  useEffect(() => {
    editorInstance = editor;
    return () => {
      editorInstance = null;
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-border rounded-lg">
        <div className="h-12 border-b border-border bg-muted/50" />
        <div className="min-h-[400px] p-4 animate-pulse bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
