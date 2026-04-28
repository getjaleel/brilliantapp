import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const result = await query(
    'SELECT * FROM "Client" ORDER BY name',
    []
  );
  const clients = result.rows;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
      <p className="text-slate-500">
        Organisations and stakeholders.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client: any) => (
          <div
            key={client.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="font-semibold text-sm">{client.name}</div>
            <div className="text-xs text-slate-500 mt-1">
              {client.industry || "No industry specified"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
