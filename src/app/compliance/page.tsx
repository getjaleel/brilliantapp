import { query } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ComplianceIndexPage() {
  const controlsResult = await query(
    `SELECT c.*, p.name as "projectName" FROM "Control" c JOIN "Project" p ON c."projectId" = p.id ORDER BY c.name ASC`,
    []
  );
  const controls = controlsResult.rows;

  const projectsResult = await query('SELECT * FROM "Project" ORDER BY name ASC', []);
  const projects = projectsResult.rows;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Compliance</h1>
        <p className="text-slate-500">Audit controls across all engagements.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project: any) => (
          <Link key={project.id} href={`/compliance/${project.id}`}>
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors">
                  {project.name}
                </CardTitle>
                <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">{project.status}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Controls</h2>
        {controls.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No controls found.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Control</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Framework</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {controls.map((control: any) => (
                  <tr key={control.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{control.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{control.projectName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">{control.framework}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          control.status === 'MET' ? 'bg-green-50 text-green-600 border-green-200' :
                          control.status === 'PARTIAL' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {control.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
