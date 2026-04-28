import React from "react";
import {
  LayoutDashboard,
  Folder,
  GitBranch,
  BrainCircuit,
  Library,
  FileText,
  ShieldCheck,
  Map,
  Settings,
  UserCircle,
  BookOpen,
  Wand2
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Folder },
  { name: "Projects", href: "/projects", icon: GitBranch },
  { name: "Engagement", href: "/engagement", icon: BrainCircuit },
  { name: "Knowledge", href: "/knowledge", icon: Library },
  { name: "Templates", href: "/templates", icon: BookOpen },
  { name: "Artefacts", href: "/artefacts", icon: FileText },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck },
  { name: "AI Tools", href: "/tools", icon: Wand2 },
  { name: "Roadmap", href: "/roadmap", icon: Map },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
          <span className="truncate">ArchNavigator</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
          <UserCircle className="w-4 h-4" />
          <span className="text-sm">Architect Admin</span>
        </div>
      </div>
    </aside>
  );
}
