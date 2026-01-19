import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Layers } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, BackLink } from "@/components/shared";
import { SortableChapterList } from "@/components/admin/sortable-chapter-list";

interface ChaptersPageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourse(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  return course;
}

async function getChapters(courseId: string) {
  return db.chapter.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export default async function ChaptersPage({ params }: ChaptersPageProps) {
  const { courseId } = await params;
  const [course, chapters] = await Promise.all([
    getCourse(courseId),
    getChapters(courseId),
  ]);

  return (
    <div className="space-y-8">
      <BackLink href={`/admin/courses`} label="Back to Courses" />

      <PageHeader
        title={`Chapters: ${course.title}`}
        description="Manage chapters for this course. Drag to reorder."
        actions={
          <Link href={`/admin/courses/${courseId}/chapters/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Chapter
            </Button>
          </Link>
        }
      />

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground" />}
              title="No chapters yet"
              description="Create your first chapter to start organizing your course content."
              action={
                <Link href={`/admin/courses/${courseId}/chapters/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chapter
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <SortableChapterList courseId={courseId} initialChapters={chapters} />
      )}
    </div>
  );
}
