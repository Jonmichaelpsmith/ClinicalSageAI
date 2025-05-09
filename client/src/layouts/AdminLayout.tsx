/**
 * Admin Layout Component
 * 
 * This component provides a consistent layout for admin pages
 * with navigation and header components.
 */
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Building, 
  Users, 
  Settings, 
  BarChart2, 
  Shield, 
  Database,
  FileText,
  ChevronRight,
  Home
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: Home,
      active: location === '/admin'
    },
    { 
      name: 'Organizations', 
      href: '/admin/organizations', 
      icon: Building,
      active: location.startsWith('/admin/organizations')
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: Users,
      active: location.startsWith('/admin/users')
    },
    { 
      name: 'Projects', 
      href: '/admin/projects', 
      icon: FileText,
      active: location.startsWith('/admin/projects')
    },
    { 
      name: 'Security', 
      href: '/admin/security', 
      icon: Shield,
      active: location.startsWith('/admin/security')
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: BarChart2,
      active: location.startsWith('/admin/analytics')
    },
    { 
      name: 'Database', 
      href: '/admin/database', 
      icon: Database,
      active: location.startsWith('/admin/database')
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      active: location.startsWith('/admin/settings')
    }
  ];
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <span className="text-xl font-bold">TrialSage Admin</span>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${item.active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Breadcrumb */}
        <div className="bg-background border-b px-4 py-2 sm:px-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/admin">
              <a className="hover:text-foreground">Admin</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium">
              {navItems.find(item => item.active)?.name || 'Page'}
            </span>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}