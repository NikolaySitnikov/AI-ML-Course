"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          className={cn(error && "border-destructive", className)}
          {...props}
        />
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    { label, error, hint, showCount, maxLength, className, id, value, ...props },
    ref
  ) => {
    const inputId = id || props.name;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {showCount && maxLength && (
            <span className="text-sm text-muted-foreground">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <Textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(error && "border-destructive", className)}
          {...props}
        />
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
