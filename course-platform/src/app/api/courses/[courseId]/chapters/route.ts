import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createChapterSchema } from "@/lib/validations/chapter";

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

// GET /api/courses/[courseId]/chapters - List all chapters for a course
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { courseId } = await context.params;

    const chapters = await db.chapter.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/chapters - Create a new chapter
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { courseId } = await context.params;
    const body = await request.json();

    // Add courseId to the body for validation
    const dataWithCourseId = { ...body, courseId };

    const validationResult = createChapterSchema.safeParse(dataWithCourseId);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if slug already exists within this course
    const existingChapter = await db.chapter.findFirst({
      where: {
        courseId,
        slug: data.slug,
      },
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: "A chapter with this slug already exists in this course" },
        { status: 400 }
      );
    }

    // Get the highest order number for chapters in this course
    const lastChapter = await db.chapter.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    // Only use provided order if explicitly set in request, otherwise auto-increment
    const orderValue =
      typeof body.order === "number"
        ? body.order
        : lastChapter
          ? lastChapter.order + 1
          : 0;

    const chapter = await db.chapter.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        published: data.published ?? false,
        order: orderValue,
        courseId,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
