import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const result = await query(
    'SELECT * FROM "RoadmapItem" ORDER BY "createdAt" DESC',
    []
  );
  const items = result.rows;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
      <p className="text-slate-500">
        Architecture and migration timeline.
      </p>

      <div className="space-y-4">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-slate-400">{item.phase}</div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Priority: {item.priority}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
