import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";
import { Pool } from "pg";

const signer = new Signer({
  hostname: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER,
  region: process.env.AWS_REGION,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN,
    clientConfig: { region: process.env.AWS_REGION },
  }),
});

export const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE || "postgres",
  password: () => signer.getAuthToken(),
  port: Number(process.env.PGPORT),
  ssl: { rejectUnauthorized: false },
  max: 20,
});

export async function query(sql: string, args: unknown[]) {
  return pool.query(sql, args);
}

export async function withConnection<<TT>(
  fn: (client: any) => Promise<<TT>,
): Promise<<TT> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
