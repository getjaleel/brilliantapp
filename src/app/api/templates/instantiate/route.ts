import { query } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const templateId = formData.get("templateId") as string;
    const projectId = formData.get("projectId") as string;
    const artefactName = formData.get("artefactName") as string;

    if (!templateId || !projectId || !artefactName) {
      return Response.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const templateResult = await query(
      'SELECT * FROM "DocumentTemplate" WHERE id = $1',
      [templateId]
    );
    const template = templateResult.rows[0];
    if (!template) {
      return Response.json(
        { ok: false, error: "Template not found" },
        { status: 404 }
      );
    }

    await query(
      `INSERT INTO "Artefact" (id, "projectId", name, type, content, version, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        `art_${Date.now()}`,
        projectId,
        artefactName,
        template.name,
        template.content,
        1,
      ]
    );

    return Response.redirect(
      new URL(`/artefacts/${projectId}`, request.url),
      303
    );
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
