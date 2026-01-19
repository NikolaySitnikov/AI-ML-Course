import Link from "next/link";
import { ArrowRight, BookOpen, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function HomePage() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: {
      _count: {
        select: { chapters: true },
      },
    },
    orderBy: { order: "asc" },
    take: 3,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-display">
              Master AI & Machine Learning
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Comprehensive courses designed to take you from fundamentals to
              advanced concepts. Learn at your own pace with structured content
              and practical examples.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="gap-2">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2">Why Learn With Us</h2>
            <p className="mt-4 text-muted-foreground">
              Our courses are structured for effective learning and deep understanding.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Structured Learning</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Courses organized into chapters and articles for progressive learning.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Comprehensive Content</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  From fundamentals to advanced topics, covering everything you need.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Rich Articles</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Well-written articles with code examples and visual explanations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview Section */}
      {courses.length > 0 && (
        <section className="border-t border-border bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-h2">Featured Courses</h2>
              <p className="mt-4 text-muted-foreground">
                Start your learning journey with our comprehensive courses.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-5xl">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                      <Layers className="mr-1 h-4 w-4" />
                      {course._count.chapters} chapter{course._count.chapters !== 1 && "s"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/courses">
                <Button variant="outline" className="gap-2">
                  View All Courses
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
