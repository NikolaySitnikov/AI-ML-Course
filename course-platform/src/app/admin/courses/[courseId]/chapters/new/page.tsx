import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { ChapterForm } from "@/components/admin/chapter-form";

interface NewChapterPageProps {
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

export default async function NewChapterPage({ params }: NewChapterPageProps) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  return (
    <div className="space-y-6">
      <BackLink
        href={`/admin/courses/${courseId}/chapters`}
        label="Back to Chapters"
      />

      <PageHeader
        title="Create New Chapter"
        description={`Add a new chapter to "${course.title}"`}
      />

      <ChapterForm courseId={courseId} mode="create" />
    </div>
  );
}
