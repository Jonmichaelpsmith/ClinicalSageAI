import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  FileText, 
  Upload, 
  BarChart3,
  Settings
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out border-r border-slate-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:w-80`}
    >
      {/* Logo and Brand */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold">
            TS
          </div>
          <h1 className="ml-3 text-xl font-semibold text-slate-800">TrialSage</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)} 
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Navigation Menu */}
      <nav className="p-4 space-y-1">
        <Link href="/">
          <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
            isActive('/') 
              ? 'bg-slate-100 text-primary' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}>
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </a>
        </Link>
        <Link href="/reports">
          <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
            isActive('/reports') 
              ? 'bg-slate-100 text-primary' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}>
            <FileText className="h-5 w-5 mr-3" />
            CSR Reports
          </a>
        </Link>
        <Link href="/upload">
          <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
            isActive('/upload') 
              ? 'bg-slate-100 text-primary' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}>
            <Upload className="h-5 w-5 mr-3" />
            Upload CSR
          </a>
        </Link>
        <Link href="/analytics">
          <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
            isActive('/analytics') 
              ? 'bg-slate-100 text-primary' 
              : 'text-slate-600 hover:bg-slate-50'
          }`}>
            <BarChart3 className="h-5 w-5 mr-3" />
            Analytics
          </a>
        </Link>
      </nav>
      
      {/* Recent Activity */}
      <div className="mt-6 px-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center py-2 px-3 text-sm text-slate-700 rounded-md">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span>Processed "Aducanumab" CSR</span>
            <span className="ml-auto text-xs text-slate-500">2h ago</span>
          </div>
          <div className="flex items-center py-2 px-3 text-sm text-slate-700 rounded-md">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
            <span>Uploaded "Tofersen" CSR</span>
            <span className="ml-auto text-xs text-slate-500">1d ago</span>
          </div>
          <div className="flex items-center py-2 px-3 text-sm text-slate-700 rounded-md">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span>Exported "Tirzepatide" data</span>
            <span className="ml-auto text-xs text-slate-500">2d ago</span>
          </div>
        </div>
      </div>
      
      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            ET
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-800">Emma Thompson</p>
            <p className="text-xs text-slate-500">Premium Plan</p>
          </div>
          <button className="ml-auto p-1 rounded-full text-slate-500 hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
