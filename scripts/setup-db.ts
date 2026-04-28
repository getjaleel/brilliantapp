import { Signer } from "@aws-sdk/rds-signer";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { execSync } from "child_process";

async function getDatabaseUrl(): Promise<string> {
  const host = process.env.PGHOST!;
  const port = Number(process.env.PGPORT || "5432");
  const user = process.env.PGUSER!;
  const region = process.env.AWS_REGION!;
  const database = process.env.PGDATABASE || "postgres";

  const credentials = awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region },
  });

  const signer = new Signer({
    hostname: host,
    port,
    username: user,
    region,
    credentials,
  });

  const token = await signer.getAuthToken();
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(token)}@${host}:${port}/${database}?sslmode=require`;
}

async function main() {
  console.log("Generating IAM auth token...");
  const dbUrl = await getDatabaseUrl();

  console.log("Pushing Prisma schema to RDS...");
  execSync("npx prisma db push --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });

  console.log("\nSchema pushed! Now seeding...");
  execSync("npx tsx scripts/seed-rds.ts", {
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: "inherit",
  });

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
