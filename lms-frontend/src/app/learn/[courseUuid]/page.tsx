'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourseById } from '@/store/slices/coursesSlice';
import { fetchLessonsByCourse, setCurrentLesson } from '@/store/slices/lessonsSlice';
import { fetchCourseProgress, toggleLessonProgress } from '@/store/slices/progressSlice';
import { fetchQuizByCourse } from '@/store/slices/quizzesSlice';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Loader2,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LearnCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseUuid = params.courseUuid as string;

  const dispatch = useAppDispatch();
  const { currentCourse } = useAppSelector((state) => state.courses);
  const { lessons, currentLesson, loading: lessonsLoading } = useAppSelector((state) => state.lessons);
  const { courseProgress } = useAppSelector((state) => state.progress);
  const { currentQuiz } = useAppSelector((state) => state.quizzes);
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  const [toggling, setToggling] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/learn/${courseUuid}`);
      return;
    }

    if (courseUuid) {
      dispatch(fetchCourseById(courseUuid));
      dispatch(fetchLessonsByCourse(courseUuid));
      dispatch(fetchCourseProgress(courseUuid));
      dispatch(fetchQuizByCourse(courseUuid));
    }
  }, [dispatch, courseUuid, isAuthenticated, isHydrated, router]);

  const currentLessonIndex = lessons.findIndex((l) => l.uuid === currentLesson?.uuid);
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  // Check if current lesson is completed
  const isLessonCompleted = (lessonUuid: string) => {
    return (
      courseProgress?.progress?.some((p) => {
        const itemLessonUuid = typeof p.lesson === 'object' && p.lesson !== null ? p.lesson.uuid : p.lesson;
        return itemLessonUuid === lessonUuid && p.isCompleted;
      }) || false
    );
  };

  const isCurrentCompleted = currentLesson ? isLessonCompleted(currentLesson.uuid) : false;

  const handleToggleProgress = async () => {
    if (!currentLesson) return;
    setToggling(true);
    try {
      const nextState = !isCurrentCompleted;
      const result = await dispatch(
        toggleLessonProgress({
          lessonUuid: currentLesson.uuid,
          isCompleted: nextState,
          courseUuid,
        }),
      );

      if (toggleLessonProgress.fulfilled.match(result)) {
        toast.success(nextState ? 'Lesson completed!' : 'Lesson marked as incomplete');
        // Refresh course progress percentage & details
        dispatch(fetchCourseProgress(courseUuid));
      } else {
        toast.error(result.payload || 'Failed to update lesson progress');
      }
    } catch {
      toast.error('An error occurred while updating progress');
    } finally {
      setToggling(false);
    }
  };

  // Convert video URL to embeddable player if applicable
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="flex items-center justify-between border-b px-4 py-2.5 bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/my-courses">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> My Courses
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="font-semibold text-xs sm:text-sm text-foreground truncate max-w-[200px] sm:max-w-md">
            {currentCourse?.title || 'Learning Portal'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Course Progress:</span>
            <span className="font-bold text-primary">{courseProgress?.percentage || 0}%</span>
            <div className="w-24">
              <Progress value={courseProgress?.percentage || 0} className="h-2" />
            </div>
          </div>

          {/* Quiz Button */}
          {currentQuiz && (
            <Link href={`/learn/${courseUuid}/quiz`}>
              <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                <span>Take Quiz</span>
              </Button>
            </Link>
          )}

          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            className="md:hidden p-1.5 rounded-md border text-foreground"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Split-Pane Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Lesson Player Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-background">
          {lessonsLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !currentLesson ? (
            <div className="m-auto py-16 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
              <p className="font-medium">No lesson selected</p>
              <p className="text-xs mt-1">Select a lesson from the curriculum sidebar to begin.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
                {/* Lesson Title & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Lesson {currentLesson.order || currentLessonIndex + 1}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5">
                      {currentLesson.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> {currentLesson.durationMinutes} mins
                    </Badge>
                    {isCurrentCompleted ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Video Player */}
                {currentLesson.videoUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md border">
                    <iframe
                      src={getEmbedUrl(currentLesson.videoUrl) || ''}
                      title={currentLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Lesson Text / Markdown Content */}
                <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4">
                  {currentLesson.content ? (
                    <div className="whitespace-pre-line text-foreground/90">
                      {currentLesson.content}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Watch the video lecture above or proceed to the next lesson.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Navigation & Completion Bar */}
              <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur p-4 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!prevLesson}
                  onClick={() => prevLesson && dispatch(setCurrentLesson(prevLesson))}
                  className="text-xs"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <Button
                  variant={isCurrentCompleted ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleToggleProgress}
                  disabled={toggling}
                  className="font-semibold text-xs"
                >
                  {toggling ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : isCurrentCompleted ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Completed (Click to Undo)
                    </>
                  ) : (
                    <>
                      <Circle className="mr-1.5 h-3.5 w-3.5" /> Mark as Complete
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && dispatch(setCurrentLesson(nextLesson))}
                  className="text-xs"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Curriculum Sidebar (Desktop & Mobile) */}
        <aside
          className={`${
            mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
          } absolute md:relative top-0 right-0 z-30 h-full w-80 sm:w-88 border-l bg-card flex flex-col transition-transform duration-200 ease-in-out`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-2">
            <h2 className="font-bold text-sm text-foreground">Course Curriculum</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {courseProgress?.completedLessons || 0} / {lessons.length} Completed
                </span>
                <span className="font-bold text-primary">{courseProgress?.percentage || 0}%</span>
              </div>
              <Progress value={courseProgress?.percentage || 0} className="h-1.5" />
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto divide-y">
            {lessons.map((lesson, idx) => {
              const active = currentLesson?.uuid === lesson.uuid;
              const completed = isLessonCompleted(lesson.uuid);

              return (
                <button
                  type="button"
                  key={lesson.uuid}
                  onClick={() => {
                    dispatch(setCurrentLesson(lesson));
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    active ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold line-clamp-2 ${
                        active ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {idx + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      {lesson.videoUrl && <PlayCircle className="h-3 w-3 text-primary" />}
                      <span>{lesson.durationMinutes} mins</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Quiz Footer */}
          {currentQuiz && (
            <div className="p-3 border-t bg-muted/20">
              <Link href={`/learn/${courseUuid}/quiz`} className="w-full">
                <Button className="w-full font-semibold text-xs" size="sm">
                  <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Exam: {currentQuiz.title}
                </Button>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
