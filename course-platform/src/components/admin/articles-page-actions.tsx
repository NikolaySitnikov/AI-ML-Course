"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportArticlesDialog } from "./import-articles-dialog";

interface ArticlesPageActionsProps {
  courseId: string;
  chapterId: string;
}

export function ArticlesPageActions({ courseId, chapterId }: ArticlesPageActionsProps) {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/articles/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      <ImportArticlesDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        courseId={courseId}
        chapterId={chapterId}
      />
    </>
  );
}
