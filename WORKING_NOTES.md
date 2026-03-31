# Working Notes — Christianity Affiliation Survey

> **Internal document. Not for public distribution.**
> Update this file at the end of every working session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before making any suggestions or changes.
2. Read `README.md` for public-facing project context, setup steps, and tech stack rationale.
3. Do not change the folder structure or naming conventions without discussing it with the developer first.
4. Follow all conventions in the **Conventions** section exactly — do not introduce new patterns.
5. Do not suggest anything listed in **What Was Tried and Rejected**; those decisions were deliberate.
6. Ask before making any large structural changes (rerouting data flows, swapping libraries, changing the Supabase schema, etc.).
7. This project was AI-assisted. Refactor conservatively — prefer targeted edits over rewrites.
8. The survey is a class assignment with a fixed deadline. Scope changes should be flagged before being implemented.

---

## Current State

**Last Updated:** 2026-03-31

The app is fully scaffolded and functional in the Replit development environment. The Supabase table may or may not be created yet — the developer was given the SQL to run manually and was working through that step. Azure Static Web Apps deployment has not yet been completed.

### What Is Working
- [x] Home page with "Take the Survey" and "View Results" navigation
- [x] Four-question survey form with full inline validation
- [x] Dynamic "Other" text input on the faith practices question (Q4)
- [x] Thank-you screen showing a summary of the respondent's answers
- [x] Results page with four Recharts visualizations
- [x] Client-side routing via Wouter (all four routes)
- [x] `staticwebapp.config.json` added for Azure SPA route fallback
- [x] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` saved as environment variables
- [x] `README.md` written with full setup and deployment documentation

### What Is Partially Built
- [ ] Supabase database table — SQL provided to developer; may not have been run yet
- [ ] Azure Static Web Apps deployment — `staticwebapp.config.json` added; GitHub Actions workflow and env vars not yet configured

### What Is Not Started
- [ ] CSV export of results
- [ ] Azure GitHub Actions CI/CD workflow file
- [ ] Any form of admin or password-protected view

---

## Current Task

The developer was working through the Azure Static Web Apps deployment checklist, specifically setting up environment variables in the Azure portal and configuring the GitHub Actions build workflow. The `staticwebapp.config.json` file is already in place.

**Next step:** Configure the GitHub Actions deployment workflow with `app_location: "artifacts/survey"`, `output_location: "dist/public"`, and `app_build_command: "pnpm --filter @workspace/survey run build"`, and add `pnpm/action-setup@v4` before the build step.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 19.1.0 | Component model; already in workspace catalog |
| TypeScript | 5.9 | Type safety; monorepo default |
| Vite | 7.x | Fast HMR dev server; already in workspace catalog |
| Tailwind CSS | 4.x | Utility-first styling; already in workspace catalog |
| Wouter | 3.3.5 | Lightweight SPA routing; no need for full React Router for 4 pages |
| `@supabase/supabase-js` | 2.100.1 | Client SDK for the developer's own Supabase account |
| Supabase (PostgreSQL) | — | Developer's own account; RLS enables public anonymous access |
| Recharts | 2.15.2 | Declarative React charts; already in workspace devDependencies |
| pnpm | 10.x | Monorepo package manager; pre-existing workspace convention |

---

## Project Structure Notes

```
Faith-Survey-Tool/
├── artifacts/
│   └── survey/                          # The deployable React + Vite app
│       ├── public/
│       │   └── staticwebapp.config.json # Azure SPA fallback — do not remove
│       ├── src/
│       │   ├── lib/
│       │   │   ├── supabase.ts          # Supabase client instance + SurveyResponse type
│       │   │   └── constants.ts         # All survey content lives here (options, states, accent)
│       │   ├── pages/
│       │   │   ├── Home.tsx             # Landing page
│       │   │   ├── Survey.tsx           # The four-question form
│       │   │   ├── Results.tsx          # Aggregated charts from Supabase
│       │   │   └── ThankYou.tsx         # Post-submission confirmation
│       │   ├── App.tsx                  # Wouter router
│       │   ├── index.css                # Tailwind v4 theme tokens (HSL custom properties)
│       │   └── main.tsx                 # React entry point
│       ├── vite.config.ts               # Reads PORT and BASE_PATH from env
│       ├── package.json
│       └── tsconfig.json
├── artifacts/api-server/                # Pre-existing Express API — NOT used by survey
├── artifacts/mockup-sandbox/            # Pre-existing design sandbox — NOT used by survey
├── lib/                                 # Shared workspace libraries (not used by survey directly)
├── README.md
├── WORKING_NOTES.md                     # This file
└── pnpm-workspace.yaml                  # Workspace package discovery and catalog version pins
```

### Non-Obvious Decisions
- **The survey app is entirely client-side.** It calls Supabase directly using the anon key — there is no Express backend route involved. The existing `api-server` artifact is not used by this project.
- **`constants.ts` is the single source of truth** for all survey question options. To add, remove, or rename an affiliation or practice, edit only that file.
- **`BASE_PATH` is injected as an env var at runtime** by Replit's infrastructure. In Azure, set `BASE_PATH=/` in Application Settings.
- **`index.css` uses Tailwind v4's CSS custom property theming.** All colors are defined as HSL variables in `:root`. The primary accent (`#8A3BDB` = `270 69% 55%`) is set there.

### Files and Folders That Must Not Be Changed Without Discussion
- `artifacts/survey/public/staticwebapp.config.json` — required for Azure SPA routing
- `artifacts/survey/vite.config.ts` — reads `PORT` and `BASE_PATH`; changes break both Replit and Azure
- `pnpm-workspace.yaml` — workspace-level dependency catalog; changes affect all packages
- `lib/` — shared workspace libraries; do not modify unless a workspace-wide change is needed

---

## Data / Database

**Platform:** Supabase (PostgreSQL), developer's own account  
**Table:** `survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes (auto) | Primary key, `gen_random_uuid()` |
| `hometown` | `text` | Yes | Free-text, trimmed before insert |
| `state` | `text` | Yes | One of the 50 US states from `constants.ts` |
| `affiliation` | `text` | Yes | One of the 6 options in `AFFILIATIONS` |
| `practices` | `text[]` | Yes | One or more values from `PRACTICES`; always includes label strings, not keys |
| `other_practice` | `text` | No | Populated only when "Other" is in `practices`; null otherwise |
| `created_at` | `timestamptz` | Yes (auto) | Server default `now()` |

**Row Level Security:** Enabled. Two policies exist — `public insert` (anon role) and `public select` (anon role). No authenticated access is required. Do not add service-role key to the frontend.

---

## Conventions

### Naming Conventions
- React component files: `PascalCase.tsx` (e.g. `ThankYou.tsx`)
- Utility/lib files: `camelCase.ts` (e.g. `supabase.ts`, `constants.ts`)
- CSS custom properties: `--kebab-case` following Tailwind v4 conventions
- Supabase table and column names: `snake_case`

### Code Style
- TypeScript strict mode; no `any` types
- Inline styles used sparingly and only for the accent color (`#8A3BDB`) — everything else uses Tailwind utilities
- No third-party form library (react-hook-form is installed but not used); validation is custom and intentionally simple
- `aria-describedby` wires error messages to their inputs; `role="alert"` on error paragraphs

### Framework Patterns
- All survey content (question options, state list) lives in `constants.ts` — components import from there
- Supabase client is a singleton exported from `lib/supabase.ts`; never call `createClient` in a component
- Page-level state (`useState`) only — no global state manager
- Navigation via Wouter `<Link>` and `useLocation` hook; `window.history.state` passes answer data to `ThankYou.tsx`

### Git Commit Style
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Keep messages under 72 characters
- Example: `feat: add staticwebapp.config.json for Azure SPA routing`

---

## Decisions and Tradeoffs

- **Direct Supabase client from the frontend (no Express backend).** The developer has their own Supabase account and the anon key is safe for browser use when RLS policies are in place. This removes a whole layer of complexity. Do not suggest wrapping Supabase calls in Express routes.
- **Wouter instead of React Router.** The app has four routes. Wouter is 2 KB; React Router is not needed. Do not suggest migrating.
- **No form library (react-hook-form).** The form has four fields and simple validation rules. A custom `validate()` function is sufficient and avoids an extra abstraction layer for a project of this size.
- **Replit's built-in PostgreSQL was not used.** The developer specifically requested their own Supabase account so they own the data independently of Replit.
- **LDS (Latter-day Saint) was removed from the affiliation options** at the developer's explicit request. Do not add it back.
- **No authentication on the results page.** This is intentional — the results page is public by design for a class survey.
- **`staticwebapp.config.json` placed in `public/`** so Vite copies it automatically to `dist/public` at build time. Do not move it or add it to `.gitignore`.

---

## What Was Tried and Rejected

- **Replit's built-in PostgreSQL database** — rejected; developer wants data in their own Supabase account.
- **Express API routes for survey data** — considered using the existing `api-server` artifact as a proxy to Supabase; rejected in favor of direct frontend Supabase client, which is simpler and sufficient given the RLS setup.
- **`react-hook-form` for form validation** — installed in the workspace but not used; rejected in favor of a simple custom `validate()` function given the small number of fields.
- **Azure Supabase integration via connection string** — the frontend uses the Supabase JS client (anon key), not a direct PostgreSQL connection string. Do not suggest switching to a pg/drizzle connection for the frontend.

---

## Known Issues and Workarounds

**Issue 1: Percentage labels on the Top States bar chart**
The Recharts `<Bar label>` formatter uses a loosely typed callback. A type cast (`as`) is used internally to access `entry.payload.pct`. This may generate a TypeScript warning during strict builds.
- **Workaround:** The cast is intentional and safe; the `pct` field is always present in the data array. Do not remove the cast or refactor to a separate `<LabelList>` component without testing the output.
- **Must not be removed** — it provides the percentage label next to each state bar.

**Issue 2: `window.history.state` used to pass data to ThankYou page**
The thank-you screen reads the respondent's answers from `window.history.state` after a programmatic navigation via Wouter's `navigate`. If the user refreshes `/thank-you`, the state will be empty and fields will show `"—"`.
- **Workaround:** Acceptable for a class assignment; the user is not expected to refresh that page.
- **Do not refactor** to URL query params or a global store unless the developer asks.

---

## Browser / Environment Compatibility

### Front-End
- **Tested in:** Chrome (latest), Edge (latest)
- **Expected support:** All modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- **Known incompatibilities:** The CSS `accentColor` property used for radio/checkbox styling may not apply in Firefox < 89 or Safari < 15.4 — inputs will fall back to system default appearance, which is acceptable.
- **Not tested on:** IE11 (not supported; Vite targets ES2022)

### Back-End / Build Environment
- **OS:** Linux (Replit NixOS container; Azure Linux build agent)
- **Node.js:** 24.x (Replit) / 20+ required for Azure build
- **Package manager:** pnpm 10.x; the `preinstall` script in `package.json` blocks npm/yarn
- **Environment variables required at build time:** `PORT`, `BASE_PATH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## Open Questions

- Does the Azure Static Web Apps GitHub Actions workflow need to handle the full pnpm monorepo install, or can it be scoped to just `artifacts/survey`?
- Should `BASE_PATH` be hardcoded to `/` in `vite.config.ts` for the Azure build, or injected via Application Settings?
- Is there a requirement for the results page to be password-protected before the class assignment is submitted?
- Will the Supabase project be kept active after the semester ends, or should a data export be built before then?

---

## Session Log

### 2026-03-31
**Accomplished:**
- Tailored the original undergraduate hobbies survey PRD to a Christianity affiliation survey
- Collected developer preferences: audience (class), affiliation options (removed LDS), footer name (Grace Moore, BAIS:3300 - spring 2026), public results page
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables using credentials provided by the developer
- Created the `survey` React + Vite artifact at `/`
- Built all four pages: Home, Survey (form), ThankYou, Results (charts)
- Installed `@supabase/supabase-js`
- Written `README.md` and this `WORKING_NOTES.md`
- Added `staticwebapp.config.json` to `public/` for Azure SPA routing

**Left Incomplete:**
- Developer had not yet confirmed the Supabase SQL was run (table may not exist)
- Azure GitHub Actions workflow not yet configured

**Decisions Made:**
- Use direct Supabase client from frontend (no backend proxy)
- Use Wouter for routing (not React Router)
- No form library; custom validation only

**Next Step:** Developer configures Azure Static Web Apps GitHub Actions workflow with correct `app_location`, `output_location`, `app_build_command`, and pnpm setup action.

---

## Useful References

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Azure Static Web Apps — Custom Build](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration)
- [Azure Static Web Apps — SPA Routing Config](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes)
- [Recharts API Reference](https://recharts.org/en-US/api)
- [Vite Build Options](https://vitejs.dev/config/build-options)
- [pnpm action-setup for GitHub Actions](https://github.com/pnpm/action-setup)
- [Wouter Routing Docs](https://github.com/molefrog/wouter)
- **AI Tools Used:** Replit Agent — used throughout this session to scaffold the project, write all components, set environment variables, and generate documentation. All output was reviewed by the developer.
