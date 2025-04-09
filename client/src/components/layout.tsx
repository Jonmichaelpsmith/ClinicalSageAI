import React from "react";
import { cn } from "@/lib/utils";

/**
 * Layout component props interface
 */
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page container wrapping the entire page
 */
export function PageContainer({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      {children}
    </div>
  );
}

/**
 * Header section for the hero/banner area
 */
export function HeaderSection({ children, className }: LayoutProps) {
  return (
    <header className={cn("w-full bg-white dark:bg-gray-950", className)}>
      {children}
    </header>
  );
}

/**
 * Content section for page body content
 */
export function ContentSection({ children, className }: LayoutProps) {
  return (
    <section className={cn("w-full", className)}>
      {children}
    </section>
  );
}

/**
 * Grid layout for cards
 */
export function CardGrid({ children, className }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
}

/**
 * Footer component
 */
export function Footer({ children, className }: LayoutProps) {
  return (
    <footer className={cn("w-full bg-white dark:bg-gray-950", className)}>
      {children}
    </footer>
  );
}