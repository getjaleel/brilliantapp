import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, ChevronRight } from "lucide-react";
import { query } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projectsResult = await query(
    `SELECT p.*, c.name as "clientName" FROM "Project" p JOIN "Client" c ON p."clientId" = c.id ORDER BY p."createdAt" DESC`,
    []
  );
  const projects = projectsResult.rows;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500">Manage your professional services engagements.</p>
        </div>
        <Link href="/projects/create">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="block">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </CardTitle>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <p className="text-sm text-slate-500">{project.clientName}</p>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-slate-400 mb-4 line-clamp-3">
                  {project.description || "No description provided."}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">
                    {project.cloudProvider || "Cloud Agnostic"}
                  </span>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold">
                    View Project <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
