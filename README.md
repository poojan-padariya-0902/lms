# Learning Management System (LMS)

A modern, scalable Learning Management System project built step-by-step from the ground up.

> [!IMPORTANT]
> **Current Development Focus: Backend Only**  
> We are currently focusing exclusively on the backend architecture and API design (`lms-backend`). Frontend development, UI components, and client-side integrations will be developed at a later stage.

---

## Repository Structure

```text
lms/
├── .agents/
│   └── Handoff.md        # Complete step-by-step curriculum & session handoff log
├── lms-backend/          # NestJS REST API server (active development)
│   ├── src/
│   │   ├── courses/      # Course management module & schema
│   │   ├── categories/   # Category hierarchy module & schema
│   │   ├── app.module.ts # Root application module
│   │   └── main.ts       # Application bootstrapping & global pipes
│   ├── .env.sample       # Template for required environment variables
│   └── package.json      # Dependencies and scripts
└── README.md             # Project overview
```

---

## Tech Stack (Backend)

* **Framework:** [NestJS 12](https://nestjs.com/) (TypeScript, CommonJS)
* **Runtime:** Node.js v24+
* **Database:** MongoDB Community Edition (8.0) via [@nestjs/mongoose](https://github.com/nestjs/mongoose)
* **Validation:** `class-validator` & `class-transformer`
* **Configuration:** `@nestjs/config` with `.env`
* **API Documentation & Testing:** Swagger (OpenAPI 3.0) with interactive form testing

---

## Current Backend Progress (Tasks 1–44 Completed)

- [x] **TypeScript & NestJS Foundations:** Classes, interfaces, decorators, and dependency injection.
- [x] **Application Infrastructure:** Global route prefix (`/api`), global `ValidationPipe`, and dynamic configuration via `.env`.
- [x] **UUID Identification Strategy:** Internal `_id` (ObjectId) remains shielded; public client communication uses UUID v4.
- [x] **Courses Module:** Persistent CRUD with Mongoose schemas and DTO validation.
- [x] **Categories Module:** Resource scaffolding, custom schemas, DTOs with `PartialType`.
- [x] **Database Relationships:** Courses link to Categories via Mongoose `ref: 'Category'` and dynamically populate using `.populate('category')`.
- [x] **Reverse Relational Queries:** Filter all courses by category (`GET /api/courses/category/:categoryUuid`).
- [x] **Relational Integrity (Deletion Protection):** Circular module dependencies resolved with `forwardRef()`; prevents deleting categories with active courses.
- [ ] **Next Up (Task 45):** Users & Authentication Module (`bcrypt`, JWT tokens, and role-based guards).

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

### 3. Interactive API Testing (Swagger)
Once the server starts, open your browser:
* **Swagger UI:** [http://localhost:5000/api](http://localhost:5000/api)
* Interactive testing is configured with `application/x-www-form-urlencoded` for easy form input.
