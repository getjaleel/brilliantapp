import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

const host = env("PGHOST");
const port = Number(env("PGPORT"));
const user = env("PGUSER");
const region = env("AWS_REGION");
const roleArn = env("AWS_ROLE_ARN");

const signer = new Signer({
  hostname: host,
  port,
  username: user,
  region,
  credentials: awsCredentialsProvider({
    roleArn,
    clientConfig: { region },
  }),
});

const sslMode = process.env.PGSSLMODE;
const ssl = sslMode === "disable" ? false : { rejectUnauthorized: false };

export const pool = new Pool({
  host,
  user,
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getAuthToken(),
  port,
  ssl,
  max: 20,
});

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
