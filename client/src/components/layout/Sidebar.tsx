import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, FileText, Upload, BarChart2, 
  Settings, HelpCircle, Lightbulb, BookOpen, 
  XCircle, Menu, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  end?: boolean;
}

function NavItem({ href, icon, children, end = false }: NavItemProps) {
  const [location] = useLocation();
  const isActive = end ? location === href : location.startsWith(href);

  return (
    <Link href={href}>
      <a
        className={cn(
          "group flex items-center px-2 py-2 text-base font-medium rounded-md",
          isActive
            ? "bg-primary text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <div className={cn(
          "mr-3 h-5 w-5",
          isActive
            ? "text-white"
            : "text-slate-400 group-hover:text-slate-500"
        )}>
          {icon}
        </div>
        {children}
      </a>
    </Link>
  );
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-600 bg-opacity-75 transition-opacity ease-linear duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white transform transition ease-in-out duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center">
            <img className="h-8 w-auto" src="/logo.svg" alt="TrialSage" />
            <span className="ml-2 text-xl font-semibold text-primary">TrialSage</span>
          </div>
          <button
            type="button"
            className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-500 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 h-0 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard />}>
              Dashboard
            </NavItem>
            <NavItem href="/reports" icon={<FileText />}>
              CSR Reports
            </NavItem>
            <NavItem href="/upload" icon={<Upload />}>
              Upload CSR
            </NavItem>
            <NavItem href="/analytics" icon={<BarChart2 />}>
              Analytics
            </NavItem>
            <NavItem href="/use-cases" icon={<BookOpen />}>
              Use Case Library
            </NavItem>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                AI Tools
              </h3>
              <div className="mt-2 space-y-1">
                <NavItem href="/protocol-generator" icon={<Lightbulb />}>
                  Protocol Generator
                </NavItem>
                <NavItem href="/study-design-agent" icon={<Lightbulb />}>
                  Study Design Agent
                </NavItem>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                <NavItem href="/settings" icon={<Settings />}>
                  Account Settings
                </NavItem>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <img className="h-8 w-auto" src="/logo.svg" alt="TrialSage" />
          <span className="ml-2 text-xl font-semibold text-primary">TrialSage</span>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavItem href="/dashboard" icon={<LayoutDashboard />}>
              Dashboard
            </NavItem>
            <NavItem href="/reports" icon={<FileText />}>
              CSR Reports
            </NavItem>
            <NavItem href="/upload" icon={<Upload />}>
              Upload CSR
            </NavItem>
            <NavItem href="/analytics" icon={<BarChart2 />}>
              Analytics
            </NavItem>
            <NavItem href="/use-cases" icon={<BookOpen />}>
              Use Case Library
            </NavItem>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                AI Tools
              </h3>
              <div className="mt-2 space-y-1">
                <NavItem href="/protocol-generator" icon={<ClipboardList />}>
                  Protocol Generator
                </NavItem>
                <NavItem href="/study-design-agent" icon={<Lightbulb />}>
                  Study Design Agent
                </NavItem>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Settings
              </h3>
              <div className="mt-2 space-y-1">
                <NavItem href="/settings" icon={<Settings />}>
                  Account Settings
                </NavItem>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}