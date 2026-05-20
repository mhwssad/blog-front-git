---
name: work-on-blog-front
description: Repository-specific guidance for the blog-front Vue 3 + TypeScript frontend. Use when Codex is working in this repository to add, refactor, or review admin, front, or common pages, Element Plus forms and tables, API modules, Pinia stores, router wiring, mock files, docs, skills, tests, or env/config changes and must keep file placement, dynamic admin routing, permission handling, type organization, and validation steps aligned with current project conventions.
---

# Work On Blog Front

## Overview

Use this skill as the repository onboarding guide and change checklist for `blog-front`. Read the repo conventions first, place code in the correct module, keep related layers in sync, and validate with the project's `pnpm` workflow before finishing.

## Build Context

1. Read `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/project-structure-convention.md`, and `docs/code-writing-convention.md` before structural or cross-module work.
2. Read the nearest existing module before inventing a new pattern. Match neighboring files in `src/views`, `src/api`, `src/stores`, `mock`, and `docs/api文档`.
3. Prefer actual repository patterns over stale prose if they conflict, then update the relevant docs or this skill when you intentionally change the convention.

## Place Files Correctly

- Put pages under `src/views/admin`, `src/views/front`, or `src/views/common`. Never place pages directly under `src/views`.
- Put page-private dialogs, drawers, cards, and helpers in the page's sibling `components/` folder.
- Put global reusable UI in `src/components/common` or `src/components/editor`. Use `src/components/admin` only for genuinely cross-admin reusable components.
- Put layout-shell code in `src/layouts` and `src/layouts/components`.
- Put public APIs in top-level `src/api/*.ts`, user APIs in `src/api/user`, and admin APIs in `src/api/sys`.
- Keep realtime client code in `src/api/websocket.ts` unless the repository grows a dedicated realtime submodule.
- Import shared API types from `@/types/api-types`; update the matching file under `src/types/api-types/` and keep the barrel export working.
- Put shared state in `src/stores` and `src/stores/modules`; keep page-only state inside the page unless reuse is clear.
- Put store-only shared helpers in `src/stores/composables` and store-shared types in `src/stores/types.ts`.
- Put reusable interaction logic in `src/composables`, stateless helpers in `src/utils`, app-wide setup in `src/plugins`, and env-independent settings in `src/config`.
- Put stable cross-module constants in `src/constants`, i18n messages in `src/i18n`, and global styles only in `src/styles`.
- Put route definitions, guards, dynamic route mapping, and menu helpers only in `src/router`.

## Follow Repository Patterns

- Use Vue 3 with `<script lang="ts" setup>`, `import type`, and explicit async return types when useful.
- Prefer Element Plus components before creating custom primitives.
- Follow the current auto-import setup for `vue`, `vue-router`, `pinia`, and `@vueuse/core`, but keep explicit type imports.
- Normalize backend field differences in the API layer, not in pages.
- Keep API files focused on requests, response typing, and compatibility mapping. Do not put view messages or navigation there.
- Keep stores focused on shared state and domain actions. Do not put DOM logic in stores.
- Keep `utils` free of page-bound business flow.
- Keep shared API types split by domain under `src/types/api-types/`, not as local files under `src/api/`.
- Use concise comments that explain why, not line-by-line narration.
- Use `v-permission` for button-level permission control instead of relying on visual hiding alone.

## Apply Feature-Specific Defaults

- For admin list pages, start from the established search area, table, pagination, and dialog or drawer pattern.
- For table pages, prefer `el-table`, `min-width`, `show-overflow-tooltip`, and `useTableHeight` when height management is needed. Treat `vxe-table` as opt-in for exceptional cases.
- For dialogs, reuse create and edit dialogs when possible and reset form state on close.
- For dynamic admin menus, ensure backend `component` values can be resolved by `src/router/component-resolver.ts`.
- For the admin home route, keep the fixed page at `src/views/admin/dashboard/index.vue`.
- For auth or shared pages, keep them under `src/views/common/**`.
- For front-facing features, preserve the separation between public content, user actions, and shared layout components.
- For shared logic around uploads, requests, charts, editors, logging, or permissions, prefer the existing composables and utils before inventing new wrappers.

## Keep Related Files In Sync

When adding or changing a business domain, check whether the same change also requires updates to:

- `src/api/**`
- `src/stores/**`
- `src/types/api-types/**`
- `src/stores/types.ts` or `src/stores/composables/**`
- `mock/*.mock.ts` and `mock/data/**`
- `docs/api文档/**`
- `docs/project-structure-convention.md` or `docs/code-writing-convention.md`
- `AGENTS.md`, `CLAUDE.md`, `README.md`, or this skill
- `env.d.ts`, `.env.example`, and `src/config/index.ts`

Apply these repo rules while syncing:

- New API domains need matching mock coverage.
- New environment variables need both declaration and example updates.
- Structure changes should update the structure doc.
- Convention changes should update the code-writing doc.
- Workflow or repo-onboarding changes should update this skill and any mirrored guidance in `AGENTS.md` or `CLAUDE.md`.

## Validate Before Finishing

1. Run `pnpm type-check` at minimum.
2. Run `pnpm build` before concluding substantial changes.
3. Run `pnpm lint` when touching several files or refactoring shared code.
4. Run `pnpm test:run` when touching shared composables, request flows, upload logic, or other tested modules.
5. Call out anything you could not verify.

## Common Triggers

Use this skill for requests like:

- Add a new admin management page.
- Add a new front feature with page, API, store, and mock updates.
- Refactor a domain while keeping file placement consistent.
- Wire a backend menu component to a new admin view.
- Review whether a change follows the repository's structure and coding conventions.
- Update repo-facing docs, workflow notes, or this repository-specific skill to match the current codebase.
