import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  BrainCircuit,
  GitBranch
} from "lucide-react";
import { query } from "@/lib/db";

export default async function Dashboard() {
  const projectsResult = await query(
    "SELECT * FROM \"Project\" LIMIT 1",
    []
  );

  const project = projectsResult.rows[0];

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">No Active Project</h2>
        <p className="text-slate-500">Create a project to start the navigator.</p>
      </div>
    );
  }

  const phasesResult = await query(
    "SELECT * FROM \"EngagementPhase\" WHERE \"projectId\" = $1 ORDER BY \"order\" ASC",
    [project.id]
  );
  const phases = phasesResult.rows;

  const risksResult = await query(
    "SELECT * FROM \"Risk\" WHERE \"projectId\" = $1",
    [project.id]
  );
  const risks = risksResult.rows;

  const controlsResult = await query(
    "SELECT * FROM \"Control\" WHERE \"projectId\" = $1",
    [project.id]
  );
  const controls = controlsResult.rows;

  const completedPhases = phases.filter((p: any) => p.status === 'COMPLETED').length;
  const progress = phases.length > 0 ? (completedPhases / phases.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagement Dashboard</h1>
          <p className="text-slate-500">Project: {project.name}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {project.status}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-600 border-blue-200">
            AI Enabled
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Progress</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-slate-500 mt-2">
              {completedPhases} of {phases.length} phases completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risks.length}</div>
            <p className="text-xs text-slate-500 mt-2">
              {risks.filter((r: any) => r.impact === 'High' || r.impact === 'Critical').length} high impact risks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length} Controls</div>
            <p className="text-xs text-slate-500 mt-2">
              {controls.filter((c: any) => c.status === 'MET').length} met / {controls.length} tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-500" />
              Engagement Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase: any) => (
                <div key={phase.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${phase.status === 'COMPLETED' ? 'bg-green-500' : phase.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{phase.name}</div>
                    <div className="text-xs text-slate-500">{phase.purpose}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {phase.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
              AI Architecture Advisor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs space-y-3">
              <div className="text-blue-400">system:</div>
              <div className="text-slate-300 italic">
                "Current phase: {phases[0]?.name}. I recommend focusing on stakeholder mapping and defining business drivers to establish a strong baseline."
              </div>
              <div className="text-purple-400">suggestion:</div>
              <div className="text-slate-300">
                Generate a Discovery Questionnaire for {project.name} based on the current constraints.
              </div>
              <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] transition-colors">
                Ask AI Advisor
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
