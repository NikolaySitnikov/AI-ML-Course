import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Logo and description */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-semibold">
                AI/ML Course
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Learn AI and Machine Learning through comprehensive courses.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AI/ML Course. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
