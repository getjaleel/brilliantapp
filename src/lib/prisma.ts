import { PrismaClient } from "@prisma/client";

function buildDatabaseUrl(): string {
  const host = process.env.PGHOST;
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD || "";
  const database = process.env.PGDATABASE || "postgres";
  const sslMode = process.env.PGSSLMODE;

  if (!host || !user) {
    throw new Error("Missing PGHOST or PGUSER environment variable");
  }

  const ssl = sslMode === "disable" ? "" : `?sslmode=${sslMode || "require"}`;
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}${ssl}`;
}

if (!process.env.DATABASE_URL && process.env.PGHOST) {
  process.env.DATABASE_URL = buildDatabaseUrl();
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
