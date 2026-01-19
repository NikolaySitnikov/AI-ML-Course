"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  published: boolean;
  className?: string;
}

export function StatusBadge({ published, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={published ? "default" : "secondary"}
      className={cn(
        published
          ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
        className
      )}
    >
      {published ? "Published" : "Draft"}
    </Badge>
  );
}
