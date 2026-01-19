import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateCourseSchema } from "@/lib/validations/course";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// GET single course
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { articles: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PATCH update course
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;
    const body = await req.json();
    const validated = updateCourseSchema.parse(body);

    // Check if course exists
    const existing = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await db.course.findUnique({
        where: { slug: validated.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A course with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const course = await db.course.update({
      where: { id: courseId },
      data: validated,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A course with this slug already exists" },
          { status: 400 }
        );
      }
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE course
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { courseId } = await params;

    // Check if course exists
    const existing = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete course (cascades to chapters and articles due to schema)
    await db.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
