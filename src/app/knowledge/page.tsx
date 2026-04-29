import { query } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const result = await query(
    'SELECT * FROM "KnowledgeItem" ORDER BY domain, title',
    []
  );
  const items = result.rows;

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
      <p className="text-slate-500">
        Architecture patterns, frameworks, and reference materials.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any) => (
          <Link key={item.id} href={`/knowledge/${item.id}`}>
            <div
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer h-full"
            >
              <div className="text-xs font-medium text-blue-600 mb-1">
                {item.domain}
              </div>
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-3">
                {item.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
