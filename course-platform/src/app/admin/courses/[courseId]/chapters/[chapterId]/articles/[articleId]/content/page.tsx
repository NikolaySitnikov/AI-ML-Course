import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ArticleContentEditor } from "@/components/admin/article-content-editor";

interface ContentEditorPageProps {
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

export default async function ContentEditorPage({ params }: ContentEditorPageProps) {
  const { courseId, chapterId, articleId } = await params;
  const { course, chapter, article } = await getData(courseId, chapterId, articleId);

  return (
    <div className="space-y-6">
      <BackLink
        href={`/admin/courses/${courseId}/chapters/${chapterId}/articles`}
        label="Back to Articles"
      />

      <PageHeader
        title={article.title}
        description="Edit article content"
        actions={
          <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/${articleId}/edit`}>
            <Button variant="outline">
              Edit Details
            </Button>
          </Link>
        }
      />

      <ArticleContentEditor
        courseId={courseId}
        chapterId={chapterId}
        article={article}
      />
    </div>
  );
}
