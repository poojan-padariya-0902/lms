'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchMyEnrollments } from '@/store/slices/enrollmentsSlice';
import { fetchMyProgress } from '@/store/slices/progressSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  PlayCircle,
  Calendar,
} from 'lucide-react';

export default function MyCoursesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { myEnrollments, loading: enrollmentsLoading } = useAppSelector((state) => state.enrollments);
  const { myProgressList } = useAppSelector((state) => state.progress);
  const { isAuthenticated, isHydrated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
      dispatch(fetchMyProgress());
    } else {
      router.push('/login?redirect=/my-courses');
    }
  }, [dispatch, isAuthenticated, isHydrated, router]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Learning Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.name}! Track your enrolled courses and pick up right where you left off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'student' && (
            <Link href="/become-instructor">
              <Button size="sm" variant="secondary" className="font-semibold text-xs">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5 text-primary" /> Teach on LearnSphere
              </Button>
            </Link>
          )}
          <Link href="/courses">
            <Button variant="outline" size="sm">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Enrollments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {enrollmentsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : myEnrollments.length === 0 ? (
          <div className="col-span-full py-16 text-center border rounded-xl bg-card">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold">You are not enrolled in any courses yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Explore our wide range of professional courses and enroll to jumpstart your career.
            </p>
            <Link href="/courses">
              <Button size="sm" className="mt-4">
                Explore Courses Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          myEnrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            // Count completed lessons for this course from myProgressList
            const completedCount = myProgressList.filter((p) => {
              const courseUuid = typeof p.course === 'object' && p.course !== null ? p.course.uuid : p.course;
              return courseUuid === course.uuid && p.isCompleted;
            }).length;

            return (
              <Card
                key={enrollment.uuid}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border group"
              >
                <div>
                  <div className="h-36 bg-gradient-to-tr from-primary/20 via-primary/10 to-muted flex items-center justify-center p-6 border-b relative">
                    <GraduationCap className="h-14 w-14 text-primary/70 group-hover:scale-105 transition-transform" />
                    <Badge
                      variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="absolute top-3 right-3 text-[10px] tracking-wider uppercase font-semibold"
                    >
                      {enrollment.status}
                    </Badge>
                  </div>

                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Enrolled{' '}
                        {formatDate(enrollment.enrolledAt)}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
                      <Link href={`/learn/${course.uuid}`}>{course.title}</Link>
                    </CardTitle>

                    <CardDescription className="line-clamp-2 text-xs">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-1.5 pt-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Lessons Completed</span>
                      <span className="font-semibold text-foreground">{completedCount} completed</span>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-2">
                  <Link href={`/learn/${course.uuid}`} className="w-full">
                    <Button className="w-full" size="sm">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Continue Learning
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
