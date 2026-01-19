import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { ChapterForm } from "@/components/admin/chapter-form";

interface EditChapterPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
}

async function getCourseAndChapter(courseId: string, chapterId: string) {
  const [course, chapter] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
    }),
    db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
    }),
  ]);

  if (!course || !chapter) {
    notFound();
  }

  return { course, chapter };
}

export default async function EditChapterPage({ params }: EditChapterPageProps) {
  const { courseId, chapterId } = await params;
  const { course, chapter } = await getCourseAndChapter(courseId, chapterId);

  return (
    <div className="space-y-6">
      <BackLink
        href={`/admin/courses/${courseId}/chapters`}
        label="Back to Chapters"
      />

      <PageHeader
        title="Edit Chapter"
        description={`Editing "${chapter.title}" in "${course.title}"`}
      />

      <ChapterForm courseId={courseId} chapter={chapter} mode="edit" />
    </div>
  );
}
