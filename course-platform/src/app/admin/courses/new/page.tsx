import { PageHeader, BackLink } from "@/components/shared";
import { CourseForm } from "@/components/admin/course-form";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/courses" label="Back to Courses" />

      <PageHeader
        title="Create New Course"
        description="Add a new course to your platform."
      />

      <CourseForm mode="create" />
    </div>
  );
}
