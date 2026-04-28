import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Download,
  PlusCircle,
  BrainCircuit,
  Trash2
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArtefactsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const artefacts = await prisma.artefact.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artefact Generator</h1>
          <p className="text-slate-500">Generate professional architecture deliverables using AI.</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" /> Create Manual Artefact
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 text-slate-100 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-400">
                <BrainCircuit className="w-5 h-5" />
                AI Artefact Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Select Template</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Choose artefact type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principles">Architecture Principles</SelectItem>
                    <SelectItem value="adr">Architecture Decision Record (ADR)</SelectItem>
                    <SelectItem value="risk_reg">Risk Register</SelectItem>
                    <SelectItem value="current_state">Current State Summary</SelectItem>
                    <SelectItem value="target_state">Target State Recommendations</SelectItem>
                    <SelectItem value="exec_summary">Executive Briefing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Additional Context / Guidance</Label>
                <Textarea
                  placeholder="e.g. Focus specifically on the data residency requirements for the Australian government..."
                  className="bg-slate-800 border-slate-700 text-slate-200 text-xs"
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Sparkles className="w-4 h-4" /> Generate Draft
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artefacts.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>No artefacts generated yet for this project.</p>
              </div>
            ) : (
              artefacts.map((art) => (
                <Card key={art.id} className="group hover:border-blue-300 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">{art.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{art.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs text-slate-500 line-clamp-3 font-mono bg-slate-50 p-2 rounded border">
                      {art.content.substring(0, 150)}...
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400">v{art.version} • {new Date(art.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                          <Download className="w-3 h-3" /> PDF
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-red-500 gap-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed imports for components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
