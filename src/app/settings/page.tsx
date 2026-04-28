import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await query(
    'SELECT * FROM "Organisation" LIMIT 1',
    []
  );
  const org = result.rows[0];

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-slate-500">
        Organisation and application configuration.
      </p>

      <div className="p-4 rounded-xl border border-slate-200">
        <div className="font-semibold text-sm">Organisation</div>
        <div className="text-xs text-slate-500 mt-1">
          {org?.name || "Not configured"}
        </div>
      </div>
    </div>
  );
}
