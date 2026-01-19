import Link from "next/link";
import { Plus, BookOpen, MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, EmptyState, StatusBadge } from "@/components/shared";
import { DeleteCourseButton } from "@/components/admin/delete-course-button";

async function getCourses() {
  return db.course.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { chapters: true },
      },
    },
  });
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Courses"
        description="Manage your course catalog"
        actions={
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </Link>
        }
      />

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
              title="No courses yet"
              description="Create your first course to start building your curriculum."
              action={
                <Link href="/admin/courses/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: `${course.color}20` }}
                    >
                      {course.icon || "📚"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{course.title}</h3>
                        <StatusBadge published={course.published} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {course._count.chapters} chapter
                          {course._count.chapters !== 1 ? "s" : ""}
                        </span>
                        <span>/{course.slug}</span>
                      </div>
                    </div>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/courses/${course.id}/chapters`}>
                          <Layers className="h-4 w-4 mr-2" />
                          Manage Chapters
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
