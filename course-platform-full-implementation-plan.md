# Course Platform Implementation Plan
## Full-Stack Website + Admin CMS

---

## Project Overview

Build a complete course platform with two parts:

1. **Public Website** — Stunning, responsive site where users browse and read course content
2. **Admin CMS** — Dashboard where administrators create/edit courses, chapters, articles, and place images within content

**Key Requirements:**
- Beautiful, consistent article formatting with zero manual CSS work
- Rich text editor for article content
- Ability to add images at specific positions within articles
- Mobile and desktop optimized (can differ in layout)
- Easy content workflow: write text → add images later → publish

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | Full-stack React, great for both public site and admin |
| **Database** | PostgreSQL | Robust, relational data for courses/chapters/articles |
| **ORM** | Prisma | Type-safe database access, excellent DX |
| **Auth** | Clerk | Simple admin authentication, no custom auth code |
| **Rich Text Editor** | Tiptap | Extensible, great for custom image placement |
| **Image Storage** | Uploadthing or Cloudinary | Easy uploads, automatic optimization |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |
| **Deployment** | Vercel + Supabase (or PlanetScale) | Seamless Next.js hosting + managed Postgres |

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Course {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String
  longDescription String? @db.Text
  icon        String?   // emoji or icon name
  color       String?   // hex color for accent
  coverImage  String?   // URL to cover image
  published   Boolean   @default(false)
  order       Int       @default(0)
  
  chapters    Chapter[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Chapter {
  id          String    @id @default(cuid())
  title       String
  slug        String
  description String?
  order       Int       @default(0)
  published   Boolean   @default(false)
  
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  articles    Article[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([courseId, slug])
}

model Article {
  id              String    @id @default(cuid())
  title           String
  slug            String
  subtitle        String?
  description     String?   // Short description for cards/SEO
  content         Json      // Tiptap JSON content (includes text + image positions)
  estimatedMinutes Int?
  order           Int       @default(0)
  published       Boolean   @default(false)
  
  chapterId       String
  chapter         Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  images          ArticleImage[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([chapterId, slug])
}

model ArticleImage {
  id        String   @id @default(cuid())
  url       String   // Stored image URL
  alt       String
  caption   String?
  size      String   @default("large") // small, medium, large, full
  position  String   @default("center") // center, left, right
  
  articleId String
  article   Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
}
```

---

## Project Structure

```
course-platform/
├── app/
│   ├── (public)/                      # Public website routes (no layout prefix)
│   │   ├── layout.tsx                 # Public layout with nav/footer
│   │   ├── page.tsx                   # Homepage
│   │   ├── courses/
│   │   │   ├── page.tsx               # All courses
│   │   │   └── [courseSlug]/
│   │   │       ├── page.tsx           # Course overview
│   │   │       └── [chapterSlug]/
│   │   │           ├── page.tsx       # Chapter overview
│   │   │           └── [articleSlug]/
│   │   │               └── page.tsx   # Article page
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── admin/                         # Admin CMS routes
│   │   ├── layout.tsx                 # Admin layout with sidebar
│   │   ├── page.tsx                   # Admin dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx               # Manage courses
│   │   │   ├── new/page.tsx           # Create course
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx           # Edit course
│   │   │       └── chapters/
│   │   │           ├── page.tsx       # Manage chapters
│   │   │           ├── new/page.tsx   # Create chapter
│   │   │           └── [chapterId]/
│   │   │               ├── page.tsx   # Edit chapter
│   │   │               └── articles/
│   │   │                   ├── page.tsx      # Manage articles
│   │   │                   ├── new/page.tsx  # Create article
│   │   │                   └── [articleId]/
│   │   │                       └── page.tsx  # Edit article (rich text + images)
│   │   └── media/
│   │       └── page.tsx               # Media library (optional)
│   │
│   └── api/
│       ├── courses/
│       │   └── route.ts
│       ├── chapters/
│       │   └── route.ts
│       ├── articles/
│       │   └── route.ts
│       ├── upload/
│       │   └── route.ts               # Image upload endpoint
│       └── webhooks/
│           └── clerk/route.ts         # Auth webhooks
│
├── components/
│   ├── ui/                            # shadcn/ui components
│   │
│   ├── public/                        # Public site components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── CourseCard.tsx
│   │   ├── ChapterCard.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleSidebar.tsx
│   │   ├── ArticleContent.tsx         # Renders Tiptap JSON beautifully
│   │   ├── ArticleImage.tsx           # Styled image component
│   │   ├── TableOfContents.tsx
│   │   └── ArticleNavigation.tsx      # Prev/Next
│   │
│   ├── admin/                         # Admin components
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── CourseForm.tsx
│   │   ├── ChapterForm.tsx
│   │   ├── ArticleForm.tsx
│   │   ├── Editor/                    # Rich text editor
│   │   │   ├── TiptapEditor.tsx       # Main editor component
│   │   │   ├── EditorToolbar.tsx      # Formatting buttons
│   │   │   ├── ImagePlacer.tsx        # Custom image insertion UI
│   │   │   └── extensions/            # Custom Tiptap extensions
│   │   │       └── ArticleImage.ts    # Custom image node
│   │   ├── ImageUploader.tsx
│   │   └── PublishToggle.tsx
│   │
│   └── shared/
│       ├── LoadingSpinner.tsx
│       └── ConfirmDialog.tsx
│
├── lib/
│   ├── db.ts                          # Prisma client
│   ├── utils.ts                       # Utility functions
│   ├── validations.ts                 # Zod schemas
│   └── uploadthing.ts                 # Upload configuration
│
├── styles/
│   ├── globals.css                    # Tailwind + custom styles
│   └── editor.css                     # Editor-specific styles
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                        # Optional seed data
│
└── public/
    └── images/
        └── placeholder.png
```

---

## Design System

### Color Palette

```css
/* globals.css */
:root {
  /* Primary - Deep Blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Neutral - Slate */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --slate-950: #020617;

  /* Accent - Amber */
  --accent-400: #fbbf24;
  --accent-500: #f59e0b;

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;

  /* Surfaces */
  --background: #ffffff;
  --surface: #f8fafc;
  --surface-elevated: #ffffff;
  
  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;

  /* Article content width */
  --article-width: 720px;
  --article-wide: 900px;
}

.dark {
  --background: #0f172a;
  --surface: #1e293b;
  --surface-elevated: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
}
```

### Typography

```css
/* Typography Scale */
.text-display {
  font-family: var(--font-serif); /* Fraunces or similar */
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.text-h1 {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.text-h2 {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.text-h3 {
  font-family: var(--font-sans);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  line-height: 1.4;
}

/* Article body text - optimized for reading */
.prose-article {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.prose-article p {
  margin-bottom: 1.75em;
}

.prose-article h2 {
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  margin-top: 3rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--slate-200);
}

.prose-article h3 {
  font-size: 1.375rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}

.prose-article strong {
  font-weight: 600;
  color: var(--text-primary);
}

.prose-article code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--slate-100);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

.prose-article pre {
  background: var(--slate-900);
  color: var(--slate-100);
  padding: 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 2rem 0;
}

.prose-article blockquote {
  border-left: 4px solid var(--primary-500);
  padding-left: 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: var(--text-secondary);
}

.prose-article ul, .prose-article ol {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
}

.prose-article li {
  margin-bottom: 0.75rem;
}

.prose-article hr {
  border: none;
  height: 1px;
  background: var(--slate-200);
  margin: 3rem 0;
}
```

### Article Image Styles

```css
/* Article images with different sizes */
.article-image {
  margin: 2.5rem 0;
  clear: both;
}

.article-image.size-small {
  max-width: 300px;
}

.article-image.size-medium {
  max-width: 500px;
}

.article-image.size-large {
  max-width: var(--article-width);
}

.article-image.size-full {
  max-width: var(--article-wide);
  margin-left: calc((var(--article-width) - var(--article-wide)) / 2);
  margin-right: calc((var(--article-width) - var(--article-wide)) / 2);
}

/* Positioning */
.article-image.position-center {
  margin-left: auto;
  margin-right: auto;
}

.article-image.position-left {
  float: left;
  margin-right: 2rem;
  margin-bottom: 1rem;
}

.article-image.position-right {
  float: right;
  margin-left: 2rem;
  margin-bottom: 1rem;
}

/* Mobile: all images full width, no float */
@media (max-width: 768px) {
  .article-image {
    float: none !important;
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

.article-image img {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  background: var(--slate-100);
}

.article-image figcaption {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  text-align: center;
}
```

---

## Core Components

### 1. Rich Text Editor with Image Placement

The editor is the heart of the CMS. We'll use Tiptap with a custom ArticleImage extension.

```tsx
// components/admin/Editor/TiptapEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ArticleImageExtension } from './extensions/ArticleImage';
import { EditorToolbar } from './EditorToolbar';
import { ImagePlacer } from './ImagePlacer';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  articleId: string;
}

export function TiptapEditor({ content, onChange, articleId }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
      }),
      ArticleImageExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose-article min-h-[500px] focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />
      
      {/* Image insertion button - opens modal */}
      <ImagePlacer editor={editor} articleId={articleId} />
      
      {/* Editor content */}
      <div className="p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

```tsx
// components/admin/Editor/EditorToolbar.tsx
'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Code, 
  Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Undo, Redo 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    { type: 'divider' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    { type: 'divider' },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    { type: 'divider' },
    { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false },
    { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false },
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-slate-50 flex-wrap">
      {tools.map((tool, i) => 
        tool.type === 'divider' ? (
          <div key={i} className="w-px h-6 bg-slate-200 mx-1" />
        ) : (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={tool.action}
            className={cn(
              'h-8 w-8 p-0',
              tool.active && 'bg-slate-200'
            )}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  );
}
```

```tsx
// components/admin/Editor/ImagePlacer.tsx
'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ImagePlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '../ImageUploader';

interface ImagePlacerProps {
  editor: Editor;
  articleId: string;
}

export function ImagePlacer({ editor, articleId }: ImagePlacerProps) {
  const [open, setOpen] = useState(false);
  const [imageData, setImageData] = useState({
    url: '',
    alt: '',
    caption: '',
    size: 'large',
    position: 'center',
  });

  const handleInsert = () => {
    if (!imageData.url || !imageData.alt) return;

    editor.chain().focus().insertContent({
      type: 'articleImage',
      attrs: imageData,
    }).run();

    setOpen(false);
    setImageData({ url: '', alt: '', caption: '', size: 'large', position: 'center' });
  };

  const handleUploadComplete = (url: string) => {
    setImageData(prev => ({ ...prev, url }));
  };

  return (
    <div className="px-4 py-2 border-b bg-slate-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ImagePlus className="h-4 w-4" />
            Insert Image
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Image Upload */}
            <div>
              <Label>Image</Label>
              <ImageUploader 
                onUploadComplete={handleUploadComplete}
                currentUrl={imageData.url}
              />
            </div>

            {/* Alt Text */}
            <div>
              <Label htmlFor="alt">Alt Text (required)</Label>
              <Input
                id="alt"
                value={imageData.alt}
                onChange={(e) => setImageData(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Describe the image for accessibility"
              />
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                value={imageData.caption}
                onChange={(e) => setImageData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Caption displayed below the image"
              />
            </div>

            {/* Size */}
            <div>
              <Label>Size</Label>
              <Select value={imageData.size} onValueChange={(v) => setImageData(prev => ({ ...prev, size: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (300px) - for floating</SelectItem>
                  <SelectItem value="medium">Medium (500px)</SelectItem>
                  <SelectItem value="large">Large (720px) - default</SelectItem>
                  <SelectItem value="full">Full width (900px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position */}
            <div>
              <Label>Position</Label>
              <Select value={imageData.position} onValueChange={(v) => setImageData(prev => ({ ...prev, position: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="left">Float Left (text wraps right)</SelectItem>
                  <SelectItem value="right">Float Right (text wraps left)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Float only works for small/medium images on desktop
              </p>
            </div>

            {/* Preview */}
            {imageData.url && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                <img 
                  src={imageData.url} 
                  alt={imageData.alt || 'Preview'} 
                  className="max-h-40 mx-auto rounded"
                />
              </div>
            )}

            {/* Insert Button */}
            <Button 
              onClick={handleInsert} 
              disabled={!imageData.url || !imageData.alt}
              className="w-full"
            >
              Insert Image at Cursor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

```tsx
// components/admin/Editor/extensions/ArticleImage.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ArticleImageNodeView } from './ArticleImageNodeView';

export const ArticleImageExtension = Node.create({
  name: 'articleImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      size: { default: 'large' },
      position: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'article-image' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['article-image', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageNodeView);
  },
});
```

```tsx
// components/admin/Editor/extensions/ArticleImageNodeView.tsx
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Trash2, GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ArticleImageNodeView({ node, deleteNode, selected }: NodeViewProps) {
  const { url, alt, caption, size, position } = node.attrs;

  return (
    <NodeViewWrapper 
      className={`article-image-editor my-4 ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
      data-drag-handle
    >
      <div className="relative group">
        {/* Drag handle */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="h-5 w-5 text-slate-400" />
        </div>

        {/* Image */}
        <figure className={`article-image size-${size} position-${position}`}>
          <img src={url} alt={alt} className="rounded-lg" />
          {caption && (
            <figcaption className="text-sm text-slate-500 mt-2 text-center">
              {caption}
            </figcaption>
          )}
        </figure>

        {/* Delete button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={() => deleteNode()}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>

        {/* Size/Position badge */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
            {size} · {position}
          </span>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
```

### 2. Article Content Renderer (Public Site)

This renders the Tiptap JSON content beautifully on the public site.

```tsx
// components/public/ArticleContent.tsx
'use client';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { ArticleImageExtension } from '@/components/admin/Editor/extensions/ArticleImage';
import { ArticleImage } from './ArticleImage';

interface ArticleContentProps {
  content: any; // Tiptap JSON
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Convert Tiptap JSON to HTML, but handle images specially
  const renderContent = () => {
    if (!content?.content) return null;

    return content.content.map((node: any, index: number) => {
      // Handle custom article images
      if (node.type === 'articleImage') {
        return (
          <ArticleImage
            key={index}
            src={node.attrs.url}
            alt={node.attrs.alt}
            caption={node.attrs.caption}
            size={node.attrs.size}
            position={node.attrs.position}
          />
        );
      }

      // Handle other nodes via Tiptap HTML generation
      const html = generateHTML({ type: 'doc', content: [node] }, [StarterKit]);
      return (
        <div 
          key={index}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <article className="prose-article max-w-[720px] mx-auto">
      {renderContent()}
    </article>
  );
}
```

```tsx
// components/public/ArticleImage.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ArticleImageProps {
  src: string;
  alt: string;
  caption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  position?: 'center' | 'left' | 'right';
}

export function ArticleImage({ 
  src, 
  alt, 
  caption, 
  size = 'large', 
  position = 'center' 
}: ArticleImageProps) {
  return (
    <figure className={cn('article-image', `size-${size}`, `position-${position}`)}>
      <Image
        src={src}
        alt={alt}
        width={size === 'small' ? 300 : size === 'medium' ? 500 : size === 'large' ? 720 : 900}
        height={size === 'small' ? 200 : size === 'medium' ? 333 : size === 'large' ? 480 : 600}
        className="rounded-xl"
        style={{ width: '100%', height: 'auto' }}
      />
      {caption && (
        <figcaption>{caption}</figcaption>
      )}
    </figure>
  );
}
```

---

## Page Layouts

### Public Site - Article Page

```
DESKTOP (1200px+)
┌────────────────────────────────────────────────────────────────────────┐
│  [Logo]                                            [Courses]  [About]  │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                         │
│  CHAPTER 1   │   ← Back to Foundations of AI                          │
│  ──────────  │                                                         │
│  ○ Intro     │   Artificial Intelligence                              │
│  ● Current   │   Teaching Rocks to Think                              │
│  ○ History   │                                                         │
│  ○ Types     │   12 min read                                          │
│              │                                                         │
│              │   ───────────────────────────────────────────────────   │
│              │                                                         │
│  ON THIS     │   [Article prose content here...]                      │
│  PAGE        │                                                         │
│  ──────────  │   [Large centered image]                               │
│  • Question  │                                                         │
│  • Old Dream │   [More prose...]                                      │
│  • Learning  │                                                         │
│  • Neural    │        ┌─────────────────┐                             │
│  • Deep      │        │ [Medium float   │  [Text wraps around         │
│              │        │  right image]   │   the floating image        │
│              │        └─────────────────┘   on desktop]               │
│              │                                                         │
│              │   [Full-width image spanning wider]                    │
│              │                                                         │
│              │   ───────────────────────────────────────────────────   │
│              │   [← Previous]                        [Next Article →]  │
│              │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘


MOBILE (<768px)
┌─────────────────────────┐
│ [≡]      [Logo]         │
├─────────────────────────┤
│ ← Foundations of AI     │
├─────────────────────────┤
│                         │
│ Artificial              │
│ Intelligence            │
│ Teaching Rocks to Think │
│                         │
│ 12 min read             │
│                         │
│ ─────────────────────── │
│                         │
│ [Article prose...]      │
│                         │
│ ┌─────────────────────┐ │
│ │ [Full width image]  │ │
│ │                     │ │
│ └─────────────────────┘ │
│ Caption text            │
│                         │
│ [More prose...]         │
│                         │
│ ┌─────────────────────┐ │
│ │ [All images become  │ │
│ │  full width on      │ │
│ │  mobile - no float] │ │
│ └─────────────────────┘ │
│                         │
│ ─────────────────────── │
│                         │
│ [← Prev]    [Next →]    │
│                         │
├─────────────────────────┤
│ 📑 Chapter Contents ▼   │
│   (collapsible)         │
└─────────────────────────┘
```

### Admin - Article Editor

```
┌────────────────────────────────────────────────────────────────────────┐
│  [Admin Logo]                                          [👤 Admin] [⚙]  │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                         │
│  📚 Courses  │   Edit Article                          [Save Draft]   │
│  └─ AI/ML    │                                        [Publish ✓]     │
│     └─ Ch.1  │   ─────────────────────────────────────────────────    │
│       └─ ●   │                                                         │
│              │   Title                                                 │
│  📁 Media    │   ┌─────────────────────────────────────────────────┐  │
│              │   │ Artificial Intelligence                         │  │
│  ⚙ Settings │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
│              │   Subtitle                                              │
│              │   ┌─────────────────────────────────────────────────┐  │
│              │   │ Teaching Rocks to Think                         │  │
│              │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
│              │   Content                                               │
│              │   ┌─────────────────────────────────────────────────┐  │
│              │   │ [B] [I] [S] │ H2  H3 │ • ⁃ ❝ ─ │ ↩ ↪          │  │
│              │   ├─────────────────────────────────────────────────┤  │
│              │   │ [🖼 Insert Image]                               │  │
│              │   ├─────────────────────────────────────────────────┤  │
│              │   │                                                 │  │
│              │   │  Here's something strange: you can recognize   │  │
│              │   │  your friend's face in a crowd of thousands... │  │
│              │   │                                                 │  │
│              │   │  ┌───────────────────────────────────────────┐ │  │
│              │   │  │  [IMAGE BLOCK - draggable]                │ │  │
│              │   │  │  moravecs-paradox.png                     │ │  │
│              │   │  │  large · center            [⚙] [🗑]       │ │  │
│              │   │  └───────────────────────────────────────────┘ │  │
│              │   │                                                 │  │
│              │   │  This is called Moravec's Paradox...           │  │
│              │   │                                                 │  │
│              │   └─────────────────────────────────────────────────┘  │
│              │                                                         │
│              │   ─────────────────────────────────────────────────    │
│              │   Est. reading time: 12 min (auto-calculated)          │
│              │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```

---

## API Routes

### Courses API

```ts
// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  published: z.boolean().optional(),
});

// GET all courses
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get('published') === 'true';

  const courses = await db.course.findMany({
    where: publishedOnly ? { published: true } : undefined,
    include: {
      chapters: {
        where: publishedOnly ? { published: true } : undefined,
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { articles: true } },
        },
      },
    },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(courses);
}

// POST create course (admin only)
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validated = courseSchema.parse(body);

  const course = await db.course.create({
    data: validated,
  });

  return NextResponse.json(course);
}
```

### Articles API

```ts
// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.any(), // Tiptap JSON
  chapterId: z.string(),
  estimatedMinutes: z.number().optional(),
  published: z.boolean().optional(),
});

// GET articles for a chapter
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get('chapterId');

  if (!chapterId) {
    return NextResponse.json({ error: 'chapterId required' }, { status: 400 });
  }

  const articles = await db.article.findMany({
    where: { chapterId },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json(articles);
}

// POST create article
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validated = articleSchema.parse(body);

  // Calculate reading time from content
  const wordCount = JSON.stringify(validated.content)
    .replace(/<[^>]*>/g, '')
    .split(/\s+/).length;
  const estimatedMinutes = Math.ceil(wordCount / 200);

  const article = await db.article.create({
    data: {
      ...validated,
      estimatedMinutes,
    },
  });

  return NextResponse.json(article);
}
```

### Image Upload

```ts
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { utapi } from '@/lib/uploadthing';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Uploadthing (or Cloudinary)
  const response = await utapi.uploadFiles(file);

  return NextResponse.json({ url: response.data?.url });
}
```

---

## Build Instructions for Cursor

### Phase 1: Project Setup (Day 1)

```
1. Create Next.js 14 project:
   npx create-next-app@latest course-platform --typescript --tailwind --app --eslint

2. Install core dependencies:
   npm install @prisma/client @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder
   npm install @clerk/nextjs uploadthing @uploadthing/react
   npm install lucide-react framer-motion
   npm install zod react-hook-form @hookform/resolvers
   npm install -D prisma @tailwindcss/typography

3. Initialize Prisma:
   npx prisma init

4. Install shadcn/ui:
   npx shadcn@latest init
   npx shadcn@latest add button card input label select dialog tabs textarea badge separator

5. Set up environment variables (.env.local):
   DATABASE_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
```

### Phase 2: Database & Auth (Day 1-2)

```
1. Copy the Prisma schema from this document
2. Run: npx prisma db push
3. Set up Clerk:
   - Create Clerk application
   - Add middleware.ts for auth
   - Wrap app in ClerkProvider
4. Create lib/db.ts for Prisma client
```

### Phase 3: Design System (Day 2)

```
1. Set up globals.css with CSS variables (colors, typography)
2. Configure Tailwind with custom theme
3. Add fonts (Inter + Fraunces) via next/font/google
4. Create article prose styles
5. Create article image styles (sizes, positions, mobile overrides)
```

### Phase 4: Admin Layout & Navigation (Day 2-3)

```
1. Create app/admin/layout.tsx with sidebar
2. Build AdminSidebar component (collapsible, shows course/chapter tree)
3. Build AdminHeader component
4. Create admin dashboard page (stats, quick links)
5. Add Clerk user button for auth
```

### Phase 5: Admin CRUD Pages (Day 3-4)

```
1. Courses:
   - /admin/courses (list with create button)
   - /admin/courses/new (form)
   - /admin/courses/[id] (edit form)
   
2. Chapters:
   - /admin/courses/[id]/chapters (list)
   - /admin/courses/[id]/chapters/new
   - /admin/courses/[id]/chapters/[chapterId]
   
3. Articles:
   - /admin/courses/[id]/chapters/[chapterId]/articles (list)
   - /admin/courses/[id]/chapters/[chapterId]/articles/new
   - /admin/courses/[id]/chapters/[chapterId]/articles/[articleId] (main editor)
```

### Phase 6: Rich Text Editor (Day 4-5)

```
1. Create TiptapEditor component
2. Build EditorToolbar with formatting buttons
3. Create custom ArticleImage Tiptap extension
4. Build ArticleImageNodeView for in-editor rendering
5. Create ImagePlacer modal:
   - Upload functionality
   - Alt text input
   - Caption input
   - Size selector
   - Position selector
   - Preview
6. Wire up image upload to Uploadthing
7. Test drag-and-drop reordering of images
```

### Phase 7: Public Layout (Day 5-6)

```
1. Create app/(public)/layout.tsx
2. Build Navbar (responsive with mobile menu)
3. Build Footer
4. Create course-specific nested layouts for article sidebar
```

### Phase 8: Public Pages (Day 6-7)

```
1. Homepage:
   - Hero section
   - Featured course card
   - Why learn section
   
2. /courses:
   - Course grid
   
3. /courses/[slug]:
   - Course hero
   - Chapter list with article counts
   
4. /courses/[slug]/[chapter]:
   - Chapter header
   - Article grid
   
5. /courses/[slug]/[chapter]/[article]:
   - Sidebar (chapter navigation)
   - Article header (title, subtitle, reading time)
   - ArticleContent renderer
   - TableOfContents (scroll spy)
   - Previous/Next navigation
```

### Phase 9: Article Content Renderer (Day 7)

```
1. Build ArticleContent component:
   - Parse Tiptap JSON
   - Render articleImage nodes as ArticleImage components
   - Render other nodes as HTML
   
2. Build ArticleImage component:
   - Handle all sizes (small, medium, large, full)
   - Handle positions (center, left float, right float)
   - Mobile override (all full width)
   - Caption styling
```

### Phase 10: Polish & Testing (Day 8)

```
1. Add loading states (skeletons)
2. Add error boundaries
3. Test full flow: create course → chapter → article → add images → publish
4. Test responsive design at all breakpoints
5. Test dark mode if implemented
6. Run Lighthouse audit
7. Fix any accessibility issues
```

---

## Content Workflow Summary

**For Admins:**

1. **Create Course** → Set title, description, icon, color
2. **Add Chapter** → Set title, description, order
3. **Add Article** → Write title, subtitle, then use rich text editor
4. **Write Content** → Use toolbar for formatting (headings, bold, lists, code, etc.)
5. **Add Images** → Click "Insert Image", upload file, set alt/caption/size/position, insert at cursor
6. **Reorder** → Drag images to new positions if needed
7. **Publish** → Toggle publish when ready

**Image Placement:**
- Position cursor where you want image
- Click "Insert Image"
- Upload or select existing
- Choose size: small (300px), medium (500px), large (720px), full (900px)
- Choose position: center, float-left, float-right
- Click "Insert"

Images become draggable blocks you can move anywhere in the content.

---

## Summary

This plan gives you:

| Feature | Description |
|---------|-------------|
| **Public Site** | Stunning, responsive course pages with beautiful typography |
| **Admin CMS** | Full CRUD for courses, chapters, articles |
| **Rich Editor** | Tiptap-based with formatting toolbar |
| **Image System** | Upload + place images with size/position controls |
| **Consistent Formatting** | CSS handles all styling automatically |
| **Mobile Optimized** | Different layouts for mobile vs desktop |
| **Easy Workflow** | Write first, add images later, publish when ready |

Hand this to Cursor and it should be able to build the complete platform.
