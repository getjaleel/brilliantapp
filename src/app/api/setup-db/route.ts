import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "Organisation" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "organisationId" TEXT NOT NULL REFERENCES "Organisation"("id"),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL REFERENCES "Client"("id"),
    "description" TEXT,
    "businessDrivers" TEXT,
    "scope" TEXT,
    "constraints" TEXT,
    "regulatoryEnv" TEXT,
    "cloudProvider" TEXT,
    "securityClass" TEXT,
    "targetOutcomes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "EngagementPhase" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "purpose" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Risk" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "impact" TEXT,
    "probability" TEXT,
    "mitigation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Control" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "framework" TEXT,
    "requirement" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_APPLICABLE',
    "evidence" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Artefact" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "KnowledgeItem" (
    "id" TEXT PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usage" TEXT,
    "questions" TEXT,
    "inputs" TEXT,
    "outputs" TEXT,
    "controls" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Stakeholder" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "influence" TEXT,
    "interest" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "AIConversation" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "AIMessage" (
    "id" TEXT PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "AIConversation"("id"),
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "Decision" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "context" TEXT,
    "decision" TEXT,
    "consequences" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "PhaseTask" (
    "id" TEXT PRIMARY KEY,
    "phaseId" TEXT NOT NULL REFERENCES "EngagementPhase"("id"),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS "RoadmapItem" (
    "id" TEXT PRIMARY KEY,
    "projectId" TEXT NOT NULL REFERENCES "Project"("id"),
    "title" TEXT NOT NULL,
    "phase" TEXT,
    "priority" TEXT,
    "dependency" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
];

export async function GET() {
  const results: string[] = [];

  try {
    for (const stmt of CREATE_TABLES) {
      try {
        await query(stmt, []);
        results.push("OK: " + stmt.split("\n")[0].trim());
      } catch (err: any) {
        if (err.message?.includes("already exists")) {
          results.push("SKIP: table exists");
        } else {
          results.push("ERR: " + err.message?.split("\n")[0]);
        }
      }
    }

    await seedDatabase();

    return Response.json({
      ok: true,
      message: "Schema pushed and seeded",
      executed: results.length,
      details: results,
    });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err.message, details: results },
      { status: 500 }
    );
  }
}

async function seedDatabase() {
  const existing = await query('SELECT COUNT(*) FROM "Project"', []);
  if (Number(existing.rows[0].count) > 0) return;

  const now = new Date().toISOString();

  // ─── Organisation ───
  const orgId = "org_seed_001";
  await query(
    `INSERT INTO "Organisation" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $3)`,
    [orgId, "Nexus Architecture Consulting", now]
  );

  // ─── Client ───
  const clientId = "client_seed_001";
  await query(
    `INSERT INTO "Client" (id, name, industry, "organisationId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $5)`,
    [clientId, "Acme Industries", "Financial Services & Insurance", orgId, now]
  );

  // ─── Project ───
  const projectId = "proj_seed_001";
  await query(
    `INSERT INTO "Project" (id, name, "clientId", description, "businessDrivers", scope, constraints, "regulatoryEnv", "cloudProvider", "securityClass", "targetOutcomes", status, "aiEnabled", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)`,
    [
      projectId,
      "Acme Industries — Cloud Migration & Modernisation",
      clientId,
      "End-to-end architecture engagement to assess, design, and roadmap Acme's migration from on-premise data centres to AWS cloud. Covers current state discovery, target architecture, risk assessment, compliance mapping (ISM / Essential Eight), and phased implementation roadmap.",
      "Reduce infrastructure TCO by 40% | Improve disaster recovery RPO to <1hr | Achieve APRA CPS 234 compliance | Enable auto-scaling for seasonal policy renewals | Decommission 2 ageing data centres by FY2027",
      "All customer-facing applications, policy administration systems, claims processing platform, data warehouse, and supporting integration middleware.",
      "Budget: $4.2M over 18 months | Security baseline: PROTECTED | AWS regions limited to ap-southeast-2 (Sydney) and ap-southeast-4 (Melbourne) | No lift-and-shift — re-architecture required | APRA audit window: Q2 FY2026",
      "Australian ISM (Feb 2024), Essential Eight Maturity Model, APRA CPS 234, ISO 27001, NIST CSF",
      "AWS",
      "PROTECTED",
      "Cloud-native architecture blueprint | Migration runbook | Risk register with mitigations | Compliance gap analysis | 3-year TCO model | Executive briefing pack",
      "DISCOVERY",
      true,
      now,
    ]
  );

  // ─── Engagement Phases ───
  const phases = [
    { id: "phase_1", name: "Initial Discovery", order: 1, status: "COMPLETED", purpose: "Understand business drivers, stakeholder landscape, and engagement boundaries" },
    { id: "phase_2", name: "Current State Assessment", order: 2, status: "IN_PROGRESS", purpose: "Document existing architecture, technical debt, and integration dependencies" },
    { id: "phase_3", name: "Target Architecture", order: 3, status: "PENDING", purpose: "Design future-state cloud-native architecture aligned to AWS Well-Architected" },
    { id: "phase_4", name: "Risk Assessment", order: 4, status: "PENDING", purpose: "Identify, score, and mitigate architecture and migration risks" },
    { id: "phase_5", name: "Compliance Mapping", order: 5, status: "PENDING", purpose: "Map ISM / Essential Eight controls to target architecture and identify gaps" },
  ];

  for (const phase of phases) {
    await query(
      `INSERT INTO "EngagementPhase" (id, "projectId", name, "order", status, purpose, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [phase.id, projectId, phase.name, phase.order, phase.status, phase.purpose, now]
    );
  }

  // ─── Phase Tasks ───
  const tasks = [
    { phaseId: "phase_1", title: "Stakeholder mapping workshop", description: "Identify all business and technical stakeholders with RACI", category: "Question", isCompleted: true },
    { phaseId: "phase_1", title: "Business driver prioritisation", description: "Rank drivers by impact, feasibility, and executive sponsorship", category: "Input", isCompleted: true },
    { phaseId: "phase_1", title: "Engagement charter sign-off", description: "Secure formal agreement on scope, constraints, and governance", category: "Output", isCompleted: true },
    { phaseId: "phase_2", title: "Infrastructure inventory", description: "Document all servers, networks, storage, and middleware", category: "Input", isCompleted: true },
    { phaseId: "phase_2", title: "Application dependency mapping", description: "Map upstream/downstream dependencies for all critical apps", category: "Input", isCompleted: false },
    { phaseId: "phase_2", title: "Technical debt register", description: "Catalogue legacy frameworks, EOL components, and skill gaps", category: "Output", isCompleted: false },
    { phaseId: "phase_3", title: "AWS landing zone design", description: "Design multi-account structure with SCPs and guardrails", category: "Output", isCompleted: false },
    { phaseId: "phase_3", title: "Containerisation strategy", description: "Define EKS/ECS approach for policy admin and claims", category: "Output", isCompleted: false },
    { phaseId: "phase_4", title: "Threat modelling session", description: "STRIDE-based threat model for target architecture", category: "Question", isCompleted: false },
    { phaseId: "phase_5", title: "ISM control gap analysis", description: "Map all 137 ISM controls to AWS services and config", category: "Input", isCompleted: false },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await query(
      `INSERT INTO "PhaseTask" (id, "phaseId", title, description, "isCompleted", category, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`task_${i}_seed`, tasks[i].phaseId, tasks[i].title, tasks[i].description, tasks[i].isCompleted, tasks[i].category, now]
    );
  }

  // ─── Risks ───
  const risks = [
    { title: "Data residency compliance breach", description: "Sensitive customer PII and policy data may inadvertently leave Australian jurisdiction through misconfigured AWS services (e.g., S3 cross-region replication, Lambda@Edge). APRA CPS 234 mandates data sovereignty for financial institutions.", impact: "Critical", probability: "High", mitigation: "Implement SCPs blocking all non-APAC regions | Enable AWS Config rule for s3-bucket-region-compliance | Tag all data stores with DataClassification=PROTECTED-AU | Quarterly automated compliance scan via AWS Security Hub" },
    { title: "Mainframe integration failure", description: "Policy admin core system (COBOL/DB2) has 47 undocumented batch interfaces. Direct API exposure may cause data inconsistency during peak renewal periods (3M policies in Oct-Nov).", impact: "High", probability: "Medium", mitigation: "Deploy API Gateway with circuit breaker pattern | Implement event-driven bridge via Amazon MQ | Run parallel reconciliation for 3 months | Phased cutover starting with read-only APIs" },
    { title: "Cloud skills gap in operations", description: "Current team has 2 AWS-certified engineers for 180+ server estate. Support model lacks 24/7 cloud operations coverage. Incident response SLA is 4 hours vs target 30 minutes.", impact: "High", probability: "High", mitigation: "Partner with AWS Managed Services for 24/7 L1/L2 | Upskill 8 engineers via AWS SA-Pro and Security Specialty certs | Hire 2 senior SREs with FinOps experience | Implement Infrastructure as Code (Terraform) to reduce manual ops" },
    { title: "Vendor lock-in to proprietary AWS services", description: "Tight coupling to AWS-native services (DynamoDB, Step Functions, Cognito) may increase exit costs and reduce negotiation leverage at contract renewal.", impact: "Medium", probability: "Medium", mitigation: "Adopt hexagonal architecture with repository abstraction layer | Use PostgreSQL-compatible Aurora instead of DynamoDB where feasible | Abstract identity behind Okta integration | Document all service boundaries and data contracts" },
    { title: "Seasonal capacity miscalculation", description: "Oct-Nov policy renewal spike (300% baseline traffic) may overwhelm auto-scaling if cold-start times exceed 8 minutes for EKS node groups.", impact: "Medium", probability: "Medium", mitigation: "Pre-warm EKS node groups via Karpenter scheduled scaling | Implement queue-based buffering with SQS + Lambda | Load test with 400% spike scenarios | Define manual scaling runbook for emergency capacity" },
  ];

  for (let i = 0; i < risks.length; i++) {
    await query(
      `INSERT INTO "Risk" (id, "projectId", title, description, impact, probability, mitigation, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', $8, $8)`,
      [`risk_${i}_seed`, projectId, risks[i].title, risks[i].description, risks[i].impact, risks[i].probability, risks[i].mitigation, now]
    );
  }

  // ─── Controls ───
  const controls = [
    { name: "Application control (whitelist)", framework: "Essential Eight", requirement: "M1: Only approved applications can execute. Block all unsigned binaries via Microsoft Defender Application Control or AWS EC2 instance policies.", status: "MET", evidence: "AppLocker policy deployed to 100% Windows fleet | AWS AMI hardened with CIS Level 2 | Quarterly compliance report Q1 2026", owner: "Sarah Chen (Security Lead)" },
    { name: "Patch management — applications", framework: "Essential Eight", requirement: "M2: Non-Microsoft applications patched within 48 hours of CVE release. Critical CVSS >9 within 24 hours.", status: "MET", evidence: "Automox deployment covering 340 endpoints | Integration with AWS Inspector for EC2 | Mean time to patch: 36 hours (target: 48)", owner: "DevOps Team" },
    { name: "Office macro hardening", framework: "Essential Eight", requirement: "M3: Only macros from trusted locations or with valid cert signatures execute. Block internet-originated macros.", status: "PARTIAL", evidence: "ASR rule enabled but 12% of users granted exceptions for legacy Excel models | Remediation plan approved by CISO", owner: "IT Security" },
    { name: "User application hardening", framework: "Essential Eight", requirement: "M4: Block ads, JavaScript, and untrusted add-ins in browsers and Office. Disable LLMNR and NetBIOS.", status: "MET", evidence: "Microsoft Edge managed mode with SmartScreen | uBlock Origin enterprise policy | Hardening GPO applied to all OUs", owner: "Endpoint Team" },
    { name: "Multi-factor authentication", framework: "Essential Eight", requirement: "M5: MFA for all privileged access and remote access. Phishing-resistant MFA (FIDO2/WebAuthn) for admin accounts.", status: "MET", evidence: "Azure AD + YubiKey for 47 admin accounts | AWS IAM Identity Center with SSO | No successful phishing simulation in 6 months", owner: "Identity Team" },
    { name: "Privileged access management", framework: "ISM", requirement: "ISM-1501: Separate admin accounts from standard user accounts. Just-in-time elevation with 4-eyes approval for PROTECTED systems.", status: "PARTIAL", evidence: "CyberArk deployed for Windows admin | AWS IAM still using static keys for 3 service accounts | Migration to IAM Roles in progress (ETA: Q3 2026)", owner: "Privileged Access Team" },
    { name: "Data encryption at rest", framework: "Essential Eight", requirement: "M7: AES-256 encryption for all stored data. Key rotation every 90 days. HSM-backed for PROTECTED.", status: "MET", evidence: "AWS KMS with CloudHSM | All EBS, S3, RDS encrypted | Key rotation automated via Terraform | Audit trail to CloudWatch Logs", owner: "Crypto Services" },
    { name: "Daily backups with offline copy", framework: "Essential Eight", requirement: "M8: Immutable backups to separate AWS account with write-once policy. 30-day retention with quarterly restore testing.", status: "MET", evidence: "AWS Backup vault locked with legal hold | Cross-account replication to backup-acme-industries | Last DR test: RPO 45min, RTO 4hrs (target: 2hrs)", owner: "Resilience Team" },
  ];

  for (let i = 0; i < controls.length; i++) {
    await query(
      `INSERT INTO "Control" (id, "projectId", name, framework, requirement, status, evidence, owner, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
      [`control_${i}_seed`, projectId, controls[i].name, controls[i].framework, controls[i].requirement, controls[i].status, controls[i].evidence, controls[i].owner, now]
    );
  }

  // ─── Artefacts ───
  const artefacts = [
    { name: "Architecture Principles v1.0", type: "Architecture Principles", content: "## Acme Industries Architecture Principles\n\n1. **Cloud-First**: All new workloads deploy to AWS unless legally prohibited.\n2. **Security-by-Design**: Every architecture decision includes threat model and control mapping.\n3. **API-First**: All services expose REST/gRPC APIs before UI development.\n4. **Event-Driven**: Prefer async messaging over synchronous calls for cross-domain integration.\n5. **Immutable Infrastructure**: No manual server changes; all config via Terraform/CloudFormation.\n6. **Observability**: Every service emits metrics, logs, and traces to central platform.\n7. **Cost-Optimisation**: Tag all resources with CostCentre; monthly FinOps review.\n8. **Data Sovereignty**: PROTECTED data remains in ap-southeast-2 (Sydney) or ap-southeast-4 (Melbourne)." },
    { name: "Current State Architecture", type: "Current State Summary", content: "## Current State Overview\n\n### Infrastructure\n- 2 on-prem data centres (Sydney primary, Melbourne DR)\n- 340 Windows/Linux servers (60% virtualised on VMware 6.7)\n- NetApp FAS storage with 1.2PB capacity\n- Cisco Nexus 9K core switches\n\n### Applications\n| System | Tech Stack | Users | Criticality |\n|--------|-----------|-------|-------------|\n| Policy Admin | COBOL/DB2 | 2,400 | Tier 1 |\n| Claims Portal | .NET Framework 4.8 / SQL Server 2016 | 8,500 | Tier 1 |\n| Data Warehouse | Oracle Exadata | 350 analysts | Tier 2 |\n| Customer Portal | Angular 8 / Node.js 12 | 120,000 | Tier 1 |\n\n### Integration\n- 47 batch file transfers via SFTP (no encryption at rest)\n- 12 SOAP web services (avg latency: 4.2s)\n- MQ Series for claims-to-policy sync\n\n### Technical Debt\n- 23 servers running Windows Server 2012 (EOL Jan 2024)\n- Oracle Exadata 12c (extended support expires Q3 2026)\n- Angular 8 (LTS ended Nov 2021)" },
    { name: "Executive Briefing — Cloud Migration", type: "Executive Summary", content: "## Executive Summary\n\n**Prepared for**: Acme Industries Board of Directors\n**Date**: April 2026\n**Classification**: Commercial-in-Confidence\n\n### Opportunity\nMigrating from on-premise data centres to AWS cloud presents a $2.8M annual savings opportunity through:\n- Decommissioning 2 data centres ($1.2M facilities + power)\n- Rightsizing compute with auto-scaling ($800K avoided over-provisioning)\n- Reserved Instance purchasing for predictable workloads ($600K discount)\n- Reduced software licensing via BYOL and open-source alternatives ($200K)\n\n### Risk-Adjusted Timeline\n- Phase 1 (Discovery): COMPLETED\n- Phase 2 (Current State): IN PROGRESS — ETA June 2026\n- Phase 3 (Target Architecture): July–August 2026\n- Phase 4 (Risk Assessment): September 2026\n- Phase 5 (Compliance Mapping): October 2026\n- Implementation: November 2026 – March 2027\n\n### Key Risks Requiring Board Attention\n1. **Data Residency**: APRA CPS 234 mandates Australian data sovereignty. Mitigation: AWS Sydney + Melbourne regions only.\n2. **Mainframe Integration**: 47 undocumented batch interfaces. Mitigation: API gateway abstraction layer + 3-month parallel run.\n3. **Skills Gap**: Only 2 AWS-certified engineers. Mitigation: Managed services partner + upskilling program.\n\n### Recommendation\nProceed with Phase 2 subject to $500K contingency approval for mainframe integration complexity." },
  ];

  for (let i = 0; i < artefacts.length; i++) {
    await query(
      `INSERT INTO "Artefact" (id, "projectId", name, type, content, version, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [`artefact_${i}_seed`, projectId, artefacts[i].name, artefacts[i].type, artefacts[i].content, 1, now]
    );
  }

  // ─── Stakeholders ───
  const stakeholders = [
    { name: "Margaret Thompson", role: "Chief Technology Officer", influence: "High", interest: "High" },
    { name: "David Park", role: "Head of Infrastructure", influence: "High", interest: "Medium" },
    { name: "Sarah Chen", role: "Security Lead (CISO Office)", influence: "Medium", interest: "High" },
    { name: "James O'Connor", role: "Policy Admin Business Owner", influence: "Medium", interest: "High" },
    { name: "Priya Nair", role: "Finance Director", influence: "High", interest: "Low" },
    { name: "Tom Bradley", role: "Claims Operations Manager", influence: "Low", interest: "High" },
  ];

  for (let i = 0; i < stakeholders.length; i++) {
    await query(
      `INSERT INTO "Stakeholder" (id, "projectId", name, role, influence, interest, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`stakeholder_${i}_seed`, projectId, stakeholders[i].name, stakeholders[i].role, stakeholders[i].influence, stakeholders[i].interest, now]
    );
  }

  // ─── AI Conversation ───
  const convId = "conv_seed_001";
  await query(
    `INSERT INTO "AIConversation" (id, "projectId", mode, "createdAt") VALUES ($1, $2, $3, $4)`,
    [convId, projectId, "Discovery Assistant", now]
  );

  const messages = [
    { role: "user", content: "We're starting Current State Assessment. What should we prioritise given our mainframe constraint?" },
    { role: "assistant", content: "Given the 47 undocumented batch interfaces on your Policy Admin core, I recommend this prioritisation:\n\n1. **Interface discovery sprint** (2 weeks): Deploy AWS Mainframe Modernization service to auto-discover COBOL program call graphs and data flow maps.\n\n2. **API-readiness assessment**: Identify the 12 SOAP services with >4s latency — these are highest-value for API Gateway migration.\n\n3. **Data classification audit**: Tag all DB2 tables with APRA sensitivity labels before any cloud replication begins.\n\n4. **Parallel environment**: Stand up AWS Melbourne as mirror for 3-month parallel reconciliation — this satisfies APRA CPS 234 continuity requirements.\n\nWould you like me to generate a detailed sprint plan for the interface discovery?" },
    { role: "user", content: "Yes, and also flag which Essential Eight controls map to each activity." },
    { role: "assistant", content: "## Interface Discovery Sprint Plan\n\n**Week 1–2: Automated Discovery**\n- Deploy AWS Mainframe Modernization (M2) Assessment Tool\n- Run static analysis on all 47 COBOL programs\n- Map CICS transaction IDs to business functions\n\n*Mapped controls:*\n- M4 (User app hardening): M2 tool deployment via hardened AMI\n- M5 (MFA): All M2 console access via AWS IAM Identity Center + YubiKey\n\n**Week 3: API Readiness Scoring**\n- Score each interface on: latency, data volume, error rate, business criticality\n- Shortlist top 5 for API Gateway PoC\n\n*Mapped controls:*\n- M1 (App control): API Gateway request validation + WAF rules\n- M7 (Encryption): TLS 1.3 mandatory for all API traffic\n\n**Week 4: Parallel Environment Standup**\n- Provision Aurora PostgreSQL in ap-southeast-4\n- Configure AWS DMS for one-way replication\n- Run first parallel batch reconciliation\n\n*Mapped controls:*\n- M8 (Backups): AWS Backup cross-region vault with legal hold\n- M6 (PAM): DMS credentials in AWS Secrets Manager with rotation\n\n**Deliverables:**\n- Interface dependency map (visual)\n- API readiness scorecard\n- Essential Eight control mapping matrix\n- Risk-adjusted migration sequence" },
  ];

  for (let i = 0; i < messages.length; i++) {
    await query(
      `INSERT INTO "AIMessage" (id, "conversationId", role, content, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
      [`msg_${i}_seed`, convId, messages[i].role, messages[i].content, now]
    );
  }

  // ─── Decisions ───
  const decisions = [
    { title: "ADR-001: AWS Aurora PostgreSQL over Amazon RDS Oracle", status: "ACCEPTED", context: "Current data warehouse runs Oracle Exadata 12c (extended support expires Q3 2026). Migration to Aurora PostgreSQL reduces licensing by $420K/year and enables serverless scaling.", decision: "Adopt Aurora PostgreSQL with Babelfish for Oracle compatibility layer. Migrate 80% of stored procedures to PostgreSQL native; retain Babelfish for 20% of complex PL/SQL.", consequences: "Positive: $420K annual savings, auto-scaling, pgvector for AI search. Negative: 6-week migration effort for stored procedures, DBA retraining required." },
    { title: "ADR-002: EKS with Karpenter over ECS Fargate", status: "ACCEPTED", context: "Claims processing requires GPU-accelerated OCR for document ingestion. Fargate lacks GPU support. EKS with Karpenter provides spot instance optimisation and GPU node pools.", decision: "Adopt Amazon EKS with Karpenter autoscaler. Deploy claims service on GPU-enabled node group (g5.xlarge) with spot instance fallback.", consequences: "Positive: 60% compute cost reduction via spot, GPU support for ML inference. Negative: Higher operational complexity — requires certified Kubernetes admin." },
    { title: "ADR-003: Amazon MQ over Amazon MSK for mainframe bridge", status: "PROPOSED", context: "Mainframe uses IBM MQ Series for claims-to-policy sync. MSK (Kafka) offers better throughput but requires protocol translation. Amazon MQ supports native JMS.", decision: "Pending — recommend PoC with both MSK and MQ. MSK for greenfield event streaming; MQ for mainframe bridge with JMS compatibility.", consequences: "Positive: MQ reduces integration risk by 40%. MSK enables future event sourcing pattern. Hybrid approach may be optimal." },
  ];

  for (let i = 0; i < decisions.length; i++) {
    await query(
      `INSERT INTO "Decision" (id, "projectId", title, status, context, decision, consequences, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      [`decision_${i}_seed`, projectId, decisions[i].title, decisions[i].status, decisions[i].context, decisions[i].decision, decisions[i].consequences, now]
    );
  }

  // ─── Roadmap Items ───
  const roadmap = [
    { title: "AWS Landing Zone provisioning", phase: "Short term", priority: "High", dependency: "ADR-001 approved" },
    { title: "Policy Admin API Gateway PoC", phase: "Short term", priority: "High", dependency: "Interface discovery complete" },
    { title: "Mainframe JMS bridge to Amazon MQ", phase: "Medium term", priority: "High", dependency: "ADR-003 decision" },
    { title: "Data warehouse Aurora migration", phase: "Medium term", priority: "Medium", dependency: "Landing Zone operational" },
    { title: "Customer portal containerisation (EKS)", phase: "Medium term", priority: "Medium", dependency: "Karpenter cluster stable" },
    { title: "Decommission Sydney DC-1", phase: "Long term", priority: "High", dependency: "All Tier 1 workloads migrated and stable for 6 months" },
    { title: "Melbourne DC-2 decommission", phase: "Long term", priority: "Medium", dependency: "DR failover tested quarterly for 12 months" },
    { title: "FinOps cost optimisation programme", phase: "Long term", priority: "Low", dependency: "6 months of AWS billing data" },
  ];

  for (let i = 0; i < roadmap.length; i++) {
    await query(
      `INSERT INTO "RoadmapItem" (id, "projectId", title, phase, priority, dependency, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [`roadmap_${i}_seed`, projectId, roadmap[i].title, roadmap[i].phase, roadmap[i].priority, roadmap[i].dependency, now]
    );
  }

  // ─── Knowledge Items ───
  const knowledge = [
    { domain: "TOGAF", title: "Architecture Development Method (ADM)", description: "Iterative process for developing enterprise architecture covering vision, business, information systems, and technology architecture.", usage: "All architecture engagements", questions: "What is the business strategy? Who are the key stakeholders? What are the constraints and drivers?", inputs: "Business strategy, current state documentation, stakeholder register", outputs: "Architecture vision, gap analysis, migration plan" },
    { domain: "AWS", title: "Well-Architected Framework", description: "Six pillars: operational excellence, security, reliability, performance efficiency, cost optimization, sustainability.", usage: "Cloud architecture reviews and migration assessments", questions: "How do you manage operational health? What is your disaster recovery RTO/RPO?", inputs: "Architecture diagrams, CloudWatch metrics, cost reports", outputs: "Improvement plan, risk register, cost optimisation roadmap" },
    { domain: "Cyber", title: "Essential Eight Maturity Model", description: "Australian Signals Directorate's top mitigation strategies for cyber security. Maturity levels 0–3.", usage: "Security assessments and compliance gap analysis", questions: "What is your current maturity level? Which controls are partially implemented?", inputs: "Security audit results, penetration test reports, policy documentation", outputs: "Maturity assessment, remediation roadmap, executive briefing" },
    { domain: "APRA", title: "CPS 234 — Information Security", description: "Prudential standard for information security management in regulated financial institutions.", usage: "Financial services architecture engagements", questions: "How do you test information security controls? What is your incident response SLA?", inputs: "Risk assessment, control testing results, third-party risk register", outputs: "Compliance attestation, board report, remediation plan" },
    { domain: "DataGov", title: "Australian Privacy Principles (APP)", description: "13 principles governing collection, use, disclosure, and storage of personal information under the Privacy Act 1988.", usage: "Data architecture and cloud migration designs", questions: "Is data collection necessary and proportionate? Is consent explicit and informed?", inputs: "Privacy impact assessment, data flow diagrams, consent records", outputs: "APP compliance matrix, privacy policy update, breach response plan" },
  ];

  for (const item of knowledge) {
    await query(
      `INSERT INTO "KnowledgeItem" (id, domain, title, description, usage, questions, inputs, outputs, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [`know_${item.domain}_seed`, item.domain, item.title, item.description, item.usage, item.questions, item.inputs, item.outputs, now]
    );
  }
}
