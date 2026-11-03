'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourses } from '@/store/slices/coursesSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { courses, loading: coursesLoading } = useAppSelector((state) => state.courses);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const mounted = useIsMounted();

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 6 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-xs font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next-Generation Learning Management System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Master new skills with <span className="text-primary">world-class</span> online courses.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore hands-on curriculum, interactive quizzes, video tutorials, and verified certificates designed by experienced instructors.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" className="h-12 px-6 text-base font-semibold shadow-md">
                  Explore Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {(!mounted || !isAuthenticated) && (
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-12 px-6 text-base font-semibold">
                    Sign Up for Free
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t max-w-lg mx-auto text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Self-Paced</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Interactive</p>
                <p className="text-xs text-muted-foreground mt-0.5">Quizzes & Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">Certificates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 border-y bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Explore by Category</h2>
              <p className="text-xs text-muted-foreground">Pick a subject and start learning right away</p>
            </div>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-xs">
                View all categories <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))
            ) : categories.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                No categories available yet.
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.uuid}
                  href={`/courses?category=${category.uuid}`}
                  className="group flex flex-col justify-between p-4 rounded-lg border bg-card hover:border-primary/50 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Compass className="h-4 w-4" />
                    <span className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">
                    {category.description || 'Explore courses'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Featured Courses</h2>
              <p className="text-sm text-muted-foreground">Top-rated curriculum chosen by learners worldwide</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                Browse Full Catalog <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
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
            ) : courses.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-card">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
                <p className="text-base font-medium">No courses published yet</p>
                <p className="text-xs text-muted-foreground mt-1">Check back later or register as an instructor to build courses.</p>
              </div>
            ) : (
              courses.map((course) => (
                <Card key={course.uuid} className="flex flex-col justify-between hover:shadow-md transition-shadow border">
                  <div>
                    <div className="h-40 bg-gradient-to-tr from-primary/20 via-primary/10 to-muted flex items-center justify-center p-6 border-b">
                      <GraduationCap className="h-14 w-14 text-primary/70" />
                    </div>
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        {course.category && (
                          <Badge variant="outline" className="text-xs">
                            {course.category.name}
                          </Badge>
                        )}
                        <span className="font-bold text-lg text-primary">
                          {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1 hover:text-primary transition-colors">
                        <Link href={`/courses/${course.uuid}`}>{course.title}</Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardFooter className="pt-2">
                    <Link href={`/courses/${course.uuid}`} className="w-full">
                      <Button className="w-full" size="sm">
                        View Course Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Why Learn on LearnSphere?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Engineered with modern educational tooling to maximize knowledge retention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border bg-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Track Real-Time Progress</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Step-by-step curriculum checkpoints and dynamic progress bars show exactly how close you are to graduation.
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Graded Quizzes & Assessments</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reinforce what you learn with auto-graded multiple-choice quizzes that provide immediate scoring and feedback.
              </p>
            </div>

            <div className="p-6 rounded-xl border bg-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Verified Peer Reviews</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Read authentic ratings and reviews from fellow enrolled students to choose the best curriculum for your goals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
