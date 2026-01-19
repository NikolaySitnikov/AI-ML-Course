"use client";

import { forwardRef, useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

interface SlugInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  sourceValue?: string; // Value to generate slug from (e.g., title)
  value: string;
  onChange: (value: string) => void;
}

export const SlugInput = forwardRef<HTMLInputElement, SlugInputProps>(
  ({ label = "Slug", error, hint, sourceValue, value, onChange, className, id, ...props }, ref) => {
    const inputId = id || props.name || "slug";
    const [isManuallyEdited, setIsManuallyEdited] = useState(false);
    const onChangeRef = useRef(onChange);

    // Update ref in an effect to avoid updating during render
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Auto-generate slug from source when not manually edited
    useEffect(() => {
      if (sourceValue && !isManuallyEdited) {
        onChangeRef.current(generateSlug(sourceValue));
      }
    }, [sourceValue, isManuallyEdited]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsManuallyEdited(true);
      onChange(generateSlug(e.target.value));
    };

    const handleRegenerate = () => {
      if (sourceValue) {
        setIsManuallyEdited(false);
        onChange(generateSlug(sourceValue));
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="flex gap-2">
          <Input
            ref={ref}
            id={inputId}
            value={value}
            onChange={handleChange}
            className={cn(error && "border-destructive", className)}
            placeholder="auto-generated-from-title"
            {...props}
          />
          {sourceValue && isManuallyEdited && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRegenerate}
              title="Regenerate from title"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
SlugInput.displayName = "SlugInput";
