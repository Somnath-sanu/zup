# ZUP

ZUP is an AI-powered platform for building web apps and UIs by chatting with an intelligent agent. Users can describe what they want to build, and ZUP generates production-quality code, previews, and a file explorer for the generated project—all in a modern, collaborative interface.

## 🚀 Overview

- **Describe your idea, get code:** Chat with AI to generate full-stack web apps, dashboards, and UI clones (e.g., Netflix, Kanban, Admin dashboards, etc.).
- **Live Preview & Code Explorer:** Instantly preview generated apps and browse/edit the code in a file explorer.
- **Project Management:** Organize, revisit, and iterate on your projects.
- **Authentication:** Secure user authentication and project isolation.

## ✨ Features

- Chat-based project creation (describe what you want to build)
- AI-powered code generation using Google Gemini and E2B sandboxes
- Live preview and code explorer for generated projects
- Project templates (Netflix, Kanban, Admin dashboard, File Manager, YouTube, Store, Airbnb, Spotify, etc.)
- User authentication and access control (Clerk)
- Modern, responsive UI with dark mode
- Modular, scalable codebase with best practices

## 🛠️ Tech Stack

**Frontend:**

- [Next.js 15](https://nextjs.org/) (App Router, SSR, API routes)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/) (utility-first styling)
- [Shadcn/UI](https://ui.shadcn.com/) (Radix UI primitives, custom components)
- [Lucide React](https://lucide.dev/) (icon library)
- [React Hook Form](https://react-hook-form.com/) (forms & validation)
- [React Query](https://tanstack.com/query/latest) (data fetching & caching)
- [Next Themes](https://github.com/pacocoursey/next-themes) (dark mode)

**Backend & Infra:**

- [tRPC](https://trpc.io/) (end-to-end typesafe APIs)
- [Prisma ORM](https://www.prisma.io/) (PostgreSQL database)
- [Inngest](https://www.inngest.com/) (event-driven serverless functions)
- [E2B Code Interpreter](https://e2b.dev/) (sandboxed code execution)
- [Google Gemini](https://ai.google.dev/gemini-api/docs) (AI model for code generation)
- [Clerk](https://clerk.com/) (authentication & user management)

**DevOps & Tooling:**

- [Vercel](https://vercel.com/) (deployment, preview URLs)
- [Docker](https://www.docker.com/) (sandbox environments)
- [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/), [PostCSS](https://postcss.org/)

## 🏗️ Architecture

- **Monolithic Next.js app** with modular feature folders (home, projects, messages, etc.)
- **AI agent** (Gemini + E2B) runs in a sandbox, receives user prompts, generates code, and returns file trees and live previews
- **tRPC** for typesafe API communication between frontend and backend
- **Prisma ORM** for database access (PostgreSQL)
- **Inngest** for background jobs and event-driven workflows
- **Clerk** for authentication and user session management
- **Shadcn/UI** and **Tailwind CSS** for consistent, accessible UI

## 🧑‍💻 Getting Started

### 🐳 Quick Start with Docker Compose (Recommended)

The easiest way to run ZUP is with Docker Compose. All services (PostgreSQL, Inngest, and the app) will start automatically, and database migrations run on startup.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/zup.git
   cd zup
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your API keys:

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from [Clerk](https://dashboard.clerk.com)
   - `E2B_API_KEY` from [E2B](https://e2b.dev/docs)
   - `GOOGLE_GENERATIVE_AI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `FIRECRAWL_API_KEY` from [Firecrawl](https://www.firecrawl.dev)

3. **Start all services:**

   ```bash
   docker compose up
   ```

   That's it! 🎉 The app will be available at [http://localhost:3000](http://localhost:3000)

   **What happens automatically:**

   - PostgreSQL database starts on port 5432
   - Inngest dev server starts on port 8288
   - Prisma migrations run automatically
   - Next.js app starts on port 3000

4. **Stop services:**
   ```bash
   docker compose down
   ```

### 💻 Local Development (Alternative)

If you prefer to run the app locally without Docker:

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up PostgreSQL:**

   - Install and run PostgreSQL locally
   - Update `DATABASE_URL` in `.env` to point to your local database

3. **Run database migrations:**

   ```bash
   npx prisma migrate deploy
   ```

4. **Run Inngest:**

   ```bash
   inngest-cli dev
   ```   

5. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**
