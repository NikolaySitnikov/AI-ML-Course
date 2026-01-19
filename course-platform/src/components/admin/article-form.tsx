"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Article } from "@prisma/client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormField, FormTextarea, SlugInput, LoadingSpinner } from "@/components/shared";

// Form schema without chapterId (it comes from props)
const articleFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug must be less than 200 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  subtitle: z
    .string()
    .max(300, "Subtitle must be less than 300 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  published: z.boolean().optional().default(false),
});

type ArticleFormData = z.input<typeof articleFormSchema>;

interface ArticleFormProps {
  courseId: string;
  chapterId: string;
  article?: Article;
  mode: "create" | "edit";
}

export function ArticleForm({ courseId, chapterId, article, mode }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      subtitle: article?.subtitle ?? "",
      description: article?.description ?? "",
      published: article?.published ?? false,
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const published = watch("published");

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? `/api/courses/${courseId}/chapters/${chapterId}/articles`
          : `/api/courses/${courseId}/chapters/${chapterId}/articles/${article?.id}`;
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
        mode === "create" ? "Article created successfully" : "Article updated successfully"
      );

      router.push(`/admin/courses/${courseId}/chapters/${chapterId}/articles`);
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
            placeholder="What is Machine Learning?"
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

          <FormField
            label="Subtitle"
            placeholder="A deeper look into the fundamentals"
            hint="Optional subtitle shown below the title."
            error={errors.subtitle?.message}
            {...register("subtitle")}
          />

          <FormTextarea
            label="Description"
            placeholder="A brief summary of this article..."
            hint="Optional summary shown in article listings and for SEO."
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
                  ? "This article is visible to the public"
                  : "This article is hidden from the public"}
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
          {mode === "create" ? "Create Article" : "Save Changes"}
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
