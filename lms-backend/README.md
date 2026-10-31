# LMS Backend API

RESTful API backend for the Learning Management System (LMS), engineered with NestJS, TypeScript, and MongoDB.

> **Note:** This repository is currently backend-only. Frontend client development will be undertaken in a future milestone.

---

## Architecture Highlights

1. **UUID Strategy:**
   * Internal MongoDB `_id` (`ObjectId`) is never exposed in API contracts.
   * Public identifiers use UUID v4, indexed and enforced uniquely across schemas.

2. **Database Relationships & Population:**
   * Courses reference Categories using Mongoose `ref: Category.name`.
   * Retrieval endpoints automatically populate relational entities using `.populate('category')`.
   * Cross-module validation ensures foreign UUIDs exist before creating or updating records.

3. **Data Integrity & Protection:**
   * Categories cannot be deleted if active courses are assigned to them (enforced via `CoursesService.countByCategoryId`).
   * Circular module dependency between `CoursesModule` and `CategoriesModule` is cleanly handled with NestJS's `forwardRef()`.

4. **DTO Validation & Transformation:**
   * Global `ValidationPipe` with `whitelist: true` and `transform: true`.
   * Strict validation rules using `class-validator` (`@IsString()`, `@IsNumber()`, `@IsUUID()`, `@IsPositive()`).
   * Form-data transformation using `class-transformer` (`@Type(() => Number)`).

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

---

## Installation & Running

```bash
# Install dependencies
npm install

# Run in watch mode (development)
npm run start:dev

# Build for production
npm run build

# Run in production mode
npm run start:prod
```

---

## API Documentation (Swagger UI)

Interactive OpenAPI documentation is available when the server is running:

* **URL:** [http://localhost:5000/api](http://localhost:5000/api)
* **Form Testing:** Configured with `@ApiConsumes('application/x-www-form-urlencoded')` for quick testing via browser form fields.

### Available Endpoints

#### Categories (`/api/categories`)
* `POST /api/categories` — Create a new category
* `GET /api/categories` — Retrieve all categories
* `GET /api/categories/:uuid` — Retrieve category by UUID
* `PATCH /api/categories/:uuid` — Update category
* `DELETE /api/categories/:uuid` — Delete category (protected against deletion if courses exist)

#### Courses (`/api/courses`)
* `POST /api/courses` — Create a course (requires `categoryUuid`)
* `GET /api/courses` — Retrieve all courses (populated with category)
* `GET /api/courses/:uuid` — Retrieve course by UUID (populated with category)
* `GET /api/courses/category/:categoryUuid` — Retrieve all courses for a specific category
* `PATCH /api/courses/:uuid` — Update course
* `DELETE /api/courses/:uuid` — Delete course
