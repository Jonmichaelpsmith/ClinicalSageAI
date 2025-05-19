import { ReactNode } from "react";
import { Link } from "wouter";
import { MoonStar, Sun, Menu, Home, FileBarChart, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cleanupModals } from "@/lib/modalHelpers";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleMenuClick = () => {
    // Clean up any modal elements when opening/closing the menu
    // This ensures no orphaned elements remain
    cleanupModals();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h1 className="font-medium">Regulatory Compliance</h1>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">MAIN NAVIGATION</p>
          <Link href="/client-portal">
            <a className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/client-portal/compliance">
            <a className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground bg-accent text-accent-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <span>Compliance</span>
            </a>
          </Link>
          <Link href="/client-portal/settings">
            <a className="flex items-center space-x-2 py-2 px-3 rounded-md hover:bg-accent hover:text-accent-foreground">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </a>
          </Link>
        </nav>
        
        {/* Component List */}
        <div className="p-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">COMPONENTS</p>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>CERV2Page</span>
            </li>
            <li className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>SimpleAppUx</span>
            </li>
            <li className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>AdvancedDashboard</span>
            </li>
            <li className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm cursor-pointer">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>BenchmarkDetailsModal</span>
            </li>
          </ul>
        </div>
        
        {/* User Section */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium">JS</span>
            </div>
            <span className="text-sm">User</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-medium">Regulatory Compliance</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
};

export default Layout;
