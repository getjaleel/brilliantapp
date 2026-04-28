import { Pool } from "pg";
import { Signer } from "@aws-sdk/rds-signer";

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

async function getIamCredentials() {
  // On Vercel: use OIDC token
  if (process.env.VERCEL) {
    const { awsCredentialsProvider } = await import("@vercel/functions/oidc");
    return awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_REGION! },
    });
  }
  // Local: AWS SDK uses default credential chain (~/.aws/credentials or env vars)
  return undefined;
}

function getPoolConfig() {
  if (process.env.AWS_ROLE_ARN && process.env.PGHOST) {
    const host = process.env.PGHOST!;
    const port = Number(process.env.PGPORT!);
    const user = process.env.PGUSER!;
    const region = process.env.AWS_REGION!;

    return {
      host,
      port,
      user,
      database: process.env.PGDATABASE || "postgres",
      password: async () => {
        const credentials = await getIamCredentials();
        const signer = new Signer({
          hostname: host,
          port,
          username: user,
          region,
          credentials,
        });
        return signer.getAuthToken();
      },
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
      max: 20,
    };
  }

  if (process.env.DATABASE_URL) {
    const parsed = parseDatabaseUrl(process.env.DATABASE_URL);
    return {
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
      database: parsed.database,
      ssl: parsed.sslMode === "disable" ? false : { rejectUnauthorized: false },
      max: 20,
    };
  }

  throw new Error("No database configuration found. Set DATABASE_URL or PGHOST/PGPORT/PGUSER/AWS_REGION/AWS_ROLE_ARN.");
}

export const pool = new Pool(getPoolConfig());

export async function query(sql: string, args: unknown[]) {
  return pool.query(sql, args);
}

export async function withConnection<T>(
  fn: (client: any) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
