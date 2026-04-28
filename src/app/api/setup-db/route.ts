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
  `CREATE TABLE IF NOT EXISTS "DocumentTemplate" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
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
    // Phase 1 — Discovery (all completed)
    { phaseId: "phase_1", title: "Stakeholder mapping workshop", description: "Identify all business and technical stakeholders with RACI matrices. Output: stakeholder register with influence/interest grid.", category: "Question", isCompleted: true },
    { phaseId: "phase_1", title: "Business driver prioritisation", description: "Rank drivers by impact, feasibility, and executive sponsorship using weighted scoring model.", category: "Input", isCompleted: true },
    { phaseId: "phase_1", title: "Engagement charter sign-off", description: "Secure formal agreement on scope, constraints, governance model, and escalation paths.", category: "Output", isCompleted: true },
    { phaseId: "phase_1", title: "Regulatory landscape briefing", description: "Map APRA CPS 234, ISM Feb 2024, and Essential Eight applicability to project scope.", category: "Input", isCompleted: true },
    { phaseId: "phase_1", title: "Security classification workshop", description: "Confirm PROTECTED baseline and agree data sovereignty requirements with CISO office.", category: "Question", isCompleted: true },
    // Phase 2 — Current State (partially complete)
    { phaseId: "phase_2", title: "Infrastructure inventory", description: "Document all 340 servers, networks, storage arrays, and middleware with ownership tags.", category: "Input", isCompleted: true },
    { phaseId: "phase_2", title: "Application dependency mapping", description: "Map upstream/downstream dependencies for all 12 critical apps using automated discovery + manual validation.", category: "Input", isCompleted: true },
    { phaseId: "phase_2", title: "Technical debt register", description: "Catalogue 23 EOL Windows Server 2012 instances, Oracle Exadata 12c, Angular 8 frontend, and skill gaps.", category: "Output", isCompleted: true },
    { phaseId: "phase_2", title: "Network topology documentation", description: "Produce VISIO diagrams for Cisco Nexus 9K core, DMZ segmentation, and firewall rule baseline.", category: "Output", isCompleted: false },
    { phaseId: "phase_2", title: "Data flow mapping", description: "Trace PII through Policy Admin, Claims, and Data Warehouse. Label APRA sensitivity per table.", category: "Input", isCompleted: false },
    { phaseId: "phase_2", title: "Cloud readiness assessment", description: "Score each workload on cloud-native suitability, refactoring effort, and business criticality.", category: "Output", isCompleted: false },
    // Phase 3 — Target Architecture (pending)
    { phaseId: "phase_3", title: "AWS landing zone design", description: "Design multi-account structure with SCPs, guardrails, and centralized logging. Align to AWS Control Tower.", category: "Output", isCompleted: false },
    { phaseId: "phase_3", title: "Containerisation strategy", description: "Define EKS with Karpenter for claims OCR, ECS Fargate for stateless APIs, and migration sequence.", category: "Output", isCompleted: false },
    { phaseId: "phase_3", title: "API Gateway pattern design", description: "Design abstraction layer for 47 mainframe batch interfaces using Amazon MQ + REST proxy.", category: "Output", isCompleted: false },
    { phaseId: "phase_3", title: "Data sovereignty architecture", description: "Ensure all PROTECTED data stored in ap-southeast-2/4. Design cross-region replication for DR only.", category: "Output", isCompleted: false },
    // Phase 4 — Risk Assessment (pending)
    { phaseId: "phase_4", title: "Threat modelling session", description: "Run STRIDE-based threat model for target architecture with Security Lead and external pen-test partner.", category: "Question", isCompleted: false },
    { phaseId: "phase_4", title: "Risk register finalisation", description: "Score all risks using likelihood/impact matrix. Validate mitigations with cost estimates and owners.", category: "Output", isCompleted: false },
    { phaseId: "phase_4", title: "Penetration test scope", description: "Define scope for external penetration testing of target-state APIs and AWS infrastructure.", category: "Input", isCompleted: false },
    // Phase 5 — Compliance Mapping (pending)
    { phaseId: "phase_5", title: "ISM control gap analysis", description: "Map all 137 ISM controls to AWS services, IAM policies, and monitoring config. Produce gap heatmap.", category: "Input", isCompleted: false },
    { phaseId: "phase_5", title: "Essential Eight maturity assessment", description: "Assess current maturity (0-3) per Essential Eight mitigation strategy. Identify quick wins.", category: "Input", isCompleted: false },
    { phaseId: "phase_5", title: "APRA CPS 234 attestation pack", description: "Compile evidence for Board attestation: control testing, third-party risk, and incident response.", category: "Output", isCompleted: false },
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
    { title: "Insider threat via over-provisioned access", description: "347 active AD accounts with standing admin access to policy database. No just-in-time elevation or session recording for PROTECTED data. Former employee accounts discovered still active 90 days post-exit.", impact: "High", probability: "Medium", mitigation: "Deploy CyberArk for all privileged cloud and on-prem access | Implement 4-eyes approval for PROTECTED data access | Monthly orphaned account review | Enable AWS CloudTrail + CloudWatch anomaly detection on IAM" },
    { title: "Third-party SaaS supply chain breach", description: "Claims portal integrates with 8 third-party SaaS providers (DocuSign, Salesforce, Twilio). Only 2 have completed SOC 2 Type II. No continuous monitoring of vendor security posture.", impact: "High", probability: "Medium", mitigation: "Mandate SOC 2 Type II or ISO 27001 for all Tier 1 vendors | Deploy Vanta/Drata for continuous vendor monitoring | Include right-to-audit clauses in all new contracts | Quarterly vendor risk scorecard" },
    { title: "Ransomware via unpatched endpoint", description: "23 Windows Server 2012 machines (EOL Jan 2024) still in production with no Extended Security Updates. WannaCry-style lateral movement possible via SMBv1 still enabled on 40% of fleet.", impact: "Critical", probability: "High", mitigation: "Emergency ESU purchase for 23 servers | Disable SMBv1 fleet-wide via GPO | Deploy CrowdStrike Falcon with behavioural ransomware detection | Air-gap critical DB2 mainframe from general network" },
    { title: "API gateway misconfiguration exposing PII", description: "Planned API Gateway for mainframe bridge may lack request validation, rate limiting, and WAF rules. Pen-test last year found IDOR vulnerability in existing SOAP layer exposing 12K customer records.", impact: "Critical", probability: "Medium", mitigation: "AWS WAF with managed rule sets on all API Gateway stages | Request validation via API Gateway models | Rate limiting: 100 req/min per client | Mandatory TLS 1.3 | Annual penetration testing by accredited tester" },
    { title: "Inadequate backup immutability", description: "Current NetApp SnapMirror backups are mutable and accessible by domain admins. Ransomware could encrypt or delete backups. RTO of 4 hours does not meet APRA CPS 234 continuity requirements.", impact: "High", probability: "Medium", mitigation: "AWS Backup vault with legal hold and cross-account replication | Immutable S3 Glacier for 7-year retention | Quarterly restore testing with documented RTO/RPO | Separate backup admin role with MFA" },
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
    { name: "Network segmentation", framework: "ISM", requirement: "ISM-1401: Networks segmented to restrict lateral movement. DMZ, corporate, and PROTECTED zones isolated with deny-by-default firewall rules.", status: "PARTIAL", evidence: "Cisco ASA DMZ segmentation in place | AWS VPC lacks micro-segmentation | Zero Trust architecture planned for Q3 2026", owner: "Network Engineering" },
    { name: "Logging and monitoring", framework: "ISM", requirement: "ISM-1651: Centralised logging of all security events with 12-month retention. Real-time alerting for privileged access and data exfiltration.", status: "MET", evidence: "Splunk Enterprise Security with 850 sources | 14-day MTTD for critical alerts | SOAR playbooks for phishing and malware", owner: "SOC Team" },
    { name: "Secure software development", framework: "APRA CPS 234", requirement: "CPS 234.33: Information security controls embedded in SDLC. Code review, SAST/DAST, and dependency scanning mandatory for all production releases.", status: "PARTIAL", evidence: "SonarQube + Snyk integrated into Azure DevOps | 78% of repos scanned | Mobile app not yet in pipeline | No DAST for APIs", owner: "Application Security" },
    { name: "Incident response planning", framework: "APRA CPS 234", requirement: "CPS 234.36: Tested incident response plan with defined roles, communication trees, and regulatory notification timelines.", status: "MET", evidence: "IR plan tested quarterly with tabletop exercises | APRA notification SLA: 24 hours | CIRT team on-call 24/7", owner: "CISO Office" },
    { name: "Third-party risk management", framework: "APRA CPS 234", requirement: "CPS 234.39: Due diligence and ongoing monitoring of material outsourcing arrangements. Right-to-audit clauses in all Tier 1 contracts.", status: "NOT_MET", evidence: "Only 2 of 8 SaaS vendors have SOC 2 Type II | No continuous monitoring platform | Vendor risk register outdated since Q3 2025", owner: "Procurement + Risk" },
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
    { name: "Cloud Security Configuration Baseline — Draft", type: "Cloud Security Configuration Baseline", content: "# Cloud Security Configuration Baseline\n\n## Account Governance\n- Multi-account strategy: Production, Staging, Dev, Security, Shared Services, Backup\n- SCPs enforced: Deny non-APAC regions, deny public S3 buckets, deny unencrypted resources\n- Billing alerts: $50K/month threshold with FinOps team notification\n\n## Identity & Access\n- MFA enforcement: Mandatory for all IAM users and root accounts\n- Password policy: 14 chars minimum, 90-day rotation, no reuse for 24 generations\n- Session timeout: 8 hours absolute, 1 hour idle\n- Key rotation: AWS IAM access keys every 90 days via Terraform automation\n\n## Networking\n- Default deny all inbound: All security groups start with deny-all; explicit allow rules only\n- VPC flow logs: Enabled on all VPCs with 12-month retention in S3\n- Private subnets for databases: Aurora, ElastiCache, and MQ deployed in private subnets only\n- WAF enabled: AWS WAF v2 on CloudFront and API Gateway with managed rule sets\n\n## Logging & Monitoring\n- CloudTrail: Organization trail with log file validation enabled\n- Log retention: 12 months hot in S3, 7 years cold in Glacier\n- SIEM integration: Splunk HEC endpoint receiving all CloudTrail, VPC Flow, and Config logs\n\n## Encryption\n- Data at rest: AES-256-GCM via AWS KMS with CloudHSM for PROTECTED data\n- Data in transit: TLS 1.3 mandatory for all API and database traffic\n- Key management: Separate KMS key per application with automatic rotation\n\n## Exceptions Approved\n- None at this time. All deviations require CISO and CTO dual approval." },
    { name: "Data Classification Register — v0.1", type: "Data Classification Register", content: "# Data Classification Register\n\n## Classification Scheme\n- Public | Internal | Sensitive | Restricted | Critical\n\n## Register\n| Data Set | System | Classification | Custodian | Retention | Encryption | Location | Sharing Rules |\n|----------|--------|----------------|-----------|-----------|------------|----------|---------------|\n| Customer PII | Policy Admin | Critical | Sarah Chen | 7 years | AES-256-GCM + HSM | ap-southeast-2 | Board approval only |\n| Claims Records | Claims Portal | Restricted | James O'Connor | 7 years | AES-256 | ap-southeast-2 | APRA reporting, legal hold |\n| Analytics Aggregates | Data Warehouse | Sensitive | Priya Nair | 5 years | AES-256 | ap-southeast-2 | Anonymised for third-party |\n| Marketing Preferences | Customer Portal | Internal | Tom Bradley | 3 years | AES-256 | ap-southeast-2 | Opt-in basis only |\n\n## Handling Rules by Classification\n- Critical: HSM-backed encryption, air-gapped backup, 4-eyes access, quarterly audit\n- Restricted: KMS encryption, immutable backup, MFA-required access, annual audit\n- Sensitive: KMS encryption, standard backup, role-based access, biennial audit\n- Internal: Standard encryption, standard backup, corporate access, spot audit\n\n## Last Review\n2026-04-15 by Sarah Chen\n\n## Exceptions\n- Oracle Exadata 12c data at rest uses TDE (not AES-256-GCM). Exception expires upon migration to Aurora." },
    { name: "Incident Response Log — Template Instantiated", type: "Cloud Incident Response Log", content: "# Cloud Incident Response Log\n\n## Incident ID\nACME-2026-001\n\n## Detection\n- Detected by: AWS GuardDuty + Splunk ES correlation rule\n- Time detected: 2026-03-14 02:17 AEDT\n- Severity: High\n\n## Classification\n- Category: Unauthorized API access\n- Asset(s) affected: Claims Portal staging environment\n- Data classification involved: Internal (no PII accessed)\n\n## Timeline\n| Time | Event | Actor |\n|------|-------|-------|\n| 02:17 | GuardDuty alerts on anomalous ListBuckets from new IP | GuardDuty |\n| 02:19 | SOC analyst acknowledges alert | SOC L1 |\n| 02:25 | IAM access key disabled | SOC L2 |\n| 03:00 | Forensic snapshot of CloudTrail logs | IR Lead |\n\n## Containment Actions\n- Disabled compromised IAM access key\n- Revoked all active sessions for affected service account\n- Isolated staging VPC from corporate network\n\n## Root Cause\nHardcoded IAM access key in Terraform state file committed to public GitHub repository. Key had s3:GetObject and s3:ListBucket permissions.\n\n## Resolution\n- Rotated all IAM keys in project\n- Implemented git-secrets pre-commit hook\n- Moved Terraform state to S3 with encryption and least-privilege IAM\n\n## Lessons Learned\nDeveloper tooling must treat Terraform state as sensitive. Pre-commit scanning is non-negotiable.\n\n## Follow-up Actions\n- Roll out git-secrets to all 47 repos by end of Q2\n- Quarterly key rotation automation via Terraform" },
    { name: "Application Threat Modeling — Claims Portal", type: "Application Threat Modeling", content: "# Application Threat Modeling Sheet\n\n## Application\nClaims Portal (.NET Framework 4.8 / SQL Server 2016)\n\n## Threat Model Methodology\nSTRIDE\n\n## Data Flow Diagram\n[User] -> [WAF] -> [API Gateway] -> [Claims Service] -> [SQL Server]\n                     |\n                     v\n                [Document Store S3]\n\n## Threat Register\n| Threat ID | Category | Threat | Target | Likelihood | Impact | Mitigation | Status |\n|-----------|----------|--------|--------|------------|--------|------------|--------|\n| TH-001 | Tampering | MITM on API traffic | API Gateway | Low | High | TLS 1.3 + mTLS | MET |\n| TH-002 | Information Disclosure | SQL injection via claims search | SQL Server | Medium | Critical | Parameterised queries + WAF | PARTIAL |\n| TH-003 | Elevation of Privilege | IDOR on claim document URLs | S3 | Medium | High | Presigned URLs with IAM condition keys | NOT_MET |\n| TH-004 | Denial of Service | Seasonal traffic spike | API Gateway | High | Medium | Rate limiting + CloudFront caching | PLANNED |\n| TH-005 | Spoofing | Fake OAuth tokens | Claims Service | Low | High | Token validation via JWKS | MET |\n\n## Assumptions\n- Azure AD is trusted identity provider\n- SQL Server patch level is current (security updates applied within 48h)\n\n## Open Risks\n- IDOR vulnerability requires application-level URL signing refactor\n- SQL injection test coverage is 60%; target is 95%" },
    { name: "Secure Coding Checklist — Customer Portal", type: "Secure Coding Checklist", content: "# Secure Coding Checklist\n\n## Application / Component\nCustomer Portal (Angular 16 / Node.js 20 migration)\n\n## Input Validation\n- [x] All user inputs validated against allow-list.\n- [x] Parameterised queries used for all database access.\n- [x] Output encoded for context (HTML, JS, URL, CSS).\n- [x] File upload restrictions enforced (type, size, content scan via ClamAV).\n\n## Authentication & Session\n- [x] Strong password policy enforced (14 chars, complexity).\n- [x] MFA available for sensitive operations (FIDO2/WebAuthn).\n- [x] Session tokens cryptographically random and rotated.\n- [x] Idle timeout (15 min) and absolute timeout (8 hr) configured.\n\n## Authorization\n- [x] Principle of least privilege applied.\n- [x] Server-side enforcement of access controls.\n- [x] Direct object reference checks (IDOR prevention) via UUIDs.\n\n## Cryptography\n- [x] AES-256-GCM for data at rest.\n- [x] TLS 1.3 for data in transit.\n- [x] Secrets stored in AWS Secrets Manager, never in code.\n\n## Logging & Error Handling\n- [x] Security events logged without sensitive data.\n- [x] Generic error messages to users; detailed logs server-side.\n- [x] Rate limiting on authentication and sensitive APIs (100 req/min).\n\n## Dependencies\n- [x] SBOM generated via CycloneDX.\n- [x] Known vulnerabilities checked via Snyk (0 critical, 2 high).\n- [x] No EOL or unsupported libraries.\n\n## Sign-off\n| Reviewer | Date | Result |\n|----------|------|--------|\n| Sarah Chen | 2026-04-10 | PASS with 2 high findings |\n| David Park | 2026-04-12 | ACCEPTED |" },
    { name: "Password Policy — v1.2", type: "Password Policy", content: "# Password Policy\n\n## 1. Purpose\nDefine minimum standards for password creation, management, and storage across all Acme Industries systems.\n\n## 2. Scope\nAll employees, contractors, service accounts, and third-party users with access to Acme systems.\n\n## 3. Requirements\n### 3.1 Complexity\n- Minimum length: 14 characters\n- Character requirements: Uppercase, lowercase, digit, special character\n- Dictionary words: Not permitted as standalone passwords\n\n### 3.2 Management\n- Rotation frequency: 90 days for standard users, 60 days for privileged\n- Reuse restriction: 24 previous passwords\n- Default passwords: Must be changed on first login; system-generated only\n\n### 3.3 Storage\n- Passwords must be stored using bcrypt (cost factor 12) with per-user salt.\n- Plaintext storage is strictly prohibited.\n\n### 3.4 MFA\nMandatory for all privileged access, remote access, and systems containing PROTECTED data. FIDO2/WebAuthn preferred; TOTP acceptable fallback. SMS OTP prohibited.\n\n## 4. Service Accounts\nService account passwords must be generated via AWS Secrets Manager or CyberArk with automatic rotation every 30 days. No hardcoded credentials in source code.\n\n## 5. Exceptions\nNone. All exceptions require CISO and CTO dual written approval with 90-day expiry.\n\n## 6. Review\nEffective date: 2026-01-01\nNext review: 2026-07-01\nApproved by: Margaret Thompson (CTO), Sarah Chen (CISO)" },
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

  // ─── Document Templates (Cybersecurity) ───
  const templates = [
    { id: "tmpl_001", name: "Cloud Access Control Matrix", category: "Cloud Security", docType: "Template", description: "Matrix mapping cloud services to user roles, permissions, and enforcement mechanisms.", content: "# Cloud Access Control Matrix\n\n## Scope\n{{CLOUD_SCOPE}}\n\n## Identity Provider\n- Primary IdP: {{IDP_NAME}}\n- Federation protocol: {{FEDERATION_PROTOCOL}}\n\n## Control Matrix\n| Cloud Service | Admin Role | Operator Role | Read-Only Role | Enforcement |\n|-------------|------------|---------------|----------------|-------------|\n| {{SERVICE_1}} | {{ADMIN_PERM_1}} | {{OPER_PERM_1}} | {{READ_PERM_1}} | {{ENFORCE_1}} |\n| {{SERVICE_2}} | {{ADMIN_PERM_2}} | {{OPER_PERM_2}} | {{READ_PERM_2}} | {{ENFORCE_2}} |\n\n## Approval Workflow\n1. Requester submits access request via {{TICKET_SYSTEM}}.\n2. Manager approves within {{APPROVAL_SLA}}.\n3. Security team validates need-to-know.\n4. Automated provisioning via {{PROVISIONING_TOOL}}.\n5. Quarterly access review by data owners.\n\n## Exceptions\n{{EXCEPTIONS}}", tags: "cloud,iam,access control" },
    { id: "tmpl_002", name: "Cloud Asset Inventory", category: "Cloud Security", docType: "Tracker", description: "Comprehensive inventory of all cloud resources with ownership, classification, and lifecycle status.", content: "# Cloud Asset Inventory\n\n## Account / Subscription\n{{ACCOUNT_ID}} — {{ACCOUNT_NAME}}\n\n## Inventory\n| Resource ID | Type | Region | Owner | Data Classification | Cost Centre | Status | Created | Last Review |\n|-------------|------|--------|-------|---------------------|-------------|--------|---------|-------------|\n| {{RES_ID_1}} | {{TYPE_1}} | {{REGION_1}} | {{OWNER_1}} | {{CLASS_1}} | {{CC_1}} | {{STATUS_1}} | {{DATE_1}} | {{REVIEW_1}} |\n| {{RES_ID_2}} | {{TYPE_2}} | {{REGION_2}} | {{OWNER_2}} | {{CLASS_2}} | {{CC_2}} | {{STATUS_2}} | {{DATE_2}} | {{REVIEW_2}} |\n\n## Unmanaged / Shadow IT Findings\n{{SHADOW_IT}}\n\n## Reconciliation Date\n{{RECONCILE_DATE}}\n\n## Next Audit\n{{NEXT_AUDIT}}", tags: "cloud,asset management,inventory" },
    { id: "tmpl_003", name: "Cloud Backup & Recovery Testing", category: "Cloud Security", docType: "Tracker", description: "Schedule and results of backup validation tests across cloud workloads.", content: "# Cloud Backup & Recovery Testing Tracker\n\n## Policy\n- RPO target: {{RPO}}\n- RTO target: {{RTO}}\n- Retention: {{RETENTION_POLICY}}\n\n## Test Log\n| Workload | Backup Type | Last Backup | Test Date | Test Result | RTO Achieved | RPO Achieved | Tester | Notes |\n|----------|-------------|-------------|-----------|-------------|--------------|--------------|--------|-------|\n| {{WL_1}} | {{BT_1}} | {{LB_1}} | {{TD_1}} | {{RES_1}} | {{RTO_1}} | {{RPO_1}} | {{TESTER_1}} | {{NOTE_1}} |\n| {{WL_2}} | {{BT_2}} | {{LB_2}} | {{TD_2}} | {{RES_2}} | {{RTO_2}} | {{RPO_2}} | {{TESTER_2}} | {{NOTE_2}} |\n\n## Failures & Remediation\n{{FAILURES}}\n\n## Next Quarterly Test\n{{NEXT_TEST}}", tags: "cloud,backup,dr,resilience" },
    { id: "tmpl_004", name: "Cloud Incident Response Log", category: "Cloud Security", docType: "Template", description: "Structured log for recording cloud security incidents, triage, and resolution.", content: "# Cloud Incident Response Log\n\n## Incident ID\n{{INCIDENT_ID}}\n\n## Detection\n- Detected by: {{DETECTION_SOURCE}}\n- Time detected: {{DETECTED_AT}}\n- Severity: {{SEVERITY}}\n\n## Classification\n- Category: {{CATEGORY}}\n- Asset(s) affected: {{AFFECTED_ASSETS}}\n- Data classification involved: {{DATA_CLASS}}\n\n## Timeline\n| Time | Event | Actor |\n|------|-------|-------|\n| {{T1}} | {{E1}} | {{A1}} |\n\n## Containment Actions\n{{CONTAINMENT}}\n\n## Root Cause\n{{ROOT_CAUSE}}\n\n## Resolution\n{{RESOLUTION}}\n\n## Lessons Learned\n{{LESSONS}}\n\n## Follow-up Actions\n{{FOLLOW_UP}}", tags: "cloud,incident,response,ir" },
    { id: "tmpl_005", name: "Cloud Security Configuration Baseline", category: "Cloud Security", docType: "Template", description: "Minimum secure configuration standards for all cloud accounts and services.", content: "# Cloud Security Configuration Baseline\n\n## Account Governance\n- Multi-account strategy: {{ACCOUNT_STRATEGY}}\n- SCPs enforced: {{SCP_LIST}}\n- Billing alerts: {{BILLING_ALERT}}\n\n## Identity & Access\n- MFA enforcement: {{MFA_POLICY}}\n- Password policy: {{PWD_POLICY}}\n- Session timeout: {{SESSION_TIMEOUT}}\n- Key rotation: {{KEY_ROTATION}}\n\n## Networking\n- Default deny all inbound: {{DENY_INBOUND}}\n- VPC flow logs: {{FLOW_LOGS}}\n- Private subnets for databases: {{PRIVATE_SUBNETS}}\n- WAF enabled: {{WAF_STATUS}}\n\n## Logging & Monitoring\n- CloudTrail: {{TRAIL_STATUS}}\n- Log retention: {{LOG_RETENTION}}\n- SIEM integration: {{SIEM}}\n\n## Encryption\n- Data at rest: {{REST_ENCRYPT}}\n- Data in transit: {{TRANSIT_ENCRYPT}}\n- Key management: {{KMS_POLICY}}\n\n## Exceptions Approved\n{{EXCEPTIONS}}", tags: "cloud,config,baseline,hardening" },
    { id: "tmpl_006", name: "DDoS Attack Mitigation Plan", category: "Network Security", docType: "Tracker", description: "Preparation checklist and runbook for DDoS attack detection and mitigation.", content: "# DDoS Attack Mitigation Plan\n\n## Risk Assessment\n- Asset criticality: {{CRITICALITY}}\n- Historical attacks: {{HISTORY}}\n- Threat actors: {{THREAT_ACTORS}}\n\n## Mitigation Stack\n| Layer | Control | Provider/Tool | Status |\n|-------|---------|---------------|--------|\n| Edge | CDN + Anycast | {{CDN}} | {{CDN_STATUS}} |\n| Edge | WAF rate limiting | {{WAF}} | {{WAF_STATUS}} |\n| Network | DDoS scrubbing | {{SCRUBBING}} | {{SCRUB_STATUS}} |\n| Network | BGP blackhole | {{BGP_PROVIDER}} | {{BGP_STATUS}} |\n| App | Auto-scaling | {{SCALING}} | {{SCALE_STATUS}} |\n\n## Response Runbook\n1. Confirm attack via {{MONITORING_TOOL}}.\n2. Notify {{SOC_TEAM}} and {{STAKEHOLDERS}}.\n3. Activate {{MITIGATION_PLAYBOOK}}.\n4. Increase scrubbing capacity to {{MAX_CAPACITY}}.\n5. Communicate with {{ISP}} if upstream filtering required.\n6. Collect forensic logs for {{RETENTION}}.\n7. Post-incident review within {{REVIEW_SLA}}.\n\n## Testing Schedule\n{{TEST_SCHEDULE}}", tags: "network,ddos,mitigation,resilience" },
    { id: "tmpl_007", name: "IP Whitelist-Blacklist", category: "Network Security", docType: "Tracker", description: "Managed list of permitted and denied IP addresses, ranges, and geolocations.", content: "# IP Whitelist-Blacklist\n\n## Last Updated\n{{LAST_UPDATED}} by {{UPDATED_BY}}\n\n## Whitelist\n| IP / Range | Description | Owner | Expiry | Approved By |\n|------------|-------------|-------|--------|-------------|\n| {{IP_1}} | {{DESC_1}} | {{OWNER_1}} | {{EXP_1}} | {{APPR_1}} |\n| {{IP_2}} | {{DESC_2}} | {{OWNER_2}} | {{EXP_2}} | {{APPR_2}} |\n\n## Blacklist\n| IP / Range | Reason | Date Added | Source | Action |\n|------------|--------|------------|--------|--------|\n| {{BIP_1}} | {{REASON_1}} | {{BDATE_1}} | {{SRC_1}} | {{ACT_1}} |\n| {{BIP_2}} | {{REASON_2}} | {{BDATE_2}} | {{SRC_2}} | {{ACT_2}} |\n\n## Automation Rules\n{{AUTO_RULES}}\n\n## Review Cycle\n{{REVIEW_CYCLE}}", tags: "network,ip,firewall,access" },
    { id: "tmpl_008", name: "Network Access Control Log", category: "Network Security", docType: "Template", description: "Log of all network access changes, approvals, and revocations.", content: "# Network Access Control Log\n\n## Change Request\n- Request ID: {{REQ_ID}}\n- Requester: {{REQUESTER}}\n- Date: {{DATE}}\n- Environment: {{ENV}}\n\n## Access Details\n- Source: {{SOURCE}}\n- Destination: {{DESTINATION}}\n- Protocol/Port: {{PROTO_PORT}}\n- Business justification: {{JUSTIFICATION}}\n\n## Approval Chain\n| Stage | Approver | Decision | Timestamp |\n|-------|----------|----------|-----------|\n| {{S1}} | {{A1}} | {{D1}} | {{T1}} |\n\n## Implementation\n- Implemented by: {{IMPL_BY}}\n- Implementation time: {{IMPL_TIME}}\n- Firewall rule IDs: {{RULE_IDS}}\n\n## Validation\n- Test result: {{TEST_RESULT}}\n- Review date: {{REVIEW_DATE}}", tags: "network,nac,change log" },
    { id: "tmpl_009", name: "Network Device Inventory", category: "Network Security", docType: "Template", description: "Catalogue of routers, switches, firewalls, load balancers, and other network gear.", content: "# Network Device Inventory\n\n## Environment\n{{ENV_NAME}}\n\n## Devices\n| Hostname | Type | Model | OS/Firmware | IP Address | Location | Owner | Support Contract | Last Patch | Status |\n|----------|------|-------|-------------|------------|----------|-------|------------------|------------|--------|\n| {{H1}} | {{T1}} | {{M1}} | {{OS1}} | {{IP1}} | {{LOC1}} | {{OWN1}} | {{SUP1}} | {{PATCH1}} | {{ST1}} |\n| {{H2}} | {{T2}} | {{M2}} | {{OS2}} | {{IP2}} | {{LOC2}} | {{OWN2}} | {{SUP2}} | {{PATCH2}} | {{ST2}} |\n\n## End-of-Life Tracking\n{{EOL_TRACKING}}\n\n## Configuration Backup Policy\n{{BACKUP_POLICY}}", tags: "network,inventory,asset" },
    { id: "tmpl_010", name: "Network Security Risk Mitigation", category: "Network Security", docType: "Report", description: "Assessment report covering network-layer threats and mitigation strategies.", content: "# Network Security Risk Mitigation Report\n\n## Executive Summary\n{{EXEC_SUMMARY}}\n\n## Scope\n{{SCOPE}}\n\n## Risk Register\n| ID | Threat | Likelihood | Impact | Risk Level | Mitigation | Owner | Target Date |\n|----|--------|------------|--------|------------|------------|-------|-------------|\n| {{R1}} | {{T1}} | {{L1}} | {{I1}} | {{RL1}} | {{M1}} | {{O1}} | {{TD1}} |\n| {{R2}} | {{T2}} | {{L2}} | {{I2}} | {{RL2}} | {{M2}} | {{O2}} | {{TD2}} |\n\n## Architecture Review\n{{ARCH_REVIEW}}\n\n## Gaps & Recommendations\n{{GAPS}}\n\n## Compliance Mapping\n{{COMPLIANCE_MAP}}\n\n## Next Review\n{{NEXT_REVIEW}}", tags: "network,risk,report,assessment" },
    { id: "tmpl_011", name: "Security Event Correlation", category: "Network Security", docType: "Tracker", description: "Correlation rules and detected patterns across security event sources.", content: "# Security Event Correlation Tracker\n\n## SIEM Platform\n{{SIEM_NAME}}\n\n## Data Sources\n{{DATA_SOURCES}}\n\n## Correlation Rules\n| Rule ID | Name | Logic | Severity | False Positive Rate | Status |\n|---------|------|-------|----------|---------------------|--------|\n| {{RID1}} | {{RN1}} | {{LOGIC1}} | {{SEV1}} | {{FP1}} | {{STAT1}} |\n| {{RID2}} | {{RN2}} | {{LOGIC2}} | {{SEV2}} | {{FP2}} | {{STAT2}} |\n\n## Detected Patterns (Last 30 Days)\n{{PATTERNS}}\n\n## Tuning Actions\n{{TUNING}}\n\n## MITRE ATT&CK Mapping\n{{MITRE_MAP}}", tags: "network,siem, correlation, detection" },
    { id: "tmpl_012", name: "VPN Usage Log", category: "Network Security", docType: "Template", description: "Log of VPN sessions with user attribution, access scope, and anomaly flags.", content: "# VPN Usage Log\n\n## Reporting Period\n{{START_DATE}} to {{END_DATE}}\n\n## Sessions\n| User | Source IP | Assigned IP | Connect Time | Disconnect Time | Duration | Bytes In | Bytes Out | Gateway | MFA Method |\n|------|-----------|-------------|--------------|-----------------|----------|----------|-----------|---------|------------|\n| {{U1}} | {{SIP1}} | {{AIP1}} | {{CT1}} | {{DT1}} | {{DUR1}} | {{BI1}} | {{BO1}} | {{GW1}} | {{MFA1}} |\n| {{U2}} | {{SIP2}} | {{AIP2}} | {{CT2}} | {{DT2}} | {{DUR2}} | {{BI2}} | {{BO2}} | {{GW2}} | {{MFA2}} |\n\n## Anomalies\n{{ANOMALIES}}\n\n## Policy Violations\n{{VIOLATIONS}}\n\n## Recommendations\n{{RECOMMENDATIONS}}", tags: "network,vpn,remote access,audit" },
    { id: "tmpl_013", name: "Access Rights & Permissions Matrix", category: "Identity & Access", docType: "Template", description: "Cross-reference of roles, systems, and permission levels with review trail.", content: "# Access Rights & Permissions Matrix\n\n## Review Date\n{{REVIEW_DATE}}\n\n## Matrix\n| Role / Person | System A | System B | System C | Database | Network | Approval |\n|---------------|----------|----------|----------|----------|---------|----------|\n| {{ROLE1}} | {{SA1}} | {{SB1}} | {{SC1}} | {{DB1}} | {{NET1}} | {{APPR1}} |\n| {{ROLE2}} | {{SA2}} | {{SB2}} | {{SC2}} | {{DB2}} | {{NET2}} | {{APPR2}} |\n\n## Privileged Accounts\n{{PRIVILEGED}}\n\n## Segregation of Duties Conflicts\n{{SOD_CONFLICTS}}\n\n## Remediation Actions\n{{REMEDIATION}}", tags: "iam,access control,permissions" },
    { id: "tmpl_014", name: "Data Breach Notification Log", category: "Data Protection", docType: "Template", description: "Record of data breach events and notifications to regulators, affected parties, and insurers.", content: "# Data Breach Notification Log\n\n## Breach Reference\n{{BREACH_REF}}\n\n## Discovery\n- Discovered by: {{DISCOVERED_BY}}\n- Discovery date: {{DISCOVERY_DATE}}\n- Detection method: {{DETECTION_METHOD}}\n\n## Breach Details\n- Type: {{BREACH_TYPE}}\n- Data categories: {{DATA_CATEGORIES}}\n- Number of records: {{RECORD_COUNT}}\n- Individuals affected: {{AFFECTED_COUNT}}\n\n## Root Cause\n{{ROOT_CAUSE}}\n\n## Notifications\n| Party | Contact | Method | Date Sent | Content Summary |\n|-------|---------|--------|-----------|-----------------|\n| {{P1}} | {{C1}} | {{M1}} | {{DS1}} | {{SUM1}} |\n| {{P2}} | {{C2}} | {{M2}} | {{DS2}} | {{SUM2}} |\n\n## Regulatory Obligations\n{{REG_OBLIGATIONS}}\n\n## Remediation\n{{REMEDIATION}}\n\n## Post-Incident Review\n{{PIR}}", tags: "data protection,breach,privacy,compliance" },
    { id: "tmpl_015", name: "Data Classification Register", category: "Data Protection", docType: "Template", description: "Register of data sets with classification labels, handling requirements, and custodians.", content: "# Data Classification Register\n\n## Classification Scheme\n- Public | Internal | Sensitive | Restricted | Critical\n\n## Register\n| Data Set | System | Classification | Custodian | Retention | Encryption | Location | Sharing Rules |\n|----------|--------|----------------|-----------|-----------|------------|----------|---------------|\n| {{DS1}} | {{SYS1}} | {{CLS1}} | {{CUST1}} | {{RET1}} | {{ENC1}} | {{LOC1}} | {{SHARE1}} |\n| {{DS2}} | {{SYS2}} | {{CLS2}} | {{CUST2}} | {{RET2}} | {{ENC2}} | {{LOC2}} | {{SHARE2}} |\n\n## Handling Rules by Classification\n{{HANDLING_RULES}}\n\n## Last Review\n{{LAST_REVIEW}}\n\n## Exceptions\n{{EXCEPTIONS}}", tags: "data protection,classification,governance" },
    { id: "tmpl_016", name: "Data Loss Prevention (DLP) Incident Log", category: "Data Protection", docType: "Template", description: "Log of DLP policy violations, investigations, and corrective actions.", content: "# DLP Incident Log\n\n## Incident ID\n{{INCIDENT_ID}}\n\n## Detection\n- DLP tool: {{DLP_TOOL}}\n- Policy triggered: {{POLICY}}\n- Severity: {{SEVERITY}}\n- Date/Time: {{DETECTED_AT}}\n\n## Event Details\n- User: {{USER}}\n- Channel: {{CHANNEL}} (Email / USB / Cloud / Endpoint / Web)\n- Data type: {{DATA_TYPE}}\n- Volume: {{VOLUME}}\n- Destination: {{DESTINATION}}\n\n## Investigation\n{{INVESTIGATION}}\n\n## Outcome\n- Intentional / Accidental: {{INTENT}}\n- Data exfiltrated: {{EXFIL}}\n- Business impact: {{IMPACT}}\n\n## Corrective Actions\n{{CORRECTIVE}}\n\n## Policy Tuning\n{{TUNING}}", tags: "data protection,dlp,incident" },
    { id: "tmpl_017", name: "Document Retention & Disposal", category: "Data Protection", docType: "Tracker", description: "Tracker for document lifecycle, retention periods, and secure disposal confirmation.", content: "# Document Retention & Disposal Tracker\n\n## Retention Policy\n{{RETENTION_POLICY}}\n\n## Tracker\n| Document ID | Title | Classification | Creation Date | Retention Period | Destruction Date | Method | Verified By |\n|-------------|-------|----------------|---------------|------------------|------------------|--------|-------------|\n| {{DOC1}} | {{TITLE1}} | {{CLASS1}} | {{CD1}} | {{RP1}} | {{DD1}} | {{METH1}} | {{VER1}} |\n| {{DOC2}} | {{TITLE2}} | {{CLASS2}} | {{CD2}} | {{RP2}} | {{DD2}} | {{METH2}} | {{VER2}} |\n\n## Legal Holds\n{{HOLDS}}\n\n## Disposal Certificate\n{{CERTIFICATE}}", tags: "data protection,retention,disposal,records" },
    { id: "tmpl_018", name: "Encryption Key Management", category: "Data Protection", docType: "Sheet", description: "Inventory of encryption keys, algorithms, rotation schedule, and custodians.", content: "# Encryption Key Management Sheet\n\n## Key Management Service\n{{KMS_PROVIDER}}\n\n## Keys\n| Key ID | Algorithm | Purpose | Environment | Owner | Rotation | Expiry | Status | HSM Backed |\n|--------|-----------|---------|-------------|-------|----------|--------|--------|------------|\n| {{K1}} | {{ALG1}} | {{PURP1}} | {{ENV1}} | {{OWN1}} | {{ROT1}} | {{EXP1}} | {{STAT1}} | {{HSM1}} |\n| {{K2}} | {{ALG2}} | {{PURP2}} | {{ENV2}} | {{OWN2}} | {{ROT2}} | {{EXP2}} | {{STAT2}} | {{HSM2}} |\n\n## Access to KMS\n{{KMS_ACCESS}}\n\n## Key Ceremony Records\n{{CEREMONY}}\n\n## Escrow / Recovery\n{{ESCROW}}", tags: "data protection,encryption,keys,crypto" },
    { id: "tmpl_019", name: "Incident Reporting & Tracking", category: "Incident & Compliance", docType: "Sheet", description: "Master sheet for all security incidents with status, owner, and resolution tracking.", content: "# Incident Reporting & Tracking Sheet\n\n## Reporting Period\n{{PERIOD}}\n\n## Incidents\n| ID | Title | Category | Severity | Reporter | Owner | Status | Opened | Closed | Root Cause | Action Items |\n|----|-------|----------|----------|----------|-------|--------|--------|--------|------------|--------------|\n| {{I1}} | {{T1}} | {{C1}} | {{SEV1}} | {{REP1}} | {{OWN1}} | {{ST1}} | {{OP1}} | {{CL1}} | {{RC1}} | {{AI1}} |\n| {{I2}} | {{T2}} | {{C2}} | {{SEV2}} | {{REP2}} | {{OWN2}} | {{ST2}} | {{OP2}} | {{CL2}} | {{RC2}} | {{AI2}} |\n\n## Metrics\n- Mean time to detect (MTTD): {{MTTD}}\n- Mean time to respond (MTTR): {{MTTR}}\n- Mean time to contain (MTTC): {{MTTC}}\n- Mean time to resolve (MTTR2): {{MTTR2}}\n\n## Trend Analysis\n{{TRENDS}}", tags: "incident,tracking,metrics,compliance" },
    { id: "tmpl_020", name: "Information Security Policy Compliance Checklist", category: "Incident & Compliance", docType: "Template", description: "Checklist for auditing compliance against information security policies.", content: "# Information Security Policy Compliance Checklist\n\n## Audit Scope\n{{AUDIT_SCOPE}}\n\n## Checklist\n| Control | Policy Reference | Requirement | Evidence | Compliant? | Gap | Owner | Deadline |\n|---------|-----------------|-------------|----------|------------|-----|-------|----------|\n| {{CTRL1}} | {{REF1}} | {{REQ1}} | {{EV1}} | {{COMP1}} | {{GAP1}} | {{OWN1}} | {{DL1}} |\n| {{CTRL2}} | {{REF2}} | {{REQ2}} | {{EV2}} | {{COMP2}} | {{GAP2}} | {{OWN2}} | {{DL2}} |\n\n## Overall Maturity\n{{MATURITY}}\n\n## Remediation Plan\n{{REMEDIATION}}\n\n## Sign-off\n| Role | Name | Date |\n|------|------|------|\n| Auditor | {{AUD_NAME}} | {{AUD_DATE}} |\n| CISO | {{CISO_NAME}} | {{CISO_DATE}} |", tags: "compliance,policy,audit,checklist" },
    { id: "tmpl_021", name: "Application Data Encryption Checklist", category: "Incident & Compliance", docType: "Template", description: "Verification checklist for encryption of application data at rest and in transit.", content: "# Application Data Encryption Checklist\n\n## Application\n{{APP_NAME}} v{{APP_VERSION}}\n\n## At Rest\n| Data Store | Encryption Enabled | Algorithm | Key Rotation | Certificate Pinning | Verified By | Date |\n|------------|-------------------|-----------|--------------|---------------------|-------------|------|\n| {{DS1}} | {{AE1}} | {{ALG1}} | {{KR1}} | {{CP1}} | {{VB1}} | {{D1}} |\n| {{DS2}} | {{AE2}} | {{ALG2}} | {{KR2}} | {{CP2}} | {{VB2}} | {{D2}} |\n\n## In Transit\n| Channel | TLS Version | Cipher Suites | Certificate Expiry | HSTS | Verified By | Date |\n|---------|-------------|---------------|--------------------|------|-------------|------|\n| {{CH1}} | {{TLS1}} | {{CS1}} | {{CE1}} | {{HSTS1}} | {{VB3}} | {{D3}} |\n| {{CH2}} | {{TLS2}} | {{CS2}} | {{CE2}} | {{HSTS2}} | {{VB4}} | {{D4}} |\n\n## Secrets Management\n{{SECRETS}}\n\n## Exceptions\n{{EXCEPTIONS}}", tags: "compliance,encryption,application,checklist" },
    { id: "tmpl_022", name: "Application Risk Assessment Matrix", category: "Application Security", docType: "Template", description: "Risk scoring matrix for application vulnerabilities and business impact.", content: "# Application Risk Assessment Matrix\n\n## Application\n{{APP_NAME}}\n\n## Assessment Date\n{{ASSESSMENT_DATE}}\n\n## Risk Matrix\n| Risk ID | Threat | Vulnerability | Likelihood | Impact | Risk Score | Risk Level | Mitigation | Residual Risk |\n|---------|--------|---------------|------------|--------|------------|------------|------------|---------------|\n| {{R1}} | {{T1}} | {{V1}} | {{L1}} | {{I1}} | {{RS1}} | {{RL1}} | {{M1}} | {{RR1}} |\n| {{R2}} | {{T2}} | {{V2}} | {{L2}} | {{I2}} | {{RS2}} | {{RL2}} | {{M2}} | {{RR2}} |\n\n## Scoring Methodology\n{{SCORING}}\n\n## Risk Appetite Statement\n{{APPETITE}}\n\n## Review Schedule\n{{REVIEW_SCHEDULE}}", tags: "application,risk,matrix,assessment" },
    { id: "tmpl_023", name: "Application Threat Modeling", category: "Application Security", docType: "Sheet", description: "STRIDE-based threat model with diagrams, threats, and mitigations.", content: "# Application Threat Modeling Sheet\n\n## Application\n{{APP_NAME}}\n\n## Threat Model Methodology\n{{METHODOLOGY}} (e.g., STRIDE, PASTA, OCTAVE)\n\n## Data Flow Diagram\n{{DFD}}\n\n## Threat Register\n| Threat ID | Category | Threat | Target | Likelihood | Impact | Mitigation | Status |\n|-----------|----------|--------|--------|------------|--------|------------|--------|\n| {{TH1}} | {{CAT1}} | {{T1}} | {{TR1}} | {{L1}} | {{I1}} | {{M1}} | {{ST1}} |\n| {{TH2}} | {{CAT2}} | {{T2}} | {{TR2}} | {{L2}} | {{I2}} | {{M2}} | {{ST2}} |\n\n## Assumptions\n{{ASSUMPTIONS}}\n\n## Open Risks\n{{OPEN_RISKS}}", tags: "application,threat model,stride,security" },
    { id: "tmpl_024", name: "Authentication & Authorization Control", category: "Application Security", docType: "Sheet", description: "Detailed controls for identity verification, session management, and access enforcement.", content: "# Authentication & Authorization Control Sheet\n\n## Application / System\n{{APP_NAME}}\n\n## Authentication Controls\n| Control | Implementation | Config | Test Result |\n|---------|------------------|--------|-------------|\n| Password policy | {{PWD_IMPL}} | {{PWD_CFG}} | {{PWD_TEST}} |\n| MFA | {{MFA_IMPL}} | {{MFA_CFG}} | {{MFA_TEST}} |\n| Session timeout | {{SESS_IMPL}} | {{SESS_CFG}} | {{SESS_TEST}} |\n| Account lockout | {{LOCK_IMPL}} | {{LOCK_CFG}} | {{LOCK_TEST}} |\n| Password reset | {{RESET_IMPL}} | {{RESET_CFG}} | {{RESET_TEST}} |\n\n## Authorization Controls\n| Control | Implementation | Config | Test Result |\n|---------|------------------|--------|-------------|\n| RBAC | {{RBAC_IMPL}} | {{RBAC_CFG}} | {{RBAC_TEST}} |\n| ABAC | {{ABAC_IMPL}} | {{ABAC_CFG}} | {{ABAC_TEST}} |\n| API authorization | {{API_IMPL}} | {{API_CFG}} | {{API_TEST}} |\n\n## Penetration Test Findings\n{{PENTEST}}", tags: "application,auth,authorization,identity" },
    { id: "tmpl_025", name: "Patch & Update", category: "Application Security", docType: "Tracker", description: "Tracker for security patches, updates, and maintenance windows.", content: "# Patch & Update Tracker\n\n## Policy\n- Critical patches: {{CRITICAL_SLA}}\n- High patches: {{HIGH_SLA}}\n- Medium/Low patches: {{MED_SLA}}\n\n## Tracker\n| System | Component | Current Version | Latest Version | Severity | CVE | Release Date | Scheduled Date | Status | Owner |\n|--------|-----------|-----------------|----------------|----------|-----|--------------|----------------|--------|-------|\n| {{SYS1}} | {{COMP1}} | {{CV1}} | {{LV1}} | {{SEV1}} | {{CVE1}} | {{RD1}} | {{SD1}} | {{STAT1}} | {{OWN1}} |\n| {{SYS2}} | {{COMP2}} | {{CV2}} | {{LV2}} | {{SEV2}} | {{CVE2}} | {{RD2}} | {{SD2}} | {{STAT2}} | {{OWN2}} |\n\n## Maintenance Windows\n{{MAINT_WINDOWS}}\n\n## Rollback Plan\n{{ROLLBACK}}", tags: "application,patch,vulnerability,maintenance" },
    { id: "tmpl_026", name: "Secure Coding Checklist", category: "Application Security", docType: "Template", description: "Development checklist covering OWASP Top 10 and language-specific secure coding practices.", content: "# Secure Coding Checklist\n\n## Application / Component\n{{APP_NAME}}\n\n## Input Validation\n- [ ] All user inputs validated against allow-list.\n- [ ] Parameterised queries used for all database access.\n- [ ] Output encoded for context (HTML, JS, URL, CSS).\n- [ ] File upload restrictions enforced (type, size, content scan).\n\n## Authentication & Session\n- [ ] Strong password policy enforced.\n- [ ] MFA available for sensitive operations.\n- [ ] Session tokens cryptographically random and rotated.\n- [ ] Idle timeout and absolute timeout configured.\n\n## Authorization\n- [ ] Principle of least privilege applied.\n- [ ] Server-side enforcement of access controls.\n- [ ] Direct object reference checks (IDOR prevention).\n\n## Cryptography\n- [ ] AES-256-GCM for data at rest.\n- [ ] TLS 1.3 for data in transit.\n- [ ] Secrets stored in vault / KMS, never in code.\n\n## Logging & Error Handling\n- [ ] Security events logged without sensitive data.\n- [ ] Generic error messages to users; detailed logs server-side.\n- [ ] Rate limiting on authentication and sensitive APIs.\n\n## Dependencies\n- [ ] SBOM generated.\n- [ ] Known vulnerabilities checked via {{SCAN_TOOL}}.\n- [ ] No EOL or unsupported libraries.\n\n## Sign-off\n| Reviewer | Date | Result |\n|----------|------|--------|\n| {{REV1}} | {{RD1}} | {{RES1}} |", tags: "application,secure coding,owasp,development" },
    { id: "tmpl_027", name: "Secure Mobile App Testing", category: "Application Security", docType: "Tracker", description: "Test plan and results for mobile application security assessments.", content: "# Secure Mobile App Testing Tracker\n\n## App Details\n- Name: {{APP_NAME}}\n- Platform: {{PLATFORM}}\n- Version: {{VERSION}}\n- Build: {{BUILD}}\n\n## Test Environment\n{{TEST_ENV}}\n\n## Test Cases\n| ID | Category | Test | Tool | Result | Evidence | Severity |\n|----|----------|------|------|--------|----------|----------|\n| {{TID1}} | {{CAT1}} | {{TEST1}} | {{TOOL1}} | {{RES1}} | {{EV1}} | {{SEV1}} |\n| {{TID2}} | {{CAT2}} | {{TEST2}} | {{TOOL2}} | {{RES2}} | {{EV2}} | {{SEV2}} |\n\n## OWASP MASVS Coverage\n{{MASVS}}\n\n## Remediation Backlog\n{{BACKLOG}}\n\n## Retest Schedule\n{{RETEST}}", tags: "application,mobile,testing,owasp" },
    { id: "tmpl_028", name: "Security Misconfiguration Log", category: "Application Security", docType: "Template", description: "Log of discovered misconfigurations, remediation, and validation.", content: "# Security Misconfiguration Log\n\n## Scan Source\n{{SCAN_SOURCE}}\n\n## Environment\n{{ENV}}\n\n## Findings\n| ID | Asset | Misconfiguration | Severity | Discovered | Remediated | Validator | Status |\n|----|-------|------------------|----------|------------|------------|-----------|--------|\n| {{F1}} | {{A1}} | {{MIS1}} | {{SEV1}} | {{DIS1}} | {{REM1}} | {{VAL1}} | {{ST1}} |\n| {{F2}} | {{A2}} | {{MIS2}} | {{SEV2}} | {{DIS2}} | {{REM2}} | {{VAL2}} | {{ST2}} |\n\n## Common Patterns\n{{PATTERNS}}\n\n## Preventive Controls\n{{PREVENTION}}", tags: "application,misconfiguration,hardening" },
    { id: "tmpl_029", name: "Static Code Analysis Log", category: "Application Security", docType: "Template", description: "Results and remediation tracking from static application security testing (SAST).", content: "# Static Code Analysis Log\n\n## Scan Details\n- Tool: {{SAST_TOOL}}\n- Version: {{TOOL_VERSION}}\n- Scan date: {{SCAN_DATE}}\n- Code base: {{REPO}} @ {{COMMIT}}\n\n## Summary\n- Critical: {{CRIT_COUNT}}\n- High: {{HIGH_COUNT}}\n- Medium: {{MED_COUNT}}\n- Low: {{LOW_COUNT}}\n- Info: {{INFO_COUNT}}\n\n## Findings\n| ID | File | Line | Severity | CWE | Title | Remediation | Owner | Due Date | Status |\n|----|------|------|----------|-----|-------|-------------|-------|----------|--------|\n| {{FID1}} | {{F1}} | {{LN1}} | {{SEV1}} | {{CWE1}} | {{TTL1}} | {{REM1}} | {{OWN1}} | {{DD1}} | {{ST1}} |\n| {{FID2}} | {{F2}} | {{LN2}} | {{SEV2}} | {{CWE2}} | {{TTL2}} | {{REM2}} | {{OWN2}} | {{DD2}} | {{ST2}} |\n\n## False Positives\n{{FALSE_POS}}\n\n## Trend\n{{TREND}}", tags: "application,sast,code,security" },
    { id: "tmpl_030", name: "Web Application Vulnerability", category: "Application Security", docType: "Tracker", description: "Tracker for web application vulnerabilities found via DAST, penetration testing, or bug bounty.", content: "# Web Application Vulnerability Tracker\n\n## Application\n{{APP_NAME}}\n\n## Assessment Method\n{{METHOD}} (DAST / PenTest / Bug Bounty)\n\n## Vulnerabilities\n| ID | Vulnerability | Location | Severity | CVSS | OWASP Category | Remediation | Retest | Status | Bounty |\n|----|-------------|----------|----------|------|----------------|-------------|--------|--------|--------|\n| {{VID1}} | {{VULN1}} | {{LOC1}} | {{SEV1}} | {{CVSS1}} | {{OWASP1}} | {{REM1}} | {{RET1}} | {{ST1}} | {{B1}} |\n| {{VID2}} | {{VULN2}} | {{LOC2}} | {{SEV2}} | {{CVSS2}} | {{OWASP2}} | {{REM2}} | {{RET2}} | {{ST2}} | {{B2}} |\n\n## SLA Targets\n{{SLA_TARGETS}}\n\n## Metrics\n- Open critical/high: {{OPEN_SEV}}\n- Mean time to fix: {{MTTF}}\n- Re-open rate: {{REOPEN}}", tags: "application,web,vulnerability,dast" },
    { id: "tmpl_031", name: "Acceptable Use of Assets", category: "Policies", docType: "Policy", description: "Policy governing acceptable use of organisational IT assets, internet, and email.", content: "# Acceptable Use of Assets Policy\n\n## 1. Purpose\n{{PURPOSE}}\n\n## 2. Scope\nThis policy applies to: {{SCOPE}}\n\n## 3. Policy Statements\n### 3.1 General Use\n- Employees must use organisational assets solely for {{INTENDED_USE}}.\n- Personal use is {{PERSONAL_USE_POLICY}}.\n\n### 3.2 Prohibited Activities\nThe following are strictly prohibited:\n- {{PROHIBITED_1}}\n- {{PROHIBITED_2}}\n- {{PROHIBITED_3}}\n\n### 3.3 Data Protection\n- All organisational data must be stored on {{APPROVED_STORAGE}}.\n- USB devices {{USB_POLICY}}.\n\n### 3.4 Monitoring\n{{MONITORING_POLICY}}\n\n## 4. Roles & Responsibilities\n| Role | Responsibility |\n|------|----------------|\n| {{ROLE1}} | {{RESP1}} |\n| {{ROLE2}} | {{RESP2}} |\n\n## 5. Violations\n{{VIOLATIONS}}\n\n## 6. Review\nEffective date: {{EFFECTIVE_DATE}}\nNext review: {{NEXT_REVIEW}}\nApproved by: {{APPROVER}}", tags: "policy,acceptable use,assets" },
    { id: "tmpl_032", name: "Password Policy", category: "Policies", docType: "Policy", description: "Organisational requirements for password complexity, rotation, and storage.", content: "# Password Policy\n\n## 1. Purpose\n{{PURPOSE}}\n\n## 2. Scope\n{{SCOPE}}\n\n## 3. Requirements\n### 3.1 Complexity\n- Minimum length: {{MIN_LENGTH}} characters\n- Character requirements: {{CHAR_REQS}}\n- Dictionary words: {{DICT_POLICY}}\n\n### 3.2 Management\n- Rotation frequency: {{ROTATION}}\n- Reuse restriction: {{REUSE}} previous passwords\n- Default passwords: {{DEFAULT_POLICY}}\n\n### 3.3 Storage\n- Passwords must be stored using {{HASH_ALGO}} with {{SALT}}.\n- Plaintext storage is {{PLAINTEXT_POLICY}}.\n\n### 3.4 MFA\n{{MFA_POLICY}}\n\n## 4. Service Accounts\n{{SERVICE_ACCOUNT_POLICY}}\n\n## 5. Exceptions\n{{EXCEPTIONS}}\n\n## 6. Review\nEffective date: {{EFFECTIVE_DATE}}\nNext review: {{NEXT_REVIEW}}\nApproved by: {{APPROVER}}", tags: "policy,password,authentication" },
    { id: "tmpl_033", name: "Backup and Recovery", category: "Policies", docType: "Policy", description: "Policy defining backup scope, frequency, retention, testing, and recovery responsibilities.", content: "# Backup and Recovery Policy\n\n## 1. Purpose\n{{PURPOSE}}\n\n## 2. Scope\n{{SCOPE}}\n\n## 3. Backup Requirements\n### 3.1 Classification\n| Data Class | RPO | RTO | Frequency | Retention | Location | Encryption |\n|------------|-----|-----|-----------|-----------|----------|------------|\n| {{CLASS1}} | {{RPO1}} | {{RTO1}} | {{FREQ1}} | {{RET1}} | {{LOC1}} | {{ENC1}} |\n| {{CLASS2}} | {{RPO2}} | {{RTO2}} | {{FREQ2}} | {{RET2}} | {{LOC2}} | {{ENC2}} |\n\n### 3.2 Testing\n- Recovery tests: {{TEST_FREQ}}\n- Test scope: {{TEST_SCOPE}}\n- Documentation: {{TEST_DOC}}\n\n## 4. Responsibilities\n| Role | Responsibility |\n|------|----------------|\n| {{ROLE1}} | {{RESP1}} |\n| {{ROLE2}} | {{RESP2}} |\n\n## 5. Incident Activation\n{{ACTIVATION}}\n\n## 6. Review\nEffective date: {{EFFECTIVE_DATE}}\nNext review: {{NEXT_REVIEW}}\nApproved by: {{APPROVER}}", tags: "policy,backup,recovery,resilience" },
    { id: "tmpl_034", name: "BYOD", category: "Policies", docType: "Policy", description: "Policy for bring-your-own-device access to corporate systems, apps, and data.", content: "# Bring Your Own Device (BYOD) Policy\n\n## 1. Purpose\n{{PURPOSE}}\n\n## 2. Scope\n{{SCOPE}}\n\n## 3. Eligible Devices\n{{ELIGIBLE}}\n\n## 4. Security Requirements\n### 4.1 Device\n- OS version: {{OS_REQ}}\n- Encryption: {{ENC_REQ}}\n- Screen lock: {{LOCK_REQ}}\n- Jailbreak/rooting: {{ROOT_POLICY}}\n\n### 4.2 Apps & Data\n- Approved apps: {{APPROVED_APPS}}\n- Corporate data container: {{CONTAINER}}\n- Remote wipe: {{WIPE_POLICY}}\n\n## 5. Privacy\n{{PRIVACY_POLICY}}\n\n## 6. Support\n{{SUPPORT_SCOPE}}\n\n## 7. Violations\n{{VIOLATIONS}}\n\n## 8. Review\nEffective date: {{EFFECTIVE_DATE}}\nNext review: {{NEXT_REVIEW}}\nApproved by: {{APPROVER}}", tags: "policy,byod,mobility,endpoint" },
    { id: "tmpl_035", name: "Information Transfer", category: "Policies", docType: "Policy", description: "Policy governing the secure transfer of information inside and outside the organisation.", content: "# Information Transfer Policy\n\n## 1. Purpose\n{{PURPOSE}}\n\n## 2. Scope\n{{SCOPE}}\n\n## 3. Transfer Methods\n### 3.1 Internal\n| Method | Approved Use | Encryption | Classification Limit |\n|--------|--------------|------------|----------------------|\n| {{M1}} | {{USE1}} | {{ENC1}} | {{LIM1}} |\n| {{M2}} | {{USE2}} | {{ENC2}} | {{LIM2}} |\n\n### 3.2 External\n| Method | Approved Use | Encryption | Classification Limit | Recipient Verification |\n|--------|--------------|------------|----------------------|------------------------|\n| {{M3}} | {{USE3}} | {{ENC3}} | {{LIM3}} | {{VER3}} |\n| {{M4}} | {{USE4}} | {{ENC4}} | {{LIM4}} | {{VER4}} |\n\n## 4. Prohibited Transfers\n{{PROHIBITED}}\n\n## 5. Third-Party Transfer\n{{THIRD_PARTY}}\n\n## 6. Audit & Monitoring\n{{AUDIT}}\n\n## 7. Review\nEffective date: {{EFFECTIVE_DATE}}\nNext review: {{NEXT_REVIEW}}\nApproved by: {{APPROVER}}", tags: "policy,information transfer,data handling" },
  ];

  for (const t of templates) {
    await query(
      `INSERT INTO "DocumentTemplate" (id, name, category, "docType", description, content, tags, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [t.id, t.name, t.category, t.docType, t.description, t.content, t.tags, now]
    );
  }
}
