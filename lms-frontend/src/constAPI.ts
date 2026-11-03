/**
 * LMS API Endpoints Registry
 * All endpoints are registered as individual constant exports (not grouped inside an object).
 */

// Base URLs
export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const BASE_UPLOADS_URL = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:5000/uploads';

// Authentication Endpoints
export const AUTH_REGISTER_ENDPOINT = '/auth/register';
export const AUTH_LOGIN_ENDPOINT = '/auth/login';
export const AUTH_PROFILE_ENDPOINT = '/auth/profile';

// Direct aliases
export const AUTH_REGISTER = AUTH_REGISTER_ENDPOINT;
export const AUTH_LOGIN = AUTH_LOGIN_ENDPOINT;
export const AUTH_PROFILE = AUTH_PROFILE_ENDPOINT;

// Categories Endpoints
export const CATEGORIES_ENDPOINT = '/categories';
export const CATEGORY_BY_UUID_ENDPOINT = (uuid: string) => `/categories/${uuid}`;

export const CATEGORIES = CATEGORIES_ENDPOINT;
export const CATEGORY_BY_UUID = CATEGORY_BY_UUID_ENDPOINT;

// Courses Endpoints
export const COURSES_ENDPOINT = '/courses';
export const COURSES_BY_CATEGORY_ENDPOINT = (categoryUuid: string) => `/courses/category/${categoryUuid}`;
export const COURSE_BY_UUID_ENDPOINT = (uuid: string) => `/courses/${uuid}`;
export const COURSES_INSTRUCTOR_MY_COURSES_ENDPOINT = '/courses/instructor/my-courses';

export const COURSES = COURSES_ENDPOINT;
export const COURSES_BY_CATEGORY = COURSES_BY_CATEGORY_ENDPOINT;
export const COURSE_BY_UUID = COURSE_BY_UUID_ENDPOINT;
export const COURSES_INSTRUCTOR_MY_COURSES = COURSES_INSTRUCTOR_MY_COURSES_ENDPOINT;

// Lessons Endpoints
export const LESSONS_ENDPOINT = '/lessons';
export const LESSONS_BY_COURSE_ENDPOINT = (courseUuid: string) => `/lessons/course/${courseUuid}`;
export const LESSON_BY_UUID_ENDPOINT = (uuid: string) => `/lessons/${uuid}`;

export const LESSONS = LESSONS_ENDPOINT;
export const LESSONS_BY_COURSE = LESSONS_BY_COURSE_ENDPOINT;
export const LESSON_BY_UUID = LESSON_BY_UUID_ENDPOINT;

// Enrollments Endpoints
export const ENROLLMENTS_ENDPOINT = '/enrollments';
export const ENROLLMENTS_MY_COURSES_ENDPOINT = '/enrollments/my-courses';
export const ENROLLMENTS_BY_COURSE_ENDPOINT = (courseUuid: string) => `/enrollments/course/${courseUuid}`;
export const ENROLLMENT_BY_UUID_ENDPOINT = (uuid: string) => `/enrollments/${uuid}`;
export const ENROLLMENT_STATUS_ENDPOINT = (uuid: string) => `/enrollments/${uuid}/status`;

export const ENROLLMENTS = ENROLLMENTS_ENDPOINT;
export const ENROLLMENTS_MY_COURSES = ENROLLMENTS_MY_COURSES_ENDPOINT;
export const ENROLLMENTS_BY_COURSE = ENROLLMENTS_BY_COURSE_ENDPOINT;
export const ENROLLMENT_BY_UUID = ENROLLMENT_BY_UUID_ENDPOINT;
export const ENROLLMENT_STATUS = ENROLLMENT_STATUS_ENDPOINT;

// Progress Endpoints
export const PROGRESS_MY_PROGRESS_ENDPOINT = '/progress/my-progress';
export const PROGRESS_BY_COURSE_ENDPOINT = (courseUuid: string) => `/progress/course/${courseUuid}`;
export const PROGRESS_LESSON_ENDPOINT = (lessonUuid: string) => `/progress/lesson/${lessonUuid}`;

export const PROGRESS_MY_PROGRESS = PROGRESS_MY_PROGRESS_ENDPOINT;
export const PROGRESS_BY_COURSE = PROGRESS_BY_COURSE_ENDPOINT;
export const PROGRESS_LESSON = PROGRESS_LESSON_ENDPOINT;

// Quizzes Endpoints
export const QUIZZES_ENDPOINT = '/quizzes';
export const QUIZZES_BY_COURSE_ENDPOINT = (courseUuid: string) => `/quizzes/course/${courseUuid}`;
export const QUIZ_BY_UUID_ENDPOINT = (uuid: string) => `/quizzes/${uuid}`;
export const QUIZ_SUBMIT_ENDPOINT = (quizUuid: string) => `/quizzes/${quizUuid}/submit`;
export const QUIZ_MY_SUBMISSIONS_ENDPOINT = (quizUuid: string) => `/quizzes/${quizUuid}/my-submissions`;

export const QUIZZES = QUIZZES_ENDPOINT;
export const QUIZZES_BY_COURSE = QUIZZES_BY_COURSE_ENDPOINT;
export const QUIZ_BY_UUID = QUIZ_BY_UUID_ENDPOINT;
export const QUIZ_SUBMIT = QUIZ_SUBMIT_ENDPOINT;
export const QUIZ_MY_SUBMISSIONS = QUIZ_MY_SUBMISSIONS_ENDPOINT;

// Reviews Endpoints
export const REVIEWS_ENDPOINT = '/reviews';
export const REVIEWS_BY_COURSE_ENDPOINT = (courseUuid: string) => `/reviews/course/${courseUuid}`;
export const REVIEWS_COURSE_STATS_ENDPOINT = (courseUuid: string) => `/reviews/course/${courseUuid}/stats`;
export const REVIEW_BY_UUID_ENDPOINT = (uuid: string) => `/reviews/${uuid}`;

export const REVIEWS = REVIEWS_ENDPOINT;
export const REVIEWS_BY_COURSE = REVIEWS_BY_COURSE_ENDPOINT;
export const REVIEWS_COURSE_STATS = REVIEWS_COURSE_STATS_ENDPOINT;
export const REVIEW_BY_UUID = REVIEW_BY_UUID_ENDPOINT;

// Uploads Endpoints
export const UPLOADS_IMAGE_ENDPOINT = '/uploads/image';
export const UPLOADS_IMAGE = UPLOADS_IMAGE_ENDPOINT;

// Users Endpoints (Admin)
export const USERS_ENDPOINT = '/users';
export const USER_BY_UUID_ENDPOINT = (uuid: string) => `/users/${uuid}`;

export const USERS = USERS_ENDPOINT;
export const USER_BY_UUID = USER_BY_UUID_ENDPOINT;

// Change Requests & Applications Endpoints
export const REQUESTS_ENDPOINT = '/requests';
export const REQUESTS_MY_REQUESTS_ENDPOINT = '/requests/my-requests';
export const REQUEST_TRACK_ENDPOINT = (requestNumber: string) => `/requests/track/${requestNumber}`;
export const REQUEST_BY_UUID_ENDPOINT = (uuid: string) => `/requests/${uuid}`;
export const REQUEST_REVIEW_ENDPOINT = (uuid: string) => `/requests/${uuid}/review`;

export const REQUESTS = REQUESTS_ENDPOINT;
export const REQUESTS_MY_REQUESTS = REQUESTS_MY_REQUESTS_ENDPOINT;
export const REQUEST_TRACK = REQUEST_TRACK_ENDPOINT;
export const REQUEST_BY_UUID = REQUEST_BY_UUID_ENDPOINT;
export const REQUEST_REVIEW = REQUEST_REVIEW_ENDPOINT;

