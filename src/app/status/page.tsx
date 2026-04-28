import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  let dbResult: any = null;
  let dbError: string | null = null;

  try {
    dbResult = await query("SELECT NOW() as time, version() as version", []);
  } catch (err: any) {
    dbError = err.message || String(err);
  }

  const envVars = {
    PGHOST: !!process.env.PGHOST,
    PGPORT: !!process.env.PGPORT,
    PGUSER: !!process.env.PGUSER,
    PGDATABASE: !!process.env.PGDATABASE,
    PGSSLMODE: !!process.env.PGSSLMODE,
    AWS_REGION: !!process.env.AWS_REGION,
    AWS_ROLE_ARN: !!process.env.AWS_ROLE_ARN,
    AWS_RESOURCE_ARN: !!process.env.AWS_RESOURCE_ARN,
    VERCEL: !!process.env.VERCEL,
    VERCEL_OIDC_TOKEN: !!process.env.VERCEL_OIDC_TOKEN,
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold">RDS Connectivity Test</h1>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.entries(envVars).map(([key, present]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={present ? "text-green-600" : "text-red-600"}>
                {present ? "✓" : "✗"}
              </span>
              <span>{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-2">Database Connection</h2>
        {dbError ? (
          <div className="text-red-600">
            <div className="font-semibold">Error</div>
            <div className="text-sm font-mono bg-red-50 p-2 rounded">{dbError}</div>
          </div>
        ) : (
          <div className="text-green-600">
            <div className="font-semibold">Connected</div>
            <div className="text-sm font-mono bg-green-50 p-2 rounded">
              Time: {dbResult?.rows[0]?.time}
              <br />
              Version: {dbResult?.rows[0]?.version}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
