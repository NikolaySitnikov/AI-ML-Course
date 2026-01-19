import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="sticky bottom-0 z-10 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Logo and copyright */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-semibold">
                AI/ML Course
              </span>
            </Link>
            <span className="hidden md:inline text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
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

        {/* Mobile copyright */}
        <p className="md:hidden mt-3 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI/ML Course. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
