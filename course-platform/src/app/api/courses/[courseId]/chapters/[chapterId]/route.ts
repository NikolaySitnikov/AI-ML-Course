import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateChapterSchema } from "@/lib/validations/chapter";

interface RouteContext {
  params: Promise<{ courseId: string; chapterId: string }>;
}

// GET /api/courses/[courseId]/chapters/[chapterId] - Get a single chapter
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;

    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
      include: {
        articles: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId]/chapters/[chapterId] - Update a chapter
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;
    const body = await request.json();

    const validationResult = updateChapterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if chapter exists
    const existingChapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== existingChapter.slug) {
      const slugExists = await db.chapter.findFirst({
        where: {
          courseId,
          slug: data.slug,
          NOT: { id: chapterId },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A chapter with this slug already exists in this course" },
          { status: 400 }
        );
      }
    }

    const chapter = await db.chapter.update({
      where: { id: chapterId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/chapters/[chapterId] - Delete a chapter
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;

    // Check if chapter exists
    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Delete chapter (articles will be cascade deleted based on Prisma schema)
    await db.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
