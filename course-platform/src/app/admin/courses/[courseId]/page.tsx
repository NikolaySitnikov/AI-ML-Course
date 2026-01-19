import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader, BackLink } from "@/components/shared";
import { CourseForm } from "@/components/admin/course-form";

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

async function getCourse(courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  return course;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  return (
    <div className="space-y-6">
      <BackLink href="/admin/courses" label="Back to Courses" />

      <PageHeader
        title="Edit Course"
        description={`Editing "${course.title}"`}
      />

      <CourseForm course={course} mode="edit" />
    </div>
  );
}
