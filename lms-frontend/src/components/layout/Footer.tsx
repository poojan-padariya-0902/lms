'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground mt-auto">
      <div className="container mx-auto px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span>LearnSphere</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Modern learning management platform empowering students to gain in-demand skills and instructors to share knowledge.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/my-courses" className="hover:text-primary transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="hover:text-primary transition-colors">
                  Instructor Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Account</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Platform</h4>
            <p className="text-xs text-muted-foreground">
              Built with Next.js 15, Tailwind CSS, Redux Toolkit, and NestJS.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© 2026 LearnSphere LMS. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Production LMS Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
