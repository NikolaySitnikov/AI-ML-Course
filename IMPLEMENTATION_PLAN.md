# AI ML Course Platform - Implementation Plan

## Overview
A full-stack course platform with:
- **Public Website**: Browse and read course content
- **Admin CMS**: Create/edit courses, chapters, articles with rich text and images

---

## Current Progress Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Project initialization, Git, GitHub |
| Phase 1 | ✅ Complete | Dependencies, shadcn/ui |
| Phase 2 | ✅ Complete | Database schema, Prisma |
| Phase 3 | ✅ Complete | Design system, dark mode |
| Phase 4 | ✅ Complete | Reusable component library |
| Phase 5 | ⏭️ Skipped | Auth (skipped for local dev) |
| Phase 6 | ✅ Complete | Admin layout & dashboard |
| Phase 7 | 🔄 Next | Course CRUD |
| Phase 8 | ⏳ Pending | Chapter CRUD |
| Phase 9 | ⏳ Pending | Article CRUD (basic) |
| Phase 10 | ⏳ Pending | Rich text editor (Tiptap) |
| Phase 11 | ⏳ Pending | Image upload system |
| Phase 12 | ⏳ Pending | Public site layout |
| Phase 13 | ⏳ Pending | Public course pages |
| Phase 14 | ⏳ Pending | Public article pages |
| Phase 15 | ⏳ Pending | Polish & refinement |
| Phase 16 | ⏳ Pending | Deployment |

---

## Phase 0: Project Initialization ✅
**Goal**: Set up the development environment and version control

### Completed:
- [x] Create GitHub repository "AI-ML-Course"
- [x] Initialize git in project directory
- [x] Create initial commit with plan documents
- [x] Push to GitHub
- [x] Run `create-next-app` with TypeScript, Tailwind, App Router
- [x] Verify project runs locally

**Repository**: https://github.com/NikolaySitnikov/AI-ML-Course

---

## Phase 1: Core Dependencies & Configuration ✅
**Goal**: Install all dependencies and configure the project

### Completed:
- [x] Install Prisma v5 and @prisma/client
- [x] Install Tiptap packages (@tiptap/react, @tiptap/pm, @tiptap/starter-kit, etc.)
- [x] Install UI utilities (lucide-react, clsx, tailwind-merge)
- [x] Install form handling (zod, react-hook-form, @hookform/resolvers)
- [x] Initialize shadcn/ui with Tailwind v4
- [x] Install components: button, card, input, label, select, dialog, tabs, textarea, badge, separator, dropdown-menu, avatar, skeleton, sheet, sonner, alert-dialog

### Skipped (for local development):
- [ ] Clerk authentication (will add before deployment)
- [ ] Uploadthing (using local filesystem for now)

---

## Phase 2: Database Schema & Prisma Setup ✅
**Goal**: Set up PostgreSQL database with Prisma ORM

### Completed:
- [x] Initialize Prisma
- [x] Configure DATABASE_URL for local PostgreSQL
- [x] Define Course model with all fields
- [x] Define Chapter model with Course relation
- [x] Define Article model with Chapter relation
- [x] Define ArticleImage model with Article relation
- [x] Add proper indexes and constraints
- [x] Create `lib/db.ts` with singleton pattern
- [x] Run `npx prisma db push`
- [x] Verify database connection with test script

### Database:
- Using local PostgreSQL (user: nikolaysitnikov)
- Database name: course_platform

---

## Phase 3: Design System Foundation ✅
**Goal**: Establish consistent styling, colors, typography, and reusable UI primitives

### Completed:
- [x] Configure custom color palette (primary blue, slate neutrals)
- [x] Set up Playfair Display serif font for headings
- [x] Create CSS variables for light and dark modes
- [x] **Set dark mode as default**
- [x] Create typography classes (.text-display, .text-h1, .text-h2, .text-h3)
- [x] Create article prose styles (.prose-article)
- [x] Create article image styles (size-small, size-medium, size-large, size-full)
- [x] Create position classes (position-center, position-left, position-right)
- [x] Add mobile responsive overrides
- [x] Add Tiptap editor styles

---

## Phase 4: Reusable Component Library ✅
**Goal**: Build foundational components that will be used throughout the app

### Completed Components:
- [x] `PageHeader` - Title, description, breadcrumbs, actions
- [x] `EmptyState` - Empty content placeholder with icon
- [x] `LoadingSpinner` / `LoadingPage` - Loading indicators
- [x] `ConfirmDialog` - Confirmation modal for destructive actions
- [x] `StatusBadge` - Published/Draft status indicator
- [x] `FormField` / `FormTextarea` - Form inputs with labels and errors
- [x] `SlugInput` - Auto-generating slug from title
- [x] `BackLink` - Consistent back navigation

---

## Phase 5: Authentication ⏭️ SKIPPED
**Reason**: Skipped for local development. Will add Clerk or NextAuth before deployment.

---

## Phase 6: Admin Layout & Dashboard ✅
**Goal**: Build the admin interface structure

### Completed:
- [x] Create `app/admin/layout.tsx` with sidebar + main content
- [x] Build `AdminSidebar` with navigation links
- [x] Build `AdminHeader` with mobile menu and user dropdown
- [x] Create admin dashboard page with stats cards
- [x] Add recent courses list
- [x] Homepage redirects to /admin
- [x] Responsive design (mobile menu sheet)

---

## Phase 7: Course CRUD Operations 🔄 NEXT
**Goal**: Implement full course management in admin

### To Do:
- [ ] Create Course API routes (GET, POST, PATCH, DELETE)
- [ ] Build course list page at `/admin/courses`
- [ ] Build course form component
- [ ] Create new course page at `/admin/courses/new`
- [ ] Create edit course page at `/admin/courses/[courseId]`
- [ ] Add Zod validation schemas
- [ ] Test full CRUD flow

---

## Phase 8: Chapter CRUD Operations
**Goal**: Implement chapter management nested under courses

### To Do:
- [ ] Create Chapter API routes
- [ ] Build chapter list page
- [ ] Build chapter form component
- [ ] Create/edit chapter pages
- [ ] Implement drag-and-drop reordering

---

## Phase 9: Article CRUD Operations (Basic)
**Goal**: Implement article management without rich text editor

### To Do:
- [ ] Create Article API routes
- [ ] Build article list page
- [ ] Build basic article form
- [ ] Create/edit article pages

---

## Phase 10: Rich Text Editor (Tiptap)
**Goal**: Implement the Tiptap editor with formatting toolbar

### To Do:
- [ ] Create base TiptapEditor component
- [ ] Build EditorToolbar with formatting buttons
- [ ] Create custom ArticleImage extension
- [ ] Build ArticleImageNodeView
- [ ] Integrate editor into article form

---

## Phase 11: Image Upload System
**Goal**: Implement image upload and placement within articles

### To Do:
- [ ] Set up local file storage (dev) or Cloudinary (prod)
- [ ] Create upload API route
- [ ] Build ImageUploader component
- [ ] Build ImagePlacer modal
- [ ] Integrate with editor

---

## Phase 12-14: Public Site
**Goal**: Build the public-facing website

### To Do:
- [ ] Public layout with navbar/footer
- [ ] Homepage
- [ ] Course list page
- [ ] Course detail page
- [ ] Article page with content renderer
- [ ] Table of contents
- [ ] Previous/Next navigation

---

## Phase 15-16: Polish & Deployment
**Goal**: Final touches and go live

### To Do:
- [ ] Loading states
- [ ] Error handling
- [ ] SEO metadata
- [ ] Add authentication
- [ ] Set up production database
- [ ] Deploy to Vercel

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (local) |
| ORM | Prisma v5 |
| Auth | Skipped for now |
| Rich Text | Tiptap |
| Image Storage | Local (Cloudinary for prod) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Theme | Dark mode default |

---

## File Structure (Current)

```
course-platform/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx      ✅
│   │   │   └── page.tsx        ✅ (dashboard)
│   │   ├── globals.css         ✅
│   │   ├── layout.tsx          ✅
│   │   └── page.tsx            ✅ (redirects to admin)
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-header.tsx    ✅
│   │   │   ├── admin-sidebar.tsx   ✅
│   │   │   └── index.ts            ✅
│   │   ├── shared/
│   │   │   ├── back-link.tsx       ✅
│   │   │   ├── confirm-dialog.tsx  ✅
│   │   │   ├── empty-state.tsx     ✅
│   │   │   ├── form-field.tsx      ✅
│   │   │   ├── loading-spinner.tsx ✅
│   │   │   ├── page-header.tsx     ✅
│   │   │   ├── slug-input.tsx      ✅
│   │   │   ├── status-badge.tsx    ✅
│   │   │   └── index.ts            ✅
│   │   └── ui/                     ✅ (shadcn components)
│   └── lib/
│       ├── db.ts               ✅
│       └── utils.ts            ✅
├── prisma/
│   └── schema.prisma           ✅
├── docker-compose.yml          ✅ (optional)
├── .env                        ✅
├── .env.local                  ✅
└── package.json                ✅
```

---

## Git Commits History

1. `Initial commit: Project planning documents`
2. `Set up Next.js project with core dependencies`
3. `Add design system and reusable component library`
4. `Add admin layout and dashboard with dark mode`
