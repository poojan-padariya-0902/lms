# Learning Management System (LMS) — Project Scope & Specification

A production-grade, highly scalable Learning Management System (LMS) backend engineered with **NestJS 12**, **TypeScript**, and **MongoDB**.

---

## 1. Executive Summary & Architecture Scope

* **Architecture Style:** Modular Monolith (NestJS Domain Feature Modules).
* **Scope Boundary:** **Backend-Only**. Frontend client applications (Web, Mobile, Admin Portals) integrate independently via the REST API contracts defined below.
* **Database Isolation Strategy:** Internal MongoDB `_id` (`ObjectId`) is shielded from external clients; all public API contracts exclusively send and receive **UUID v4**.
* **Security Model:** Stateless JWT authentication (Passport.js) combined with declarative Role-Based Access Control (`@Roles()`, `RolesGuard`).
* **Response Standardization:** Global interceptors and filters enforce uniform response envelopes across all endpoints.

---

## 2. Global Pipeline & Response Conventions

### A. Mutation Responses (Creation & Updates)
To optimize network bandwidth for frontends that redirect users immediately after form submission, `POST`, `PATCH`, `PUT`, and `DELETE` return lightweight status envelopes with no redundant data payloads:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Resource created successfully",
  "timestamp": "2026-11-03T11:40:00.000Z"
}
```

*(Exemptions: `/auth/login` returns tokens, `/uploads` returns file URLs, `/quizzes/:uuid/submit` returns score results).*

### B. Universal Default Pagination
All collection endpoints (`GET /api/courses`, `categories`, `lessons`, `users`, `enrollments`, `reviews`, `quizzes`) implement automated default pagination:
* **Default values:** `page = 1`, `limit = 10` entries (configurable up to `100`).
* **Response format:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [ ... ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "timestamp": "2026-11-03T11:40:00.000Z"
}
```

### C. Standardized Error Envelope
Unhandled errors and database exceptions (e.g., MongoDB `11000` duplicate key errors) are intercepted by [`AllExceptionsFilter`](lms-backend/src/common/filters/all-exceptions.filter.ts):
```json
{
  "success": false,
  "statusCode": 409,
  "error": "Duplicate value error on field 'email'. This record already exists.",
  "timestamp": "2026-11-03T11:40:00.000Z",
  "path": "/api/users"
}
```

---

## 3. Module Scope & Feature Breakdown

### 1. Authentication & Security (`src/auth`)
* Stateless JWT authentication with `@nestjs/jwt` and `PassportModule`.
* Password hashing with `bcrypt` (10 salt rounds).
* Roles: `ADMIN`, `INSTRUCTOR`, `STUDENT`.
* Endpoints:
  * `POST /api/auth/register` — Student self-registration.
  * `POST /api/auth/login` — Authentication issuing signed JWT payload (`sub: user.uuid, email, role`).
  * `GET /api/auth/profile` — Token verification endpoint.

### 2. Users Management (`src/users`)
* User schema with roles, password sanitization (`.select('-password')`), and duplicate email prevention.
* Endpoints:
  * `POST /api/users` — Admin user provisioning.
  * `GET /api/users` — Paginated user directory.
  * `GET /api/users/:uuid` — Retrieve user profile.
  * `PATCH /api/users/:uuid` — Update user details or re-hash password.
  * `DELETE /api/users/:uuid` — Remove user.

### 3. Categories Taxonomy (`src/categories`)
* Course grouping and classification.
* **Deletion Integrity:** Prevents deleting categories that currently have active courses assigned.
* Endpoints:
  * `POST /api/categories` — Create category (`ADMIN` only).
  * `GET /api/categories` — Paginated categories listing.
  * `GET /api/categories/:uuid` — Category details.
  * `PATCH /api/categories/:uuid` — Update category (`ADMIN` only).
  * `DELETE /api/categories/:uuid` — Delete category (`ADMIN` only).

### 4. Courses Management (`src/courses`)
* Core course catalog, pricing, category linkage (`ref: Category.name`), and dynamic population.
* Endpoints:
  * `POST /api/courses` — Create course (`INSTRUCTOR`, `ADMIN`).
  * `GET /api/courses` — Paginated course catalog with populated categories.
  * `GET /api/courses/:uuid` — Course details by UUID.
  * `GET /api/courses/category/:categoryUuid` — Filter courses by category.
  * `PATCH /api/courses/:uuid` — Update course (`INSTRUCTOR`, `ADMIN`).
  * `DELETE /api/courses/:uuid` — Delete course (`INSTRUCTOR`, `ADMIN`).

### 5. Lessons & Curriculum (`src/lessons`)
* Hierarchical course content: videos, reading materials, durations, and sequence ordering.
* **Compound Index:** `{ course: 1, order: 1 }` for high-performance sequential ordering.
* Free preview access flag (`isFreePreview`) for marketing/onboarding.
* Endpoints:
  * `POST /api/lessons` — Create lesson (`INSTRUCTOR`, `ADMIN`).
  * `GET /api/lessons` — Paginated lessons list.
  * `GET /api/lessons/course/:courseUuid` — Course curriculum ordered by sequence.
  * `GET /api/lessons/:uuid` — Single lesson details.
  * `PATCH /api/lessons/:uuid` — Update lesson (`INSTRUCTOR`, `ADMIN`).
  * `DELETE /api/lessons/:uuid` — Delete lesson (`INSTRUCTOR`, `ADMIN`).

### 6. Enrollments (`src/enrollments`)
* Junction model connecting students (`User`) to courses (`Course`).
* **Compound Unique Index:** `{ student: 1, course: 1 }` prevents duplicate course enrollments.
* Status lifecycle tracking: `ACTIVE`, `COMPLETED`, `CANCELLED`.
* Endpoints:
  * `POST /api/enrollments` — Enroll current user (or Admin-specified student).
  * `GET /api/enrollments/my-courses` — Logged-in student's enrolled courses.
  * `GET /api/enrollments/course/:courseUuid` — Enrolled students for a course (`INSTRUCTOR`, `ADMIN`).
  * `GET /api/enrollments` — Global enrollment directory (`ADMIN` only).
  * `PATCH /api/enrollments/:uuid/status` — Modify lifecycle status (`INSTRUCTOR`, `ADMIN`).
  * `DELETE /api/enrollments/:uuid` — Unenroll student (`ADMIN` only).

### 7. Lesson Progress Tracking (`src/progress`)
* Atomic tracking of lesson completion (`isCompleted`, `completedAt`).
* **Access Gate:** Verifies student is actively enrolled before recording progress.
* **Real-Time Analytics:** Calculates overall course completion percentage `(completedLessons / totalLessons) * 100`.
* Endpoints:
  * `PUT /api/progress/lesson/:lessonUuid` — Idempotent toggle of lesson completion.
  * `GET /api/progress/course/:courseUuid` — Live course completion percentage and lesson breakdown.
  * `GET /api/progress/my-progress` — Complete progress history across all enrolled courses.

### 8. Course Reviews & Ratings (`src/reviews`)
* Verified reviews: only enrolled students can leave feedback.
* **Compound Unique Index:** `{ student: 1, course: 1 }` limits students to one review per course.
* **MongoDB Aggregation Pipeline:** Multi-stage native aggregation (`$match`, `$group`, `$avg`, `$cond`) computing average rating and 1-to-5 star breakdowns.
* Endpoints:
  * `POST /api/reviews` — Submit course review (Enrolled student only).
  * `GET /api/reviews/course/:courseUuid` — Paginated course reviews.
  * `GET /api/reviews/course/:courseUuid/stats` — Course review aggregation statistics.
  * `PATCH /api/reviews/:uuid` — Edit review (Review author or Admin).
  * `DELETE /api/reviews/:uuid` — Delete review (Review author or Admin).

### 9. Quizzes & Assessments (`src/quizzes`)
* Embedded questions schema with multiple choice options.
* **Security Shield:** `correctOptionIndex` configured with `{ select: false }` to prevent answer leakage prior to submission.
* **Automated Grading Engine:** Validates answers, calculates score percentages, and determines pass/fail status against passing thresholds.
* Endpoints:
  * `POST /api/quizzes` — Create quiz with questions (`INSTRUCTOR`, `ADMIN`).
  * `GET /api/quizzes/course/:courseUuid` — List quizzes for a course.
  * `GET /api/quizzes/:uuid` — Quiz content (answers hidden).
  * `POST /api/quizzes/:uuid/submit` — Submit answers for auto-grading.
  * `GET /api/quizzes/:uuid/my-submissions` — Previous quiz attempt history.
  * `DELETE /api/quizzes/:uuid` — Delete quiz (`INSTRUCTOR`, `ADMIN`).

### 10. File Uploads & Media Assets (`src/uploads`)
* Multer integration supporting image uploads (`jpeg`, `png`, `webp`) up to 5MB.
* Static file serving via Express `useStaticAssets` mapped to `/uploads/:filename`.
* Endpoints:
  * `POST /api/uploads/image` — Upload media asset (`multipart/form-data`).

### 11. Asynchronous Events & Notifications (`src/common/events` & `src/notifications`)
* Decoupled event bus (`AppEventsService`) dispatched on enrollments and quiz passes.
* Non-blocking listeners in `NotificationsService` handling background notifications without slowing down HTTP responses.

---

## 4. Verification & Quality Standards

* **TypeScript Compilation:** Zero errors (`nest build`).
* **Unit Testing:** Automated test suites passing via Jest and `@nestjs/testing` mocks (`npm test`).
* **API Documentation:** Interactive OpenAPI 3.0 documentation with Bearer token authentication at `http://localhost:5000/api`.

