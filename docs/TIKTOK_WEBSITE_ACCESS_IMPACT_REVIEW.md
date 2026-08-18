# Impact Review — TikTok Production Review Remediation (Website Accessibility)

Date: 2026-08-18
Decision owner: authorized project owner (confirmed in chat)
Trigger: TikTok reviewer rejection — "Website is not accessible., Invalid Website URL."

## 1. Requested change and exact scope

Public website presentation and discoverability only:

- Root route (`/`) redesigned into a credible, complete official website that explains
  SuperChoice AI Content Creator Hub, CMS, lightweight CRM, content
  creation/review/approval, and multi-channel publishing, while retaining the
  published CMS feed and existing login/admin behavior.
- Visible, crawlable links to Privacy Policy, Terms of Service and a public TikTok
  Integration page in the public header nav and footer — no menu, no login required.
- New public route `/tiktok-integration` describing the Content Posting API user flow;
  `/tiktok-verification` retained for backward compatibility and cross-linked.
- Accurate, non-generic HTML titles/descriptions plus canonical URLs on `/`, `/privacy`,
  `/terms`, `/tiktok-integration`, `/tiktok-verification`; generic "Lovable App" root
  defaults replaced.
- Remove "Demo Page" wording from surface copy.

## 2. Explicit exclusions (not authorized, not performed)

- No database, schema, data, migration or RLS change.
- No Supabase client, proxy, auth middleware or session change.
- No n8n / LINE / Google / HeyGen / API workflow, endpoint contract or secret change.
- No publish state-machine, approval logic or admin permission change.
- No deletion, renaming or content change of existing TikTok signature files.
- No external platform submission and no deploy/publish action.

## 3. Consumers and dependency trace

| Consumer | Dependency touched | Expected outcome |
|---|---|---|
| Anonymous visitors | `/` markup and nav/footer | Full public page, no login wall |
| TikTok reviewer/crawler | `/`, `/privacy`, `/terms`, `/tiktok-integration`, `/tiktok-verification`, `robots.txt` | 200 + descriptive metadata |
| CMS feed readers | `cms_posts` loader in `/` | Unchanged query, unchanged rendering data |
| Admin users | `useAdminAccess`, Admin dropdown, `/publish` `/cms` `/heygen` | Unchanged gating and links |
| Public API (`/api/public/publish`) | none | Untouched |
| Verification files under `public/` | none | Byte-identical, same paths |

## 4. Risks and regression plan

| Risk | Mitigation / check |
|---|---|
| Homepage loader regression hides feed | Loader code and `databaseReady` fallback left intact |
| Admin menu leak to guests | `admin.allowed` condition unchanged |
| Duplicate canonical tags | Canonicals added on leaf routes only, none in `__root.tsx` |
| Verification file loss | No file under `public/` modified or removed |
| Route collision on new page | New file `src/routes/tiktok-integration.tsx`; old route retained |

Validation: TypeScript/build check, dev-server HTTP status probes on all public routes,
verification-file byte checks, guest-view render check.

## 5. Rollback

Revert this single commit. No data, secret or infrastructure state changes to undo.

## 6. Unresolved questions

None blocking. No contact data was invented; contact wording continues to point to the
official SuperChoice AI channel already referenced in the legal pages.

## 7. Post-change evidence

Changed files:

- `docs/TIKTOK_WEBSITE_ACCESS_IMPACT_REVIEW.md` (new)
- `src/routes/index.tsx` (public marketing sections, nav + footer legal links, metadata)
- `src/routes/tiktok-integration.tsx` (new public page, Content Posting API flow)
- `src/routes/tiktok-verification.tsx` (metadata, canonical, cross-link)
- `src/routes/privacy.tsx` (metadata, canonical)
- `src/routes/terms.tsx` (metadata, canonical)
- `src/routes/__root.tsx` (generic "Lovable App" defaults replaced)
- `src/components/publish/index.tsx` (heading copy only: removed "Demo Page")

Evidence recorded after implementation:

- Type/build check: passed (see run log in the change session).
- HTTP probes on dev server: `/`, `/privacy`, `/terms`, `/tiktok-integration`,
  `/tiktok-verification` and their trailing-slash forms return 200.
- Verification signature files: unchanged (`git status` shows no entries under `public/`).
- Guest render: homepage shows product explanation, CMS feed and legal links with no
  redirect to `/login`.
- Not deployed: publish/deploy intentionally left to the caller.

## 8. Recorded validation run (2026-08-18, dev server)

- `bunx tsgo --noEmit`: no diagnostics (TYPECHECK_OK).
- HTTP 200: `/`, `/privacy`, `/privacy/`, `/terms`, `/tiktok-integration`,
  `/tiktok-integration/`, `/tiktok-verification`, `/login` — no login redirect on `/`.
- Homepage head: `<title>SuperChoice AI Content Creator Hub — CMS &amp; Multi-Channel
  Publishing</title>` with `rel="canonical" href="https://superchoiceai.lovable.app/"`.
- `grep -c "Lovable App" src/routes/__root.tsx` → 0.
- TikTok signature files present and unchanged (68 bytes each):
  `public/tiktokCB8NijnB3v7VJEWAn48lgo8XAXKOcxJs.txt`,
  `public/tiktokhExb7wXHJMQvTb5D1sqAaR3CGuKT7KrY.txt`,
  `public/privacy/tiktokxi6WNZUjqUB9nS7b8GoeUGsGY8lO0o8W.txt`,
  `public/terms/tiktokCGdf3N1TR65mUHLI0qLdtM0EFRGuUUlH.txt`,
  `public/tiktok-verification/tiktokhExb7wXHJMQvTb5D1sqAaR3CGuKT7KrY.txt`.
- `public/robots.txt` unchanged and crawlable (`Allow: /`).
- No deploy performed.
