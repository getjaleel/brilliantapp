import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getRuleBasedRecommendations } from "@/lib/recommendations";
import { getAIRecommendation } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return Response.json({ ok: false, error: "Missing projectId" }, { status: 400 });
    }

    const projectRes = await query('SELECT * FROM "Project" WHERE id = $1', [projectId]);
    const project = projectRes.rows[0];
    if (!project) {
      return Response.json({ ok: false, error: "Project not found" }, { status: 404 });
    }

    const ruleRecs = await getRuleBasedRecommendations({
      projectId,
      industry: project.clientName,
      regulatoryEnv: project.regulatoryEnv,
      cloudProvider: project.cloudProvider,
      securityClass: project.securityClass,
      status: project.status,
      description: project.description,
      scope: project.scope,
      businessDrivers: project.businessDrivers,
      constraints: project.constraints,
      targetOutcomes: project.targetOutcomes,
    });

    let aiEnhanced = false;
    let aiSummary = ruleRecs.summary;

    try {
      const templatesRes = await query(
        'SELECT id, name, category, "docType", description, tags FROM "DocumentTemplate"',
        []
      );
      const knowledgeRes = await query(
        'SELECT id, title, domain, description FROM "KnowledgeItem"',
        []
      );

      const aiContext = {
        project: {
          name: project.name,
          industry: project.clientName,
          regulatoryEnv: project.regulatoryEnv,
          cloudProvider: project.cloudProvider,
          securityClass: project.securityClass,
          status: project.status,
          description: project.description,
          scope: project.scope,
          businessDrivers: project.businessDrivers,
          constraints: project.constraints,
          targetOutcomes: project.targetOutcomes,
        },
        ruleBasedTopTemplates: ruleRecs.templates.slice(0, 6),
        ruleBasedTopKnowledge: ruleRecs.knowledge.slice(0, 4),
        availableTemplates: templatesRes.rows.map((t: any) => ({
          id: t.id,
          name: t.name,
          category: t.category,
          docType: t.docType,
          description: t.description,
        })),
        availableKnowledge: knowledgeRes.rows.map((k: any) => ({
          id: k.id,
          title: k.title,
          domain: k.domain,
          description: k.description,
        })),
      };

      const aiResponse = await getAIRecommendation(
        "RECOMMENDATION",
        aiContext,
        `Return ONLY a JSON object with this exact shape (no markdown, no code fences):\n{\n  "templates": [{"id":"string","score":number,"reason":"string"}],\n  "knowledge": [{"id":"string","score":number,"reason":"string"}],\n  "summary": "string"\n}\n\nScore each recommendation 0-100. Use the available templates and knowledge items. Pick the most relevant for this project.`
      );

      const clean = aiResponse.replace(/```json\s*|\s*```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (parsed.templates && Array.isArray(parsed.templates)) {
        const aiTemplateIds = new Set(parsed.templates.map((t: any) => t.id));
        ruleRecs.templates = ruleRecs.templates.map((t) => {
          const ai = parsed.templates.find((pt: any) => pt.id === t.id);
          return ai ? { ...t, score: Math.round((t.score + ai.score) / 2), reason: ai.reason || t.reason } : t;
        });
        const extras = parsed.templates
          .filter((pt: any) => !aiTemplateIds.has(pt.id))
          .map((pt: any) => {
            const full = templatesRes.rows.find((tr: any) => tr.id === pt.id);
            return full
              ? {
                  id: full.id,
                  name: full.name,
                  category: full.category,
                  docType: full.docType,
                  score: pt.score,
                  reason: pt.reason,
                }
              : null;
          })
          .filter(Boolean) as typeof ruleRecs.templates;
        ruleRecs.templates = [...ruleRecs.templates, ...extras];
        ruleRecs.templates.sort((a, b) => b.score - a.score);
      }

      if (parsed.knowledge && Array.isArray(parsed.knowledge)) {
        const aiKnowledgeIds = new Set(parsed.knowledge.map((k: any) => k.id));
        ruleRecs.knowledge = ruleRecs.knowledge.map((k) => {
          const ai = parsed.knowledge.find((pk: any) => pk.id === k.id);
          return ai ? { ...k, score: Math.round((k.score + ai.score) / 2), reason: ai.reason || k.reason } : k;
        });
        const extras = parsed.knowledge
          .filter((pk: any) => !aiKnowledgeIds.has(pk.id))
          .map((pk: any) => {
            const full = knowledgeRes.rows.find((kr: any) => kr.id === pk.id);
            return full
              ? {
                  id: full.id,
                  title: full.title,
                  domain: full.domain,
                  score: pk.score,
                  reason: pk.reason,
                }
              : null;
          })
          .filter(Boolean) as typeof ruleRecs.knowledge;
        ruleRecs.knowledge = [...ruleRecs.knowledge, ...extras];
        ruleRecs.knowledge.sort((a, b) => b.score - a.score);
      }

      if (parsed.summary) {
        aiSummary = parsed.summary;
      }
      aiEnhanced = true;
    } catch (aiErr: any) {
      console.error("AI recommendation enhancement failed:", aiErr.message);
    }

    return Response.json({
      ok: true,
      aiEnhanced,
      summary: aiSummary,
      templates: ruleRecs.templates.slice(0, 6),
      knowledge: ruleRecs.knowledge.slice(0, 4),
    });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
