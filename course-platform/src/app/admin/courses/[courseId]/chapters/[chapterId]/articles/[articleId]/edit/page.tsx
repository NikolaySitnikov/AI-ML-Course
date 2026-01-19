import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { ArticleForm } from "@/components/admin/article-form";

interface EditArticlePageProps {
  params: Promise<{ courseId: string; chapterId: string; articleId: string }>;
}

async function getData(courseId: string, chapterId: string, articleId: string) {
  const [course, chapter, article] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
    }),
    db.chapter.findFirst({
      where: { id: chapterId, courseId },
    }),
    db.article.findFirst({
      where: { id: articleId, chapterId },
    }),
  ]);

  if (!course || !chapter || !article) {
    notFound();
  }

  return { course, chapter, article };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { courseId, chapterId, articleId } = await params;
  const { course, chapter, article } = await getData(courseId, chapterId, articleId);

  return (
    <div className="space-y-6">
      <BackLink
        href={`/admin/courses/${courseId}/chapters/${chapterId}/articles`}
        label="Back to Articles"
      />

      <PageHeader
        title="Edit Article"
        description={`Editing "${article.title}"`}
      />

      <ArticleForm
        courseId={courseId}
        chapterId={chapterId}
        article={article}
        mode="edit"
      />
    </div>
  );
}
