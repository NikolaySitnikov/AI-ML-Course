"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Pencil, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { Article } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared";
import { DeleteArticleButton } from "./delete-article-button";

interface SortableArticleItemProps {
  article: Article;
  courseId: string;
  chapterId: string;
  index: number;
}

function SortableArticleItem({ article, courseId, chapterId, index }: SortableArticleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/50 transition-colors ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <Link
              href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/${article.id}/edit`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{article.title}</h3>
                  <StatusBadge published={article.published} />
                </div>
                {article.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>/{article.slug}</span>
                </div>
              </div>
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/${article.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/${article.id}/content`}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit Content
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteArticleButton
                courseId={courseId}
                chapterId={chapterId}
                articleId={article.id}
                articleTitle={article.title}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableArticleListProps {
  courseId: string;
  chapterId: string;
  initialArticles: Article[];
}

export function SortableArticleList({ courseId, chapterId, initialArticles }: SortableArticleListProps) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = articles.findIndex((a) => a.id === active.id);
      const newIndex = articles.findIndex((a) => a.id === over.id);

      const newArticles = arrayMove(articles, oldIndex, newIndex);
      setArticles(newArticles);

      // Save the new order to the database
      setIsSaving(true);
      try {
        const response = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/articles/reorder`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              articleIds: newArticles.map((a) => a.id),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save order");
        }

        toast.success("Article order updated");
        router.refresh();
      } catch (error) {
        // Revert on error
        setArticles(initialArticles);
        toast.error("Failed to update article order");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={articles.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className={`grid gap-4 ${isSaving ? "opacity-70 pointer-events-none" : ""}`}>
          {articles.map((article, index) => (
            <SortableArticleItem
              key={article.id}
              article={article}
              courseId={courseId}
              chapterId={chapterId}
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
