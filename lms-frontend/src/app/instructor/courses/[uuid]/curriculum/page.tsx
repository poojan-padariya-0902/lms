'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourseById } from '@/store/slices/coursesSlice';
import {
  fetchLessonsByCourse,
  createLesson,
  deleteLesson,
} from '@/store/slices/lessonsSlice';
import {
  fetchQuizByCourse,
  createQuiz,
  deleteQuiz,
} from '@/store/slices/quizzesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  PlusCircle,
  PlayCircle,
  Clock,
  Trash2,
  HelpCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { QuizQuestion } from '@/types';

export default function CourseCurriculumEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseUuid = params.uuid as string;

  const dispatch = useAppDispatch();
  const { currentCourse } = useAppSelector((state) => state.courses);
  const { lessons, loading: lessonsLoading } = useAppSelector((state) => state.lessons);
  const { currentQuiz, loading: quizLoading } = useAppSelector((state) => state.quizzes);
  const { isAuthenticated, isHydrated, user } = useAppSelector((state) => state.auth);

  // Lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState('10');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [isFreePreview, setIsFreePreview] = useState(false);

  // Quiz modal state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
    },
  ]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/instructor/courses/${courseUuid}/curriculum`);
      return;
    }
    if (user?.role !== 'instructor' && user?.role !== 'admin') {
      router.push('/courses');
      return;
    }

    if (courseUuid) {
      dispatch(fetchCourseById(courseUuid));
      dispatch(fetchLessonsByCourse(courseUuid));
      dispatch(fetchQuizByCourse(courseUuid));
    }
  }, [dispatch, courseUuid, isAuthenticated, isHydrated, user, router]);

  // Handle Add Lesson
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle) {
      toast.error('Please provide a lesson title');
      return;
    }

    setLessonSubmitting(true);
    try {
      const result = await dispatch(
        createLesson({
          title: lessonTitle,
          content: lessonContent || undefined,
          videoUrl: lessonVideoUrl || undefined,
          durationMinutes: parseInt(lessonDuration, 10) || 0,
          order: parseInt(lessonOrder, 10) || lessons.length + 1,
          isFreePreview,
          courseUuid,
        }),
      );

      if (createLesson.fulfilled.match(result)) {
        toast.success(result.payload.message || 'Lesson added successfully');
        setLessonModalOpen(false);
        setLessonTitle('');
        setLessonContent('');
        setLessonVideoUrl('');
        setLessonDuration('10');
        setIsFreePreview(false);
        dispatch(fetchLessonsByCourse(courseUuid));
      } else {
        toast.error(result.payload || 'Failed to add lesson');
      }
    } catch {
      toast.error('An error occurred while adding the lesson');
    } finally {
      setLessonSubmitting(false);
    }
  };

  const handleDeleteLesson = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const result = await dispatch(deleteLesson(uuid));
      if (deleteLesson.fulfilled.match(result)) {
        toast.success('Lesson deleted');
      } else {
        toast.error(result.payload || 'Failed to delete lesson');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Question helpers for Quiz
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      },
    ]);
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctOptionIndex = optIdx;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== qIdx));
  };

  // Handle Add Quiz
  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle) {
      toast.error('Please enter a quiz title');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        toast.error(`Question ${i + 1} is missing question text.`);
        return;
      }
      const filledOptions = questions[i].options.filter((o) => o.trim().length > 0);
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 non-empty answer choices.`);
        return;
      }
    }

    setQuizSubmitting(true);
    try {
      const cleanedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options.filter((o) => o.trim().length > 0),
        correctOptionIndex: q.correctOptionIndex,
      }));

      const result = await dispatch(
        createQuiz({
          title: quizTitle,
          description: quizDescription || undefined,
          courseUuid,
          questions: cleanedQuestions,
          passingScorePercentage: parseInt(passingScore, 10) || 70,
        }),
      );

      if (createQuiz.fulfilled.match(result)) {
        toast.success(result.payload.message || 'Assessment Quiz created successfully!');
        setQuizModalOpen(false);
        dispatch(fetchQuizByCourse(courseUuid));
      } else {
        toast.error(result.payload || 'Failed to create quiz');
      }
    } catch {
      toast.error('An error occurred while creating quiz');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this assessment quiz?')) return;
    try {
      const result = await dispatch(deleteQuiz(uuid));
      if (deleteQuiz.fulfilled.match(result)) {
        toast.success('Quiz deleted successfully');
        dispatch(fetchQuizByCourse(courseUuid));
      } else {
        toast.error(result.payload || 'Failed to delete quiz');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Back & Title Header */}
      <div className="flex items-center gap-3 pb-4 border-b mb-6">
        <Link href="/instructor">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Instructor Dashboard
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="font-semibold text-sm text-foreground truncate max-w-sm">
          {currentCourse?.title || 'Curriculum Management'}
        </span>
      </div>

      <div className="space-y-8">
        {/* Section 1: Curriculum Lessons */}
        <div className="border rounded-xl p-6 bg-card space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Course Lessons</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organize sequential video lectures and readings for your students.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setLessonOrder((lessons.length + 1).toString());
                setLessonModalOpen(true);
              }}
              className="font-semibold"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Lesson
            </Button>
          </div>

          {lessonsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-12 text-center border rounded-lg bg-background/50">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium">No lessons added yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click &quot;Add Lesson&quot; to build out your curriculum.
              </p>
            </div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.uuid}
                  className="p-4 flex items-center justify-between bg-background/50 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                      {lesson.order || idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{lesson.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {lesson.videoUrl && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <PlayCircle className="h-3 w-3 text-primary" /> Video
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="h-3 w-3" /> {lesson.durationMinutes} mins
                        </span>
                        {lesson.isFreePreview && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px] text-emerald-600">
                              Preview
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLesson(lesson.uuid)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    title="Delete Lesson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Assessment Quiz */}
        <div className="border rounded-xl p-6 bg-card space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Course Assessment Quiz</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Test student comprehension with automated multiple-choice questions.
              </p>
            </div>

            {!currentQuiz && (
              <Button size="sm" onClick={() => setQuizModalOpen(true)} className="font-semibold">
                <PlusCircle className="mr-1.5 h-4 w-4" /> Create Assessment Quiz
              </Button>
            )}
          </div>

          {quizLoading ? (
            <Skeleton className="h-28 w-full rounded-lg" />
          ) : !currentQuiz ? (
            <div className="py-12 text-center border rounded-lg bg-background/50">
              <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium">No quiz created for this course</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create an exam so students can test their knowledge upon finishing the curriculum.
              </p>
            </div>
          ) : (
            <div className="p-5 border rounded-lg bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{currentQuiz.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    Pass: {currentQuiz.passingScorePercentage}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentQuiz.questions?.length || 0} Multiple-Choice Questions
                </p>
                {currentQuiz.description && (
                  <p className="text-xs text-muted-foreground italic">&quot;{currentQuiz.description}&quot;</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteQuiz(currentQuiz.uuid)}
                  className="text-destructive hover:text-destructive text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Lesson */}
      <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Course Lesson</DialogTitle>
            <DialogDescription>
              Create a sequential lesson with duration, video URL, and reading material.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLesson} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                placeholder="e.g. Introduction to Next.js App Router"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lesson-duration">Duration (Minutes)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-order">Sequence Order</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  min="1"
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-video">Video URL (Optional: YouTube embed or MP4)</Label>
              <Input
                id="lesson-video"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lesson-content">Reading / Markdown Content (Optional)</Label>
              <Textarea
                id="lesson-content"
                placeholder="Detailed explanations, code snippets, and instructions..."
                rows={4}
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="free-preview"
                checked={isFreePreview}
                onChange={(e) => setIsFreePreview(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="free-preview" className="text-xs cursor-pointer">
                Allow free preview for prospective students
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLessonModalOpen(false)}
                disabled={lessonSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={lessonSubmitting}>
                {lessonSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Add Lesson'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Quiz */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Course Assessment Quiz</DialogTitle>
            <DialogDescription>
              Author multiple choice questions and designate the correct answer index.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddQuiz} className="space-y-6 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input
                  id="quiz-title"
                  placeholder="e.g. Comprehensive Knowledge Check"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz-pass">Passing Score (%)</Label>
                <Input
                  id="quiz-pass"
                  type="number"
                  min="1"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quiz-desc">Description (Optional)</Label>
              <Input
                id="quiz-desc"
                placeholder="Instructions or scope of the assessment..."
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Questions ({questions.length})</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddQuestion} className="text-xs">
                  <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Question
                </Button>
              </div>

              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-lg border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">Question {qIdx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Enter question text..."
                    value={q.questionText}
                    onChange={(e) => handleUpdateQuestionText(qIdx, e.target.value)}
                    required
                  />

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-muted-foreground">Options (select correct answer radio):</span>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-answer-${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          className="h-8 text-xs"
                          required={optIdx < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuizModalOpen(false)}
                disabled={quizSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={quizSubmitting}>
                {quizSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Quiz...
                  </>
                ) : (
                  'Create Assessment Quiz'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
