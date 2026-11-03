# LearnSphere — Full-Stack Learning Management System (LMS)

LearnSphere is a production-grade, enterprise-ready Learning Management System built from the ground up as a modern monorepo containing a **NestJS REST API Backend** and a **Next.js 16 App Router Frontend**.

---

## 🏗️ Repository Architecture

```text
lms/
├── .agents/
│   ├── Handoff.md              # Backend curriculum, architecture & session handoff
│   └── Frontend-Handoff.md     # Frontend technical specifications & state architecture
├── lms-backend/                # NestJS 12 REST API Server (Port 5000)
│   ├── src/
│   │   ├── auth/           # JWT auth, Passport strategy, student registration
│   │   ├── users/          # User profiles, roles (student/instructor/admin), bcrypt
│   │   ├── categories/     # Course categories and taxonomy
│   │   ├── courses/        # Course authoring, ownership isolation & statuses
│   │   ├── lessons/        # Curriculum sequencing, video lectures, markdown notes
│   │   ├── enrollments/    # Course enrollment & student roster (email masking)
│   │   ├── progress/       # Lesson completion & course percentage tracking
│   │   ├── reviews/        # Enrolled student reviews & aggregation analytics
│   │   ├── quizzes/        # Assessments, hidden answers & auto-grading engine
│   │   ├── requests/       # Unified change request & instructor application queue
│   │   ├── uploads/        # Multipart file uploads & static media serving
│   │   ├── notifications/  # Decoupled event listeners
│   │   └── main.ts         # CORS array whitelist, global pipes, interceptors & Swagger
│   ├── .env.sample         # Environment configuration template
│   └── package.json
├── lms-frontend/               # Next.js 16 App Router Client (Port 3000)
│   ├── src/
│   │   ├── app/            # App router pages (15 routes across all user roles)
│   │   ├── components/     # shadcn/ui components, role-tailored Navbar & layout
│   │   ├── constAPI.ts     # Flat centralized API endpoint constant registry
│   │   ├── hooks/          # React 19 hydration-safe hooks (useIsMounted)
│   │   ├── lib/            # Axios interceptor client & date utilities
│   │   ├── store/          # Pure Redux Toolkit slices (RTK only, no RTK Query)
│   │   └── types/          # Shared TypeScript models and interfaces
│   └── package.json
├── TESTING_DATA.md             # Complete step-by-step manual testing guide & form data
├── PROJECT_SCOPE.md            # Comprehensive system specification & requirements
└── README.md                   # Project overview & quick start
```

---

## 🚀 Key Features & Business Flow

1. **Strict Public Registration:**
   - Public signups (`/register`) strictly provision accounts with the `student` role. Self-assigning `instructor` or `admin` is prevented.
2. **"Become an Instructor" Application Flow:**
   - Students submit an application with expertise, experience, and motivation (`/become-instructor`).
   - Generates an auto-tracked reference number (e.g., `APP-2026-XXXX`).
   - Admins review, approve, or reject applications with feedback in the Admin Panel (`/admin`).
3. **Instructor Content Isolation:**
   - Instructors only view and manage courses they author (`/instructor`).
   - New courses start as `DRAFT`.
4. **Unified Change Request System:**
   - Instructors must provide mandatory genuine reasons for publishing courses, deleting courses, requesting new categories, and revoking student enrollments.
   - Admins review all requests in a unified queue.
5. **Sensitive Student Data Masking:**
   - Instructors viewing their course roster see masked student emails (`a***e@lms.local`) to prevent data leakage. Full details remain accessible only to Admins.
6. **Role-Tailored Dynamic Top Bar:**
   - **Student:** Direct navigation to `Courses`, `My Learning`, and `Become an Instructor`.
   - **Instructor:** Direct access to `Instructor Studio` and `Course Catalog`.
   - **Admin:** Direct access to `Admin Management` and `Audit Courses`.
   - **Logo Click:** Intelligently redirects users to their role-specific dashboard (`/my-courses`, `/instructor`, `/admin`).
7. **Complete Student Learning Suite:**
   - Responsive video player, lesson markdown content, progress percentage bars, auto-graded quizzes (70% passing threshold), and verified 5-star course reviews.

---

## 🛠️ Tech Stack

### Backend (`lms-backend`)
* **Framework:** [NestJS 12](https://nestjs.com/) (TypeScript)
* **Database:** MongoDB via `@nestjs/mongoose`
* **Authentication:** JWT, Passport.js, bcrypt password hashing
* **CORS:** Configurable array whitelist from `.env`
* **Documentation:** Swagger OpenAPI 3.0 at `http://localhost:5000/api`

### Frontend (`lms-frontend`)
* **Framework:** [Next.js 16](https://nextjs.org/) (React 19, TypeScript, App Router)
* **Styling & UI:** Tailwind CSS v4, Base UI primitives, Lucide React icons, Sonner toasts
* **State Management:** **Redux Toolkit (RTK)** with centralized API constants
* **Hydration Safety:** React 19 `useSyncExternalStore` for 100% hydration mismatch-free rendering

---

## 🏁 Getting Started

### 1. Prerequisites
* **Node.js:** v24+
* **npm:** v11+
* **MongoDB:** Running locally on port `27017`

### 2. Start the Backend
```bash
cd lms-backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.sample .env

# 3. Start development server (runs on http://localhost:5000)
npm run start:dev
```

### 3. Start the Frontend
```bash
cd lms-frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

### 4. Interactive Testing & Verification
* **Frontend Application:** [http://localhost:3000](http://localhost:3000)
* **Swagger API Docs:** [http://localhost:5000/api](http://localhost:5000/api)
* **Manual Testing Dataset:** Follow [`TESTING_DATA.md`](TESTING_DATA.md) for complete copy-paste testing datasets and step-by-step verification flows.
