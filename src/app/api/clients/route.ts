import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await query('SELECT id, name, industry FROM "Client" ORDER BY name ASC', []);
    return Response.json({ ok: true, clients: result.rows });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
