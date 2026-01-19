import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ArticleContent } from "@/components/public/article-content";

interface ArticlePageProps {
  params: Promise<{
    courseSlug: string;
    chapterSlug: string;
    articleSlug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { courseSlug, chapterSlug, articleSlug } = await params;

  const course = await db.course.findUnique({
    where: { slug: courseSlug, published: true },
  });

  if (!course) {
    return { title: "Article Not Found" };
  }

  const chapter = await db.chapter.findUnique({
    where: {
      courseId_slug: { courseId: course.id, slug: chapterSlug },
      published: true,
    },
  });

  if (!chapter) {
    return { title: "Article Not Found" };
  }

  const article = await db.article.findUnique({
    where: {
      chapterId_slug: { chapterId: chapter.id, slug: articleSlug },
      published: true,
    },
  });

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: `${article.title} | ${course.title}`,
    description: article.description,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { courseSlug, chapterSlug, articleSlug } = await params;

  // Get the course with all chapters and articles for navigation
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

  // Find the current chapter and article
  const chapter = course.chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) {
    notFound();
  }

  const article = chapter.articles.find((a) => a.slug === articleSlug);
  if (!article) {
    notFound();
  }

  // Build a flat list of all articles for prev/next navigation
  const allArticles: Array<{
    courseSlug: string;
    chapterSlug: string;
    articleSlug: string;
    title: string;
  }> = [];

  for (const ch of course.chapters) {
    for (const art of ch.articles) {
      allArticles.push({
        courseSlug: course.slug,
        chapterSlug: ch.slug,
        articleSlug: art.slug,
        title: art.title,
      });
    }
  }

  const currentIndex = allArticles.findIndex(
    (a) => a.chapterSlug === chapterSlug && a.articleSlug === articleSlug
  );
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex gap-12">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <Link
                href={`/courses/${course.slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </Link>

              <nav className="space-y-4">
                {course.chapters.map((ch, chapterIndex) => (
                  <div key={ch.id}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {chapterIndex + 1}. {ch.title}
                    </h4>
                    <ul className="space-y-1">
                      {ch.articles.map((art) => {
                        const isActive =
                          ch.slug === chapterSlug && art.slug === articleSlug;
                        return (
                          <li key={art.id}>
                            <Link
                              href={`/courses/${course.slug}/${ch.slug}/${art.slug}`}
                              className={`block py-1 px-3 text-sm rounded-md transition-colors ${
                                isActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                            >
                              {art.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0 max-w-3xl">
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/courses"
                className="hover:text-primary transition-colors"
              >
                Courses
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/courses/${course.slug}`}
                className="hover:text-primary transition-colors"
              >
                {course.title}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate">{article.title}</span>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <div className="text-sm text-muted-foreground mb-2">
                {chapter.title}
              </div>
              <h1 className="text-h1">{article.title}</h1>
              {article.description && (
                <p className="mt-4 text-lg text-muted-foreground">
                  {article.description}
                </p>
              )}
            </header>

            {/* Article Content */}
            <div className="article-container-wide">
              <ArticleContent content={article.content as object | null} />
            </div>

            {/* Prev/Next Navigation */}
            <nav className="mt-16 pt-8 border-t border-border">
              <div className="flex justify-between gap-4">
                {prevArticle ? (
                  <Link
                    href={`/courses/${prevArticle.courseSlug}/${prevArticle.chapterSlug}/${prevArticle.articleSlug}`}
                    className="group flex flex-col items-start gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center text-sm text-muted-foreground">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </span>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {prevArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextArticle ? (
                  <Link
                    href={`/courses/${nextArticle.courseSlug}/${nextArticle.chapterSlug}/${nextArticle.articleSlug}`}
                    className="group flex flex-col items-end gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center text-sm text-muted-foreground">
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {nextArticle.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </nav>
          </article>
        </div>
      </div>
    </div>
  );
}
