'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourseById } from '@/store/slices/coursesSlice';
import { fetchLessonsByCourse } from '@/store/slices/lessonsSlice';
import { fetchCourseReviews, fetchCourseStats } from '@/store/slices/reviewsSlice';
import { fetchMyEnrollments, enrollCourse } from '@/store/slices/enrollmentsSlice';
import { submitChangeRequest } from '@/store/slices/requestsSlice';
import { ReviewModal } from '@/components/courses/ReviewModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Star,
  MessageSquarePlus,
  ArrowRight,
  Loader2,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { Review } from '@/types';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseUuid = params.uuid as string;

  const dispatch = useAppDispatch();
  const { currentCourse, loading: courseLoading } = useAppSelector((state) => state.courses);
  const { lessons, loading: lessonsLoading } = useAppSelector((state) => state.lessons);
  const { reviews, stats, loading: reviewsLoading } = useAppSelector((state) => state.reviews);
  const { myEnrollments, loading: enrollmentLoading } = useAppSelector((state) => state.enrollments);
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const mounted = useIsMounted();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedReviewForFlag, setSelectedReviewForFlag] = useState<Review | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitting, setFlagSubmitting] = useState(false);

  useEffect(() => {
    if (courseUuid) {
      dispatch(fetchCourseById(courseUuid));
      dispatch(fetchLessonsByCourse(courseUuid));
      dispatch(fetchCourseReviews({ courseUuid }));
      dispatch(fetchCourseStats(courseUuid));
      if (isHydrated && isAuthenticated) {
        dispatch(fetchMyEnrollments());
      }
    }
  }, [dispatch, courseUuid, isHydrated, isAuthenticated]);

  const isEnrolled = myEnrollments.some((enrollment) => {
    const enrolledCourseUuid =
      typeof enrollment.course === 'object' && enrollment.course !== null
        ? enrollment.course.uuid
        : enrollment.course;
    return enrolledCourseUuid === courseUuid && enrollment.status === 'ACTIVE';
  });

  const showEnrolled = mounted && isEnrolled;
  const showAuthenticated = mounted && isAuthenticated;

  const totalDurationMinutes = lessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to enroll in this course');
      router.push(`/login?redirect=/courses/${courseUuid}`);
      return;
    }

    if (isEnrolled) {
      router.push(`/learn/${courseUuid}`);
      return;
    }

    setEnrolling(true);
    try {
      const resultAction = await dispatch(enrollCourse(courseUuid));
      if (enrollCourse.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message || 'Successfully enrolled! Welcome to the course.');
        // Follow handoff rule: immediately redirect user to learning portal on mutation success
        router.push(`/learn/${courseUuid}`);
      } else {
        toast.error(resultAction.payload || 'Enrollment failed');
      }
    } catch {
      toast.error('An unexpected error occurred during enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewForFlag || !flagReason.trim()) {
      toast.error('Please provide a genuine reason for reporting this review');
      return;
    }
    setFlagSubmitting(true);
    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'FLAG_REVIEW',
          reason: flagReason.trim(),
          details: {
            reviewUuid: selectedReviewForFlag.uuid,
            courseUuid,
            reviewerName: selectedReviewForFlag.student?.name,
          },
        }),
      );
      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Review report ${result.payload.requestNumber} submitted to Admin!`);
        setFlagModalOpen(false);
        setFlagReason('');
      } else {
        toast.error(result.payload || 'Failed to submit report');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setFlagSubmitting(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          The requested course does not exist or may have been archived.
        </p>
        <Link href="/courses">
          <Button className="mt-4" size="sm">
            Back to Course Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/courses" className="hover:text-primary transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        {currentCourse.category && (
          <>
            <Link
              href={`/courses?category=${currentCourse.category.uuid}`}
              className="hover:text-primary transition-colors"
            >
              {currentCourse.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </>
        )}
        <span className="text-foreground font-medium truncate max-w-xs">{currentCourse.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Title, Description, Curriculum, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {currentCourse.category && (
                <Badge variant="secondary" className="text-xs">
                  {currentCourse.category.name}
                </Badge>
              )}
              {stats && stats.totalReviews > 0 && (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{stats.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">({stats.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {currentCourse.title}
            </h1>

            <p className="text-base text-muted-foreground mt-4 leading-relaxed whitespace-pre-line">
              {currentCourse.description}
            </p>
          </div>

          {/* Curriculum Section */}
          <div className="border rounded-xl p-6 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Course Curriculum</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lessons.length} lessons • ~{totalDurationMinutes} minutes total runtime
                </p>
              </div>
            </div>

            {lessonsLoading ? (
              <div className="space-y-2 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lessons.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Curriculum is being prepared. Lessons will be published soon.
              </div>
            ) : (
              <div className="divide-y rounded-lg border">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.uuid}
                    className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                        {lesson.order || idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {lesson.videoUrl && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <PlayCircle className="h-3 w-3 text-primary" /> Video lesson
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="h-3 w-3" /> {lesson.durationMinutes} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {lesson.isFreePreview ? (
                        <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-600/30">
                          Free Preview
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Enrolled Only</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Reviews Section */}
          <div className="border rounded-xl p-6 bg-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Student Reviews</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real feedback from students enrolled in this course
                </p>
              </div>

              {showEnrolled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalOpen(true)}
                  className="self-start sm:self-auto"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-1.5" /> Write a Review
                </Button>
              )}
            </div>

            {/* Overall Rating Score Card */}
            {stats && stats.totalReviews > 0 ? (
              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/40 border">
                <div className="text-center pr-6 border-r">
                  <p className="text-4xl font-extrabold text-foreground">{stats.averageRating.toFixed(1)}</p>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          Math.round(stats.averageRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{stats.totalReviews} total ratings</p>
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Based on validated completion reviews from enrolled participants.
                </div>
              </div>
            ) : null}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No reviews yet. Be the first enrolled student to share feedback!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.uuid} className="p-4 rounded-lg border bg-background/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {rev.student?.name ? rev.student.name[0]?.toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {rev.student?.name || 'Enrolled Student'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                rev.rating >= s ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
                              }`}
                            />
                          ))}
                        </div>
                        {showAuthenticated && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReviewForFlag(rev);
                              setFlagModalOpen(true);
                            }}
                            className="text-muted-foreground/40 hover:text-destructive p-1 rounded transition-colors"
                            title="Report abusive or spam review"
                          >
                            <Flag className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {rev.comment && (
                      <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                        &quot;{rev.comment}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Course Pricing & Enrollment Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="h-44 bg-gradient-to-tr from-primary/20 via-primary/10 to-muted flex items-center justify-center border-b">
              <GraduationCap className="h-20 w-20 text-primary/70" />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Course Price
                </span>
                <p className="text-3xl font-extrabold text-foreground mt-1">
                  {currentCourse.price === 0 ? 'Free' : `$${currentCourse.price.toFixed(2)}`}
                </p>
              </div>

              <div className="space-y-3">
                {showEnrolled ? (
                  <Link href={`/learn/${courseUuid}`} className="w-full">
                    <Button size="lg" className="w-full font-semibold shadow-md">
                      Go to Learning Portal <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling || enrollmentLoading}
                    className="w-full font-semibold shadow-md"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
                      </>
                    ) : (
                      <>
                        Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t text-xs">
                <h4 className="font-semibold text-foreground">Course includes:</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Full lifetime access to {lessons.length} lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Self-paced curriculum with completion tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Graded assessments & quizzes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Course review and student feedback portal</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        courseUuid={courseUuid}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

      {/* Flag / Report Review Modal */}
      <Dialog open={flagModalOpen} onOpenChange={setFlagModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Flag className="h-5 w-5" /> Report Inappropriate Review
            </DialogTitle>
            <DialogDescription>
              Submit an administrative removal request with a genuine reason (e.g. competitor spam, abusive language).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFlagSubmit} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
              <p className="font-semibold text-foreground">
                Review by: {selectedReviewForFlag?.student?.name || 'Student'}
              </p>
              <p className="text-muted-foreground italic">
                &quot;{selectedReviewForFlag?.comment || 'Rating only'}&quot;
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="flag-reason">Genuine Reason for Removal (Mandatory)</Label>
              <Textarea
                id="flag-reason"
                placeholder="Explain why this review violates platform standards (e.g. Contains profanity, promotional spam links, harassment)..."
                rows={4}
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFlagModalOpen(false)}
                disabled={flagSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={flagSubmitting}>
                {flagSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
