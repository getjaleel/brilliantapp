import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("Seeding...");
  await prisma.knowledgeItem.create({ data: { domain: "TOGAF", title: "Test", description: "Test" } });
  console.log("Done");
}
main().catch(console.error).finally(() => prisma.$disconnect());
