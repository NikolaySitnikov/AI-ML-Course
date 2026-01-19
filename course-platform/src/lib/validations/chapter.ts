import { z } from "zod";

export const chapterSchema = z.object({
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
  order: z.number().int().min(0).optional().default(0),
  courseId: z.string().min(1, "Course is required"),
});

export const createChapterSchema = chapterSchema;

export const updateChapterSchema = chapterSchema.partial().omit({ courseId: true });

// Input type (what the form submits)
export type ChapterFormData = z.input<typeof chapterSchema>;

// Output type (after validation with defaults applied)
export type ChapterData = z.output<typeof chapterSchema>;
