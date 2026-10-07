# Launch runbook

Everything in the code is built and tested. What's left needs the owner's accounts and keys. Claude never sees or handles secret values: wherever a step says "paste", the owner pastes into the file or the dashboard directly.

Each step says who does it and roughly how long it takes. Steps 1 to 4 can run in parallel; email (step 5) waits on DNS.

## 1. Keys (owner, 15 minutes)

Put these in `D:\RCweb-next\.env.local` for local work (dev project) and in Vercel for the deployed site (production project). Names only are listed here; `.env.example` has the same list.

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase, the project, Settings, API. Dev: `https://lvmibgzaaegamfesjfsk.supabase.co`. Production: `https://osjvefbyxwvtycxukcmq.supabase.co`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase, Settings, API Keys, the publishable key (`sb_publishable_…`). |
| `SUPABASE_SECRET_KEY` | Supabase, Settings, API Keys, "Create secret key" (`sb_secret_…`). One per project. The local file still holds a placeholder. |
| `NEXT_PUBLIC_SITE_URL` | The site's address: `http://localhost:3000` locally, the production address in Vercel (for example `https://rcweb-next.vercel.app` or the club domain). |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit, Developer options (`private_…`). Needed only for the member import's photo uploads. |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/Rifan` |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit, Developer options (`public_…`). |
| `CERT_LINK_SECRET` | Make one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` and paste the output. Keep it the same across deploys, or links already emailed stop working. |
| `RESEND_API_KEY` | Resend, API Keys (`re_…`). |
| `RESEND_FROM_EMAIL` | For example `Robotics Club <certificates@your-domain>`, on the domain verified in step 5. |
| `ADMIN_NOTIFY_EMAILS` | Optional: comma-separated admin addresses. |
| `EMAIL_ENABLED` | `1` only once step 5 is done. Until then leave it unset: "Find my certificates" says lookup opens soon instead of claiming to send. |
| `JOIN_EMAIL_DOMAINS` | Optional: defaults to `vitstudent.ac.in`. |

Never set `DATA_FIXTURES` in Vercel. Remove it from `.env.local` once the dev secret key is in, so local builds read the real dev database.

## 2. GitHub and Vercel (owner, 30 minutes)

1. Create the repository `helpRifan/rcweb-next` (private is fine) and tell Claude, who adds it as the remote and pushes `master`. The old `rc_web` repository and its Vercel project stay untouched.
2. In Vercel, "Add New Project", import `rcweb-next`, keep the Next.js defaults, and add the step 1 variables for Production (production Supabase project) and Preview (dev project).
3. Deploy. The first build runs `next build` plus the bundle secret check.

## 3. The production database (Claude, with the owner's go-ahead at each starred step, 45 minutes)

1. * Take a fresh backup of the production project, as in `D:\RC-web-backups\supabase-2026-09-30\README.md`.
2. * Apply the migrations in `supabase/migrations/` to production, then run `supabase/tests/privileges.sql` and the security advisors. Expected: 0 rows, no warnings.
3. * Drop the legacy tables (they hold only filler, checked 2026-09-30). This can't be undone without the backup.
4. * Seed the owners in `admins` (the four D13 accounts) and run `supabase/dev/roster.sql` (the roster, unpublished, and the faculty coordinator).
5. * Import the certificates: `npx tsx scripts/import-certificates.ts "C:\Users\rifan\OneDrive\Documents\Certificates" --project prod --commit`, with the production keys in the environment. The dry run already matches the survey: 321 certificates (293 participation, 28 placed) and 54 contact emails. The review file with IDs lands in `D:\RC-web-backups`.

## 4. Google sign-in (owner, 10 minutes)

1. Supabase (production), Auth, URL Configuration: set the Site URL to the production address and add `https://<production address>/admin/auth/callback` to the redirect URLs.
2. The Google provider and its redirect URI are already set for production. For the dev project too, add `https://lvmibgzaaegamfesjfsk.supabase.co/auth/v1/callback` to the Google OAuth client and paste the client ID and secret in Supabase (dev), Auth, Providers, Google.

## 5. Email (owner, 20 minutes plus DNS time)

1. In Resend, add the club's domain and copy the DNS records it shows (SPF and DKIM) into the domain's DNS. Verification can take from minutes to a day.
2. Once Resend shows the domain as verified, set `RESEND_FROM_EMAIL` on that domain and `EMAIL_ENABLED=1` in Vercel, and redeploy.
3. Without a domain, everything else still works; only "Find my certificates" waits, and says so.

## 6. Check production (Claude, 15 minutes)

- `E2E_BASE_URL=https://<production address> npx playwright test tests/e2e/smoke.spec.ts` (the other e2e files expect the local fixtures).
- By hand: verify a certificate ID from the review file, download its PDF, request "Find my certificates" for a team email you own, and sign in to the admin with an owner account.

## 7. Content (owner, any time, through the admin)

- Events: dates, descriptions and covers for the five TechnoVIT '26 events, then publish them.
- Gallery: approve or rewrite the nine draft captions, then publish.
- Settings: the six division sentences (drafts are in `.superpowers/briefs/home-sections.md`).
- Members: after the Google Form, `npx tsx scripts/import-members.ts <responses.csv> <photos-folder>` (dry run first, then `--commit`). It fills the seeded roster rows and keeps their links.
- Partners: add and publish real ones; the Partners page appears with the first.
