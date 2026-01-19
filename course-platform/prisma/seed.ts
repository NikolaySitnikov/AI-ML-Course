import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a test course
  const course = await prisma.course.upsert({
    where: { slug: "ai-fundamentals" },
    update: {},
    create: {
      title: "AI Fundamentals",
      slug: "ai-fundamentals",
      description: "Learn the fundamentals of Artificial Intelligence",
      published: true,
      order: 1,
    },
  });

  console.log("Created course:", course.title);

  // Create a test chapter
  const chapter = await prisma.chapter.upsert({
    where: {
      courseId_slug: {
        courseId: course.id,
        slug: "introduction",
      },
    },
    update: {},
    create: {
      title: "Introduction to AI",
      slug: "introduction",
      description: "An introduction to artificial intelligence concepts",
      published: true,
      order: 1,
      courseId: course.id,
    },
  });

  console.log("Created chapter:", chapter.title);

  // Create a test article
  const article = await prisma.article.upsert({
    where: {
      chapterId_slug: {
        chapterId: chapter.id,
        slug: "what-is-ai",
      },
    },
    update: {},
    create: {
      title: "What is AI?",
      slug: "what-is-ai",
      description: "Understanding the basics of artificial intelligence",
      published: true,
      order: 1,
      chapterId: chapter.id,
      content: {},
    },
  });

  console.log("Created article:", article.title);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
