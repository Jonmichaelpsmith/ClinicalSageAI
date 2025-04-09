
import React from "react";
import { Link } from "wouter";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <a className="font-bold text-xl hover:opacity-80 transition-opacity">
            ModernUI
          </a>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center space-x-6">
        <NavItem href="/">Dashboard</NavItem>
        <NavItem href="/features">Features</NavItem>
        <NavItem href="/docs">Documentation</NavItem>
        <NavItem href="/about">About</NavItem>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="rounded-full w-10 h-10 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          <span className="text-sm font-medium">JD</span>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <a className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {children}
      </a>
    </Link>
  );
}
