import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, BackLink } from "@/components/shared";
import { SortableArticleList } from "@/components/admin/sortable-article-list";
import { ArticlesPageActions } from "@/components/admin/articles-page-actions";

interface ArticlesPageProps {
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

async function getArticles(chapterId: string) {
  return db.article.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
  });
}

export default async function ArticlesPage({ params }: ArticlesPageProps) {
  const { courseId, chapterId } = await params;
  const [{ course, chapter }, articles] = await Promise.all([
    getCourseAndChapter(courseId, chapterId),
    getArticles(chapterId),
  ]);

  return (
    <div className="space-y-8">
      <BackLink
        href={`/admin/courses/${courseId}/chapters`}
        label="Back to Chapters"
      />

      <PageHeader
        title={`Articles: ${chapter.title}`}
        description={`Manage articles in this chapter. Drag to reorder.`}
        actions={<ArticlesPageActions courseId={courseId} chapterId={chapterId} />}
      />

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No articles yet"
              description="Create your first article to add content to this chapter."
              action={
                <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <SortableArticleList
          courseId={courseId}
          chapterId={chapterId}
          initialArticles={articles}
        />
      )}
    </div>
  );
}
