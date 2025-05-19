// /client/src/components/navigation/UnifiedTopNavV3.jsx

import React from 'react';
import { useLocation, Link } from 'wouter';
import { OrganizationSwitcher } from '../tenant/OrganizationSwitcher';
import { ClientWorkspaceSwitcher } from '../tenant/ClientWorkspaceSwitcher';
import { Settings, Users, Building2, SwitchCamera, Sparkles } from 'lucide-react';
import { useLumenAiAssistant } from '../../contexts/LumenAiAssistantContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UnifiedTopNavV3({ activeTab, onTabChange, breadcrumbs = [] }) {
  const [, navigate] = useLocation();
  const { openAssistant } = useLumenAiAssistant();

  // Format tab names for display
  const formatTabName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="w-full sticky top-0 z-[100] bg-white shadow-md flex flex-col">

      {/* Top Row - Navigation and Module Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-2 border-b">
        <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 text-xs font-medium bg-gray-100 rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95"
            >
              ← Back
            </button>
            <button
              onClick={() => window.history.forward()}
              className="px-3 py-1 text-xs font-medium bg-gray-100 rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95"
            >
              → Forward
            </button>
            <Link href="/client-portal">
              <span className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95 cursor-pointer">
                🏠 Client Portal
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {/* Organization Switcher */}
            <div className="relative z-20">
              <OrganizationSwitcher />
            </div>
            
            {/* Client Workspace Switcher */}
            <div className="relative z-10 ml-2">
              <ClientWorkspaceSwitcher />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-2 md:mt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95 flex items-center cursor-pointer">
                    <Settings className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Settings</span>
                    <span className="sm:hidden">Set</span>
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Personal account settings, preferences, and appearance options</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/client-management">
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95 flex items-center cursor-pointer">
                    <Users className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Client Management</span>
                    <span className="sm:hidden">Clients</span>
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[350px] p-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Client Management</p>
                  <p className="text-xs">Comprehensive client workspace administration for CROs and regulatory consultants:</p>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Create and configure client workspaces with industry-specific settings (Biotech, Pharma, Medical Device)</li>
                    <li>Set regulatory compliance levels, governance controls, and risk management thresholds</li>
                    <li>Configure security controls, audit trails, and 21 CFR Part 11 compliance settings</li>
                    <li>Manage workspace-specific permissions, roles, and access restrictions</li>
                    <li>Enable/disable modules and set resource quotas on a per-client basis</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/tenant-management">
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 rounded transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95 flex items-center cursor-pointer">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Organization Settings</span>
                    <span className="sm:hidden">Orgs</span>
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-[350px] p-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Organization Settings</p>
                  <p className="text-xs">Enterprise-grade organization-wide administration for pharmaceutical, biotech, and medical device companies:</p>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Define organization-wide compliance and validation frameworks (21 CFR Part 11, GxP, IDMP, etc.)</li>
                    <li>Manage organization structure, reporting hierarchies, and global permissions</li>
                    <li>Configure tenant isolation and cross-workspace controls for multi-client CROs</li>
                    <li>Set up regulatory intelligence distribution, change control, and deviation management</li>
                    <li>Define Quality Management System (QMS) integration and Critical-to-Quality (CtQ) factors</li>
                    <li>Deploy enterprise-wide security policies and regulatory authority submission templates</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <span className="px-3 py-1 text-xs font-medium bg-indigo-50 rounded text-indigo-600 transition-all duration-200 ease-in-out hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-300 active:scale-95 flex items-center cursor-pointer">
                    <SwitchCamera className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Switch Module</span>
                    <span className="sm:hidden">Modules</span>
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Switch between platform modules (CER, IND Wizard, VAULT, etc.)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Breadcrumb Trail */}
      <div className="px-4 py-1 text-xs text-gray-500 font-medium bg-white border-b">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx}>
            {idx > 0 && ' > '}
            <span className="hover:underline cursor-default transition">{crumb}</span>
          </span>
        ))}
      </div>

      {/* Functional Tabs Row */}
      <div className="flex justify-center overflow-x-auto whitespace-nowrap gap-4 sm:gap-8 border-b border-gray-100 bg-white py-2 px-1">
        {['Risk Heatmap', 'Timeline Simulator', 'Ask Lumen AI'].map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => {
              if (tabKey === 'Ask Lumen AI') {
                // Open the AI assistant instead of changing tabs
                openAssistant();
              } else {
                onTabChange(tabKey.replace(/ /g, ''));
              }
            }}
            className={`text-sm font-semibold px-3 py-1 rounded ${
              activeTab === tabKey.replace(/ /g, '')
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            } transition-all duration-200 ease-in-out focus:ring-2 focus:ring-indigo-300 active:scale-95`}
          >
            {tabKey === 'Ask Lumen AI' ? (
              <span className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1" /> {tabKey}
              </span>
            ) : tabKey}
          </button>
        ))}
      </div>
    </div>
  );
}