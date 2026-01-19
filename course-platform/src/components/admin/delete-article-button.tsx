"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared";

interface DeleteArticleButtonProps {
  courseId: string;
  chapterId: string;
  articleId: string;
  articleTitle: string;
}

export function DeleteArticleButton({
  courseId,
  chapterId,
  articleId,
  articleTitle,
}: DeleteArticleButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/articles/${articleId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete article");
      }

      toast.success("Article deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    } finally {
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setShowDialog(true);
        }}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </DropdownMenuItem>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Delete Article"
        description={`Are you sure you want to delete "${articleTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
