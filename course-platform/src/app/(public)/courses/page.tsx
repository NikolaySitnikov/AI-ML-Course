import Link from "next/link";
import { Layers } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = {
  title: "Courses",
  description: "Browse all available AI and Machine Learning courses.",
};

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    where: { published: true },
    include: {
      _count: {
        select: { chapters: true },
      },
      chapters: {
        where: { published: true },
        include: {
          _count: {
            select: { articles: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });

  // Calculate total articles per course
  const coursesWithStats = courses.map((course) => ({
    ...course,
    totalArticles: course.chapters.reduce(
      (sum, chapter) => sum + chapter._count.articles,
      0
    ),
  }));

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-h1">All Courses</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our comprehensive courses on AI and Machine Learning.
          </p>
        </div>

        {/* Course Grid */}
        <div className="mx-auto mt-16 max-w-5xl">
          {coursesWithStats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No courses available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {coursesWithStats.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="mt-3 text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Layers className="mr-1.5 h-4 w-4" />
                      {course._count.chapters} chapter
                      {course._count.chapters !== 1 && "s"}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <div>
                      {course.totalArticles} article
                      {course.totalArticles !== 1 && "s"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
