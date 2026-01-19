import { z } from "zod";

export const courseSchema = z.object({
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
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  longDescription: z
    .string()
    .max(5000, "Long description must be less than 5000 characters")
    .optional()
    .nullable(),
  icon: z.string().max(10, "Icon must be less than 10 characters").optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
    .optional()
    .nullable(),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  published: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
});

export const createCourseSchema = courseSchema;

export const updateCourseSchema = courseSchema.partial();

// Input type (what the form submits)
export type CourseFormData = z.input<typeof courseSchema>;

// Output type (after validation with defaults applied)
export type CourseData = z.output<typeof courseSchema>;
