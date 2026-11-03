'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourses, fetchInstructorCourses, createCourse } from '@/store/slices/coursesSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchCourseEnrollments } from '@/store/slices/enrollmentsSlice';
import { submitChangeRequest } from '@/store/slices/requestsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import {
  PenTool,
  PlusCircle,
  GraduationCap,
  Trash2,
  Loader2,
  ExternalLink,
  Layers,
  Send,
  Users,
  ShieldAlert,
  FolderPlus,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Course, Enrollment } from '@/types';

export default function InstructorDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { courses, loading: coursesLoading } = useAppSelector((state) => state.courses);
  const { categories } = useAppSelector((state) => state.categories);
  const { courseEnrollments, loading: rosterLoading } = useAppSelector((state) => state.enrollments);
  const { user, isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  // Course create state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [categoryUuid, setCategoryUuid] = useState('');

  // Request Publish modal
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedCourseForPublish, setSelectedCourseForPublish] = useState<Course | null>(null);
  const [publishReason, setPublishReason] = useState('');
  const [publishSubmitting, setPublishSubmitting] = useState(false);

  // Request Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourseForDelete, setSelectedCourseForDelete] = useState<Course | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Request Category modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatReason, setNewCatReason] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Student Roster modal
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [selectedCourseForRoster, setSelectedCourseForRoster] = useState<Course | null>(null);

  // Revoke Student modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedEnrollmentForRevoke, setSelectedEnrollmentForRevoke] = useState<Enrollment | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeSubmitting, setRevokeSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/instructor');
      return;
    }
    if (user?.role !== 'instructor' && user?.role !== 'admin') {
      router.push('/courses');
      return;
    }

    if (user.role === 'admin') {
      dispatch(fetchCourses({ page: 1, limit: 100 }));
    } else {
      dispatch(fetchInstructorCourses());
    }
    dispatch(fetchCategories());
  }, [dispatch, isAuthenticated, isHydrated, user, router]);

  const refreshCourses = () => {
    if (user?.role === 'admin') {
      dispatch(fetchCourses({ page: 1, limit: 100 }));
    } else {
      dispatch(fetchInstructorCourses());
    }
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryUuid) {
      toast.error('Please fill in title, description, and select a category');
      return;
    }

    setSubmittingCourse(true);
    try {
      const result = await dispatch(
        createCourse({
          title,
          description,
          price: parseFloat(price) || 0,
          categoryUuid,
        }),
      );

      if (createCourse.fulfilled.match(result)) {
        toast.success(result.payload.message || 'Course draft created successfully!');
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setPrice('0');
        setCategoryUuid('');
        refreshCourses();
      } else {
        toast.error(result.payload || 'Failed to create course');
      }
    } catch {
      toast.error('An error occurred while creating the course');
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Submit Course for Publishing Request
  const handleSubmitPublishRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForPublish || !publishReason.trim()) {
      toast.error('Please provide a genuine reason / readiness checklist');
      return;
    }

    setPublishSubmitting(true);
    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'PUBLISH_COURSE',
          reason: publishReason.trim(),
          details: {
            courseUuid: selectedCourseForPublish.uuid,
            courseTitle: selectedCourseForPublish.title,
            instructorName: user?.name,
          },
        }),
      );

      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Publish request ${result.payload.requestNumber} submitted for Admin review!`);
        setPublishModalOpen(false);
        setPublishReason('');
        refreshCourses();
      } else {
        toast.error(result.payload || 'Failed to submit publish request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setPublishSubmitting(false);
    }
  };

  // Submit Course Deletion Request
  const handleSubmitDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForDelete || !deleteReason.trim()) {
      toast.error('Please provide a genuine reason for course deletion');
      return;
    }

    setDeleteSubmitting(true);
    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'DELETE_COURSE',
          reason: deleteReason.trim(),
          details: {
            courseUuid: selectedCourseForDelete.uuid,
            courseTitle: selectedCourseForDelete.title,
            instructorName: user?.name,
          },
        }),
      );

      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Deletion request ${result.payload.requestNumber} submitted for Admin review!`);
        setDeleteModalOpen(false);
        setDeleteReason('');
      } else {
        toast.error(result.payload || 'Failed to submit deletion request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Submit Request for New Category
  const handleSubmitCategoryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatReason.trim()) {
      toast.error('Please provide category name and a genuine reason');
      return;
    }

    setCatSubmitting(true);
    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'NEW_CATEGORY',
          reason: newCatReason.trim(),
          details: {
            name: newCatName.trim(),
            description: newCatDesc.trim() || undefined,
            instructorName: user?.name,
          },
        }),
      );

      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Category request ${result.payload.requestNumber} submitted to Admin!`);
        setCategoryModalOpen(false);
        setNewCatName('');
        setNewCatDesc('');
        setNewCatReason('');
      } else {
        toast.error(result.payload || 'Failed to submit category request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setCatSubmitting(false);
    }
  };

  // View Roster
  const handleOpenRoster = (course: Course) => {
    setSelectedCourseForRoster(course);
    dispatch(fetchCourseEnrollments(course.uuid));
    setRosterModalOpen(true);
  };

  // Submit Student Access Revocation Request
  const handleSubmitRevokeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentForRevoke || !revokeReason.trim()) {
      toast.error('Please provide a genuine reason for revoking student access');
      return;
    }

    setRevokeSubmitting(true);
    try {
      const result = await dispatch(
        submitChangeRequest({
          type: 'REVOKE_STUDENT',
          reason: revokeReason.trim(),
          details: {
            enrollmentUuid: selectedEnrollmentForRevoke.uuid,
            studentName: selectedEnrollmentForRevoke.student?.name,
            studentEmailMasked: selectedEnrollmentForRevoke.student?.email,
            courseTitle: selectedCourseForRoster?.title,
          },
        }),
      );

      if (submitChangeRequest.fulfilled.match(result)) {
        toast.success(`Student revocation request ${result.payload.requestNumber} submitted to Admin!`);
        setRevokeModalOpen(false);
        setRevokeReason('');
      } else {
        toast.error(result.payload || 'Failed to submit revocation request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setRevokeSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <PenTool className="h-4 w-4" />
            <span>Instructor Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Course Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Author curriculum, publish approved courses, and track enrolled students with privacy safeguards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryModalOpen(true)}
            className="text-xs"
          >
            <FolderPlus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Request New Category
          </Button>

          <Button onClick={() => setCreateModalOpen(true)} className="font-semibold shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Course Draft
          </Button>
        </div>
      </div>

      {/* Courses List */}
      <div className="pt-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          My Author Courses ({courses.length})
        </h2>

        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center border rounded-xl bg-card">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold">No courses created yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Get started by creating your first course draft and building sequential lessons.
            </p>
            <Button onClick={() => setCreateModalOpen(true)} size="sm" className="mt-4">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Create Course Draft
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const status = course.status || 'DRAFT';

              return (
                <Card key={course.uuid} className="flex flex-col justify-between border shadow-sm">
                  <div>
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        {course.category && (
                          <Badge variant="secondary" className="text-xs">
                            {course.category.name}
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30'
                              : status === 'PENDING_APPROVAL'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {status === 'PUBLISHED'
                            ? '● Live in Catalog'
                            : status === 'PENDING_APPROVAL'
                            ? '⏳ Review Pending'
                            : 'Draft'}
                        </Badge>
                      </div>

                      <CardTitle className="text-base font-bold line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.description}
                      </CardDescription>

                      <div className="text-xs font-semibold text-primary pt-1">
                        Price: {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                      </div>
                    </CardHeader>
                  </div>

                  <CardFooter className="pt-2 flex flex-col gap-2 border-t bg-muted/10">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Link href={`/instructor/courses/${course.uuid}/curriculum`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                          <Layers className="h-3.5 w-3.5 mr-1" /> Curriculum
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRoster(course)}
                        className="w-full text-xs"
                      >
                        <Users className="h-3.5 w-3.5 mr-1" /> Student Roster
                      </Button>
                    </div>

                    <div className="flex items-center justify-between w-full pt-1">
                      {status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedCourseForPublish(course);
                            setPublishModalOpen(true);
                          }}
                          className="text-xs font-semibold text-primary"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" /> Submit for Publishing
                        </Button>
                      )}

                      {status === 'PENDING_APPROVAL' && (
                        <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" /> Awaiting Admin Approval
                        </span>
                      )}

                      {status === 'PUBLISHED' && (
                        <Link href={`/courses/${course.uuid}`} target="_blank">
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            <ExternalLink className="h-3 w-3 mr-1" /> View Live Page
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourseForDelete(course);
                          setDeleteModalOpen(true);
                        }}
                        className="text-destructive hover:text-destructive text-xs h-7 ml-auto"
                        title="Request Course Deletion"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Request Deletion
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Create Course Draft */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Course Draft</DialogTitle>
            <DialogDescription>
              Set up course details. Once you author lessons and quizzes, you can submit it for publishing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="e.g. Master Next.js 15 & React 19"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="course-desc">Course Description</Label>
              <Textarea
                id="course-desc"
                placeholder="Overview of learning objectives and key topics covered..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-price">Price (USD)</Label>
                <Input
                  id="course-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="course-category">Category</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setCategoryModalOpen(true);
                    }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    + Request New
                  </button>
                </div>
                <Select
                  value={categoryUuid}
                  onValueChange={(val) => {
                    if (val) setCategoryUuid(val);
                  }}
                >
                  <SelectTrigger id="course-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.uuid} value={cat.uuid}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={submittingCourse}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submittingCourse}>
                {submittingCourse ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  'Save Draft'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Submit for Publishing Request */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Course for Publishing</DialogTitle>
            <DialogDescription>
              Submit your completed course for Administrative review to publish it live to the public catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPublishRequest} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
              <p className="font-semibold text-foreground">{selectedCourseForPublish?.title}</p>
              <p className="text-muted-foreground">Status: DRAFT → PENDING APPROVAL</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="publish-reason">
                Genuine Reason & Readiness Checklist (Mandatory)
              </Label>
              <Textarea
                id="publish-reason"
                placeholder="State why this course is ready (e.g. All 10 video lectures recorded, final assessment quiz authored, prerequisites verified)..."
                rows={4}
                value={publishReason}
                onChange={(e) => setPublishReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPublishModalOpen(false)}
                disabled={publishSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={publishSubmitting}>
                {publishSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Publish Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Request Course Deletion */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Request Course Deletion
            </DialogTitle>
            <DialogDescription>
              To protect enrolled students from abrupt content loss, course deletions require Admin approval with a genuine reason.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitDeleteRequest} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-destructive/10 text-xs border border-destructive/20">
              <p className="font-bold text-destructive">{selectedCourseForDelete?.title}</p>
              <p className="text-muted-foreground mt-0.5">
                Target UUID: {selectedCourseForDelete?.uuid}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delete-reason">
                Genuine Reason for Deletion (Mandatory)
              </Label>
              <Textarea
                id="delete-reason"
                placeholder="Detail why this course must be removed (e.g. Content outdated, replaced with newer edition, deprecation notice given)..."
                rows={4}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={deleteSubmitting}>
                {deleteSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Deletion Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Request New Category */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request New Taxonomy Category</DialogTitle>
            <DialogDescription>
              Suggest a missing subject category. The Admin will review and provision it globally.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCategoryRequest} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-cat-name">Category Name</Label>
              <Input
                id="new-cat-name"
                placeholder="e.g. DevOps & Infrastructure"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-cat-desc">Description (Optional)</Label>
              <Input
                id="new-cat-desc"
                placeholder="Brief summary of topics covered"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-cat-reason">Genuine Reason (Mandatory)</Label>
              <Textarea
                id="new-cat-reason"
                placeholder="Explain why this category is required (e.g. Preparing 3 specialized courses on Docker and Terraform)..."
                rows={3}
                value={newCatReason}
                onChange={(e) => setNewCatReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                disabled={catSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={catSubmitting}>
                {catSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Category Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Student Roster View (With Privacy Masked Emails) */}
      <Dialog open={rosterModalOpen} onOpenChange={setRosterModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Enrolled Student Roster
            </DialogTitle>
            <DialogDescription>
              {selectedCourseForRoster?.title} • Student contact emails are privacy-masked for security.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {rosterLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : courseEnrollments.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border rounded-lg">
                No students enrolled in this course yet.
              </div>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden">
                {courseEnrollments.map((enr) => (
                  <div
                    key={enr.uuid}
                    className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {enr.student?.name || 'Enrolled Student'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono">{enr.student?.email}</span>
                        <span>•</span>
                        <span>
                          Enrolled{' '}
                          {formatDate(enr.enrolledAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={enr.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {enr.status}
                      </Badge>

                      {enr.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEnrollmentForRevoke(enr);
                            setRevokeModalOpen(true);
                          }}
                          className="text-xs text-destructive hover:text-destructive h-7"
                          title="Report misconduct / Request revocation"
                        >
                          <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRosterModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 6: Request Student Access Revocation */}
      <Dialog open={revokeModalOpen} onOpenChange={setRevokeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Request Student Access Revocation
            </DialogTitle>
            <DialogDescription>
              Student access cannot be revoked unilaterally. State the genuine grounds for removal for Admin review.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRevokeRequest} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
              <p className="font-semibold text-foreground">
                Student: {selectedEnrollmentForRevoke?.student?.name}
              </p>
              <p className="text-muted-foreground font-mono">
                Email: {selectedEnrollmentForRevoke?.student?.email}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="revoke-reason">
                Genuine Grounds / Reason (Mandatory)
              </Label>
              <Textarea
                id="revoke-reason"
                placeholder="Describe reason (e.g. Academic cheating on exam, abusive conduct in comments, direct chargeback requested)..."
                rows={4}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRevokeModalOpen(false)}
                disabled={revokeSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={revokeSubmitting}>
                {revokeSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Revocation Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
