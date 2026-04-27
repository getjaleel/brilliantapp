import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.phaseTask.deleteMany();
  await prisma.engagementPhase.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.control.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.artefact.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.stakeholder.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.knowledgeItem.deleteMany();

  // 1. Seed Knowledge Library
  const knowledgeItems = [
    {
      domain: "TOGAF",
      title: "Architecture Principles",
      description: "Core rules that guide the architecture and ensure consistency across the organization.",
      usage: "Use during the Preliminary Phase to define the 'guardrails' for all subsequent architecture work.",
      questions: "What are the non-negotiable business goals? What technical standards must be followed? Who are the key decision makers for principles?",
      inputs: "Business strategy, stakeholder interviews, industry benchmarks.",
      outputs: "Architecture Principles Document.",
      controls: "Governance Framework, Design Authority Approval.",
    },
    {
      domain: "AWS",
      title: "Well-Architected Framework: Reliability",
      description: "Ensure the workload performs its intended function consistently and recovers from failures.",
      usage: "Use during Target Architecture design to validate resilience and availability.",
      questions: "What is the RTO and RPO? How is the system distributed across AZs? Is there a tested DR plan?",
      inputs: "SLA requirements, failure mode analysis, current infrastructure map.",
      outputs: "Reliability Assessment, DR Roadmap.",
      controls: "Backup Policies, Multi-AZ Deployment, Health Checks.",
    },
    {
      domain: "Cyber",
      title: "Essential Eight Maturity Assessment",
      description: "Australian Government strategy to mitigate cyber security incidents.",
      usage: "Use during Security Assessment to benchmark the current state against the ASD Essential Eight.",
      questions: "Is application control implemented? How is patching managed? Are backups protected from ransomware?",
      inputs: "Current security configurations, patching logs, backup schedules.",
      outputs: "Essential Eight Maturity Report, Gap Analysis.",
      controls: "Application Control, Patching, MFA, Macro Disabling, User Application Hardening, Restricted Admin Privileges, Regular Backups.",
    },
    {
      domain: "DevOps",
      title: "CI/CD Maturity Model",
      description: "Evaluating the automation and reliability of the software delivery lifecycle.",
      usage: "Use during DevOps Review to identify bottlenecks in the release process.",
      questions: "Is the pipeline fully automated? Are tests integrated? Is there a manual approval gate for production?",
      inputs: "Pipeline definition (YAML), test reports, deployment logs.",
      outputs: "DevOps Maturity Scorecard, Automation Roadmap.",
      controls: "Branching Strategy, Automated Testing, Deployment Approvals.",
    },
    {
      domain: "DataGov",
      title: "Data Classification Framework",
      description: "Defining levels of data sensitivity to apply appropriate security controls.",
      usage: "Use during Data Governance review to map data assets to security levels.",
      questions: "What data is considered 'Highly Confidential'? Who owns the data? How is data labeled?",
      inputs: "Data inventory, business sensitivity guidelines, legal requirements.",
      outputs: "Data Classification Matrix, Access Control Policy.",
      controls: "Encryption at rest, IAM policies, Data Leakage Prevention (DLP).",
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.create({ data: item });
  }

  // 2. Seed Engagement Phases
  const phases = [
    { name: "Initial Discovery", order: 1, purpose: "Understand high-level business goals, stakeholders, and constraints." },
    { name: "Business Context", order: 2, purpose: "Deep dive into business capabilities, processes, and value streams." },
    { name: "Current State Assessment", order: 3, purpose: "Document technical baseline, existing architecture, and pain points." },
    { name: "Requirements Gathering", order: 4, purpose: "Define functional and non-functional requirements (NFRs)." },
    { name: "Risk and Compliance Assessment", order: 5, purpose: "Identify security, compliance, and operational risks." },
    { name: "Target Architecture", order: 6, purpose: "Design the future state architecture based on requirements and principles." },
    { name: "Gap Analysis", order: 7, purpose: "Identify the delta between current and target states." },
    { name: "Roadmap", order: 8, purpose: "Plan the transition from current to target state in increments." },
    { name: "Implementation Planning", order: 9, purpose: "Define the detailed build and rollout strategy." },
    { name: "Governance and Audit Readiness", order: 10, purpose: "Ensure the solution meets all governance and regulatory standards." },
    { name: "Handover and Continuous Improvement", order: 11, purpose: "Transition to operations and establish a feedback loop." },
  ];

  const org = await prisma.organisation.create({
    data: { name: "Architecture Consulting Ltd" },
  });

  const client = await prisma.client.create({
    data: {
      name: "Government Agency X",
      industry: "Public Sector",
      organisationId: org.id,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Cloud Modernisation Project",
      clientId: client.id,
      description: "Migrating legacy on-premise systems to AWS with a focus on security and resilience.",
      status: "DISCOVERY",
    },
  });

  for (const phase of phases) {
    await prisma.engagementPhase.create({
      data: {
        ...phase,
        projectId: project.id,
      },
    });
  }

  const discoveryPhase = await prisma.engagementPhase.findFirst({
    where: { name: "Initial Discovery", projectId: project.id },
  });

  if (discoveryPhase) {
    const tasks = [
      { title: "Identify key stakeholders", description: "Map stakeholders and their influence/interest.", category: "Question" },
      { title: "Define business drivers", description: "Understand why this project is happening now.", category: "Input" },
      { title: "Document existing constraints", description: "Identify technical, budget, or legal constraints.", category: "Input" },
      { title: "Draft project scope", description: "Clearly define what is and isn't in scope.", category: "Output" },
    ];

    for (const task of tasks) {
      await prisma.phaseTask.create({
        data: {
          ...task,
          phaseId: discoveryPhase.id,
        },
      });
    }
  }

  await prisma.risk.createMany({
    data: [
      {
        projectId: project.id,
        title: "Lack of Cloud Skills",
        description: "Internal team lacks experience in AWS landing zone patterns.",
        impact: "High",
        probability: "High",
        mitigation: "Provide targeted training or engage a professional services partner.",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Data Residency Breach",
        description: "Risk of storing sensitive government data outside of Australian borders.",
        impact: "Critical",
        probability: "Low",
        mitigation: "Use AWS Sydney region and implement strict region-lock policies.",
        status: "OPEN",
      },
    ],
  });

  await prisma.control.createMany({
    data: [
      {
        projectId: project.id,
        name: "Application Control",
        framework: "Essential Eight",
        requirement: "Restrict execution of unapproved binaries.",
        status: "NOT_MET",
        evidence: "No centralized application white-listing in place.",
      },
      {
        projectId: project.id,
        name: "Patch Applications",
        framework: "Essential Eight",
        requirement: "Patch applications within 48 hours of a critical release.",
        status: "PARTIAL",
        evidence: "Patching is performed monthly, but critical patches are often delayed.",
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(() => {
    prisma.$disconnect();
  });
