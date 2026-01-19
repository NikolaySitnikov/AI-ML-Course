import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileEdit } from "lucide-react";

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

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileEdit className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Rich Text Editor Coming Soon</h3>
            <p className="text-muted-foreground max-w-sm">
              The Tiptap rich text editor will be implemented in the next phase.
              You&apos;ll be able to write and format your article content here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
