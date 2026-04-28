import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Organisation
  const org = await prisma.organisation.create({
    data: { name: "Acme Corp" },
  });
  console.log("Created organisation:", org.id);

  // Create Client
  const client = await prisma.client.create({
    data: {
      name: "Acme Industries",
      industry: "Technology",
      organisationId: org.id,
    },
  });
  console.log("Created client:", client.id);

  // Create Project
  const project = await prisma.project.create({
    data: {
      name: "Cloud Migration Assessment",
      clientId: client.id,
      description: "Initial discovery phase for AWS cloud migration",
      businessDrivers: "Cost reduction, scalability, compliance",
      scope: "Infrastructure assessment and migration planning",
      constraints: "Budget Q3, security clearance required",
      regulatoryEnv: "Australian ISM, Essential Eight",
      cloudProvider: "AWS",
      securityClass: "PROTECTED",
      targetOutcomes: "Cloud-ready architecture blueprint",
      status: "DISCOVERY",
      aiEnabled: true,
    },
  });
  console.log("Created project:", project.id);

  // Create Engagement Phases
  const phases = [
    { name: "Initial Discovery", order: 1, status: "COMPLETED", purpose: "Understand current state and business drivers" },
    { name: "Current State Assessment", order: 2, status: "IN_PROGRESS", purpose: "Map existing architecture and identify gaps" },
    { name: "Target Architecture", order: 3, status: "PENDING", purpose: "Design future-state cloud architecture" },
    { name: "Risk Assessment", order: 4, status: "PENDING", purpose: "Identify and mitigate migration risks" },
    { name: "Compliance Mapping", order: 5, status: "PENDING", purpose: "Map controls to ISM/Essential Eight" },
  ];

  for (const phase of phases) {
    await prisma.engagementPhase.create({
      data: { ...phase, projectId: project.id },
    });
  }
  console.log("Created 5 engagement phases");

  // Create Risks
  const risks = [
    { title: "Data residency compliance", description: "Sensitive data may leave Australian jurisdiction", impact: "High", probability: "Medium", mitigation: "Implement AWS Sydney region with encryption" },
    { title: "Skill gap in cloud operations", description: "Team lacks AWS certified engineers", impact: "Medium", probability: "High", mitigation: "Training program + managed services partner" },
    { title: "Legacy system compatibility", description: "Mainframe integration may not support modern APIs", impact: "High", probability: "Medium", mitigation: "API gateway + abstraction layer" },
  ];

  for (const risk of risks) {
    await prisma.risk.create({
      data: { ...risk, projectId: project.id },
    });
  }
  console.log("Created 3 risks");

  // Create Controls
  const controls = [
    { name: "Multi-factor authentication", framework: "Essential Eight", requirement: "MFA for all privileged access", status: "MET" },
    { name: "Patch management", framework: "ISM", requirement: "Critical patches within 48 hours", status: "PARTIAL" },
    { name: "Data encryption at rest", framework: "Essential Eight", requirement: "AES-256 encryption for all stored data", status: "MET" },
  ];

  for (const control of controls) {
    await prisma.control.create({
      data: { ...control, projectId: project.id },
    });
  }
  console.log("Created 3 controls");

  // Create Artefacts
  const artefacts = [
    { name: "Architecture Principles v1.0", type: "Architecture Principles", content: "1. Cloud-first\n2. Security by design\n3. Open standards" },
    { name: "Current State Diagram", type: "Current State Summary", content: "Network topology showing on-prem DC with 3-tier app" },
  ];

  for (const art of artefacts) {
    await prisma.artefact.create({
      data: { ...art, projectId: project.id },
    });
  }
  console.log("Created 2 artefacts");

  // Create Knowledge Items
  const knowledgeItems = [
    { domain: "TOGAF", title: "Architecture Development Method", description: "Iterative process for developing enterprise architecture", usage: "All architecture engagements", questions: "What is the business strategy? Who are the stakeholders?", inputs: "Business strategy, current state docs", outputs: "Architecture vision, gap analysis" },
    { domain: "AWS", title: "Well-Architected Framework", description: "Operational excellence, security, reliability, performance efficiency, cost optimization, sustainability", usage: "Cloud architecture reviews", questions: "How do you manage operational health?", inputs: "Architecture diagrams, metrics", outputs: "Improvement plan, risk register" },
    { domain: "Cyber", title: "Essential Eight Maturity Model", description: "Australian Signals Directorate top mitigation strategies", usage: "Security assessments", questions: "What is your current maturity level?", inputs: "Security audit results", outputs: "Maturity assessment, roadmap" },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.create({ data: item });
  }
  console.log("Created 3 knowledge items");

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
