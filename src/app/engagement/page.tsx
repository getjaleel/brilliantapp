import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ChevronRight, LayoutDashboard, GitBranch } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EngagementIndexPage() {
  const projectsResult = await query(
    'SELECT * FROM "Project" ORDER BY "createdAt" DESC',
    []
  );
  const projects = projectsResult.rows;

  if (projects.length === 1) {
    redirect(`/engagement/${projects[0].id}`);
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagements</h1>
          <p className="text-slate-500">Select a project to view its engagement lifecycle.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project: any) => (
          <Card key={project.id} className="hover:border-blue-300 transition-all cursor-pointer group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                  {project.name}
                </CardTitle>
                <Badge variant="outline">{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 mb-4">
                {project.description || "No description provided."}
              </div>
              <Link
                href={`/engagement/${project.id}`}
                className="flex items-center gap-1 text-blue-600 text-xs font-semibold"
              >
                View Engagement <ChevronRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
