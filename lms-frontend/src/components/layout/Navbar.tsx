'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Shield,
  PenTool,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useIsMounted();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const showAuth = mounted && isHydrated && isAuthenticated && !!user;

  const getLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return `flex items-center gap-1.5 transition-colors font-medium text-sm ${
      isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
    }`;
  };

  const getMobileLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return `flex items-center text-sm font-medium py-2 px-1 rounded transition-colors ${
      isActive ? 'text-primary font-semibold bg-primary/5' : 'text-foreground hover:text-primary'
    }`;
  };

  const renderRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:text-amber-400">
            Admin
          </Badge>
        );
      case 'instructor':
        return (
          <Badge className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold bg-primary/10 text-primary border border-primary/20">
            Instructor
          </Badge>
        );
      case 'student':
      default:
        return (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider py-0 px-2 font-semibold">
            Student
          </Badge>
        );
    }
  };

  const getBrandHref = () => {
    if (!showAuth) return '/';
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'instructor':
        return '/instructor';
      case 'student':
        return '/my-courses';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href={getBrandHref()}
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary transition-opacity hover:opacity-90"
          title={showAuth ? `Go to ${user?.role} dashboard` : 'LearnSphere Home'}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span>LearnSphere</span>
        </Link>

        {/* Desktop Navigation — Strictly Role-Based */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {showAuth ? (
            <>
              {/* STUDENT ROLE LINKS */}
              {user.role === 'student' && (
                <>
                  <Link href="/courses" className={getLinkClass('/courses')}>
                    <BookOpen className="h-4 w-4" />
                    <span>Explore Courses</span>
                  </Link>
                  <Link href="/my-courses" className={getLinkClass('/my-courses')}>
                    <GraduationCap className="h-4 w-4" />
                    <span>My Learning</span>
                  </Link>
                  <Link href="/become-instructor" className={getLinkClass('/become-instructor')}>
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Become an Instructor</span>
                  </Link>
                </>
              )}

              {/* INSTRUCTOR ROLE LINKS */}
              {user.role === 'instructor' && (
                <>
                  <Link href="/instructor" className={getLinkClass('/instructor')}>
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span>Instructor Studio</span>
                  </Link>
                  <Link href="/courses" className={getLinkClass('/courses')}>
                    <BookOpen className="h-4 w-4" />
                    <span>Course Catalog</span>
                  </Link>
                </>
              )}

              {/* ADMIN ROLE LINKS */}
              {user.role === 'admin' && (
                <>
                  <Link href="/admin" className={getLinkClass('/admin')}>
                    <Shield className="h-4 w-4 text-amber-500" />
                    <span>Admin Management</span>
                  </Link>
                  <Link href="/courses" className={getLinkClass('/courses')}>
                    <BookOpen className="h-4 w-4" />
                    <span>Audit Courses</span>
                  </Link>
                </>
              )}
            </>
          ) : (
            /* GUEST / PUBLIC LINKS */
            <>
              <Link href="/courses" className={getLinkClass('/courses')}>
                <BookOpen className="h-4 w-4" />
                <span>Courses</span>
              </Link>
              <Link href="/become-instructor" className={getLinkClass('/become-instructor')}>
                <PenTool className="h-4 w-4" />
                <span>Teach on LearnSphere</span>
              </Link>
            </>
          )}
        </nav>

        {/* Auth / Profile Area */}
        <div className="hidden md:flex items-center gap-3">
          {showAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border bg-background hover:bg-muted text-sm font-medium cursor-pointer transition-colors outline-none">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {user.name ? user.name[0]?.toUpperCase() : <UserIcon className="h-3.5 w-3.5" />}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                {renderRoleBadge(user.role)}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                {/* ROLE-SPECIFIC DROPDOWN ITEMS */}
                {user.role === 'student' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push('/my-courses')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span>My Enrolled Courses</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/courses')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Browse Catalog</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/become-instructor')}
                      className="flex items-center gap-2 cursor-pointer text-primary"
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>Become an Instructor</span>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === 'instructor' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push('/instructor')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>Instructor Studio</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/courses')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Public Catalog</span>
                    </DropdownMenuItem>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/admin')}
                      className="flex items-center gap-2 cursor-pointer text-muted-foreground"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Review Requests Queue</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/courses')}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Audit Live Courses</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu drawer — Strictly Role-Based */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background">
          {showAuth ? (
            <>
              {/* STUDENT MOBILE LINKS */}
              {user.role === 'student' && (
                <>
                  <Link
                    href="/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/courses')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-primary" /> Explore Courses
                  </Link>
                  <Link
                    href="/my-courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/my-courses')}
                  >
                    <GraduationCap className="h-4 w-4 mr-2 text-primary" /> My Learning
                  </Link>
                  <Link
                    href="/become-instructor"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/become-instructor')}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-primary" /> Become an Instructor
                  </Link>
                </>
              )}

              {/* INSTRUCTOR MOBILE LINKS */}
              {user.role === 'instructor' && (
                <>
                  <Link
                    href="/instructor"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/instructor')}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2 text-primary" /> Instructor Studio
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/courses')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" /> Course Catalog
                  </Link>
                </>
              )}

              {/* ADMIN MOBILE LINKS */}
              {user.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/admin')}
                  >
                    <Shield className="h-4 w-4 mr-2 text-amber-500" /> Admin Management
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getMobileLinkClass('/courses')}
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" /> Audit Courses
                  </Link>
                </>
              )}
            </>
          ) : (
            /* GUEST MOBILE LINKS */
            <>
              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkClass('/courses')}
              >
                <BookOpen className="h-4 w-4 mr-2 text-primary" /> Courses
              </Link>
              <Link
                href="/become-instructor"
                onClick={() => setMobileMenuOpen(false)}
                className={getMobileLinkClass('/become-instructor')}
              >
                <PenTool className="h-4 w-4 mr-2 text-primary" /> Teach on LearnSphere
              </Link>
            </>
          )}

          <div className="pt-3 border-t">
            {showAuth ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>{user.name}</span>
                  {renderRoleBadge(user.role)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
