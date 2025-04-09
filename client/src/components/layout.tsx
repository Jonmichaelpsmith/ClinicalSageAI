
import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: LayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      <main className="flex-1">{children}</main>
    </div>
  );
}

export function HeaderSection({ children, className }: LayoutProps) {
  return (
    <header className={cn("border-b sticky top-0 z-10 bg-background/95 backdrop-blur-sm", className)}>
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}

export function ContentSection({ children, className }: LayoutProps) {
  return (
    <section className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </section>
  );
}

export function CardGrid({ children, className }: LayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {children}
    </div>
  );
}

export function Footer({ children, className }: LayoutProps) {
  return (
    <footer className={cn("border-t py-6 bg-muted/20", className)}>
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        {children}
      </div>
    </footer>
  );
}
