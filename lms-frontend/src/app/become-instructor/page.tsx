'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { submitChangeRequest, fetchMyRequests } from '@/store/slices/requestsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import {
  PenTool,
  Clock,
  CheckCircle2,
  Copy,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeInstructorPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const { myRequests, loading, submitting } = useAppSelector((state) => state.requests);

  const [headline, setHeadline] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experienceReason, setExperienceReason] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/become-instructor');
      return;
    }
    if (user?.role === 'instructor' || user?.role === 'admin') {
      router.push('/instructor');
      return;
    }

    dispatch(fetchMyRequests());
  }, [dispatch, isAuthenticated, isHydrated, user, router]);

  // Find latest instructor application
  const existingApp = myRequests.find((r) => r.type === 'BECOME_INSTRUCTOR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline || !expertise || !experienceReason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (experienceReason.trim().length < 15) {
      toast.error('Please provide a more detailed genuine reason (at least 15 characters)');
      return;
    }

    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'BECOME_INSTRUCTOR',
          reason: experienceReason.trim(),
          details: {
            headline: headline.trim(),
            expertise: expertise.trim(),
            portfolioUrl: portfolioUrl.trim() || undefined,
            applicantName: user?.name,
            applicantEmail: user?.email,
          },
        }),
      );

      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Application ${result.payload.requestNumber} submitted successfully!`);
        dispatch(fetchMyRequests());
      } else {
        toast.error(result.payload || 'Failed to submit application');
      }
    } catch {
      toast.error('An unexpected error occurred while submitting');
    }
  };

  const copyTrackingNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Application number ${num} copied to clipboard!`);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {/* Existing Application Tracking View */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : existingApp && existingApp.status !== 'REJECTED' ? (
        <Card className="border shadow-lg">
          <CardHeader className="text-center space-y-2 border-b bg-muted/20 pb-6">
            <div className="flex justify-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${
                  existingApp.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40'
                }`}
              >
                {existingApp.status === 'APPROVED' ? (
                  <CheckCircle2 className="h-8 w-8" />
                ) : (
                  <Clock className="h-8 w-8" />
                )}
              </div>
            </div>

            <CardTitle className="text-2xl font-bold tracking-tight">
              {existingApp.status === 'APPROVED'
                ? 'Instructor Application Approved!'
                : 'Instructor Application Under Review'}
            </CardTitle>

            <CardDescription className="text-xs">
              {existingApp.status === 'APPROVED'
                ? 'Your credentials have been validated by our academic administrators.'
                : 'Our administrative committee is reviewing your background and proposed curriculum.'}
            </CardDescription>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background text-xs font-mono font-bold shadow-xs">
                <span>Application No: {existingApp.requestNumber}</span>
                <button
                  type="button"
                  onClick={() => copyTrackingNumber(existingApp.requestNumber)}
                  className="p-1 hover:text-primary transition-colors"
                  title="Copy Tracking ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <div className="p-4 rounded-xl bg-muted/30 border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Status</span>
                <Badge
                  variant={existingApp.status === 'APPROVED' ? 'default' : 'secondary'}
                  className={`font-bold uppercase tracking-wider ${
                    existingApp.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-amber-600'
                  }`}
                >
                  {existingApp.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Subject & Expertise</span>
                <span className="text-foreground font-medium">
                  {typeof existingApp.details?.expertise === 'string'
                    ? existingApp.details.expertise
                    : 'Course Curriculum'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Submitted On</span>
                <span className="text-foreground">
                  {formatDate(existingApp.createdAt)}
                </span>
              </div>
              {existingApp.adminFeedback && (
                <div className="pt-2 border-t mt-2">
                  <span className="font-semibold text-muted-foreground block mb-1">Admin Feedback:</span>
                  <p className="text-foreground italic bg-background p-2.5 rounded border">
                    &quot;{existingApp.adminFeedback}&quot;
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t flex flex-col sm:flex-row justify-between gap-3">
            <Link href="/my-courses" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                Back to My Learning
              </Button>
            </Link>

            {existingApp.status === 'APPROVED' && (
              <Link href="/instructor" className="w-full sm:w-auto">
                <Button size="sm" className="w-full font-semibold">
                  <PenTool className="mr-1.5 h-4 w-4" /> Open Instructor Studio
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ) : (
        /* Application Submission Form */
        <Card className="border shadow-lg">
          <CardHeader className="space-y-2 text-center pb-6 border-b">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Apply to Become an Instructor
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-xs leading-relaxed">
              Share your skills, author world-class curriculum, and teach learners worldwide on LearnSphere.
            </CardDescription>

            {existingApp && existingApp.status === 'REJECTED' && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive text-left mt-3">
                <p className="font-bold">Previous Application ({existingApp.requestNumber}) was Declined</p>
                {existingApp.adminFeedback && (
                  <p className="mt-1 text-[11px]">&quot;{existingApp.adminFeedback}&quot;</p>
                )}
                <p className="mt-1 text-[11px] font-medium">
                  Please update your qualifications and submit a revised application below.
                </p>
              </div>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="applicant-name">Full Name</Label>
                  <Input id="applicant-name" value={user?.name || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="applicant-email">Email Address</Label>
                  <Input id="applicant-email" value={user?.email || ''} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g. Senior Cloud Architect & Kubernetes Specialist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expertise">Target Subject Area & Proposed Course</Label>
                <Input
                  id="expertise"
                  placeholder="e.g. Production Docker & Microservices for Developers"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="experienceReason">
                  Genuine Reason & Qualifications
                  <span className="text-xs text-muted-foreground ml-1 font-normal">
                    (Why do you want to teach? Describe your relevant experience)
                  </span>
                </Label>
                <Textarea
                  id="experienceReason"
                  placeholder="Detail your professional experience, previous teaching or mentoring background, and why this curriculum will benefit students..."
                  rows={4}
                  value={experienceReason}
                  onChange={(e) => setExperienceReason(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="portfolioUrl">Portfolio or LinkedIn Profile (Optional)</Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/... or https://github.com/..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              <div className="rounded-lg bg-muted/40 p-3 border text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Administrative Quality Review</span>
                </div>
                <p>
                  Upon submission, you will receive an <strong>Application Tracking Number</strong>. Our review board verifies credentials before granting instructor publishing privileges.
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex flex-col sm:flex-row justify-between gap-3 border-t">
              <Link href="/my-courses" className="w-full sm:w-auto">
                <Button type="button" variant="ghost" size="sm" className="w-full">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto font-semibold">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Instructor Application <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
