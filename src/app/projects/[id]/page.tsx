import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  CircleDashed,
  FileText,
  BrainCircuit,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Users,
  Gavel,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const projectResult = await query(
    'SELECT p.*, c.name as "clientName" FROM "Project" p JOIN "Client" c ON p."clientId" = c.id WHERE p.id = $1',
    [id]
  );
  const project = projectResult.rows[0];

  if (!project) {
    return <div className="p-8 text-center">Project not found.</div>;
  }

  const phasesResult = await query(
    'SELECT * FROM "EngagementPhase" WHERE "projectId" = $1 ORDER BY "order" ASC',
    [id]
  );
  const phases = phasesResult.rows;

  const risksResult = await query(
    'SELECT * FROM "Risk" WHERE "projectId" = $1',
    [id]
  );
  const risks = risksResult.rows;

  const controlsResult = await query(
    'SELECT * FROM "Control" WHERE "projectId" = $1',
    [id]
  );
  const controls = controlsResult.rows;

  const artefactsResult = await query(
    'SELECT * FROM "Artefact" WHERE "projectId" = $1 ORDER BY "createdAt" DESC',
    [id]
  );
  const artefacts = artefactsResult.rows;

  const stakeholdersResult = await query(
    'SELECT * FROM "Stakeholder" WHERE "projectId" = $1 ORDER BY "createdAt" ASC',
    [id]
  );
  const stakeholders = stakeholdersResult.rows;

  const decisionsResult = await query(
    'SELECT * FROM "Decision" WHERE "projectId" = $1 ORDER BY "createdAt" ASC',
    [id]
  );
  const decisions = decisionsResult.rows;

  const messagesResult = await query(
    'SELECT m.* FROM "AIMessage" m JOIN "AIConversation" c ON m."conversationId" = c.id WHERE c."projectId" = $1 ORDER BY m."createdAt" ASC',
    [id]
  );
  const messages = messagesResult.rows;

  const completedPhases = phases.filter((p: any) => p.status === 'COMPLETED').length;
  const progress = phases.length > 0 ? (completedPhases / phases.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-slate-500">{project.clientName} &bull; {project.status}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="px-3 py-1">
            {project.cloudProvider || "Cloud Agnostic"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-600 border-blue-200">
            AI Enabled
          </Badge>
          <Link href={`/engagement/${id}`}>
            <Button size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Engagement
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Engagement Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Engagement Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Completion</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Active Risks</div>
                    <div className="text-lg font-bold">{risks.length}</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Controls Met</div>
                    <div className="text-lg font-bold">{controls.filter((c: any) => c.status === 'MET').length} / {controls.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Business Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {project.description && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
                </div>
              )}
              {project.businessDrivers && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Business Drivers</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.businessDrivers}</p>
                </div>
              )}
              {project.scope && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Scope</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.scope}</p>
                </div>
              )}
              {project.constraints && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Constraints</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.constraints}</p>
                </div>
              )}
              {project.targetOutcomes && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Target Outcomes</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.targetOutcomes}</p>
                </div>
              )}
              {project.regulatoryEnv && (
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Regulatory Environment</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{project.regulatoryEnv}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Security Classification</div>
                  <div className="text-sm font-semibold">{project.securityClass || "Unspecified"}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="text-sm font-semibold">{project.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Phases */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Lifecycle Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {phases.map((phase: any) => (
                  <Link key={phase.id} href={`/engagement/${id}/${phase.id}`} className="block">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        {phase.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : phase.status === 'IN_PROGRESS' ? (
                          <CircleDashed className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                        <div>
                          <div className="font-medium text-sm group-hover:text-blue-600 transition-colors">{phase.name}</div>
                          <div className="text-xs text-slate-500">{phase.purpose}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{phase.status}</Badge>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stakeholders */}
          {stakeholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stakeholders.map((s: any) => (
                    <div key={s.id} className="p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {s.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.role}</div>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Badge variant="outline" className="text-[10px]">Inf: {s.influence}</Badge>
                        <Badge variant="outline" className="text-[10px]">Int: {s.interest}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decisions / ADRs */}
          {decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-500" />
                  Architecture Decisions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decisions.map((d: any) => (
                  <div key={d.id} className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{d.title}</div>
                      <Badge
                        variant="outline"
                        className={d.status === 'ACCEPTED' ? 'text-[10px] bg-green-50 text-green-600 border-green-200' : d.status === 'PROPOSED' ? 'text-[10px] bg-blue-50 text-blue-600 border-blue-200' : 'text-[10px] bg-slate-50 text-slate-600 border-slate-200'}
                      >
                        {d.status}
                      </Badge>
                    </div>
                    {d.context && <p className="text-xs text-slate-500 mb-2">{d.context}</p>}
                    {d.decision && (
                      <div className="p-2 rounded bg-amber-50 border border-amber-100 text-xs text-slate-700">
                        <span className="font-semibold text-amber-700">Decision: </span>{d.decision}
                      </div>
                    )}
                    {d.consequences && (
                      <p className="text-xs text-slate-500 mt-2">{d.consequences}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* AI Advisor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-500" />
                AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs">
                <div className="text-blue-400 mb-2">Analysis:</div>
                <div className="text-slate-300 leading-relaxed italic">
                  Based on the current phase ({phases.find((p: any) => p.status === 'IN_PROGRESS')?.name || phases[0]?.name}), I recommend documenting the current state networking topology before proceeding to requirements.
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <BrainCircuit className="w-4 h-4" />
                Open AI Chat
              </Button>
            </CardContent>
          </Card>

          {/* AI Conversation */}
          {messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Recent AI Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((m: any) => {
                  const isAssistant = m.role === 'assistant';
                  return (
                    <div key={m.id} className={isAssistant ? 'p-3 rounded-lg text-xs bg-slate-100' : 'p-3 rounded-lg text-xs bg-blue-50'}>
                      <div className={isAssistant ? 'font-semibold mb-1 text-slate-600' : 'font-semibold mb-1 text-blue-600'}>
                        {isAssistant ? 'AI' : 'You'}
                      </div>
                      <div className="text-slate-700 whitespace-pre-wrap">{m.content}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Key Artefacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Key Artefacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {artefacts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No artefacts generated yet.</p>
              ) : (
                artefacts.map((art: any) => (
                  <Link key={art.id} href={`/artefacts/${id}`} className="block">
                    <div className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs hover:bg-slate-50 cursor-pointer">
                      <span className="font-medium">{art.name}</span>
                      <Badge variant="outline" className="text-[10px]">{art.type}</Badge>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Risks Summary */}
          {risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Top Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {risks.slice(0, 3).map((risk: any) => (
                  <div key={risk.id} className="p-2 rounded-lg border border-slate-100 text-xs">
                    <div className="font-medium">{risk.title}</div>
                    <div className="text-slate-500 mt-1 line-clamp-2">{risk.description}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{risk.impact}</Badge>
                      <Badge variant="outline" className="text-[10px]">{risk.probability}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Controls Summary */}
          {controls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Control Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {controls.slice(0, 4).map((control: any) => {
                  const controlClass = control.status === 'MET'
                    ? 'text-[10px] bg-green-50 text-green-600 border-green-200'
                    : control.status === 'PARTIAL'
                    ? 'text-[10px] bg-yellow-50 text-yellow-600 border-yellow-200'
                    : 'text-[10px] bg-slate-50 text-slate-600 border-slate-200';
                  return (
                    <div key={control.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 text-xs">
                      <span className="font-medium truncate max-w-[140px]">{control.name}</span>
                      <Badge variant="outline" className={controlClass}>
                        {control.status}
                      </Badge>
                    </div>
                  );
                })}
                <Link href={`/compliance/${id}`} className="block">
                  <Button variant="ghost" size="sm" className="w-full text-xs mt-2">
                    View All Controls
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
