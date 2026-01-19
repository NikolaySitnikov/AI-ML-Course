import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ courseId: string; chapterId: string }>;
}

const reorderSchema = z.object({
  articleIds: z.array(z.string()).min(1, "At least one article ID is required"),
});

// PATCH /api/courses/[courseId]/chapters/[chapterId]/articles/reorder - Reorder articles
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;
    const body = await request.json();

    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { articleIds } = validationResult.data;

    // Verify chapter belongs to course
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Verify all articles belong to this chapter
    const articles = await db.article.findMany({
      where: {
        chapterId,
        id: { in: articleIds },
      },
    });

    if (articles.length !== articleIds.length) {
      return NextResponse.json(
        { error: "Some articles were not found in this chapter" },
        { status: 400 }
      );
    }

    // Update order for each article
    const updatePromises = articleIds.map((articleId, index) =>
      db.article.update({
        where: { id: articleId },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering articles:", error);
    return NextResponse.json(
      { error: "Failed to reorder articles" },
      { status: 500 }
    );
  }
}
