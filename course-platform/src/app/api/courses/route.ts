import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCourseSchema } from "@/lib/validations/course";
import { Prisma } from "@prisma/client";

// GET all courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    const courses = await db.course.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: {
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST create course
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCourseSchema.parse(body);

    // Check if slug already exists
    const existing = await db.course.findUnique({
      where: { slug: validated.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A course with this slug already exists" },
        { status: 400 }
      );
    }

    // Get the highest order number
    const maxOrder = await db.course.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const course = await db.course.create({
      data: {
        ...validated,
        order: nextOrder,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);

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
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
