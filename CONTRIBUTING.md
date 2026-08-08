# CONTRIBUTING — Lovable-first workflow

Primary editor: Lovable — all UI work should start in Lovable on feature branches named `feat/lovable/*`.

Purpose
- Keep Lovable as the authoritative editor for UI and pages. Lovable edits sync to this repository; follow the workflow below to avoid conflicts and half-finished work.

Branching
- Create feature branches for work originating in Lovable: `feat/lovable/<short-description>`
- For non-UI engineering work (backend, infra, tests), use `feat/<area>/<short-description>`.

Workflow (Lovable-first)
1. Start the feature in the Lovable editor and let Lovable commit to a feature branch (or create a feature branch locally with the same name before editing in Lovable).
2. Develop and preview in Lovable. Lovable will commit changes to this repository.
3. Open a pull request from the feature branch into the repository default branch for code review and CI checks. If you are the only maintainer and manage the main branch directly, keep feature branches but merge when ready.
4. Do not edit the same UI files simultaneously in GitHub and in Lovable without coordinating via the feature branch and a short message in the PR/commit.

Commit messages
- Include a short Lovable reference when a change originates from the Lovable editor, for example: `feat(lovable): add publish form skeleton — lovable:project=562dedca-7e64-4a79-851e-e97cc7dc2fef`.

Communication rules
- Never edit the same UI file both in Lovable and directly on GitHub at the same time without explicit coordination (e.g., a shared feature branch and a message describing who will finish first).
- If you must make a hotfix directly on GitHub for production, communicate in the team channel and avoid making overlapping Lovable edits until the hotfix is merged and synchronized.

Branch protection and CI
- It is recommended to protect the default branch (require PR reviews and passing checks) to avoid accidental direct edits. If you want, I can add example GitHub Actions workflows later.

Maintainer note
- You control whether the team uses PRs. If you prefer to merge feature branches yourself, keep using the `feat/lovable/*` pattern so edits are traceable to Lovable.
