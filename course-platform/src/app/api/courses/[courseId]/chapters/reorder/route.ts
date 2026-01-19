import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

const reorderSchema = z.object({
  chapterIds: z.array(z.string()).min(1, "At least one chapter ID is required"),
});

// PATCH /api/courses/[courseId]/chapters/reorder - Reorder chapters
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { courseId } = await context.params;
    const body = await request.json();

    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { chapterIds } = validationResult.data;

    // Verify all chapters belong to this course
    const chapters = await db.chapter.findMany({
      where: {
        courseId,
        id: { in: chapterIds },
      },
    });

    if (chapters.length !== chapterIds.length) {
      return NextResponse.json(
        { error: "Some chapters were not found in this course" },
        { status: 400 }
      );
    }

    // Update order for each chapter
    const updatePromises = chapterIds.map((chapterId, index) =>
      db.chapter.update({
        where: { id: chapterId },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering chapters:", error);
    return NextResponse.json(
      { error: "Failed to reorder chapters" },
      { status: 500 }
    );
  }
}
