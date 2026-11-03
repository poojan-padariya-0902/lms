# LearnSphere — LMS Frontend Client

The frontend client for **LearnSphere LMS**, built with **Next.js 16**, **React 19**, **TypeScript**, and **Redux Toolkit (RTK)**.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 16.4 (App Router, Turbopack, Partial Prerendering)
* **React:** React 19.3
* **Language:** TypeScript 5 (Strict Mode)
* **Styling:** Tailwind CSS v4 + Base UI primitives + Lucide React icons
* **State Management:** **Redux Toolkit (RTK)** (pure slices with `createAsyncThunk`, no RTK Query)
* **API Registry:** Centralized, flat endpoint registry in [`src/constAPI.ts`](src/constAPI.ts)
* **HTTP Client:** Axios client with Bearer JWT interceptor and unified error extraction
* **Notifications:** Sonner toasts with rich color badges

---

## 🧭 Page Routes & Role Access

| Path | Description | Access |
|---|---|---|
| `/` | Landing page with hero, featured categories & top courses | Public |
| `/courses` | Searchable course catalog with category filter & pagination | Public |
| `/courses/[uuid]` | Course detail page, curriculum preview, reviews & enroll | Public / Student |
| `/login` | User login with auto-role redirection | Guest |
| `/register` | Student signup (strictly registers with `role: student`) | Guest |
| `/become-instructor` | "Become an Instructor" application & `APP-2026-XXXX` tracking | Student |
| `/my-courses` | Student Learning Portal (enrolled courses & progress) | Student |
| `/learn/[courseUuid]` | Interactive classroom with video player & lesson toggles | Enrolled Student |
| `/learn/[courseUuid]/quiz` | Auto-graded quiz examination & answer review | Enrolled Student |
| `/instructor` | Instructor Studio (own courses, publish/delete/category requests, masked roster) | Instructor / Admin |
| `/instructor/courses/[uuid]/curriculum` | Curriculum & Quiz assessment builder | Instructor / Admin |
| `/admin` | Admin Management (metrics, categories, users, review requests queue) | Admin |

---

## 📦 Redux Toolkit Architecture

State is managed via dedicated slices under `src/store/slices/`:

* `authSlice`: JWT authentication, user profile, deterministic hydration & logout
* `coursesSlice`: Public catalog, search, category filtering & instructor course list
* `categoriesSlice`: Taxonomy management and course counts
* `lessonsSlice`: Curriculum ordering, video lectures & markdown notes
* `enrollmentsSlice`: Student enrollment list & masked student rosters
* `progressSlice`: Real-time lesson completion & course progress percentages
* `quizzesSlice`: Assessments, questions, and auto-grading submissions
* `reviewsSlice`: 5-star ratings, verified feedback, and rating breakdowns
* `usersSlice`: User directory administration (Admin)
* `requestsSlice`: Change requests queue & instructor application tracking

---

## ⚡ Hydration & Performance Highlights

1. **React 19 `useIsMounted` Hook:** Uses `useSyncExternalStore` to ensure server snapshots match initial hydration without cascading re-renders or `react-hooks/set-state-in-effect` warnings.
2. **Deterministic Auth State:** `authSlice` initializes consistently to `{ isAuthenticated: false, isHydrated: false }` across server and client, syncing safely with `localStorage` in an `AuthInitializer` wrapper.
3. **Role-Tailored Top Bar:** The navigation bar strictly renders links for the active role (Student, Instructor, Admin, or Guest) and dynamically routes the logo click to the user's role-specific dashboard.
4. **Deterministic Date Formatting:** Uses `formatDate()` to prevent server-client locale date mismatches.

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js:** v24+
* **npm:** v11+
* **Backend:** Running on `http://localhost:5000`

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Lint
```bash
# Check TypeScript and ESLint (0 errors, 0 warnings)
npm run lint

# Production compilation (15 static/prerendered routes)
npm run build

# Start production server
npm run start
```
