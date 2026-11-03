'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchQuizByCourse, submitQuiz, clearLastSubmissionResult } from '@/store/slices/quizzesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CourseQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseUuid = params.courseUuid as string;

  const dispatch = useAppDispatch();
  const { currentQuiz, lastSubmissionResult, loading, submitting } = useAppSelector(
    (state) => state.quizzes,
  );
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [resultModalOpen, setResultModalOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/learn/${courseUuid}/quiz`);
      return;
    }
    if (courseUuid) {
      dispatch(fetchQuizByCourse(courseUuid));
      dispatch(clearLastSubmissionResult());
    }
  }, [dispatch, courseUuid, isAuthenticated, isHydrated, router]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    const totalQuestions = currentQuiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    if (answeredCount < totalQuestions) {
      toast.error(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    // Convert map to ordered answers array
    const orderedAnswers: number[] = [];
    for (let i = 0; i < totalQuestions; i++) {
      orderedAnswers.push(selectedAnswers[i]);
    }

    try {
      const resultAction = await dispatch(
        submitQuiz({
          quizUuid: currentQuiz.uuid,
          selectedAnswers: orderedAnswers,
        }),
      );

      if (submitQuiz.fulfilled.match(resultAction)) {
        setResultModalOpen(true);
      } else {
        toast.error(resultAction.payload || 'Failed to submit quiz');
      }
    } catch {
      toast.error('An error occurred while scoring your quiz');
    }
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    dispatch(clearLastSubmissionResult());
    setResultModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
        <h2 className="text-xl font-bold">No Quiz Available</h2>
        <p className="text-xs text-muted-foreground mt-1">
          There is no assessment configured for this course yet.
        </p>
        <Link href={`/learn/${courseUuid}`}>
          <Button size="sm" className="mt-4">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Lessons
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Quiz Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b mb-6">
        <Link href={`/learn/${courseUuid}`}>
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Course
          </Button>
        </Link>

        <Badge variant="outline" className="text-xs">
          Passing Score: {currentQuiz.passingScorePercentage}%
        </Badge>
      </div>

      {/* Quiz Title Card */}
      <div className="border rounded-xl p-6 bg-card space-y-2 mb-8 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          <HelpCircle className="h-4 w-4" />
          <span>Course Assessment</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">{currentQuiz.title}</h1>
        {currentQuiz.description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-1">
            {currentQuiz.description}
          </p>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {currentQuiz.questions.map((q, qIdx) => {
          const selectedOption = selectedAnswers[qIdx];

          return (
            <Card key={qIdx} className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Question {qIdx + 1} of {currentQuiz.questions.length}</span>
                  {selectedOption !== undefined && (
                    <Badge variant="secondary" className="text-[10px] text-emerald-600 font-semibold">
                      Answered
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-1">
                  {q.questionText}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;

                  return (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary'
                          : 'hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit Button Bar */}
      <div className="sticky bottom-4 mt-8 p-4 rounded-xl border bg-background/95 backdrop-blur shadow-lg flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {Object.keys(selectedAnswers).length} of {currentQuiz.questions.length} questions answered
        </span>

        <Button
          onClick={handleSubmitQuiz}
          disabled={submitting}
          size="lg"
          className="font-semibold shadow-md"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Auto-Grading...
            </>
          ) : (
            'Submit Assessment'
          )}
        </Button>
      </div>

      {/* Instant Result Modal */}
      {lastSubmissionResult && (
        <Dialog open={resultModalOpen} onOpenChange={setResultModalOpen}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <div className="flex justify-center mb-2">
                {lastSubmissionResult.isPassed ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40">
                    <Trophy className="h-8 w-8" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <XCircle className="h-8 w-8" />
                  </div>
                )}
              </div>

              <DialogTitle className="text-2xl font-bold">
                {lastSubmissionResult.isPassed ? 'Congratulations! You Passed!' : 'Assessment Not Passed'}
              </DialogTitle>

              <DialogDescription className="text-xs">
                {lastSubmissionResult.isPassed
                  ? `You achieved ${lastSubmissionResult.scorePercentage}% score and met the passing criteria.`
                  : `You scored ${lastSubmissionResult.scorePercentage}%. The required passing score is ${currentQuiz.passingScorePercentage}%.`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="p-4 rounded-lg bg-muted/40 border">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Final Exam Score
                </span>
                <p className="text-4xl font-extrabold text-foreground mt-1">
                  {lastSubmissionResult.scorePercentage}%
                </p>
                {lastSubmissionResult.correctAnswers !== undefined &&
                  lastSubmissionResult.totalQuestions !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {lastSubmissionResult.correctAnswers} of {lastSubmissionResult.totalQuestions} questions correct
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleRetakeQuiz} className="w-full sm:w-auto">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retake Exam
              </Button>
              <Button
                onClick={() => router.push(`/learn/${courseUuid}`)}
                className="w-full sm:w-auto"
              >
                Return to Course <CheckCircle2 className="h-3.5 w-3.5 ml-1" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
