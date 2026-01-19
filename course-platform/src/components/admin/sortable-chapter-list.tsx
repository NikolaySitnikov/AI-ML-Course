"use client";

import { useState, useId, useEffect } from "react";
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
import { GripVertical, MoreHorizontal, Pencil, FileText, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Chapter } from "@prisma/client";

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
import { DeleteChapterButton } from "./delete-chapter-button";

type ChapterWithCount = Chapter & {
  _count: {
    articles: number;
  };
};

interface SortableChapterItemProps {
  chapter: ChapterWithCount;
  courseId: string;
  index: number;
  onPublishToggle: (chapterId: string, published: boolean) => void;
}

function SortableChapterItem({ chapter, courseId, index, onPublishToggle }: SortableChapterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

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
              href={`/admin/courses/${courseId}/chapters/${chapter.id}/articles`}
              className="flex items-center gap-4 flex-1 min-w-0"
            >
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{chapter.title}</h3>
                  <StatusBadge published={chapter.published} />
                </div>
                {chapter.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chapter.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {chapter._count.articles} article
                    {chapter._count.articles !== 1 ? "s" : ""}
                  </span>
                  <span>/{chapter.slug}</span>
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
                <Link href={`/admin/courses/${courseId}/chapters/${chapter.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/courses/${courseId}/chapters/${chapter.id}/articles`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Articles
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPublishToggle(chapter.id, !chapter.published)}>
                {chapter.published ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteChapterButton
                courseId={courseId}
                chapterId={chapter.id}
                chapterTitle={chapter.title}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableChapterListProps {
  courseId: string;
  initialChapters: ChapterWithCount[];
}

export function SortableChapterList({ courseId, initialChapters }: SortableChapterListProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [isSaving, setIsSaving] = useState(false);
  const dndId = useId();

  // Sync state when initialChapters changes (e.g., after delete)
  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  const handlePublishToggle = async (chapterId: string, published: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });

      if (!response.ok) {
        throw new Error("Failed to update chapter");
      }

      // Update local state
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, published } : c))
      );

      toast.success(published ? "Chapter published" : "Chapter unpublished");
      router.refresh();
    } catch {
      toast.error("Failed to update chapter");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chapters.findIndex((c) => c.id === active.id);
      const newIndex = chapters.findIndex((c) => c.id === over.id);

      const newChapters = arrayMove(chapters, oldIndex, newIndex);
      setChapters(newChapters);

      // Save the new order to the database
      setIsSaving(true);
      try {
        const response = await fetch(`/api/courses/${courseId}/chapters/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterIds: newChapters.map((c) => c.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save order");
        }

        toast.success("Chapter order updated");
        router.refresh();
      } catch (error) {
        // Revert on error
        setChapters(initialChapters);
        toast.error("Failed to update chapter order");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className={`grid gap-4 ${isSaving ? "opacity-70 pointer-events-none" : ""}`}>
          {chapters.map((chapter, index) => (
            <SortableChapterItem
              key={chapter.id}
              chapter={chapter}
              courseId={courseId}
              index={index}
              onPublishToggle={handlePublishToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
