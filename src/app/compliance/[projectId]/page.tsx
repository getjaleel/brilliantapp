import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  FileCheck,
  ArrowRight,
  BrainCircuit
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompliancePage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const controls = await prisma.control.findMany({
    where: { projectId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Compliance Tracker</h1>
          <p className="text-slate-500">Map project controls to government frameworks (ISM, PSPF, Essential Eight).</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="w-4 h-4" /> Add Control
        </Button>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search controls, frameworks, or requirements..." />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3 font-semibold">Control Name</th>
                <th className="px-6 py-3 font-semibold">Framework</th>
                <th className="px-6 py-3 font-semibold">Requirement</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Evidence</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {controls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    No controls mapped for this project.
                  </td>
                </tr>
              ) : (
                controls.map((control) => (
                  <tr key={control.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{control.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px]">{control.framework}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {control.requirement}
                    </td>
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {control.evidence ? (
                          <span className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                            <FileCheck className="w-3 h-3" /> View Evidence
                          </span>
                        ) : (
                          <span className="italic">Missing</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs">
                        Edit <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-700">
            <BrainCircuit className="w-5 h-5" />
            Compliance Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-800 leading-relaxed">
            "I've analyzed your currently met controls. There is a significant gap in <strong>Privileged Access Management</strong> relative to the Essential Eight Level 2 requirements. I recommend implementing a separate administrative account strategy."
          </div>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1">
            Generate Gap Analysis Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
