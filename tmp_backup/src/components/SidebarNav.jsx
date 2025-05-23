// /client/src/components/SidebarNav.jsx
import {
  BrainCircuit,
  BarChart3,
  FileText,
  UploadCloud,
  LineChart,
  NotebookText,
  FlaskConical
} from "lucide-react";

export default function SidebarNav() {
  return (
    <aside className="bg-white border-r border-gray-200 min-h-screen w-64 p-4 flex flex-col gap-2 text-sm text-gray-700">
      <div className="text-xl font-bold text-blue-600 mb-4">TrialSage</div>
      <nav className="space-y-1">
        <NavItem icon={BrainCircuit} href="/study" label="Intelligence" />
        <NavItem icon={BarChart3} href="/analytics" label="Analytics" />
        <NavItem icon={UploadCloud} href="/predict" label="Predict Trial" />
        <NavItem icon={LineChart} href="/csrs" label="CSR Library" />
        <NavItem icon={FileText} href="/reports" label="Reports" />
        <NavItem icon={NotebookText} href="/use-cases" label="Use Cases" />
        <NavItem icon={FlaskConical} href="/planning" label="Modeling & Design" />
      </nav>
    </aside>
  );
}

function NavItem({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition"
    >
      <Icon size={16} />
      <span>{label}</span>
    </a>
  );
}