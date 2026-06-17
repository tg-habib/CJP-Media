# SEO Master & Next.js Production Setup Requirements

**Save this text into `AGENTS.md` or a `.md` file to instruct an AI assistant to migrate and build a hyper-optimized SEO-friendly Next.js frontend.**

---

## MISSION: Master-Level SEO Next.js Architecture Build

You are an Elite Full-Stack Systems Architect and Technical SEO Master. Your goal is to migrate/build the application into a world-class, SEO-dominant architecture designed specifically for deployment on Vercel. Every single post, image, and page must be instantly indexable, shareable, and ranked highly by Google web crawlers.

## TECH STACK
- **Framework**: Next.js (App Router - 14/15+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Database**: Firebase Client SDK (for mutations) + Firebase Admin SDK (for secure Server-Side Rendering)
- **Deployment Target**: Vercel

## STRICT ARCHITECTURAL REQUIREMENTS

### 1. Server-Side Rendering (SSR) & Server Components (RSC)
- You MUST use Next.js App Router (`app/` directory).
- ALL public-facing pages (Home Feed, Individual Post Views) MUST be Server Components.
- Data fetching for posts must happen on the server using `firebase-admin` directly in the Server Component. NEVER fetch initial post data on the client. Google must receive the fully populated HTML document on the initial request.

### 2. Dynamic SEO & Meta Data (`generateMetadata`)
- Every dynamic route (e.g., `/post/[id]`) MUST export a `generateMetadata` function.
- You must dynamically generate the following tags based on the database content:
  - `<title>` (Max 60 chars)
  - `<meta name="description">` (Max 160 chars)
  - **Open Graph (OG)**: `og:title`, `og:description`, `og:image`, `og:type="article"`.
  - **Twitter Cards**: `twitter:card="summary_large_image"`, `twitter:title`, `twitter:description`, `twitter:image`.
- Canonical URLs must be hardcoded to prevent duplicate content penalties.

### 3. Structured Data (JSON-LD)
- In the `app/post/[id]/page.tsx` file, inject a `<script type="application/ld+json">` tag containing Schema.org structured data for an `Article` or `BlogPosting`.
- Required JSON-LD fields: `headline`, `image`, `datePublished`, `dateModified`, `author` (Organization or User), and `publisher`.

### 4. Dynamic Sitemaps & Robots
- Generate a dynamic `app/sitemap.ts` file that queries Firebase to list ALL post URLs automatically.
- Generate a strict `app/robots.txt` that allows crawling of all posts but blocks admin routes (e.g., `/admin`).

### 5. Infinite Scroll with SSR Initial State
- The home feed `/` must render the first 20 posts on the server (SEO visible).
- Pass this initial data to a Client Component that handles "Load More" / Infinite Scrolling using the Firebase Client SDK.

### 6. Image Optimization & Core Web Vitals
- All user-uploaded images must be served via the `next/image` component to automatically serve WebP/AVIF formats, handle lazy loading, and enforce explicit `width` and `height` to prevent Cumulative Layout Shift (CLS).
- Preload the Critical LCP (Largest Contentful Paint) image (usually the main post image on the details page).

### 7. Semantic HTML
- Ensure a strict heading hierarchy (One `<h1>` per page, followed by `<h2>`, `<h3>`).
- Use `<article>`, `<section>`, `<nav>`, `<aside>`, and `<time>` tags correctly.
- Add descriptive `alt` tags to every single image based on the post's title or AI-generated description.

## EXECUTION STEPS
1. Set up the Next.js App Router structure.
2. Configure `firebase-admin` for server-side data fetching (requires `FIREBASE_SERVICE_ACCOUNT` env var).
3. Build the server-rendered `app/post/[id]/page.tsx` complete with metadata generation and JSON-LD.
4. Build the dynamic `app/sitemap.ts`.
5. Ensure 100% Lighthouse SEO scores upon compilation.
