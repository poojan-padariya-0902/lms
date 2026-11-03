# Learning Management System (LMS)

A modern, scalable Learning Management System project built step-by-step from the ground up.

> [!IMPORTANT]
> **Current Development Focus: Backend Only**  
> We have completed the full production-grade backend architecture and API design (`lms-backend`). Frontend client development will be undertaken at a future stage.

---

## Repository Structure

```text
lms/
├── .agents/
│   ├── Handoff.md            # Backend curriculum & session handoff log
│   └── Frontend-Handoff.md   # Frontend architecture specification & agent roadmap
├── lms-backend/              # NestJS REST API server (production-ready)
│   ├── src/
│   │   ├── auth/         # JWT auth, Passport strategy, RBAC guards
│   │   ├── users/        # User management & bcrypt password security
│   │   ├── categories/   # Category hierarchy module & schema
│   │   ├── courses/      # Course management module & schema
│   │   ├── lessons/      # Lesson curriculum, ordering & preview flags
│   │   ├── enrollments/  # Student course enrollments & lifecycle status
│   │   ├── progress/     # Lesson completion & course percentage analytics
│   │   ├── reviews/      # Course ratings & MongoDB aggregation pipelines
│   │   ├── quizzes/      # Assessments, hidden answers & auto-grading engine
│   │   ├── uploads/      # Multipart image uploads & static asset serving
│   │   ├── notifications/# Decoupled asynchronous event listeners
│   │   ├── common/       # Interceptors, filters, custom decorators & pagination
│   │   ├── app.module.ts # Root application module
│   │   └── main.ts       # Bootstrapping, global pipes, interceptors & filters
│   ├── .env.sample       # Template for required environment variables
│   └── package.json      # Dependencies and scripts
├── PROJECT_SCOPE.md      # Full architecture specification, contracts & feature scope
└── README.md             # Project overview
```

---

## Tech Stack (Backend)

* **Framework:** [NestJS 12](https://nestjs.com/) (TypeScript, CommonJS)
* **Runtime:** Node.js v24+
* **Database:** MongoDB Community Edition (8.0) via [@nestjs/mongoose](https://github.com/nestjs/mongoose)
* **Authentication:** Passport.js (`passport-jwt`), stateless JWT (`@nestjs/jwt`), `bcrypt`
* **Validation & Transformation:** `class-validator` & `class-transformer`
* **Configuration:** `@nestjs/config` with `.env`
* **File Uploads:** Multer with Express static asset serving
* **Event Architecture:** Native asynchronous event bus for non-blocking notifications
* **API Documentation & Testing:** Swagger (OpenAPI 3.0) with Bearer token authentication & interactive form testing
* **Testing:** Automated unit testing suites with Jest and `@nestjs/testing` mocks

---

## Backend Feature Summary (Tasks 1–55 Completed)

- [x] **TypeScript & NestJS Foundations:** Classes, interfaces, decorators, and dependency injection.
- [x] **Application Infrastructure:** Global route prefix (`/api`), global `ValidationPipe`, and dynamic configuration via `.env`.
- [x] **UUID Identification Strategy:** Internal `_id` (ObjectId) remains shielded; public client communication uses UUID v4.
- [x] **Courses & Categories:** Persistent CRUD, relational references (`ref`), population (`.populate`), and deletion protection.
- [x] **Authentication & RBAC:** Password hashing (`bcrypt`), JWT tokens, `@Roles()` metadata, and `RolesGuard`.
- [x] **Lessons Curriculum:** Sequential ordering with compound index `{ course: 1, order: 1 }` and free preview flags.
- [x] **Enrollments:** Student-course junction entity with compound unique index `{ student: 1, course: 1 }` and status lifecycle.
- [x] **Lesson Progress Tracking:** Idempotent atomic upserts (`findOneAndUpdate` with `upsert: true`) and live course completion percentage calculation.
- [x] **Course Reviews & Ratings:** Verified reviews (enrolled only), uniqueness constraint, and MongoDB aggregation pipelines (`$match`, `$group`, `$avg`).
- [x] **Quizzes & Assessments:** Embedded questions, hidden correct answers (`{ select: false }`), and automated grading engine.
- [x] **File Uploads:** Multer image upload pipeline and static media serving at `/uploads/:filename`.
- [x] **Custom Decorators:** `@CurrentUser()` for clean, type-safe user extraction.
- [x] **Global Pipeline:** Uniform response envelope (`TransformInterceptor`) with lightweight mutation payloads and standardized error envelopes (`AllExceptionsFilter`).
- [x] **Universal Pagination:** Default `page = 1, limit = 10` pagination across all collection endpoints with total count metadata.
- [x] **Asynchronous Event-Driven Architecture:** Decoupled event bus (`AppEventsService`) and background notification listeners.
- [x] **Automated Unit Testing:** Jest test suites passing with 100% pass rate.

*For complete details, see [PROJECT_SCOPE.md](PROJECT_SCOPE.md).*

---

## Getting Started

### 1. Prerequisites
* **Node.js:** v24+ & **npm:** v11+
* **MongoDB:** Running locally on port `27017` (e.g., via `sudo systemctl start mongod`)

### 2. Setup the Backend
```bash
cd lms-backend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.sample .env

# 3. Start development server
npm run start:dev
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Interactive API Testing (Swagger)
Once the server starts, open your browser:
* **Swagger UI:** [http://localhost:5000/api](http://localhost:5000/api)
* Includes Bearer token authorization and form-urlencoded testing.
