import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";
import { db } from "@/lib/db";

interface CoursePageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { courseSlug } = await params;
  const course = await db.course.findUnique({
    where: { slug: courseSlug, published: true },
  });

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  const course = await db.course.findUnique({
    where: { slug: courseSlug, published: true },
    include: {
      chapters: {
        where: { published: true },
        include: {
          articles: {
            where: { published: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Find the first article to link to "Start Learning"
  const firstArticle =
    course.chapters[0]?.articles[0] ?? null;

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/courses" className="hover:text-primary transition-colors">
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{course.title}</span>
        </nav>

        {/* Course Header */}
        <div className="mb-12">
          <h1 className="text-h1">{course.title}</h1>
          {course.description && (
            <p className="mt-4 text-lg text-muted-foreground">
              {course.description}
            </p>
          )}
          {firstArticle && (
            <div className="mt-8">
              <Link
                href={`/courses/${course.slug}/${course.chapters[0].slug}/${firstArticle.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Learning
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Table of Contents */}
        <div className="space-y-8">
          <h2 className="text-h2 border-b border-border pb-4">Course Content</h2>

          {course.chapters.length === 0 ? (
            <p className="text-muted-foreground">
              No content available yet. Check back soon!
            </p>
          ) : (
            <div className="space-y-6">
              {course.chapters.map((chapter, chapterIndex) => (
                <div
                  key={chapter.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Chapter Header */}
                  <div className="bg-muted/50 px-6 py-4">
                    <h3 className="font-semibold">
                      <span className="text-muted-foreground mr-2">
                        {chapterIndex + 1}.
                      </span>
                      {chapter.title}
                    </h3>
                    {chapter.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  {/* Articles List */}
                  {chapter.articles.length > 0 && (
                    <ul className="divide-y divide-border">
                      {chapter.articles.map((article, articleIndex) => (
                        <li key={article.id}>
                          <Link
                            href={`/courses/${course.slug}/${chapter.slug}/${article.slug}`}
                            className="flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors group"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm text-muted-foreground">
                              {chapterIndex + 1}.{articleIndex + 1}
                            </span>
                            <span className="group-hover:text-primary transition-colors">
                              {article.title}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
