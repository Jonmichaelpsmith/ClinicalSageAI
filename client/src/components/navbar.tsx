import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, X, ChevronDown, Database, 
  LayoutDashboard, FileText, BarChart2, 
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [location] = useLocation();

  return (
    <nav className="container px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Database className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">TrialSage</span>
            </div>
          </Link>
          <div className="hidden md:flex space-x-2">
            <NavItem href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </NavItem>
            <NavItem href="/reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </NavItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 flex items-center gap-1 -my-2">
                  <span>AI Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/use-cases" className="w-full cursor-pointer">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" /> 
                      Use Case Library
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/analytics" className="w-full cursor-pointer">
                    <div className="flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2" /> 
                      Analytics
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/translation" className="w-full cursor-pointer">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" /> 
                      Translation
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <Link href="/upload">
            <Button variant="outline" size="sm" className="h-9 shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Upload CSR
            </Button>
          </Link>
          <Button size="sm" className="h-9 shadow-sm">Sign In</Button>
        </div>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <div className="pt-4 pb-3 border-t mt-4 md:hidden">
          <div className="space-y-2 flex flex-col">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Link href="/use-cases">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Use Case Library
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart2 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/translation">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Translation
              </Button>
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/upload">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload CSR
                </Button>
              </Link>
              <Button size="sm" className="w-full">Sign In</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "h-9 flex items-center -my-2 font-medium px-4",
          isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"
        )}
      >
        {children}
      </Button>
    </Link>
  );
}