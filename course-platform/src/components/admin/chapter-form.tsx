"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Chapter } from "@prisma/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField, FormTextarea, SlugInput, LoadingSpinner } from "@/components/shared";

// Form schema without courseId (it comes from props)
const chapterFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  published: z.boolean().optional().default(false),
});

type ChapterFormData = z.input<typeof chapterFormSchema>;

interface ChapterFormProps {
  courseId: string;
  chapter?: Chapter;
  mode: "create" | "edit";
}

export function ChapterForm({ courseId, chapter, mode }: ChapterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      title: chapter?.title ?? "",
      slug: chapter?.slug ?? "",
      description: chapter?.description ?? "",
      published: chapter?.published ?? false,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const published = watch("published");

  const onSubmit = async (data: ChapterFormData) => {
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? `/api/courses/${courseId}/chapters`
          : `/api/courses/${courseId}/chapters/${chapter?.id}`;
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
        mode === "create" ? "Chapter created successfully" : "Chapter updated successfully"
      );

      router.push(`/admin/courses/${courseId}/chapters`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <FormField
            label="Title"
            placeholder="Introduction to Neural Networks"
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
            label="Description"
            placeholder="A brief overview of what this chapter covers..."
            hint="Optional description for this chapter."
            error={errors.description?.message}
            showCount
            maxLength={500}
            rows={3}
            {...register("description")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-muted-foreground">
                {published
                  ? "This chapter is visible to the public"
                  : "This chapter is hidden from the public"}
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

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
          {mode === "create" ? "Create Chapter" : "Save Changes"}
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
