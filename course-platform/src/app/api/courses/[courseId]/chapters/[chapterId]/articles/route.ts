import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createArticleSchema } from "@/lib/validations/article";

interface RouteContext {
  params: Promise<{ courseId: string; chapterId: string }>;
}

// GET /api/courses/[courseId]/chapters/[chapterId]/articles - List all articles for a chapter
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;

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

    const articles = await db.article.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/chapters/[chapterId]/articles - Create a new article
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { courseId, chapterId } = await context.params;
    const body = await request.json();

    // Add chapterId to the body for validation
    const dataWithChapterId = { ...body, chapterId };

    const validationResult = createArticleSchema.safeParse(dataWithChapterId);

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

    // Check if slug already exists within this chapter
    const existingArticle = await db.article.findFirst({
      where: {
        chapterId,
        slug: data.slug,
      },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: "An article with this slug already exists in this chapter" },
        { status: 400 }
      );
    }

    // Get the highest order number for articles in this chapter
    const lastArticle = await db.article.findFirst({
      where: { chapterId },
      orderBy: { order: "desc" },
    });

    // Only use provided order if explicitly set in request, otherwise auto-increment
    const orderValue =
      typeof body.order === "number"
        ? body.order
        : lastArticle
          ? lastArticle.order + 1
          : 0;

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle || null,
        description: data.description || null,
        content: data.content ?? undefined,
        estimatedMinutes: data.estimatedMinutes ?? null,
        published: data.published ?? false,
        order: orderValue,
        chapterId,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
