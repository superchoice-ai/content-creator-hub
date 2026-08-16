# Infrastructure / Core Dependency Change Governance

## Mandatory rule
Before changing shared infrastructure or any core dependency, perform a repository-wide System Impact Review first and disclose the impact before implementation.

Required sequence:
1. Search the whole repository for direct/indirect consumers.
2. List affected pages, APIs, workflows, jobs, auth paths, database paths, shared components, integrations, transactions and concurrency risks.
3. State confirmed impact vs possible impact.
4. Present safer alternatives and prefer the lowest-blast-radius option.
5. Obtain explicit approval before a shared/core change that can affect multiple consumers or production data paths.
6. Keep implementation atomic/reversible and avoid unrelated refactors.
7. Regression-test every identified consumer, not only the screen where the issue appeared.
8. State rollback boundaries and unverified items.

## High-risk scope
Treat these as high-impact until proven otherwise:
- Supabase client/server initialization
- auth/session middleware
- RLS and SECURITY DEFINER functions
- RPC signatures/behavior
- database migrations
- environment/backend/project-ref selection
- service-role/secret handling
- shared provider clients and shared configuration access
- routing, queues, webhook infrastructure, common integrations

## Supabase rule
Supabase is a core DB/runtime dependency. Any change involving Supabase must include impact analysis for `.from()`, `.rpc()`, auth/session, server-side usage, RLS-sensitive paths, critical writes, and dependent workflows before cutover.

## Required pre-change summary
- Change
- Reason
- Confirmed consumers
- Possible impact
- Options
- Recommended lowest-risk option
- Approval required: Yes/No

Read-only impact analysis does not require approval. Implementation of a cross-cutting infrastructure change does when it can affect multiple consumers or production data paths.
