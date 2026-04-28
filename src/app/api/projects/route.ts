import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      clientId,
      description,
      businessDrivers,
      scope,
      constraints,
      regulatoryEnv,
      cloudProvider,
      securityClass,
      targetOutcomes,
    } = body;

    if (!name || !clientId) {
      return Response.json({ ok: false, error: "Name and client are required" }, { status: 400 });
    }

    const id = `proj_${Date.now()}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO "Project" (id, name, "clientId", description, "businessDrivers", scope, constraints, "regulatoryEnv", "cloudProvider", "securityClass", "targetOutcomes", status, "aiEnabled", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'DISCOVERY', true, $12, $12)`,
      [id, name, clientId, description, businessDrivers, scope, constraints, regulatoryEnv, cloudProvider, securityClass, targetOutcomes, now]
    );

    // Seed default engagement phases
    const defaultPhases = [
      { name: "Initial Discovery", order: 1, status: "PENDING", purpose: "Understand business drivers, stakeholder landscape, and engagement boundaries" },
      { name: "Current State Assessment", order: 2, status: "PENDING", purpose: "Document existing architecture, technical debt, and integration dependencies" },
      { name: "Target Architecture", order: 3, status: "PENDING", purpose: "Design future-state cloud-native architecture aligned to Well-Architected principles" },
      { name: "Risk Assessment", order: 4, status: "PENDING", purpose: "Identify, score, and mitigate architecture and migration risks" },
      { name: "Compliance Mapping", order: 5, status: "PENDING", purpose: "Map controls to target architecture and identify gaps" },
    ];

    for (const phase of defaultPhases) {
      const phaseId = `phase_${Date.now()}_${phase.order}`;
      await query(
        `INSERT INTO "EngagementPhase" (id, "projectId", name, "order", status, purpose, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
        [phaseId, id, phase.name, phase.order, phase.status, phase.purpose, now]
      );
    }

    return Response.json({ ok: true, id });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
