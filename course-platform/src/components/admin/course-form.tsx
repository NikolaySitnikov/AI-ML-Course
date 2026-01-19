"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Course } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField, FormTextarea, SlugInput, LoadingSpinner } from "@/components/shared";
import { courseSchema, CourseFormData } from "@/lib/validations/course";

interface CourseFormProps {
  course?: Course;
  mode: "create" | "edit";
}

// Common emoji icons for courses
const EMOJI_OPTIONS = ["📚", "🧠", "🤖", "💡", "🔬", "📊", "🎯", "⚡", "🌟", "🎓"];

export function CourseForm({ course, mode }: CourseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title ?? "",
      slug: course?.slug ?? "",
      description: course?.description ?? "",
      longDescription: course?.longDescription ?? "",
      icon: course?.icon ?? "📚",
      color: course?.color ?? "#3b82f6",
      coverImage: course?.coverImage ?? "",
      published: course?.published ?? false,
      order: course?.order ?? 0,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const icon = watch("icon");
  const published = watch("published");

  const onSubmit = async (data: CourseFormData) => {
    setIsSubmitting(true);

    try {
      const url = mode === "create" ? "/api/courses" : `/api/courses/${course?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      toast.success(
        mode === "create" ? "Course created successfully" : "Course updated successfully"
      );

      router.push("/admin/courses");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <FormField
            label="Title"
            placeholder="Introduction to Machine Learning"
            error={errors.title?.message}
            required
            {...register("title")}
          />

          <SlugInput
            label="Slug"
            hint="URL-friendly identifier (auto-generated from title)"
            error={errors.slug?.message}
            required
            sourceValue={title}
            value={slug}
            onChange={(value) => setValue("slug", value)}
          />

          <FormTextarea
            label="Short Description"
            placeholder="A brief overview of what this course covers..."
            hint="Displayed on course cards. Keep it concise."
            error={errors.description?.message}
            required
            showCount
            maxLength={500}
            rows={3}
            {...register("description")}
          />

          <FormTextarea
            label="Long Description"
            placeholder="Detailed description of the course content, learning objectives, prerequisites..."
            hint="Displayed on the course detail page."
            error={errors.longDescription?.message}
            showCount
            maxLength={5000}
            rows={6}
            {...register("longDescription")}
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label className="mb-3 block">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue("icon", emoji)}
                  className={`h-12 w-12 rounded-lg border-2 text-2xl flex items-center justify-center transition-colors ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {errors.icon && (
              <p className="text-sm text-destructive mt-2">{errors.icon.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="color" className="mb-3 block">
              Accent Color
            </Label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                id="color"
                {...register("color")}
                className="h-12 w-20 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                {...register("color")}
                placeholder="#3b82f6"
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {errors.color && (
              <p className="text-sm text-destructive mt-2">{errors.color.message}</p>
            )}
          </div>

          <FormField
            label="Cover Image URL"
            placeholder="https://example.com/image.jpg"
            hint="Optional cover image for the course"
            error={errors.coverImage?.message}
            {...register("coverImage")}
          />
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-muted-foreground">
                {published
                  ? "This course is visible to the public"
                  : "This course is hidden from the public"}
              </p>
            </div>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={(checked) => setValue("published", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
          {mode === "create" ? "Create Course" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
