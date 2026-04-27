import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, PlusCircle, Save } from "lucide-react";

export default function ProjectCreate() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-slate-500">Setup a new professional services engagement.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Fundamentals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input placeholder="e.g. Cloud Migration 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client1">Government Agency X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief overview of the engagement goals..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cloud Provider</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">AWS</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="gcp">GCP</SelectItem>
                      <SelectItem value="agnostic">Cloud Agnostic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Security Classification</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unclassified">Unclassified</SelectItem>
                      <SelectItem value="protected">Protected</SelectItem>
                      <SelectItem value="secret">Secret</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Drivers</Label>
                <Textarea placeholder="What is driving this change? (e.g. cost reduction, technical debt, compliance requirements)" />
              </div>
              <div className="space-y-2">
                <Label>Scope & Constraints</Label>
                <Textarea placeholder="What is in scope? What are the hard constraints (budget, time, legal)?" />
              </div>
              <div className="space-y-2">
                <Label>Target Outcomes</Label>
                <Textarea placeholder="What does success look like at the end of this engagement?" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-slate-100 border-slate-800">
            <CardHeader>
              <CardTitle className="text-md font-semibold flex items-center gap-2 text-blue-400">
                <BrainCircuit className="w-5 h-5" />
                AI Setup Advice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs font-mono text-slate-400 italic leading-relaxed">
                "I'm monitoring your inputs. Once you define the security classification and cloud provider, I can suggest the most relevant compliance frameworks (e.g. ISM vs PSPF) and recommend a tailored engagement lifecycle."
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="w-fit text-slate-400 border-slate-700">
                  Suggested: ISM Framework
                </Badge>
                <Badge variant="outline" className="w-fit text-slate-400 border-slate-700">
                  Suggested: AWS Well-Architected
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button className="w-full gap-2">
              <Save className="w-4 h-4" />
              Create Project
            </Button>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
