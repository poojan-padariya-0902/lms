export type Role = 'admin' | 'instructor' | 'student';

export interface User {
  uuid: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  uuid: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CourseStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'ARCHIVED';

export interface Course {
  uuid: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  instructor?: User;
  status?: CourseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  uuid: string;
  title: string;
  content?: string;
  videoUrl?: string;
  durationMinutes: number;
  order: number;
  isFreePreview: boolean;
  course: Course | string;
  createdAt?: string;
  updatedAt?: string;
}

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Enrollment {
  uuid: string;
  student: User;
  course: Course;
  enrolledAt: string;
  status: EnrollmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressItem {
  uuid: string;
  student: string | User;
  lesson: Lesson;
  course: string | Course;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CourseProgressSummary {
  courseUuid: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  isCompleted: boolean;
  progress: ProgressItem[];
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex?: number;
}

export interface Quiz {
  uuid: string;
  title: string;
  description?: string;
  course: Course | string;
  questions: QuizQuestion[];
  passingScorePercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSubmissionResult {
  scorePercentage: number;
  isPassed: boolean;
  correctAnswers?: number;
  totalQuestions?: number;
}

export interface Submission {
  uuid: string;
  student: User | string;
  quiz: Quiz | string;
  course: Course | string;
  selectedAnswers: number[];
  scorePercentage: number;
  isPassed: boolean;
  submittedAt: string;
}

export interface Review {
  uuid: string;
  student: User;
  course: Course | string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution?: Record<number, number>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface DetailResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface MutationResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  error: string | string[];
  timestamp: string;
  path: string;
}

export interface AuthResponseData {
  access_token: string;
  user: User;
}

export interface UploadImageResponseData {
  filename: string;
  url: string;
  size: number;
}

export type RequestType =
  | 'BECOME_INSTRUCTOR'
  | 'PUBLISH_COURSE'
  | 'DELETE_COURSE'
  | 'NEW_CATEGORY'
  | 'REVOKE_STUDENT'
  | 'FLAG_REVIEW';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ChangeRequest {
  uuid: string;
  requestNumber: string;
  type: RequestType;
  status: RequestStatus;
  requester: User;
  reason: string;
  details?: Record<string, unknown>;
  adminFeedback?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

