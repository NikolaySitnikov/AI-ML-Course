"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Article } from "@prisma/client";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/editor";
import { LoadingSpinner } from "@/components/shared";

interface ArticleContentEditorProps {
  courseId: string;
  chapterId: string;
  article: Article;
}

export function ArticleContentEditor({
  courseId,
  chapterId,
  article,
}: ArticleContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState<object | null>(
    article.content as object | null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = useCallback((newContent: object) => {
    setContent(newContent);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/articles/${article.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save");
      }

      toast.success("Content saved successfully");
      setHasChanges(false);
      router.push(`/admin/courses/${courseId}/chapters/${chapterId}/articles`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const SaveButton = () => (
    <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
      {isSaving ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      Save Content
    </Button>
  );

  return (
    <div className="space-y-4 pb-20">
      <TiptapEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Start writing your article content..."
      />

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-background border-t border-border p-4 z-40">
        <div className="flex items-center justify-between max-w-none">
          <div className="text-sm text-muted-foreground">
            {hasChanges ? (
              <span className="text-amber-500">Unsaved changes</span>
            ) : (
              <span>All changes saved</span>
            )}
          </div>
          <SaveButton />
        </div>
      </div>
    </div>
  );
}
