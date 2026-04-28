import { query } from "./db";

export interface RecommendationInput {
  projectId: string;
  industry?: string;
  regulatoryEnv?: string;
  cloudProvider?: string;
  securityClass?: string;
  status?: string;
  description?: string;
  scope?: string;
  businessDrivers?: string;
  constraints?: string;
  targetOutcomes?: string;
}

export interface TemplateRec {
  id: string;
  name: string;
  category: string;
  docType: string;
  score: number;
  reason: string;
}

export interface KnowledgeRec {
  id: string;
  title: string;
  domain: string;
  score: number;
  reason: string;
}

export interface RecommendationsResult {
  templates: TemplateRec[];
  knowledge: KnowledgeRec[];
  summary: string;
}

function tokenize(text?: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreTextMatch(source: string[], target: string): number {
  const t = tokenize(target);
  if (t.length === 0 || source.length === 0) return 0;
  const hits = t.filter((word) => source.some((s) => s.includes(word) || word.includes(s)));
  return hits.length / Math.max(t.length, source.length);
}

export async function getRuleBasedRecommendations(
  input: RecommendationInput
): Promise<RecommendationsResult> {
  const projectTokens = [
    ...tokenize(input.industry),
    ...tokenize(input.regulatoryEnv),
    ...tokenize(input.cloudProvider),
    ...tokenize(input.securityClass),
    ...tokenize(input.description),
    ...tokenize(input.scope),
    ...tokenize(input.businessDrivers),
    ...tokenize(input.constraints),
    ...tokenize(input.targetOutcomes),
  ];

  const risksRes = await query('SELECT title, description FROM "Risk" WHERE "projectId" = $1', [
    input.projectId,
  ]);
  const risks = risksRes.rows;
  for (const r of risks) {
    projectTokens.push(...tokenize(r.title), ...tokenize(r.description));
  }

  const controlsRes = await query('SELECT name, framework, requirement FROM "Control" WHERE "projectId" = $1', [
    input.projectId,
  ]);
  const controls = controlsRes.rows;
  for (const c of controls) {
    projectTokens.push(...tokenize(c.name), ...tokenize(c.framework), ...tokenize(c.requirement));
  }

  const templatesRes = await query(
    'SELECT id, name, category, "docType", description, content, tags FROM "DocumentTemplate"',
    []
  );
  const templates = templatesRes.rows;

  const knowledgeRes = await query(
    'SELECT id, title, domain, description, usage, questions, inputs, outputs, controls FROM "KnowledgeItem"',
    []
  );
  const knowledge = knowledgeRes.rows;

  const categoryBoosts: Record<string, number> = {};
  const reg = (input.regulatoryEnv || "").toLowerCase();
  const cloud = (input.cloudProvider || "").toLowerCase();
  const sec = (input.securityClass || "").toLowerCase();
  const industry = (input.industry || "").toLowerCase();

  if (cloud.includes("aws") || cloud.includes("azure") || cloud.includes("gcp") || cloud.includes("cloud")) {
    categoryBoosts["Cloud Security"] = 20;
  }
  if (sec.includes("protect") || sec.includes("confident") || sec.includes("secret")) {
    categoryBoosts["Data Protection"] = 25;
    categoryBoosts["Network Security"] = 15;
  }
  if (reg.includes("apra") || reg.includes("ism") || reg.includes("cps") || reg.includes("nist") || reg.includes("iso")) {
    categoryBoosts["Incident & Compliance"] = 25;
    categoryBoosts["Policies"] = 15;
  }
  if (industry.includes("finance") || industry.includes("bank") || industry.includes("insurance")) {
    categoryBoosts["Data Protection"] = 15;
    categoryBoosts["Incident & Compliance"] = 15;
  }
  if (input.scope?.toLowerCase().includes("app") || input.scope?.toLowerCase().includes("mobile")) {
    categoryBoosts["Application Security"] = 20;
  }
  if (input.description?.toLowerCase().includes("ddos") || input.description?.toLowerCase().includes("network")) {
    categoryBoosts["Network Security"] = 20;
  }

  const templateRecs: TemplateRec[] = templates.map((t: any) => {
    const text = `${t.name} ${t.category} ${t.docType} ${t.description} ${t.tags || ""}`;
    let score = scoreTextMatch(projectTokens, text) * 100;
    score += categoryBoosts[t.category] || 0;
    if (t.docType === "Policy" && input.status === "DISCOVERY") score += 10;
    if (t.docType === "Tracker" && input.status === "IN_PROGRESS") score += 10;
    return {
      id: t.id,
      name: t.name,
      category: t.category,
      docType: t.docType,
      score: Math.min(Math.round(score), 100),
      reason: buildReason(t.category, t.docType, input),
    };
  });

  const knowledgeRecs: KnowledgeRec[] = knowledge.map((k: any) => {
    const text = `${k.title} ${k.domain} ${k.description} ${k.usage || ""} ${k.questions || ""} ${k.outputs || ""}`;
    let score = scoreTextMatch(projectTokens, text) * 100;
    if (k.domain === "Cyber" && (sec || reg)) score += 20;
    if (k.domain === "APRA" && reg.includes("apra")) score += 30;
    if (k.domain === "DataGov" && (sec.includes("protect") || industry.includes("finance"))) score += 15;
    if (k.domain === "AWS" && cloud.includes("aws")) score += 25;
    if (k.domain === "TOGAF") score += 5;
    return {
      id: k.id,
      title: k.title,
      domain: k.domain,
      score: Math.min(Math.round(score), 100),
      reason: `Relevant to ${k.domain} context`,
    };
  });

  templateRecs.sort((a, b) => b.score - a.score);
  knowledgeRecs.sort((a, b) => b.score - a.score);

  const topTemplates = templateRecs.filter((t) => t.score > 0).slice(0, 6);
  const topKnowledge = knowledgeRecs.filter((k) => k.score > 0).slice(0, 4);

  return {
    templates: topTemplates,
    knowledge: topKnowledge,
    summary: buildSummary(topTemplates, topKnowledge, input),
  };
}

function buildReason(category: string, docType: string, input: RecommendationInput): string {
  const reg = input.regulatoryEnv || "";
  const cloud = input.cloudProvider || "";
  if (category === "Cloud Security" && cloud) return `Cloud provider ${cloud} requires cloud-specific controls`;
  if (category === "Policies" && reg) return `Regulatory environment ${reg} needs documented policies`;
  if (category === "Data Protection") return `Security class ${input.securityClass || "specified"} demands data protection measures`;
  if (category === "Application Security") return `Scope includes applications requiring secure development`;
  if (category === "Network Security") return `Network layer protections aligned to project scope`;
  if (category === "Incident & Compliance") return `Compliance framework requires ongoing tracking`;
  return `Matches project industry and regulatory context`;
}

function buildSummary(
  templates: TemplateRec[],
  knowledge: KnowledgeRec[],
  input: RecommendationInput
): string {
  const parts: string[] = [];
  if (input.cloudProvider) parts.push(`${input.cloudProvider} cloud migration`);
  if (input.regulatoryEnv) parts.push(`regulated under ${input.regulatoryEnv}`);
  if (input.securityClass) parts.push(`${input.securityClass} security classification`);
  const ctx = parts.length > 0 ? `Given ${parts.join(", ")}, ` : "";
  return `${ctx}prioritise ${templates.slice(0, 3).map((t) => t.name).join(", ")}. Reference ${knowledge.slice(0, 2).map((k) => k.title).join(", ")} for methodology.`;
}
