import { z } from "zod";

export const articleSchema = z.object({
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
  content: z.any().optional().nullable(), // Tiptap JSON content
  estimatedMinutes: z.number().int().min(0).optional().nullable(),
  published: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
  chapterId: z.string().min(1, "Chapter is required"),
});

export const createArticleSchema = articleSchema;

export const updateArticleSchema = articleSchema.partial().omit({ chapterId: true });

// Input type (what the form submits)
export type ArticleFormData = z.input<typeof articleSchema>;

// Output type (after validation with defaults applied)
export type ArticleData = z.output<typeof articleSchema>;
