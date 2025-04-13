import React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Upload,
  BarChart2,
  Settings,
  HelpCircle,
  Lightbulb,
  BookOpen,
  XCircle,
  Menu,
  ClipboardList,
  Globe,
  Database,
  FileSymlink,
  Microscope,
  FileCheck,
  Briefcase,
  AlertTriangle,
  Target,
  Beaker,
  GraduationCap,
  BarChart,
  LineChart,
  PieChart,
  FolderOpen,
  Save,
  LogOut,
  User,
  ClipboardList as ClipboardIcon,
  FileOutput,
  BookOpen as BookIcon,
  ScrollText,
  Library,
  Split,
  SearchCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
    <div>
      <Link href={href} className={cn(
          "group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors duration-150", // Reduced padding
          isActive
            ? "bg-primary/10 text-primary"
            : "text-slate-700 hover:bg-slate-100 hover:text-primary"
        )}>
        <div className={cn(
          "mr-2 h-4 w-4 flex-shrink-0", //Reduced size
          isActive
            ? "text-primary"
            : "text-slate-500 group-hover:text-primary"
        )}>
          {icon}
        </div>
        {children}
      </Link>
    </div>
  );
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white transform transition ease-in-out duration-300 shadow-lg", // Reduced width
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-12 flex items-center justify-between px-3 border-b border-slate-200 bg-slate-50"> {/*Reduced height and padding */}
          <div className="flex items-center">
            <Database className="h-6 w-6 text-primary" /> {/*Reduced size */}
            <span className="ml-2 text-base font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"> {/*Reduced font size*/}
              LumenTrialGuide.AI
            </span>
          </div>
          <button
            type="button"
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-500 focus:outline-none" 
            onClick={() => setSidebarOpen(false)}
          >
            <XCircle className="h-5 w-5" /> {/* Reduced size */}
          </button>
        </div>

        <div className="flex-1 h-0 overflow-y-auto">
          {user && (
            <div className="px-2 py-2 mb-2 bg-slate-50 rounded-md border border-slate-200"> {/*Reduced padding */}
              <div className="flex items-center">
                <div className="p-1.5 bg-primary/10 rounded-full"> {/*Reduced padding */}
                  <User className="h-4 w-4 text-primary" /> {/*Reduced size */}
                </div>
                <div className="ml-2"> {/*Reduced margin */}
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    Logged in
                  </p>
                </div>
              </div>
              <div className="mt-2"> {/*Reduced margin */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-1" /> {/*Reduced size */}
                  Sign out
                </Button>
              </div>
            </div>
          )}

          <nav className="px-2 py-3 space-y-0.5"> {/*Reduced padding and spacing */}
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
            <NavItem href="/statistical-modeling" icon={<FileSymlink />}>
              Statistical Modeling
            </NavItem>
            <NavItem href="/use-cases" icon={<BookOpen />}>
              Use Case Library
            </NavItem>
            <NavItem href="/fail-map" icon={<AlertTriangle />}>
              Real-World Fail Map
            </NavItem>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                AI Tools
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/protocol-designer" icon={<ClipboardList />}>
                  Protocol Designer
                </NavItem>
                <NavItem href="/study-design-agent" icon={<Lightbulb />}>
                  Study Design Agent
                </NavItem>
                <NavItem href="/translation" icon={<Globe />}>
                  Translation Service
                </NavItem>
                <NavItem href="/academic-knowledge-demo" icon={<GraduationCap />}>
                  Academic Knowledge
                </NavItem>
                <NavItem href="/academic-regulatory" icon={<Library />}>
                  Academic & Regulatory
                </NavItem>
                <NavItem href="/trial-predictor" icon={<BarChart />}>
                  Trial Success Predictor
                </NavItem>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Strategic Services
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/competitive-intelligence" icon={<Target />}>
                  Strategic Intelligence
                </NavItem>
                <NavItem href="/dossier" icon={<FolderOpen />}>
                  Protocol Dossier
                </NavItem>
                <NavItem href="/my-dossiers" icon={<Save />}>
                  My Dossiers
                </NavItem>
                <NavItem href="/export-log" icon={<FileOutput />}>
                  Export Log
                </NavItem>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Settings
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/settings" icon={<Settings />}>
                  Account Settings
                </NavItem>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Lumen Bio
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/lumen-bio/dashboard" icon={<Microscope />}>
                  Lumen Bio Dashboard
                </NavItem>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-56 lg:border-r lg:border-slate-200 lg:bg-white lg:shadow-sm"> {/*Reduced width */}
        <div className="h-12 flex items-center justify-center px-3 border-b border-slate-200 bg-slate-50"> {/*Reduced height and padding */}
          <Database className="h-6 w-6 text-primary" /> {/*Reduced size */}
          <span className="ml-2 text-base font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"> {/*Reduced font size*/}
            LumenTrialGuide.AI
          </span>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto pt-3"> {/*Reduced padding */}
          {user && (
            <div className="px-2 py-2 mb-2 bg-slate-50 rounded-md border border-slate-200 mx-2"> {/*Reduced padding and margin */}
              <div className="flex items-center">
                <div className="p-1.5 bg-primary/10 rounded-full"> {/*Reduced padding */}
                  <User className="h-4 w-4 text-primary" /> {/*Reduced size */}
                </div>
                <div className="ml-2"> {/*Reduced margin */}
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    Logged in
                  </p>
                </div>
              </div>
              <div className="mt-2"> {/*Reduced margin */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-1" /> {/*Reduced size */}
                  Sign out
                </Button>
              </div>
            </div>
          )}

          <nav className="flex-1 px-2 space-y-0.5"> {/*Reduced padding and spacing */}
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
            <NavItem href="/statistical-modeling" icon={<FileSymlink />}>
              Statistical Modeling
            </NavItem>
            <NavItem href="/use-cases" icon={<BookOpen />}>
              Use Case Library
            </NavItem>
            <NavItem href="/fail-map" icon={<AlertTriangle />}>
              Real-World Fail Map
            </NavItem>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                AI Tools
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/protocol-designer" icon={<ClipboardList />}>
                  Protocol Designer
                </NavItem>
                <NavItem href="/study-design-agent" icon={<Lightbulb />}>
                  Study Design Agent
                </NavItem>
                <NavItem href="/translation" icon={<Globe />}>
                  Translation Service
                </NavItem>
                <NavItem href="/academic-knowledge-demo" icon={<GraduationCap />}>
                  Academic Knowledge
                </NavItem>
                <NavItem href="/academic-regulatory" icon={<Library />}>
                  Academic & Regulatory
                </NavItem>
                <NavItem href="/trial-predictor" icon={<BarChart />}>
                  Trial Success Predictor
                </NavItem>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Strategic Services
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/competitive-intelligence" icon={<Target />}>
                  Strategic Intelligence
                </NavItem>
                <NavItem href="/dossier" icon={<FolderOpen />}>
                  Protocol Dossier
                </NavItem>
                <NavItem href="/my-dossiers" icon={<Save />}>
                  My Dossiers
                </NavItem>
                <NavItem href="/export-log" icon={<FileOutput />}>
                  Export Log
                </NavItem>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Settings
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/settings" icon={<Settings />}>
                  Account Settings
                </NavItem>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200"> {/*Reduced padding and margin */}
              <h3 className="px-2 mb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider"> {/*Reduced padding and margin */}
                Lumen Bio
              </h3>
              <div className="space-y-0.5"> {/*Reduced spacing */}
                <NavItem href="/lumen-bio/dashboard" icon={<Microscope />}>
                  Lumen Bio Dashboard
                </NavItem>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}