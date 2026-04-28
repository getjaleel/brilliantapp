import { PrismaClient } from "@prisma/client";
import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

async function buildIamDatabaseUrl(): Promise<string> {
  const host = process.env.PGHOST!;
  const port = Number(process.env.PGPORT || "5432");
  const user = process.env.PGUSER!;
  const region = process.env.AWS_REGION!;
  const database = process.env.PGDATABASE || "postgres";

  let token: string;

  if (process.env.VERCEL && process.env.AWS_ROLE_ARN) {
    const credentials = awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN,
      clientConfig: { region },
    });
    const signer = new Signer({
      hostname: host,
      port,
      username: user,
      region,
      credentials,
    });
    token = await signer.getAuthToken();
  } else if (process.env.AWS_ROLE_ARN) {
    const signer = new Signer({
      hostname: host,
      port,
      username: user,
      region,
    });
    token = await signer.getAuthToken();
  } else {
    throw new Error("AWS_ROLE_ARN required for IAM auth");
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(token)}@${host}:${port}/${database}?sslmode=require`;
}

async function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  if (process.env.PGHOST && process.env.PGPASSWORD) {
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || "5432";
    const user = process.env.PGUSER;
    const password = process.env.PGPASSWORD;
    const database = process.env.PGDATABASE || "postgres";
    const sslMode = process.env.PGSSLMODE;
    const ssl = sslMode === "disable" ? "" : `?sslmode=${sslMode || "require"}`;
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(user!)}:${encodeURIComponent(password)}@${host}:${port}/${database}${ssl}`;
    return;
  }
  if (process.env.PGHOST && process.env.AWS_ROLE_ARN) {
    process.env.DATABASE_URL = await buildIamDatabaseUrl();
    return;
  }
  throw new Error("No database config. Set DATABASE_URL or PGHOST+PGPASSWORD or PGHOST+AWS_ROLE_ARN.");
}

await ensureDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
