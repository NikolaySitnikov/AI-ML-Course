import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateArticleSchema } from "@/lib/validations/article";

interface RouteContext {
  params: Promise<{ courseId: string; chapterId: string; articleId: string }>;
}

// GET /api/courses/[courseId]/chapters/[chapterId]/articles/[articleId] - Get a single article
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId, articleId } = await context.params;

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

    const article = await db.article.findFirst({
      where: {
        id: articleId,
        chapterId,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId]/chapters/[chapterId]/articles/[articleId] - Update an article
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId, articleId } = await context.params;
    const body = await request.json();

    const validationResult = updateArticleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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

    // Check if article exists
    const existingArticle = await db.article.findFirst({
      where: {
        id: articleId,
        chapterId,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (data.slug && data.slug !== existingArticle.slug) {
      const slugExists = await db.article.findFirst({
        where: {
          chapterId,
          slug: data.slug,
          NOT: { id: articleId },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "An article with this slug already exists in this chapter" },
          { status: 400 }
        );
      }
    }

    const article = await db.article.update({
      where: { id: articleId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle || null }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.content !== undefined && { content: data.content ?? undefined }),
        ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/chapters/[chapterId]/articles/[articleId] - Delete an article
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId, articleId } = await context.params;

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

    // Check if article exists
    const article = await db.article.findFirst({
      where: {
        id: articleId,
        chapterId,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await db.article.delete({
      where: { id: articleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
