# AI ML Course Platform - Implementation Plan

## Overview
A full-stack course platform with:
- **Public Website**: Browse and read course content
- **Admin CMS**: Create/edit courses, chapters, articles with rich text and images

---

## Phase 0: Project Initialization
**Goal**: Set up the development environment and version control

### Step 0.1: Initialize Git & GitHub
- [x] Create GitHub repository "AI-ML-Course"
- [ ] Initialize git in project directory
- [ ] Create initial commit with plan documents
- [ ] Push to GitHub

### Step 0.2: Create Next.js Project
- [ ] Run `create-next-app` with TypeScript, Tailwind, App Router
- [ ] Verify project runs locally
- [ ] Commit and push

**Testing**:
- Run `npm run dev` and verify default page loads at localhost:3000

---

## Phase 1: Core Dependencies & Configuration
**Goal**: Install all dependencies and configure the project

### Step 1.1: Install Core Dependencies
- [ ] Install Prisma and @prisma/client
- [ ] Install Tiptap packages (@tiptap/react, @tiptap/pm, @tiptap/starter-kit, etc.)
- [ ] Install Clerk authentication (@clerk/nextjs)
- [ ] Install Uploadthing (@uploadthing/react, uploadthing)
- [ ] Install UI utilities (lucide-react, framer-motion)
- [ ] Install form handling (zod, react-hook-form, @hookform/resolvers)
- [ ] Install dev dependencies (prisma, @tailwindcss/typography)

### Step 1.2: Initialize shadcn/ui
- [ ] Run shadcn init with proper configuration
- [ ] Install required components: button, card, input, label, select, dialog, tabs, textarea, badge, separator, dropdown-menu, avatar, skeleton, toast

### Step 1.3: Configure Environment Variables
- [ ] Create .env.local template
- [ ] Create .env.example for documentation
- [ ] Add .env.local to .gitignore (should already be there)

**Testing**:
- Verify all packages install without errors
- Run `npm run dev` and confirm no import errors

---

## Phase 2: Database Schema & Prisma Setup
**Goal**: Set up PostgreSQL database with Prisma ORM

### Step 2.1: Initialize Prisma
- [ ] Run `npx prisma init`
- [ ] Configure DATABASE_URL for PostgreSQL

### Step 2.2: Create Database Schema
- [ ] Define Course model
- [ ] Define Chapter model with Course relation
- [ ] Define Article model with Chapter relation
- [ ] Define ArticleImage model with Article relation
- [ ] Add proper indexes and constraints

### Step 2.3: Create Prisma Client Helper
- [ ] Create `lib/db.ts` with singleton pattern for Prisma client
- [ ] Export db instance for use across the app

### Step 2.4: Run Initial Migration
- [ ] Run `npx prisma db push` or `npx prisma migrate dev`
- [ ] Verify schema in database

**Testing**:
- Write a simple test script to create/read a course
- Verify database connection works

---

## Phase 3: Design System Foundation
**Goal**: Establish consistent styling, colors, typography, and reusable UI primitives

### Step 3.1: Configure Tailwind Theme
- [ ] Add custom colors (primary, slate, accent, semantic)
- [ ] Configure font families (Inter for body, serif for headings)
- [ ] Add custom spacing and sizing values

### Step 3.2: Set Up Global Styles
- [ ] Create CSS variables for colors, surfaces, text
- [ ] Add dark mode CSS variables
- [ ] Create typography utility classes (.text-display, .text-h1, .text-h2, .text-h3)

### Step 3.3: Create Article Prose Styles
- [ ] Style .prose-article for body text
- [ ] Style headings (h2, h3) within articles
- [ ] Style code blocks, blockquotes, lists
- [ ] Style horizontal rules

### Step 3.4: Create Article Image Styles
- [ ] Size classes (size-small, size-medium, size-large, size-full)
- [ ] Position classes (position-center, position-left, position-right)
- [ ] Mobile responsive overrides (all images full-width)
- [ ] Caption styling

### Step 3.5: Configure Fonts
- [ ] Set up next/font/google for Inter
- [ ] Set up next/font/google for serif font (Fraunces or Playfair Display)
- [ ] Apply fonts to layout

**Testing**:
- Create a test page showing all typography variants
- Create a test page showing image size/position combinations
- Verify dark mode toggle works (if implementing)

---

## Phase 4: Reusable Component Library
**Goal**: Build foundational components that will be used throughout the app

### Step 4.1: Create Layout Components
- [ ] `Container` - Responsive max-width container
- [ ] `PageHeader` - Consistent page headers with title, subtitle, breadcrumbs
- [ ] `Section` - Consistent section spacing

### Step 4.2: Create Form Components
- [ ] `FormField` - Label + input wrapper with error handling
- [ ] `FormTextarea` - Textarea with character count
- [ ] `FormSelect` - Select with proper styling
- [ ] `SlugInput` - Auto-generates slug from title

### Step 4.3: Create Feedback Components
- [ ] `LoadingSpinner` - Simple spinner
- [ ] `Skeleton` variants - Card skeleton, text skeleton, image skeleton
- [ ] `EmptyState` - When no items exist
- [ ] `ErrorState` - When something goes wrong

### Step 4.4: Create Interactive Components
- [ ] `ConfirmDialog` - Confirmation before destructive actions
- [ ] `PublishToggle` - Toggle with status indicator
- [ ] `StatusBadge` - Published/Draft badge
- [ ] `OrderableList` - Drag-and-drop reorderable list

### Step 4.5: Create Navigation Components
- [ ] `Breadcrumbs` - Navigation breadcrumb trail
- [ ] `BackLink` - Consistent back navigation

**Testing**:
- Create a component showcase page at /components-demo
- Verify each component renders correctly
- Test interactive states (hover, focus, disabled)

---

## Phase 5: Authentication with Clerk
**Goal**: Set up admin authentication

### Step 5.1: Configure Clerk
- [ ] Create Clerk application (or use existing)
- [ ] Add Clerk environment variables
- [ ] Create `middleware.ts` for route protection

### Step 5.2: Set Up ClerkProvider
- [ ] Wrap app in ClerkProvider
- [ ] Configure public routes vs protected routes

### Step 5.3: Create Auth Components
- [ ] Add sign-in page at /sign-in
- [ ] Add sign-up page at /sign-up (if needed)
- [ ] Integrate UserButton in admin header

### Step 5.4: Protect Admin Routes
- [ ] Ensure /admin/* routes require authentication
- [ ] Test redirect to sign-in for unauthenticated users

**Testing**:
- Verify unauthenticated users redirected from /admin
- Verify authenticated users can access /admin
- Verify sign-in/sign-out flow works

---

## Phase 6: Admin Layout & Dashboard
**Goal**: Build the admin interface structure

### Step 6.1: Create Admin Layout
- [ ] Create `app/admin/layout.tsx`
- [ ] Implement sidebar + main content structure
- [ ] Add responsive behavior (collapsible sidebar on mobile)

### Step 6.2: Build AdminSidebar Component
- [ ] Logo/brand section
- [ ] Navigation links (Dashboard, Courses, Media, Settings)
- [ ] Course/chapter tree navigation
- [ ] Active state indicators
- [ ] Collapse/expand functionality

### Step 6.3: Build AdminHeader Component
- [ ] Page title display
- [ ] User menu with Clerk UserButton
- [ ] Optional: quick actions

### Step 6.4: Create Admin Dashboard Page
- [ ] Quick stats (total courses, chapters, articles)
- [ ] Recent activity or recently edited items
- [ ] Quick action buttons (Create Course, etc.)

**Testing**:
- Navigate through admin layout
- Test sidebar collapse on mobile
- Verify all navigation links work

---

## Phase 7: Course CRUD Operations
**Goal**: Implement full course management in admin

### Step 7.1: Create Course API Routes
- [ ] `GET /api/courses` - List all courses
- [ ] `POST /api/courses` - Create course
- [ ] `GET /api/courses/[id]` - Get single course
- [ ] `PATCH /api/courses/[id]` - Update course
- [ ] `DELETE /api/courses/[id]` - Delete course
- [ ] Add Zod validation schemas

### Step 7.2: Build Course List Page
- [ ] Create `/admin/courses/page.tsx`
- [ ] Display courses in a table or card grid
- [ ] Show title, status, chapter count, actions
- [ ] Add "Create Course" button
- [ ] Implement delete with confirmation

### Step 7.3: Build Course Form Component
- [ ] Title input
- [ ] Slug input (auto-generated)
- [ ] Short description textarea
- [ ] Long description textarea (optional)
- [ ] Icon picker (emoji)
- [ ] Color picker
- [ ] Cover image upload
- [ ] Publish toggle
- [ ] Order input

### Step 7.4: Create Course Page
- [ ] Create `/admin/courses/new/page.tsx`
- [ ] Use CourseForm component
- [ ] Handle form submission
- [ ] Redirect to edit page on success

### Step 7.5: Edit Course Page
- [ ] Create `/admin/courses/[courseId]/page.tsx`
- [ ] Load existing course data
- [ ] Use CourseForm component with initial values
- [ ] Handle updates
- [ ] Show success/error feedback

**Testing**:
- Create a new course and verify in database
- Edit course and verify changes persist
- Delete course and verify removal
- Test validation (required fields, unique slug)

---

## Phase 8: Chapter CRUD Operations
**Goal**: Implement chapter management nested under courses

### Step 8.1: Create Chapter API Routes
- [ ] `GET /api/chapters?courseId=xxx` - List chapters for course
- [ ] `POST /api/chapters` - Create chapter
- [ ] `GET /api/chapters/[id]` - Get single chapter
- [ ] `PATCH /api/chapters/[id]` - Update chapter
- [ ] `DELETE /api/chapters/[id]` - Delete chapter
- [ ] `PATCH /api/chapters/reorder` - Reorder chapters

### Step 8.2: Build Chapter List Page
- [ ] Create `/admin/courses/[courseId]/chapters/page.tsx`
- [ ] Display chapters in orderable list
- [ ] Show title, status, article count
- [ ] Add "Create Chapter" button
- [ ] Implement drag-and-drop reordering

### Step 8.3: Build Chapter Form Component
- [ ] Title input
- [ ] Slug input (auto-generated)
- [ ] Description textarea
- [ ] Publish toggle
- [ ] Order input (or use drag-and-drop)

### Step 8.4: Create/Edit Chapter Pages
- [ ] Create `/admin/courses/[courseId]/chapters/new/page.tsx`
- [ ] Create `/admin/courses/[courseId]/chapters/[chapterId]/page.tsx`
- [ ] Handle create/update operations
- [ ] Navigation back to chapter list

**Testing**:
- Create chapters within a course
- Verify chapters appear in correct order
- Test reordering functionality
- Delete chapter and verify articles cascade deleted

---

## Phase 9: Article CRUD Operations (Basic)
**Goal**: Implement article management without rich text editor

### Step 9.1: Create Article API Routes
- [ ] `GET /api/articles?chapterId=xxx` - List articles for chapter
- [ ] `POST /api/articles` - Create article
- [ ] `GET /api/articles/[id]` - Get single article
- [ ] `PATCH /api/articles/[id]` - Update article
- [ ] `DELETE /api/articles/[id]` - Delete article
- [ ] `PATCH /api/articles/reorder` - Reorder articles

### Step 9.2: Build Article List Page
- [ ] Create `/admin/courses/[courseId]/chapters/[chapterId]/articles/page.tsx`
- [ ] Display articles in orderable list
- [ ] Show title, status, reading time
- [ ] Add "Create Article" button

### Step 9.3: Build Basic Article Form
- [ ] Title input
- [ ] Slug input (auto-generated)
- [ ] Subtitle input
- [ ] Short description textarea
- [ ] Placeholder for content editor (Phase 10)
- [ ] Publish toggle

### Step 9.4: Create/Edit Article Pages
- [ ] Create new article page
- [ ] Create edit article page
- [ ] Basic form without rich text for now

**Testing**:
- Create articles within a chapter
- Edit basic article metadata
- Delete articles
- Verify article order persists

---

## Phase 10: Rich Text Editor (Tiptap)
**Goal**: Implement the Tiptap editor with formatting toolbar

### Step 10.1: Create Base Tiptap Editor
- [ ] Create `components/admin/Editor/TiptapEditor.tsx`
- [ ] Configure StarterKit extension
- [ ] Configure Placeholder extension
- [ ] Style editor container
- [ ] Handle content change callbacks

### Step 10.2: Build Editor Toolbar
- [ ] Create `EditorToolbar.tsx`
- [ ] Text formatting: Bold, Italic, Strikethrough, Code
- [ ] Headings: H2, H3
- [ ] Lists: Bullet, Ordered
- [ ] Block elements: Blockquote, Horizontal Rule
- [ ] History: Undo, Redo
- [ ] Active state indicators

### Step 10.3: Create Custom Article Image Extension
- [ ] Create `extensions/ArticleImage.ts` Tiptap extension
- [ ] Define attributes: url, alt, caption, size, position
- [ ] Configure as block, atom, draggable

### Step 10.4: Build Article Image Node View
- [ ] Create `ArticleImageNodeView.tsx`
- [ ] Render image with size/position classes
- [ ] Add drag handle
- [ ] Add delete button
- [ ] Add size/position badge
- [ ] Handle selection state

### Step 10.5: Integrate Editor into Article Form
- [ ] Replace placeholder with TiptapEditor
- [ ] Save content as JSON
- [ ] Load existing content for editing
- [ ] Auto-calculate reading time from content

**Testing**:
- Type and format text in editor
- Test all toolbar buttons
- Verify content saves as JSON
- Verify content loads correctly when editing

---

## Phase 11: Image Upload System
**Goal**: Implement image upload and placement within articles

### Step 11.1: Configure Uploadthing
- [ ] Set up Uploadthing account/API keys
- [ ] Create `lib/uploadthing.ts` configuration
- [ ] Create file router for image uploads

### Step 11.2: Create Upload API Route
- [ ] Create `/api/uploadthing/route.ts`
- [ ] Handle file uploads
- [ ] Return uploaded image URLs

### Step 11.3: Build Image Uploader Component
- [ ] Create `ImageUploader.tsx`
- [ ] Drag-and-drop upload zone
- [ ] Upload progress indicator
- [ ] Preview uploaded image
- [ ] Error handling

### Step 11.4: Build Image Placer Modal
- [ ] Create `ImagePlacer.tsx`
- [ ] Image upload or URL input
- [ ] Alt text input (required)
- [ ] Caption input (optional)
- [ ] Size selector (small, medium, large, full)
- [ ] Position selector (center, left, right)
- [ ] Preview panel
- [ ] Insert button

### Step 11.5: Integrate with Editor
- [ ] Add "Insert Image" button to editor
- [ ] Open ImagePlacer modal
- [ ] Insert articleImage node at cursor position
- [ ] Verify images render in editor

**Testing**:
- Upload an image and verify it appears in content
- Test all size/position combinations in editor
- Verify images persist after saving
- Test error handling for failed uploads

---

## Phase 12: Public Site Layout
**Goal**: Build the public website structure

### Step 12.1: Create Public Layout
- [ ] Create `app/(public)/layout.tsx`
- [ ] Set up responsive container
- [ ] Configure metadata

### Step 12.2: Build Public Navbar
- [ ] Create `components/public/Navbar.tsx`
- [ ] Logo/brand
- [ ] Navigation links (Courses, About)
- [ ] Mobile menu (hamburger)
- [ ] Responsive behavior

### Step 12.3: Build Footer
- [ ] Create `components/public/Footer.tsx`
- [ ] Copyright
- [ ] Links
- [ ] Simple, clean design

### Step 12.4: Create Course-Specific Layout
- [ ] Nested layout for article pages
- [ ] Sidebar for chapter/article navigation
- [ ] Responsive (sidebar becomes bottom sheet on mobile)

**Testing**:
- Navigate public site structure
- Test responsive navbar/footer
- Verify layouts render correctly on mobile

---

## Phase 13: Public Course Pages
**Goal**: Build the course browsing experience

### Step 13.1: Build Course Card Component
- [ ] Create `CourseCard.tsx`
- [ ] Icon/image display
- [ ] Title and description
- [ ] Chapter/article counts
- [ ] Hover state
- [ ] Link to course page

### Step 13.2: Create Homepage
- [ ] Create `app/(public)/page.tsx`
- [ ] Hero section with main heading
- [ ] Featured course(s)
- [ ] Why learn section
- [ ] Call to action

### Step 13.3: Create Courses List Page
- [ ] Create `app/(public)/courses/page.tsx`
- [ ] Grid of CourseCards
- [ ] Filter/search (optional for MVP)
- [ ] Empty state if no courses

### Step 13.4: Create Course Detail Page
- [ ] Create `app/(public)/courses/[courseSlug]/page.tsx`
- [ ] Course hero with title, description, icon
- [ ] Chapter list with article counts
- [ ] Start learning CTA

### Step 13.5: Build Chapter Card Component
- [ ] Create `ChapterCard.tsx`
- [ ] Title and description
- [ ] Article count
- [ ] Progress indicator (future feature)

**Testing**:
- View courses page with test data
- Click through to course detail
- Verify chapter list displays correctly
- Test empty states

---

## Phase 14: Public Article Pages
**Goal**: Build the article reading experience

### Step 14.1: Build Article Sidebar
- [ ] Create `ArticleSidebar.tsx`
- [ ] Chapter navigation tree
- [ ] Article list with current highlight
- [ ] Progress indicators (optional)
- [ ] Collapsible on mobile

### Step 14.2: Build Article Header
- [ ] Title and subtitle
- [ ] Reading time
- [ ] Breadcrumb navigation
- [ ] Back link to chapter/course

### Step 14.3: Build Article Content Renderer
- [ ] Create `ArticleContent.tsx`
- [ ] Parse Tiptap JSON content
- [ ] Render articleImage nodes specially
- [ ] Render other nodes via Tiptap HTML generation
- [ ] Apply prose styles

### Step 14.4: Build Article Image Component
- [ ] Create `ArticleImage.tsx` for public rendering
- [ ] Handle all size variants
- [ ] Handle all position variants
- [ ] Mobile override (full width)
- [ ] Caption rendering
- [ ] Use Next.js Image component

### Step 14.5: Build Table of Contents
- [ ] Create `TableOfContents.tsx`
- [ ] Extract headings from content
- [ ] Scroll spy to highlight current section
- [ ] Smooth scroll on click

### Step 14.6: Build Article Navigation
- [ ] Create `ArticleNavigation.tsx`
- [ ] Previous article link
- [ ] Next article link
- [ ] Handle first/last articles

### Step 14.7: Create Article Page
- [ ] Create `app/(public)/courses/[courseSlug]/[chapterSlug]/[articleSlug]/page.tsx`
- [ ] Fetch article data
- [ ] Render with all components
- [ ] SEO metadata

**Testing**:
- Navigate full article flow
- Test image rendering at all sizes
- Test table of contents scroll spy
- Test prev/next navigation
- Verify mobile layout

---

## Phase 15: Polish & Refinement
**Goal**: Add finishing touches and improve UX

### Step 15.1: Loading States
- [ ] Add loading.tsx files for each route group
- [ ] Create skeleton loaders for cards
- [ ] Add loading states to forms

### Step 15.2: Error Handling
- [ ] Add error.tsx files for each route group
- [ ] Create user-friendly error messages
- [ ] Handle API errors gracefully

### Step 15.3: Toast Notifications
- [ ] Implement toast system
- [ ] Add success toasts for CRUD operations
- [ ] Add error toasts for failures

### Step 15.4: SEO & Metadata
- [ ] Add metadata to all public pages
- [ ] Create OpenGraph images (optional)
- [ ] Add sitemap (optional)

### Step 15.5: Performance Optimization
- [ ] Verify images use Next.js Image
- [ ] Add proper caching headers
- [ ] Optimize database queries
- [ ] Run Lighthouse audit

### Step 15.6: Accessibility Audit
- [ ] Verify keyboard navigation
- [ ] Check color contrast
- [ ] Add ARIA labels where needed
- [ ] Test with screen reader (optional)

**Testing**:
- Full end-to-end flow testing
- Lighthouse score check
- Mobile device testing
- Cross-browser testing

---

## Phase 16: Deployment
**Goal**: Deploy the application to production

### Step 16.1: Database Setup
- [ ] Set up production PostgreSQL (Supabase/PlanetScale/Neon)
- [ ] Run migrations on production database

### Step 16.2: Configure Production Environment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Set up Clerk for production
- [ ] Configure Uploadthing for production

### Step 16.3: Deploy
- [ ] Connect GitHub repo to Vercel
- [ ] Deploy to production
- [ ] Verify all features work

### Step 16.4: Post-Deployment
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)
- [ ] Create initial content

---

## Testing Strategy

### Unit Testing
- Test utility functions
- Test Zod validation schemas
- Test component rendering

### Integration Testing
- Test API routes with database
- Test form submissions
- Test authentication flows

### E2E Testing (Manual for MVP)
- Create course → chapter → article flow
- Add images to article
- Publish and view on public site
- Mobile responsiveness

### Browser Testing Checkpoints
After each major phase, we pause for manual browser testing to verify:
1. All new UI renders correctly
2. All forms function properly
3. Data persists correctly
4. No console errors
5. Mobile layout works

---

## Pause Points for User Testing

The following points require user testing before proceeding:

1. **After Phase 0**: Project initialized, can we proceed?
2. **After Phase 3**: Design system looks good?
3. **After Phase 6**: Admin layout acceptable?
4. **After Phase 7**: Course CRUD working?
5. **After Phase 9**: Article management (basic) working?
6. **After Phase 11**: Image upload and placement working?
7. **After Phase 14**: Full public site working?
8. **After Phase 15**: Ready for deployment?

---

## File Structure Summary

```
course-platform/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [courseSlug]/
│   │   │       ├── page.tsx
│   │   │       └── [chapterSlug]/
│   │   │           └── [articleSlug]/
│   │   │               └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── courses/
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [courseId]/
│   │           ├── page.tsx
│   │           └── chapters/
│   │               ├── page.tsx
│   │               ├── new/
│   │               └── [chapterId]/
│   │                   ├── page.tsx
│   │                   └── articles/
│   │                       ├── page.tsx
│   │                       ├── new/
│   │                       └── [articleId]/
│   ├── api/
│   │   ├── courses/
│   │   ├── chapters/
│   │   ├── articles/
│   │   └── uploadthing/
│   ├── sign-in/
│   └── sign-up/
├── components/
│   ├── ui/ (shadcn)
│   ├── shared/
│   ├── public/
│   └── admin/
├── lib/
│   ├── db.ts
│   ├── utils.ts
│   └── validations.ts
├── prisma/
│   └── schema.prisma
└── styles/
    └── globals.css
```

---

## Ready to Begin!

This plan is designed for iterative development with TDD and frequent testing. Each phase builds on the previous, and we pause at key points for your review.

**Shall I begin with Phase 0: Project Initialization?**
