import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { ArticleForm } from "@/components/admin/article-form";

interface NewArticlePageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
}

async function getCourseAndChapter(courseId: string, chapterId: string) {
  const [course, chapter] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
    }),
    db.chapter.findFirst({
      where: { id: chapterId, courseId },
    }),
  ]);

  if (!course || !chapter) {
    notFound();
  }

  return { course, chapter };
}

export default async function NewArticlePage({ params }: NewArticlePageProps) {
  const { courseId, chapterId } = await params;
  const { course, chapter } = await getCourseAndChapter(courseId, chapterId);

  return (
    <div className="space-y-6">
      <BackLink
        href={`/admin/courses/${courseId}/chapters/${chapterId}/articles`}
        label="Back to Articles"
      />

      <PageHeader
        title="Create New Article"
        description={`Add a new article to "${chapter.title}"`}
      />

      <ArticleForm courseId={courseId} chapterId={chapterId} mode="create" />
    </div>
  );
}
