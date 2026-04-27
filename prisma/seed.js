const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Seeding database...');
  try {
    await prisma.knowledgeItem.create({ 
      data: { 
        domain: 'TOGAF', 
        title: 'Test', 
        description: 'Test' 
      } 
    });
    console.log('Seed successful!');
  } catch (e) {
    console.error('Seed failed:', e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
