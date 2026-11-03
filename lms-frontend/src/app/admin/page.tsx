'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCategories, createCategory, deleteCategory } from '@/store/slices/categoriesSlice';
import { fetchUsers, createUser, deleteUser } from '@/store/slices/usersSlice';
import { fetchCourses } from '@/store/slices/coursesSlice';
import { fetchAllRequests, reviewChangeRequest } from '@/store/slices/requestsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Layers,
  Users as UsersIcon,
  GraduationCap,
  PlusCircle,
  Trash2,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Role, ChangeRequest } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { users, loading: usersLoading } = useAppSelector((state) => state.users);
  const { courses } = useAppSelector((state) => state.courses);
  const { allRequests, loading: requestsLoading } = useAppSelector((state) => state.requests);
  const { user, isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  // Review request modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Category modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // User modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<Role>('student');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (user?.role !== 'admin') {
      router.push('/courses');
      return;
    }

    dispatch(fetchCategories());
    dispatch(fetchUsers({ page: 1, limit: 50 }));
    dispatch(fetchCourses({ page: 1, limit: 50 }));
    dispatch(fetchAllRequests());
  }, [dispatch, isAuthenticated, isHydrated, user, router]);

  const pendingRequestsCount = allRequests.filter((r) => r.status === 'PENDING').length;

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const result = await dispatch(
        reviewChangeRequest({
          uuid: selectedRequest.uuid,
          status,
          adminFeedback: adminFeedback.trim() || undefined,
        }),
      );

      if (reviewChangeRequest.fulfilled.match(result)) {
        toast.success(`Request ${selectedRequest.requestNumber} has been ${status.toLowerCase()}!`);
        setReviewModalOpen(false);
        setAdminFeedback('');
        dispatch(fetchAllRequests());
        dispatch(fetchUsers({ page: 1, limit: 50 }));
        dispatch(fetchCategories());
        dispatch(fetchCourses({ page: 1, limit: 50 }));
      } else {
        toast.error(result.payload || 'Failed to review request');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) {
      toast.error('Category name is required');
      return;
    }

    setCategorySubmitting(true);
    try {
      const result = await dispatch(
        createCategory({
          name: catName.trim(),
          description: catDesc.trim() || undefined,
        }),
      );

      if (createCategory.fulfilled.match(result)) {
        toast.success(result.payload.message || 'Category created');
        setCategoryModalOpen(false);
        setCatName('');
        setCatDesc('');
        dispatch(fetchCategories());
      } else {
        toast.error(result.payload || 'Failed to create category');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const result = await dispatch(deleteCategory(uuid));
      if (deleteCategory.fulfilled.match(result)) {
        toast.success('Category deleted');
      } else {
        toast.error(result.payload || 'Failed to delete category');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !userPassword) {
      toast.error('Please fill in name, email, and password');
      return;
    }

    setUserSubmitting(true);
    try {
      const result = await dispatch(
        createUser({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
        }),
      );

      if (createUser.fulfilled.match(result)) {
        toast.success(result.payload.message || 'User registered successfully');
        setUserModalOpen(false);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        dispatch(fetchUsers({ page: 1, limit: 50 }));
      } else {
        toast.error(result.payload || 'Failed to create user');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (uuid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const result = await dispatch(deleteUser(uuid));
      if (deleteUser.fulfilled.match(result)) {
        toast.success('User deleted');
      } else {
        toast.error(result.payload || 'Failed to delete user');
      }
    } catch {
      toast.error('An error occurred');
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="h-4 w-4" />
            <span>Admin Oversight</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Platform Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global management for change requests, taxonomies, users, and catalog safety.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 py-6">
        <Card className="border shadow-sm border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-600 uppercase">Pending Requests</CardTitle>
            <Inbox className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{pendingRequestsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Requiring administrative decision</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{courses.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Live and draft courses</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Categories</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{categories.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Active taxonomy subjects</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Registered Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">{users.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Students, instructors, admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full sm:w-[460px] grid-cols-3">
          <TabsTrigger value="requests" className="relative">
            Change Requests
            {pendingRequestsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="categories">Categories ({categories.length})</TabsTrigger>
          <TabsTrigger value="users">User Directory ({users.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Change Requests Queue */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Change Requests & Applications</h2>
              <p className="text-xs text-muted-foreground">
                Review submitted requests with genuine justifications before executing platform changes.
              </p>
            </div>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="divide-y">
              {requestsLoading ? (
                <div className="p-6 text-xs text-muted-foreground">Loading change requests...</div>
              ) : allRequests.length === 0 ? (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  <FileCheck className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
                  No pending change requests or instructor applications.
                </div>
              ) : (
                allRequests.map((req) => (
                  <div
                    key={req.uuid}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border">
                          {req.requestNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {req.type.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-bold uppercase ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : req.status === 'REJECTED'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {req.status}
                        </Badge>
                      </div>

                      <p className="text-sm font-semibold text-foreground">
                        {req.requester?.name || 'User'} ({req.requester?.email})
                      </p>

                      <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">
                        Reason: &quot;{req.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Button
                        size="sm"
                        variant={req.status === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedRequest(req);
                          setAdminFeedback(req.adminFeedback || '');
                          setReviewModalOpen(true);
                        }}
                        className="text-xs font-semibold"
                      >
                        {req.status === 'PENDING' ? 'Review & Decide' : 'View Details'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Categories */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Course Categories</h2>
            <Button size="sm" onClick={() => setCategoryModalOpen(true)}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Category
            </Button>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="divide-y">
              {categoriesLoading ? (
                <div className="p-4 text-xs text-muted-foreground">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No categories created yet.
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.uuid}
                    className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.description || 'No description provided'}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(cat.uuid)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">User Directory</h2>
            <Button size="sm" onClick={() => setUserModalOpen(true)}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Create User
            </Button>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <div className="divide-y">
              {usersLoading ? (
                <div className="p-4 text-xs text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No users found.</div>
              ) : (
                users.map((u) => (
                  <div
                    key={u.uuid}
                    className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{u.name}</span>
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {u.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>

                    {u.uuid !== user?.uuid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(u.uuid)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Review & Decide Request */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border">
                {selectedRequest?.requestNumber}
              </span>
              <Badge variant="outline" className="text-xs uppercase">
                {selectedRequest?.type.replace('_', ' ')}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold pt-1">Review Change Request</DialogTitle>
            <DialogDescription>
              Requested by {selectedRequest?.requester?.name} ({selectedRequest?.requester?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-lg bg-muted/40 border space-y-2 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground block mb-0.5">
                  Stated Genuine Reason:
                </span>
                <p className="text-foreground leading-relaxed bg-background p-2.5 rounded border font-medium">
                  {selectedRequest?.reason}
                </p>
              </div>

              {selectedRequest?.details && Object.keys(selectedRequest.details).length > 0 && (
                <div>
                  <span className="font-semibold text-muted-foreground block mb-0.5">Details:</span>
                  <div className="grid grid-cols-2 gap-2 bg-background p-2 rounded border">
                    {Object.entries(selectedRequest.details).map(([key, val]) => (
                      <div key={key} className="truncate">
                        <span className="font-medium text-muted-foreground capitalize">{key}: </span>
                        <span>{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-feedback">Admin Notes & Feedback (Optional)</Label>
              <Textarea
                id="admin-feedback"
                placeholder="Optional notes or feedback sent to the requester upon decision..."
                rows={3}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            {selectedRequest?.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleReviewAction('REJECTED')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject Request
                </Button>
                <Button
                  type="button"
                  onClick={() => handleReviewAction('APPROVED')}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve & Execute
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Create Category */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Course Category</DialogTitle>
            <DialogDescription>Define a new taxonomy category for course indexing.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Web Development"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description (Optional)</Label>
              <Textarea
                id="cat-desc"
                placeholder="Topics and skills covered under this category..."
                rows={3}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
                disabled={categorySubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={categorySubmitting}>
                {categorySubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Create User */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Provision an account with custom role authorization.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Full Name</Label>
              <Input
                id="u-name"
                placeholder="Jane Smith"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email Address</Label>
              <Input
                id="u-email"
                type="email"
                placeholder="jane@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-pass">Password</Label>
              <Input
                id="u-pass"
                type="password"
                placeholder="••••••••"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="u-role">Role</Label>
              <Select
                value={userRole}
                onValueChange={(val) => {
                  if (val) setUserRole(val as Role);
                }}
              >
                <SelectTrigger id="u-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserModalOpen(false)}
                disabled={userSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={userSubmitting}>
                {userSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Provisioning...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
