"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  articles: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}

interface CourseSidebarProps {
  courseSlug: string;
  courseTitle: string;
  chapters: Chapter[];
  currentChapterSlug: string;
  currentArticleSlug: string;
}

export function CourseSidebar({
  courseSlug,
  chapters,
  currentChapterSlug,
  currentArticleSlug,
}: CourseSidebarProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    initial.add(currentChapterSlug);
    return initial;
  });

  // 80px header + 60px sticky footer = 140px
  const sidebarHeight = "calc(100vh - 140px)";
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleChapter = (chapterSlug: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterSlug)) {
        next.delete(chapterSlug);
      } else {
        next.add(chapterSlug);
      }
      return next;
    });
  };

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      {/* Fixed positioned sidebar */}
      <div
        ref={sidebarRef}
        style={{ height: sidebarHeight }}
        className="fixed top-20 w-72 overflow-y-auto pr-4 overscroll-contain bg-background sidebar-scrollbar"
      >
        <Link
          href={`/courses/${courseSlug}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Course
        </Link>

        <nav className="space-y-1">
          {chapters.map((ch, chapterIndex) => {
            const isExpanded = expandedChapters.has(ch.slug);
            const isCurrentChapter = ch.slug === currentChapterSlug;
            const hasCurrentArticle = ch.articles.some(
              (art) => art.slug === currentArticleSlug && isCurrentChapter
            );

            return (
              <div key={ch.id}>
                <button
                  onClick={() => toggleChapter(ch.slug)}
                  className={`w-full flex items-center justify-between gap-2 py-2 px-2 text-sm font-medium rounded-md transition-colors ${
                    hasCurrentArticle
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-left truncate">
                    {chapterIndex + 1}. {ch.title}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <ul className="ml-2 space-y-0.5 mt-1 mb-2">
                    {ch.articles.map((art) => {
                      const isActive =
                        ch.slug === currentChapterSlug &&
                        art.slug === currentArticleSlug;
                      return (
                        <li key={art.id}>
                          <Link
                            href={`/courses/${courseSlug}/${ch.slug}/${art.slug}`}
                            className={`block py-1.5 px-3 text-sm rounded-md transition-colors ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {art.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
