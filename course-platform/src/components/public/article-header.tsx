"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ArticleHeaderProps {
  courseSlug: string;
  courseTitle: string;
  chapterTitle: string;
  articleTitle: string;
  articleDescription?: string | null;
}

export function ArticleHeader({
  courseSlug,
  courseTitle,
  chapterTitle,
  articleTitle,
  articleDescription,
}: ArticleHeaderProps) {
  const [showTitleInBar, setShowTitleInBar] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleTitle]);

  useEffect(() => {
    const handleScroll = () => {
      if (!titleRef.current) return;

      const titleRect = titleRef.current.getBoundingClientRect();
      // Show title in bar when the main title is scrolled past the sticky bar position
      // Sticky bar is at top-[57px], so when title bottom goes above ~120px, show it
      setShowTitleInBar(titleRect.bottom < 120);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Sticky Article Info Bar */}
      <div className="sticky top-[57px] z-40 -mx-6 px-6 py-3 mb-6 bg-background border-b border-border">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link
            href="/courses"
            className="hover:text-primary transition-colors"
          >
            Courses
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/courses/${courseSlug}`}
            className="hover:text-primary transition-colors"
          >
            {courseTitle}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-muted-foreground truncate">{chapterTitle}</span>
        </nav>
        {/* Title appears on separate line with transition when scrolled */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showTitleInBar ? "max-h-8 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <h2 className="font-serif font-semibold text-lg truncate">
            {articleTitle}
          </h2>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <h1 ref={titleRef} className="text-h1">
          {articleTitle}
        </h1>
        {articleDescription && (
          <p className="mt-4 text-lg text-muted-foreground">
            {articleDescription}
          </p>
        )}
      </header>
    </>
  );
}
