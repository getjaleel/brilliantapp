import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ArtefactsPage() {
  const result = await query(
    'SELECT * FROM "Artefact" ORDER BY "createdAt" DESC',
    []
  );
  const artefacts = result.rows;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Artefacts</h1>
      <p className="text-slate-500">
        Generated architecture deliverables and documentation.
      </p>

      <div className="space-y-4">
        {artefacts.map((art: any) => (
          <div
            key={art.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="font-semibold text-sm">{art.name}</div>
              <div className="text-xs text-slate-400">{art.type}</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              v{art.version} &bull; {new Date(art.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
