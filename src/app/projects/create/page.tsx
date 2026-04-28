"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProjectCreate() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    clientId: "",
    description: "",
    businessDrivers: "",
    scope: "",
    constraints: "",
    regulatoryEnv: "",
    cloudProvider: "",
    securityClass: "",
    targetOutcomes: "",
  });

  useEffect(() => {
    fetch("/api/setup-db")
      .then(() =>
        fetch("/api/clients")
          .then((r) => r.json())
          .then((data) => {
            if (data.clients) setClients(data.clients);
          })
          .catch(() => {
            // fallback: try raw query endpoint if it exists, otherwise ignore
          })
          .finally(() => setFetching(false))
      )
      .catch(() => setFetching(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/projects/${data.id}`);
      } else {
        setError(data.error || "Failed to create project");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-slate-500">Setup a new professional services engagement.</p>
        </div>
        <Link href="/projects">
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
      </header>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Fundamentals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Cloud Migration 2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <select
                    id="clientId"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    <option value="">{fetching ? "Loading clients..." : "Select Client"}</option>
                    {clients.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief overview of the engagement goals..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cloudProvider">Cloud Provider</Label>
                  <select
                    id="cloudProvider"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={form.cloudProvider}
                    onChange={(e) => setForm({ ...form, cloudProvider: e.target.value })}
                  >
                    <option value="">Select Provider</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                    <option value="Cloud Agnostic">Cloud Agnostic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityClass">Security Classification</Label>
                  <select
                    id="securityClass"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={form.securityClass}
                    onChange={(e) => setForm({ ...form, securityClass: e.target.value })}
                  >
                    <option value="">Select Classification</option>
                    <option value="Unclassified">Unclassified</option>
                    <option value="PROTECTED">PROTECTED</option>
                    <option value="Secret">Secret</option>
                  </select>
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
                <Label htmlFor="businessDrivers">Business Drivers</Label>
                <Textarea
                  id="businessDrivers"
                  placeholder="What is driving this change? (e.g. cost reduction, technical debt, compliance requirements)"
                  value={form.businessDrivers}
                  onChange={(e) => setForm({ ...form, businessDrivers: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Textarea
                  id="scope"
                  placeholder="What is in scope?"
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="constraints">Constraints</Label>
                <Textarea
                  id="constraints"
                  placeholder="What are the hard constraints (budget, time, legal)?"
                  value={form.constraints}
                  onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetOutcomes">Target Outcomes</Label>
                <Textarea
                  id="targetOutcomes"
                  placeholder="What does success look like at the end of this engagement?"
                  value={form.targetOutcomes}
                  onChange={(e) => setForm({ ...form, targetOutcomes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regulatoryEnv">Regulatory Environment</Label>
                <Textarea
                  id="regulatoryEnv"
                  placeholder="Applicable frameworks and regulations"
                  value={form.regulatoryEnv}
                  onChange={(e) => setForm({ ...form, regulatoryEnv: e.target.value })}
                />
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
                "I&apos;m monitoring your inputs. Once you define the security classification and cloud provider, I can suggest the most relevant compliance frameworks (e.g. ISM vs PSPF) and recommend a tailored engagement lifecycle."
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
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Create Project
            </Button>
            <Link href="/projects" className="w-full">
              <Button variant="outline" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
