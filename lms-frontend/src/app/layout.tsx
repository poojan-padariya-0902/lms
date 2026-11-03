import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'LearnSphere — Learn, Teach, Excel',
  description: 'Production-ready Learning Management System for students, instructors, and admins.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ReduxProvider>
          <Suspense fallback={<div className="h-16 border-b bg-background" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">
            <Suspense fallback={<div className="container mx-auto p-8">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
