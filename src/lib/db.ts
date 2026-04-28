import { Pool } from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";
import { attachDatabasePool } from "@vercel/functions";

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const sslMode = parsed.searchParams.get("sslmode");
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1) || "postgres",
    sslMode,
  };
}

function getPool() {
  // 1. IAM auth via OIDC (works both on Vercel and locally after env pull)
  if (process.env.AWS_ROLE_ARN && process.env.PGHOST) {
    const credentials = awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN,
      clientConfig: { region: process.env.AWS_REGION! },
    });

    const signer = new Signer({
      hostname: process.env.PGHOST,
      port: Number(process.env.PGPORT || "5432"),
      username: process.env.PGUSER!,
      region: process.env.AWS_REGION!,
      credentials,
    });

    const pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || "5432"),
      user: process.env.PGUSER,
      database: process.env.PGDATABASE || "postgres",
      password: ((cb: (err: Error | null, password: string) => void) => {
        signer
          .getAuthToken()
          .then((token) => cb(null, token))
          .catch((err) => cb(err as Error, ""));
      }) as any,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });

    if (process.env.VERCEL) attachDatabasePool(pool);
    return pool;
  }

  // 2. Explicit password auth
  if (process.env.PGHOST && process.env.PGPASSWORD) {
    return new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || "5432"),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || "postgres",
      ssl:
        process.env.PGSSLMODE === "disable"
          ? false
          : { rejectUnauthorized: false },
      max: 20,
    });
  }

  // 3. DATABASE_URL fallback
  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    return new Pool({
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl: parsed.sslMode === "disable" ? false : { rejectUnauthorized: false },
      max: 20,
    });
  }

  throw new Error(
    "No database config. Set DATABASE_URL or PGHOST+AWS_ROLE_ARN or PGHOST+PGPASSWORD."
  );
}

export const pool = getPool();

export async function query(sql: string, args: unknown[]) {
  return pool.query(sql, args);
}

export async function withConnection<T>(
  fn: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
