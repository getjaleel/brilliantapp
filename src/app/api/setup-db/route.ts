import { query } from "@/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Read the generated SQL
    const sqlPath = join(process.cwd(), "prisma", "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // Split into individual statements and execute
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await query(stmt + ";", []);
        results.push(`OK: ${stmt.split("\n")[0].trim()}`);
      } catch (err: any) {
        // Ignore "already exists" errors
        if (err.message?.includes("already exists")) {
          results.push(`SKIP (exists): ${stmt.split("\n")[0].trim()}`);
        } else {
          results.push(`ERR: ${err.message?.split("\n")[0]}`);
        }
      }
    }

    // Insert seed data
    await seedDatabase();

    return Response.json({
      ok: true,
      message: "Schema pushed and seeded",
      executed: results.length,
      details: results.slice(0, 20),
    });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}

async function seedDatabase() {
  // Check if already seeded
  const existing = await query('SELECT COUNT(*) FROM "Project"', []);
  if (Number(existing.rows[0].count) > 0) return;

  const now = new Date().toISOString();

  // Organisation
  const orgId = "org_seed_001";
  await query(
    `INSERT INTO "Organisation" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
    [orgId, "Acme Corp", now]
  );

  // Client
  const clientId = "client_seed_001";
  await query(
    `INSERT INTO "Client" (id, name, industry, "organisationId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $5)`,
    [clientId, "Acme Industries", "Technology", orgId, now]
  );

  // Project
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

  // Engagement Phases
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

  // Risks
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

  // Controls
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

  // Knowledge Items
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
