# LMS Backend API

RESTful API backend for the Learning Management System (LMS), engineered with NestJS 12, TypeScript, and MongoDB.

> **Note:** This repository is currently backend-only. Frontend client development will be undertaken in a future milestone.

---

## Architecture Highlights

1. **UUID Identification Strategy:**
   * Internal MongoDB `_id` (`ObjectId`) is never exposed in API contracts.
   * Public identifiers use UUID v4, indexed and enforced uniquely across schemas.

2. **Database Relationships & Integrity:**
   * Referenced documents use Mongoose `ref` and are populated dynamically via `.populate()`.
   * Cross-module validation ensures foreign UUIDs exist before creating or updating records.
   * Categories cannot be deleted if active courses are assigned to them (enforced via `CoursesService.countByCategoryId`).

3. **Authentication & Role-Based Access Control (RBAC):**
   * Passwords hashed via `bcrypt` (10 rounds) and sanitized from queries (`.select('-password')`).
   * Stateless JWT issuance (`JwtService`) and verification via Passport JWT strategy (`JwtAuthGuard`).
   * Declarative role authorization using `@Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)` and `RolesGuard`.

4. **Global Pipeline & Clean Response Envelopes:**
   * **Global `ValidationPipe`:** Enforces whitelist filtering and class-transformer type casting.
   * **`TransformInterceptor`:**
     * **Mutations (`POST`, `PATCH`, `PUT`, `DELETE`):** Return lightweight confirmation envelopes `{ success: true, statusCode, message, timestamp }` with no redundant data payloads.
     * **Paginated Queries (`GET`):** Automatically format lists into `{ success: true, statusCode, data: [...], pagination: { total, page, limit, totalPages }, timestamp }`.
   * **`AllExceptionsFilter`:** Catches HttpExceptions and MongoDB `11000` duplicate key errors, returning uniform error envelopes.

5. **Universal Default Pagination:**
   * All list endpoints default to `page = 1, limit = 10` if query parameters are omitted.
   * Concurrently queries items and total count using `Promise.all()`.

6. **Automated Assessment & Aggregation Engine:**
   * **Quizzes:** Hidden answers (`{ select: false }` on `correctOptionIndex`) prevent pre-submission leaks; server-side auto-grading evaluates scores and pass/fail thresholds.
   * **Reviews:** MongoDB native aggregation pipelines (`$match`, `$group`, `$avg`, `$cond`) calculate average ratings and star breakdowns.

7. **Media Uploads & Static Serving:**
   * Multer file interceptor validating image types (`jpg`, `png`, `webp`) up to 5MB.
   * Direct static file serving via Express `useStaticAssets` at `/uploads/:filename`.

8. **Asynchronous Event-Driven Architecture:**
   * Decoupled `AppEventsService` dispatches background events (`enrollment.created`, `quiz.passed`).
   * `NotificationsService` handles non-blocking email simulation and certificate unlock notifications.

---

## Environment Variables

Copy `.env.sample` to `.env`:

```bash
cp .env.sample .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/lms-backend` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `superSecretJwtKeyChangeInProduction!` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `SALT_ROUNDS` | bcrypt salt hashing rounds | `10` |

---

## Installation & Running

```bash
# Install dependencies
npm install

# Run in watch mode (development)
npm run start:dev

# Run automated unit tests
npm test

# Build for production
npm run build

# Run in production mode
npm run start:prod
```

---

## API Documentation (Swagger UI)

Interactive OpenAPI documentation is available when the server is running:

* **URL:** [http://localhost:5000/api](http://localhost:5000/api)
* **Authentication:** Click **Authorize** and input Bearer JWT token (persisted across reloads).

### Endpoint Overview

#### Auth (`/api/auth`)
* `POST /api/auth/register` — Register a new student account
* `POST /api/auth/login` — Login with email/password and obtain JWT token
* `GET /api/auth/profile` — Verify token and retrieve logged-in user profile

#### Users (`/api/users`)
* `POST /api/users` — Provision new user (Admin)
* `GET /api/users` — Paginated user directory (`?page=1&limit=10`)
* `GET /api/users/:uuid` — Retrieve user profile
* `PATCH /api/users/:uuid` — Update user profile / password
* `DELETE /api/users/:uuid` — Delete user

#### Categories (`/api/categories`)
* `POST /api/categories` — Create category (Admin)
* `GET /api/categories` — Paginated categories listing
* `GET /api/categories/:uuid` — Retrieve category details
* `PATCH /api/categories/:uuid` — Update category
* `DELETE /api/categories/:uuid` — Delete category (protected against deletion if courses exist)

#### Courses (`/api/courses`)
* `POST /api/courses` — Create course (Instructor/Admin)
* `GET /api/courses` — Paginated courses with populated categories
* `GET /api/courses/:uuid` — Retrieve course details
* `GET /api/courses/category/:categoryUuid` — Paginated courses filtered by category
* `PATCH /api/courses/:uuid` — Update course details
* `DELETE /api/courses/:uuid` — Delete course

#### Lessons (`/api/lessons`)
* `POST /api/lessons` — Create curriculum lesson (Instructor/Admin)
* `GET /api/lessons` — Paginated lessons listing
* `GET /api/lessons/course/:courseUuid` — Course curriculum ordered by sequence
* `GET /api/lessons/:uuid` — Single lesson details
* `PATCH /api/lessons/:uuid` — Update lesson
* `DELETE /api/lessons/:uuid` — Delete lesson

#### Enrollments (`/api/enrollments`)
* `POST /api/enrollments` — Enroll in course (defaults to authenticated student)
* `GET /api/enrollments/my-courses` — Paginated list of enrolled courses for current user
* `GET /api/enrollments/course/:courseUuid` — Course enrollment list (Instructor/Admin)
* `GET /api/enrollments` — Global enrollment list (Admin)
* `PATCH /api/enrollments/:uuid/status` — Update enrollment status (`ACTIVE`, `COMPLETED`, `CANCELLED`)
* `DELETE /api/enrollments/:uuid` — Unenroll student (Admin)

#### Progress (`/api/progress`)
* `PUT /api/progress/lesson/:lessonUuid` — Toggle lesson completion (idempotent upsert)
* `GET /api/progress/course/:courseUuid` — Real-time course completion percentage & lesson details
* `GET /api/progress/my-progress` — Complete progress history across all courses

#### Reviews (`/api/reviews`)
* `POST /api/reviews` — Submit verified review & rating (Enrolled students only)
* `GET /api/reviews/course/:courseUuid` — Paginated reviews for a course
* `GET /api/reviews/course/:courseUuid/stats` — MongoDB aggregation stats (average rating, review count, 5-1 star distribution)
* `PATCH /api/reviews/:uuid` — Edit review
* `DELETE /api/reviews/:uuid` — Delete review

#### Quizzes (`/api/quizzes`)
* `POST /api/quizzes` — Create assessment quiz with questions (Instructor/Admin)
* `GET /api/quizzes/course/:courseUuid` — List quizzes for a course
* `GET /api/quizzes/:uuid` — Retrieve quiz for examination (correct answers hidden)
* `POST /api/quizzes/:uuid/submit` — Submit answers for auto-grading
* `GET /api/quizzes/:uuid/my-submissions` — Previous quiz attempt history
* `DELETE /api/quizzes/:uuid` — Delete quiz

#### Uploads (`/api/uploads`)
* `POST /api/uploads/image` — Upload image asset (`multipart/form-data`, max 5MB)
* Static asset access at `http://localhost:5000/uploads/:filename`
