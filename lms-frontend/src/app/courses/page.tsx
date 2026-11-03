'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCourses, fetchCoursesByCategory } from '@/store/slices/coursesSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const selectedCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [, startTransition] = useTransition();

  const { courses, pagination, loading: coursesLoading } = useAppSelector((state) => state.courses);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchCoursesByCategory({ categoryUuid: selectedCategory, page: currentPage, limit: 9 }));
    } else {
      dispatch(fetchCourses({ page: currentPage, limit: 9, search: initialSearch || undefined }));
    }
  }, [dispatch, selectedCategory, currentPage, initialSearch]);

  const handleCategoryChange = (categoryUuid: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryUuid) {
      params.set('category', categoryUuid);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/courses?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`/courses?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`/courses?${params.toString()}`);
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Course Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and enroll in top-rated courses taught by industry professionals
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
        <Button
          variant={!selectedCategory ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange('')}
          className="rounded-full text-xs"
        >
          All Courses
        </Button>
        {categoriesLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
          : categories.map((cat) => (
              <Button
                key={cat.uuid}
                variant={selectedCategory === cat.uuid ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(cat.uuid)}
                className="rounded-full text-xs whitespace-nowrap"
              >
                {cat.name}
              </Button>
            ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {coursesLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border">
              <Skeleton className="h-44 w-full" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full py-16 text-center border rounded-xl bg-card">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {initialSearch
                ? `No courses matching "${initialSearch}". Try a different search term or category.`
                : 'There are no courses matching the selected filters right now.'}
            </p>
            {(selectedCategory || initialSearch) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/courses');
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          courses.map((course) => (
            <Card
              key={course.uuid}
              className="flex flex-col justify-between hover:shadow-md transition-all border group"
            >
              <div>
                <div className="h-44 bg-gradient-to-tr from-primary/15 via-primary/5 to-muted flex items-center justify-center p-6 border-b relative">
                  <GraduationCap className="h-16 w-16 text-primary/60 group-hover:scale-105 transition-transform" />
                  <span className="absolute top-3 right-3 font-bold text-sm bg-background/90 backdrop-blur px-2.5 py-1 rounded-md border shadow-sm text-primary">
                    {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                  </span>
                </div>

                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    {course.category && (
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {course.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    <Link href={`/courses/${course.uuid}`}>{course.title}</Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>
              </div>

              <CardFooter className="pt-2">
                <Link href={`/courses/${course.uuid}`} className="w-full">
                  <Button className="w-full" size="sm">
                    View Course <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t mt-12 pt-6">
          <p className="text-xs text-muted-foreground">
            Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> ({pagination.total} total courses)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
