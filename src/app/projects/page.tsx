import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CheckCircle2, Circle, ChevronRight } from "lucide-react";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true }
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-slate-500">Manage your professional services engagements.</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" />
          New Project
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:border-blue-300 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                  {project.name}
                </CardTitle>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">{project.client.name}</p>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-400 mb-4">
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
        ))}
      </div>
    </div>
  );
}
