import { Pool } from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

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

function getIamSigner(credentials?: any) {
  const host = process.env.PGHOST!;
  const port = Number(process.env.PGPORT!);
  const user = process.env.PGUSER!;
  const region = process.env.AWS_REGION!;

  return new Signer({
    hostname: host,
    port,
    username: user,
    region,
    ...(credentials ? { credentials } : {}),
  });
}

function getPoolConfig() {
  // 1. Vercel runtime: OIDC IAM auth
  if (process.env.VERCEL && process.env.AWS_ROLE_ARN && process.env.PGHOST) {
    const signer = getIamSigner(
      awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN,
        clientConfig: { region: process.env.AWS_REGION! },
      })
    );
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT!),
      user: process.env.PGUSER!,
      database: process.env.PGDATABASE || "postgres",
      password: () => signer.getAuthToken(),
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
      max: 20,
    };
  }

  // 2. Local/AWS env: IAM auth with default credential chain
  if (process.env.AWS_ROLE_ARN && process.env.PGHOST) {
    const signer = getIamSigner(); // no credentials = default AWS chain
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT!),
      user: process.env.PGUSER!,
      database: process.env.PGDATABASE || "postgres",
      password: () => signer.getAuthToken(),
      ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
      max: 20,
    };
  }

  // 3. Fallback to explicit DATABASE_URL
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

  throw new Error("No database config. Set DATABASE_URL or PGHOST+AWS_ROLE_ARN.");
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
