"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Files } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/shared";

interface ImportArticlesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  chapterId: string;
}

export function ImportArticlesDialog({
  open,
  onOpenChange,
  courseId,
  chapterId,
}: ImportArticlesDialogProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setMode("single");
    setError(null);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/articles/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      toast.success(`Imported ${data.count} article${data.count !== 1 ? "s" : ""}`);
      resetState();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Articles
          </DialogTitle>
          <DialogDescription>
            Upload a markdown file to quickly create articles with formatted content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload a markdown file
                </p>
                <p className="text-xs text-muted-foreground">.md or .txt files</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown,text/markdown,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Import Mode */}
          <div className="space-y-2">
            <Label>Import Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "single" | "multiple")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Single Article</div>
                      <div className="text-xs text-muted-foreground">
                        Create one article from the entire file
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="multiple">
                  <div className="flex items-center gap-2">
                    <Files className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Multiple Articles</div>
                      <div className="text-xs text-muted-foreground">
                        Split by # headings into separate articles
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Help */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Expected format:</p>
            <pre className="bg-background rounded p-2 overflow-x-auto">
{`# Article Title

Your content here with **bold**, *italic*,
\`code\`, and [links](url).

## Section Heading

More content...`}
            </pre>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
