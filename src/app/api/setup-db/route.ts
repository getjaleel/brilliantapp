import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "Organisation" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "organisationId" TEXT NOT NULL REFERENCES "Organisation"("id"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id"),
    "description" TEXT,
    "businessDrivers" TEXT,
    "scope" TEXT,
    "constraints" TEXT,
    "regulatoryEnv" TEXT,
    "cloudProvider" TEXT,
    "securityClass" TEXT,
    "targetOutcomes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "EngagementPhase" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Risk" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impact" TEXT,
    "probability" TEXT,
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Control" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "framework" TEXT,
    "requirement" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "evidence" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Artefact" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "KnowledgeItem" (
    "id" TEXT PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usage" TEXT,
    "questions" TEXT,
    "inputs" TEXT,
    "outputs" TEXT,
    "controls" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Stakeholder" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "influence" TEXT,
    "interest" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "AIConversation" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "AIMessage" (
    "id" TEXT PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "AIConversation"("id"),
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Decision" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "context" TEXT,
    "decision" TEXT,
    "consequences" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "RoadmapItem" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "phase" TEXT,
    "priority" TEXT,
    "dependency" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
];

export async function GET() {
  const results: string[] = [];

  try {
    for (const stmt of CREATE_TABLES) {
      try {
        await query(stmt, []);
        results.push("OK: " + stmt.split("\n")[0].trim());
      } catch (err: any) {
        if (err.message?.includes("already exists")) {
          results.push("SKIP: table exists");
        } else {
          results.push("ERR: " + err.message?.split("\n")[0]);
        }
      }
    }

    await seedDatabase();

    return Response.json({
      ok: true,
      message: "Schema pushed and seeded",
      executed: results.length,
      details: results,
    });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message, details: results },
      { status: 500 }
    );
  }
}

async function seedDatabase() {
  const existing = await query('SELECT COUNT(*) FROM "Project"', []);
  if (Number(existing.rows[0].count) > 0) return;

  const now = new Date().toISOString();

  const orgId = "org_seed_001";
  await query(
    `INSERT INTO "Organisation" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
    [orgId, "Acme Corp", now]
  );

  const clientId = "client_seed_001";
  await query(
    `INSERT INTO "Client" (id, name, industry, "organisationId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $5)`,
    [clientId, "Acme Industries", "Technology", orgId, now]
  );

  const projectId = "proj_seed_001";
  await query(
    `INSERT INTO "Project" (id, name, "clientId", description, "businessDrivers", scope, constraints, "regulatoryEnv", "cloudProvider", "securityClass", "targetOutcomes", status, "aiEnabled", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)`,
    [
      projectId,
      "Cloud Migration Assessment",
      clientId,
      "Initial discovery phase for AWS cloud migration",
      "Cost reduction, scalability, compliance",
      "Infrastructure assessment and migration planning",
      "Budget Q3, security clearance required",
      "Australian ISM, Essential Eight",
      "AWS",
      "PROTECTED",
      "Cloud-ready architecture blueprint",
      "DISCOVERY",
      true,
      now,
    ]
  );

  const phases = [
    { name: "Initial Discovery", order: 1, status: "COMPLETED", purpose: "Understand current state and business drivers" },
    { name: "Current State Assessment", order: 2, status: "IN_PROGRESS", purpose: "Map existing architecture and identify gaps" },
    { name: "Target Architecture", order: 3, status: "PENDING", purpose: "Design future-state cloud architecture" },
    { name: "Risk Assessment", order: 4, status: "PENDING", purpose: "Identify and mitigate migration risks" },
    { name: "Compliance Mapping", order: 5, status: "PENDING", purpose: "Map controls to ISM/Essential Eight" },
  ];

  for (const phase of phases) {
    const phaseId = `phase_${phase.order}_seed`;
    await query(
      `INSERT INTO "EngagementPhase" (id, "projectId", name, "order", status, purpose, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [phaseId, projectId, phase.name, phase.order, phase.status, phase.purpose, now]
    );
  }

  const risks = [
    { title: "Data residency compliance", description: "Sensitive data may leave Australian jurisdiction", impact: "High", probability: "Medium", mitigation: "Implement AWS Sydney region with encryption" },
    { title: "Skill gap in cloud operations", description: "Team lacks AWS certified engineers", impact: "Medium", probability: "High", mitigation: "Training program + managed services partner" },
    { title: "Legacy system compatibility", description: "Mainframe integration may not support modern APIs", impact: "High", probability: "Medium", mitigation: "API gateway + abstraction layer" },
  ];

  for (let i = 0; i < risks.length; i++) {
    await query(
      `INSERT INTO "Risk" (id, "projectId", title, description, impact, probability, mitigation, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', $8, $8)`,
      [`risk_${i}_seed`, projectId, risks[i].title, risks[i].description, risks[i].impact, risks[i].probability, risks[i].mitigation, now]
    );
  }

  const controls = [
    { name: "Multi-factor authentication", framework: "Essential Eight", requirement: "MFA for all privileged access", status: "MET" },
    { name: "Patch management", framework: "ISM", requirement: "Critical patches within 48 hours", status: "PARTIAL" },
    { name: "Data encryption at rest", framework: "Essential Eight", requirement: "AES-256 encryption for all stored data", status: "MET" },
  ];

  for (let i = 0; i < controls.length; i++) {
    await query(
      `INSERT INTO "Control" (id, "projectId", name, framework, requirement, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [`control_${i}_seed`, projectId, controls[i].name, controls[i].framework, controls[i].requirement, controls[i].status, now]
    );
  }

  const knowledge = [
    { domain: "TOGAF", title: "Architecture Development Method", description: "Iterative process for developing enterprise architecture" },
    { domain: "AWS", title: "Well-Architected Framework", description: "Operational excellence, security, reliability, performance efficiency, cost optimization, sustainability" },
    { domain: "Cyber", title: "Essential Eight Maturity Model", description: "Australian Signals Directorate top mitigation strategies" },
  ];

  for (const item of knowledge) {
    await query(
      `INSERT INTO "KnowledgeItem" (id, domain, title, description, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
      [`know_${item.domain}_seed`, item.domain, item.title, item.description, now]
    );
  }
}
