# Execution log: 3-day launch plan

This log covers `2026-10-01-three-day-launch.md`. The owner was asleep overnight on 1–2 Oct and delegated every decision. Each task records:
- where it departed from the plan, and why;
- owner actions still pending;
- anything a reviewer should check.

## Overnight conditions (1–2 Oct)

- **`SUPABASE_SECRET_KEY` isn't available.** `.env.local` holds the placeholder `sb_secret_PLACEHOLDER_owner_must_replace`.
  - Unit tests mock `db()`.
  - Live database reads wait for owner action A3.
- **No GitHub CLI and no Vercel login on this machine.** Task 10 (repo, Vercel, preview) waits for the owner; work stays committed locally on `master`.
- **Real club photos are already on ImageKit** at public URLs (`D:\RC-web\imagekit_mapping.json`, endpoint `https://ik.imagekit.io/Rifan`). They can be referenced without the private key.
- **Prototypes and reference screenshots** the owner approved are in `.superpowers/prototypes/` and `.superpowers/reference-shots/`, both git-ignored.

## Task 1: Scaffold

Done as planned: create-next-app 16.3.8, pinned deps installed with no ERESOLVE, the Vitest config, setup and smoke test, and the boilerplate removed. `.gitignore`, `docs/` and `.superpowers/` were kept. The React Compiler is off: there's no `babel-plugin-react-compiler` dependency and no `reactCompiler` in `next.config.ts`. The lockfile mentions it only as one of Next's optional peers.

Deviations:
- **`D:\rcweb-next-scaffold` wasn't deleted.** The built-in safety check refused `rm -rf` on it, so its files were copied in and the folder was left behind. *Owner: delete `D:\rcweb-next-scaffold` by hand. It holds only the untouched create-next-app output.*
- **`typecheck` is `next typegen && tsc --noEmit`, not plain `tsc --noEmit`.** Next 16 generates `next-env.d.ts` and the global `LayoutProps`/`PageProps` types into `.next/types`. On a fresh clone with no `.next/`, plain `tsc` fails on `LayoutProps` from Task 2 on. The Next 16 CLI docs recommend this pattern.
- **`.gitignore` gained `next-env.d.ts`, `*.tsbuildinfo` and `*.pem`** besides the planned `/shots/`. They come from the scaffold's own ignore file, which we dropped. Next 16's docs say `next-env.d.ts` must not be tracked, and `tsc --noEmit` with `incremental` writes `tsconfig.tsbuildinfo`.
- **ESLint ignores `.superpowers/**` and `shots/**`.** Flat config lints dot-folders. `.superpowers/rbsrc/` holds git-ignored React Bits reference sources that produced 59 lint errors, none of them in project code.

## Task 2: Design tokens, Archivo, guardrails

Done as planned. `shadcn init --defaults --yes` worked as-is in the existing project: `components.json` has `"style": "base-nova"`, `src/lib/utils.ts` is `export { cn } from "cn"`, and `src/components/ui/button.tsx` exists. `globals.css`, `palette.ts` and the Archivo `layout.tsx` match the plan. The guardrail test failed first (Geist, the scaffold hexes, `font-mono`, the zinc classes), then passed.

Deviations:
- **`tests/setup.ts` guards its browser stubs with `typeof window !== 'undefined'`.** The guardrail test runs under `@vitest-environment node`, and the planned setup crashed there with `window is not defined` before any test ran.
- **`<html>` carries the `dark` class, and `globals.css` keeps shadcn's `@custom-variant dark (&:is(.dark *))`.** The site is dark only. Without this, shadcn's `dark:` styles would follow the visitor's OS setting instead of always applying.
- **`globals.css` has `@source not "../../docs"`.** Tailwind v4 scans every non-ignored file, so the plan's own text (`bg-black/50`) produced a `#00000080` rule in the shipped CSS. After the change, the built CSS holds only palette hexes, their alpha tints and `#0000` (transparent).
- **`src/app/page.tsx` became a small palette-clean placeholder** (the h1 and one line of hero copy). The scaffold page's zinc and `font-mono` classes fail the guardrails, and the plan only deletes this file in Task 3.
- **`button.tsx` was restyled beyond the colour clean-up.**
  - Colours: the `color-mix(in oklch, …)` hover became `hover:bg-rc-muted/20`, hover states use the palette tokens, and `destructive` is an outlined grey, not a tinted red-style fill.
  - Focus: shadcn's `outline-none` plus a 50% ring broke the "2px `#FFFFFF`, offset 3px" focus rule, so it became `focus-visible:outline-2 outline-offset-3 outline-rc-ink`.
  - Size: every size is at least 44px tall (`min-h-11`, icon sizes `size-11`/`size-12`), the site's tap-target minimum. shadcn's defaults ran from 24 to 36px.
  - Type: the label is 15px, weight 600, width 102%, per the UI label rule.

## Task 3: Site shell (header, footer, 404, icons)

Done as planned. `site.ts`, `SiteHeader`, `SiteFooter`, `ButtonLink`, the `(site)` layout, `not-found.tsx` and `make-icons.mjs` are in. `favicon.ico` was removed. Both test files failed first (missing modules), then passed. `next/image` needed no mocking in Vitest.

Checked in a real browser: headless Chrome over CDP with device emulation, from a throwaway script that starts and stops `next start`. Screenshots stayed in the session scratchpad.
- No horizontal overflow at 360, 390, 768 or 1440px.
- The mobile menu opens at 390 and 360.
- Tab from page load reaches "Skip to content" first, and the focus ring shows as 2px white with a 3px offset.
- `/no-such-page` returns 404 with the header and footer.

Deviations:
- **`tests/setup.ts` registers `afterEach(() => cleanup())`.** Vitest runs without globals, so Testing Library's auto-cleanup never registers. Renders leaked between tests, and the `SiteHeader` tests failed with "multiple elements found".
- **The placeholder home moved to `src/app/(site)/page.tsx` instead of being deleted.** It now has the hero copy and both buttons. A deleted page would leave `/` returning 404 until Task 4, and this keeps the shell reviewable. *Task 4: overwrite this file; it's marked as a placeholder.*
- **The header logo uses `loading="eager"`, not `priority`.** Next 16 deprecated `priority` (`node_modules/next/dist/docs/.../image.md`). The logo isn't the LCP element, so it doesn't need `preload`.
- **While the mobile menu is open, the header bar is solid `bg-rc-bg`.** Otherwise page content scrolls visibly behind the transparent bar above the opaque menu panel.
- **`make-icons.mjs` trims the logo's empty margin before resizing.** The source is 1254px square with about 18% transparent margin, so the planned straight resize left a roughly 22px mark in the 34px slot.
  - `public/logo.png` is 256px and transparent (49 KB, under the 60 KB budget).
  - `icon.png` is the mark on a `#0D0D0D` rounded square (palette-quantised, 41 KB). The plan's transparent icon would show an invisible white "R" on light browser tab strips.
  - `apple-icon.png` is opaque and full-bleed with 12% padding, because iOS applies its own corner mask.
- **`sharp` is now a declared devDependency (`^0.35.5`, the same version Next already pulls in).** `make-icons.mjs` imports it directly, and relying on Next's optional transitive copy is fragile.
- **`not-found.tsx` also renders the skip link and sets `metadata.title` to "Page not found".** That keeps the keyboard path consistent with `(site)/layout.tsx`.

## Task 4: React Bits and the homepage hero

Done as planned, resumed after a usage-limit cut-off. Step 1 (registry install of `FaultyTerminal.tsx` and `DecryptedText.tsx`, adding `ogl` and `motion`) and the Step 2 test file were already in the tree. Both were checked and kept. The test failed 3 of 3 against the stock component, then passed after the port. Every other test file failed first on missing modules, then passed.

Deviations:
- **`FaultyTerminal` port additions beyond the plan's list.** All are marked "port-only" in the file.
  - `timeOffsetRef` is seeded inside the effect, not by `useRef(Math.random() * 100)`. The registry line fails `react-hooks/purity`. Each context build gets its own random offset, as before.
  - `renderStill()` also sets `uPageLoadProgress` to 1, so a still frame can never be blank if `pageLoadAnimation` is left on.
  - **Lost-context fallback.** On `webglcontextlost` the loop stops and the canvas is removed, so the poster shows again (Review Focus 1).
  - **Non-blocking shader warm-up (`KHR_parallel_shader_compile`).** The field's program is compiled and linked off the main thread first, then ogl's `Program` is built and links from the browser's program cache.
    - Why: on this machine's Intel UHD GPU with a cold shader cache, ogl's `getProgramParameter(LINK_STATUS)` blocked the main thread for 1.8 to 1.9 s at about 0.55 s after load. That froze the headline mid-scramble, so the scramble took 2.25 s instead of 0.48 s.
    - After the change, the only long frame is the first context creation (about 110 ms). The canvas still arrives at about 2.6 s on a cold cache, as before, because the GPU compile takes that long anyway, and the poster shows until then. Without the extension the build is synchronous, as in the registry.
  - **A provenance header comment** (source, copyright, port notes). The registry file ships no header to keep.
- **`DecryptedText`, three small edits.**
  - A provenance header.
  - One `eslint-disable-next-line react-hooks/set-state-in-effect` on the registry's reset effect.
  - **`motion.span` became a plain `span`.** It used no motion features, and the motion runtime put 41.8 KB gzipped into the first-load chunk of every page with a scrambled h1. First-load JS for `/` went from 222.1 to 184.3 KB gzipped (budget 250). `motion` stays in `package.json` because the registry added it and later components may need it.
- **The poster steps aside once the canvas is in.**
  - `HeroField`'s wrapper has `field-host bg-rc-bg`, and `globals.css` adds `.field-host:has(canvas) .field-poster { opacity: 0 }`.
  - In the first GPU shots, the poster's dot grid showed through the field's dark gaps under `mix-blend-lighten`.
  - Without a solid backdrop inside the wrapper's stacking context, the shader's black would stay `#000` instead of being lifted to `#0D0D0D`. Now the most common dark pixel is 13,13,13 in both the prototype and the build.
- **The hero scrim is a `.hero-scrim` class in `globals.css`, with the prototype's exact values.**
  - The plan used Tailwind `before:` classes with -30% insets on every side. The prototype uses `-30% -28% -30% -40%` on desktop and a 0.64 linear band under 700px; both are ported.
  - Body copy is 16px on mobile and 18px from `sm` up, with line-height 1.55 (spec 4.2). The plan had `text-lg` everywhere. The copy-to-body gap is 20px on mobile and 28px from `sm` up, as in the prototype.
- **`tests/setup.ts` makes `HTMLCanvasElement.prototype.getContext` return `null` quietly.** jsdom already returned null but logged "Not implemented" on every call.
- **`scripts/shoot.mjs` follows this run's brief.**
  - With no base URL, or with `local`, it spawns `next start -p 3100` and waits for HTTP 200. When done it kills the whole process tree (`taskkill /T` on Windows), errors included.
  - Paths may be given without the leading slash, because Git Bash rewrites `/` to `C:/Program Files/Git/`. A rewritten path is refused with a hint.
  - It waits for `load`, then up to 10 s of network idle. `networkidle0`, as in the old prototype script, timed out after 30 s against `next start`.
  - The sweep ends away from the halo's start point (`sweepEnd` per size), so the "mouse" shot shows the halo has moved.
  - It reports the h1 as assistive tech reads it (aria-hidden layers removed), the canvas backbuffer size and every HTTP response of 400 or above.
- **No `.claude/launch.json` and no `preview_start`.** Per this run's rules, the screenshot script starts and stops its own server.
- **`puppeteer-core` `^24.43.1` is a devDependency.** `npm audit` reports 7 high-severity issues, all in dev-only transitive dependencies (`basic-ftp`, `extract-zip`, from puppeteer's browser-download helpers, which go unused because we drive the installed Chrome). `npm audit --omit=dev` reports 0.

### Quality gate (spec 4.7, items 1 to 4): what was compared and concluded

Checked on the real GPU: the renderer is `ANGLE (Intel, Intel(R) UHD Graphics (0x0000A7A8) Direct3D11 vs_5_0 ps_5_0, D3D11)`, not SwiftShader. Shots are in `shots/home-{1440x900,390x844}-{idle,mouse}.png` (git-ignored). They were compared with `.superpowers/reference-shots/rb-faulty-terminal-{1-idle,2-mouse}.png` in full and as side-by-side crops.

1. **The centrepiece is the star. Pass.**
   - Same glyph cell (about 22px square; scale 2.7 and gridMul [1.6, 1] at 1440x900), shapes, scanline texture and tint (`#619AC3` at brightness 0.6). The dark gaps are `#0D0D0D`.
   - The share of lit pixels differs frame to frame (one frame: 20.8% in the reference, 17.1% here), because each load starts at a random time offset. The uniforms are identical.
   - **The cursor halo follows the pointer.** Glyph coverage near the halo's start point fell from 0.42 to 0.21 (desktop) and from 0.49 to 0.15 (mobile). Near the sweep's end it rose from 0.20 to 0.44 and from 0.19 to 0.32.
   - **DPR caps hold.** 1440x900 at DPR 1 has a 1440x900 backbuffer. 390x844 on touch at DPR 2 is capped to 1.5 (585x1266).
2. **Nothing reads as a template. Pass.**
   - The guardrail tests pass (palette, anti-slop, Archivo only).
   - There's one bold idea, the field and the headline decrypt. Everything else is quiet: two plain buttons, with no eyebrow, stats, cards or arrows.
   - *For the owner:* the prototype showed "Join the club" as an underlined text link. The plan and spec 6.1 ("Buttons") make it a bordered secondary button, and I kept the plan.
3. **The ui-ux-pro-max checklist. Pass.**
   - **Contrast** is measured over the live field, with the text hidden, the scrim kept and the halo parked under the copy: h1 7.63:1 (desktop) and 10.46:1 (mobile); body 10.56:1 and 10.57:1.
   - **Tap targets:** both buttons are 48px tall.
   - **Width:** no horizontal overflow at 360, 375, 768, 1024 or 1440.
   - **Reduced motion:** a single still frame (two shots 1.5 s apart are byte-identical) and no scramble layers.
   - **WebGL disabled** (`--disable-webgl`): the poster, no canvas, the copy intact.
   - **Lost context forced:** the canvas leaves and the poster returns, with no page errors.
   - No emoji anywhere.
4. **Motion is intentional. Pass, with one note.**
   - The headline scramble resolves in 475 ms (desktop) and 477 ms (mobile). The h1 height and the paragraph's position stay constant throughout, so nothing re-wraps or shifts.
   - After first paint, no frame is longer than the one-off ~110 ms context creation. Headless Chrome ran rAF at about 130 frames/s at 1440x900 on the integrated GPU.
   - *Note for the owner:* the field's cells fade in over the registry's 2 s page-load animation, which the approved prototype also had. It's a background entrance under text that's readable from first paint (about 360 ms), so I applied the 600 ms rule to content entrances only.

Other observations:
- **The only console errors are 404s from Next prefetching nav routes that don't exist yet** (`/team`, `/events`, `/gallery`, `/certificates`, `/join`). They stop as Day 2 builds those pages.
- **The FaultyTerminal chunk is lazy** and not part of the first load.

Pending owner actions:
- A7: a live review of Home.
- Decide whether "Join the club" stays a bordered button or becomes the prototype's text link.

## Task 5: Env validation and Supabase clients

Done as planned: `env-schema.ts`, `env.ts`, `instrumentation.ts`, the four Supabase clients, the placeholder `database.types.ts` and `.env.example`. The env test failed first (module missing), then passed 4 of 4.

`.env.local` is git-ignored: `git check-ignore .env.local` prints `.env.local`, and `.env.example` is not ignored. It holds:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, from the Supabase MCP for `lvmibgzaaegamfesjfsk`. rcweb-dev already has a modern `sb_publishable_` key (named `default`, enabled), so no publishable placeholder was needed. The legacy anon JWT is not used.
- `SUPABASE_SECRET_KEY=sb_secret_PLACEHOLDER_owner_must_replace`. It passes the `sb_secret_` format check, so local builds and tests work, but every live `db()` call fails until the owner pastes the real key.
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

Deviations:
- **The "never echoes a value" test has `expect.assertions(2)`.** As planned, it passed silently if `parseServerEnv` didn't throw at all.
- **The owner wasn't asked to paste the secret key.** They're asleep, so it's logged as pending A3 below.

Checked by hand (Review Focus 4):
- After `next build`, `next start` with `NEXT_PUBLIC_SUPABASE_URL=http://bad.example` and a legacy `eyJ…` secret logs `Invalid or missing environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY. See .env.example.` and answers `GET /` with 500. Neither value appears in the output.
- *For a reviewer:* Next 16 keeps the process alive after a failed `register()` ("Failed to prepare server") instead of exiting. So "refuses to start" here means it serves nothing but 500s.
- `next build` with the same bad URL still succeeds: `register()` runs at server start, not at build. *For Task 10:* a Vercel build won't catch missing env vars, but the first request will.

Pending owner actions:
- **A3:** paste the rcweb-dev secret key into `D:\RCweb-next\.env.local` as `SUPABASE_SECRET_KEY`, replacing `sb_secret_PLACEHOLDER_owner_must_replace` (Supabase dashboard, then Settings, then API Keys, then "Create secret key").

## Task 6: Database schema on rcweb-dev

Done as planned, on `lvmibgzaaegamfesjfsk` (rcweb-dev) only. Both migration files match the plan's SQL character for character and were applied through the MCP as `schema_v1` and `seed_settings`.

Before applying:
- `list_migrations` returned `[]` and `list_tables` (public) returned `[]`.
- No storage buckets, no public functions and no public enums existed. The extensions were Supabase's defaults (`pg_stat_statements`, `uuid-ossp`, `pgcrypto` in `extensions`, `supabase_vault`).
- Privilege query 5 returned 1 row (`certificates bucket missing or public`), the expected first failure.

After applying, every query in `supabase/tests/privileges.sql` returned `[]`:
1. anon/authenticated table privileges: 0 rows.
2. tables without RLS: 0 rows.
3. client-role policies in `public` and `storage`: 0 rows.
4. anon/authenticated execute on `hit_rate_limit`: 0 rows.
5. bucket missing or public: 0 rows.

Positive checks:
- `service_role` can execute `hit_rate_limit`, write `rate_limits` and read `admins`.
- anon can't execute `set_updated_at`.
- There are 9 public tables.
- `site_settings.recruitment` is `{"open": false}`.
- The `certificates` bucket is private, 5 MB, `application/pdf` only.

Advisors:
- **Security:** one lint only, `rls_enabled_no_policy` (INFO) on all 9 tables. That's intended (spec 5). There are no RLS-disabled, exposure, security-definer or mutable-search-path warnings.
- **Performance:** only `unused_index` (INFO) on `gallery_items_event_id_idx` and `certificates_contact_email_idx`, as expected on empty tables.

Owners: 4 seeded with `is_owner = true`. `select count(*) from public.admins where is_owner` returned `4`. No address is written into any committed file.

Deviations:
- **`supabase/history/2026-09-30-emergency-rls-lockdown.sql` was added by the orchestrator in `505266f`.** The Task 6 agent's copy out of `D:\RC-web-backups\` was refused as a sensitive source. The orchestrator then copied its own authored copy of the same SQL from the session scratchpad. It's history only and is never applied. No owner action is left.
- **`ADMIN_EMAILS` in `D:\RCweb-reimagined\api\index.ts` now has four entries, not three.** They are the three `@vitstudent.ac.in` owner accounts D13 describes, plus a personal `gmail.com` address that D13 doesn't list. I seeded exactly D13's four owners (the three VIT accounts plus the one non-VIT account D13 names), which matches the plan's expected count of 4. The extra address got no admin row, because owner rights shouldn't go to an address the confirmed decision doesn't name. *Owner: if that address should be an owner, run* `insert into public.admins (email, is_owner) values (lower(btrim('<address>')), true) on conflict (email) do nothing;` *on rcweb-dev, and record the change in the spec's D13.*
- **The owner rows have `name = null`.** The constant holds addresses only, and guessing names from them would be invented data. Names can be filled in from the admin UI later.
- **`privileges.sql` starts with a two-line header comment** saying how to run it and that every query must return zero rows.
- **`database.types.ts` is the MCP output verbatim.** It keeps the generator's formatting (no semicolons). ESLint passes on it, and the guardrail test already skips it by name.

## Task 7: Rate limiter

Done as planned: `rate-limit.ts` and its test. The test failed first (module missing), then passed 5 of 5.

Live check on rcweb-dev through MCP `execute_sql`:
- `select public.hit_rate_limit('selftest', 60, 2)` three times returned `true`, `true`, `false`.
- Extra check: after moving `window_start` back 61 s, the next call returned `true`, and the row showed `hits = 1` with a fresh window.
- The `selftest` row was then deleted; `rate_limits` holds 0 rows.

Extra check that a leaked publishable key reads nothing (spec 5): with only the rcweb-dev publishable key, `GET /rest/v1/admins` returned 401. `POST /rest/v1/rpc/hit_rate_limit` returned 401 with `permission denied for function hit_rate_limit` (42501).

Deviations:
- **`rateLimit` also fails closed when the call throws.** The plan only handled a returned `error`. A thrown error (bad env in `db()`, a network failure) would have rejected the promise, leaving the decision to each caller. It now logs the message and returns `false`. One test was added for this: "fails closed when the call itself throws".
- **The test's `beforeEach` has a block body.** The plan's `beforeEach(() => rpc.mockReset())` returns the mock, because `mockReset()` returns `this`. Vitest runs a function returned from `beforeEach` as that test's teardown, so `rpc()` was called once more after every test. With the plan's three tests this was harmless. With a rejecting mock, it failed the new test even though `rateLimit` resolved `false`. *Day 2 and Day 3 tests copy this pattern, so use a block body there too.*

Final checks for Tasks 5 to 7: `npm run typecheck && npm run lint && npm run test && npm run build` all pass, with 12 test files and 36 tests.

## Task 8: Admin sign-in and gate

Done as planned: `admin-rules.ts` and its test, `admin.ts`, `src/proxy.ts`, the admin layout, the sign-in page and button, the OAuth callback, and the protected layout, page and sign-out action. The rules test failed first (module missing), then passed 15 of 15. `admin-rules.ts`, `admin.ts`, the callback and `actions.ts` match the plan's code.

The build lists `/admin`, `/admin/sign-in` and `/admin/auth/callback` as dynamic, plus "Proxy (Middleware)".

Deviations:
- **The proxy matches its public paths as whole segments.** It allows `/admin/sign-in` and `/admin/auth` exactly, or anything under them. The plan's `pathname.startsWith('/admin/sign-in')` also let `/admin/sign-inx` past the proxy. That was harmless, because the route 404s, but it's tighter now.
- **`SignInButton` reports a failed `signInWithOAuth`.** It shows an icon and "Couldn’t open Google sign-in. Try again." (`role="alert"`). The plan only reset the pending state, so a failure did nothing visible.
- **The sign-in page takes the first value of a repeated query parameter** (`?next=a&next=b`). Next types `searchParams` values as `string | string[]`, and an array must not reach `safeNextPath` as anything but a string.
- **`src/app/admin/(protected)/AdminNav.tsx` is new.** It's a small client nav that sets `aria-current` with `usePathname`, which the server layout can't do. "Dashboard" is current only on `/admin` itself. Task 21 adds its sections to `ITEMS`.
- **The admin layout also has the skip link and `<main id="main">`,** like `(site)/layout.tsx`. The logo and club name link back to the public site, a hairline rule separates them from "Admin", and there's no site nav.
- **Titles.** The admin layout's title is "Admin" and the sign-in page's is "Sign in", so the root template gives "Sign in | Robotics Club, VIT Chennai". Both are `noindex, nofollow`.
- **Sign out uses the restyled shadcn `Button`** (`variant="outline"`, `type="submit"`). Base UI defaults a native button to `type="button"`, and the explicit prop wins.
- **The dashboard says what's coming in plain sentences:** events, gallery captions, members and partners, recruitment, and the waitlist with CSV export. It shows no counts or numbers.

Checked by hand:
- **Signed out:** `next start` and headless Chrome on the real GPU (`scripts/shoot.mjs local admin "admin/sign-in?error=not_admin"`). `/admin` lands on the sign-in page (h1 "Sign in to admin") with no console or HTTP errors. Task 9's e2e pins the exact URL, `/admin/sign-in?next=%2Fadmin`.
- **Sign-in page:** the `not_admin` message shows an icon and words in a hairline box. It's palette-only and fits at 1440 and 390.
- *For a reviewer:* the callback calls `getCurrentAdmin()`, which builds a fresh auth client after `exchangeCodeForSession`. That works because Next's mutable `cookies()` in a Route Handler returns cookies set earlier in the same request: `MutableRequestCookiesAdapter.wrap` reads from its own `ResponseCookies`.

Pending owner actions:
- **A4 (Step 4, the Google sign-in by hand) was skipped.** Turn on Google sign-in for rcweb-dev (plan, Owner actions A4). Then in rcweb-dev, open Auth, then URL Configuration, and add `http://localhost:3000/admin/auth/callback` and the Vercel preview pattern (Task 10) to the redirect URLs. Then sign in once with an owner account, which should land on `/admin`, and once with a non-listed account, which should land on `/admin/sign-in?error=not_admin` with the auth cookies cleared.
- **Do A3 before testing A4.** Until the real `SUPABASE_SECRET_KEY` is in `.env.local`, the `admins` lookup fails. It fails closed: it logs "admin lookup failed" and returns no admin. So every account, owners included, lands on `not_admin`.

## Task 9: Security headers, bundle secret check, e2e smoke

Done as planned:
- `@playwright/test` 1.63.0 and `@axe-core/playwright` 4.13.0 are installed with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, and no browser was downloaded. Playwright drives the installed Chrome (`channel: 'chrome'`).
- `npm run e2e` runs Playwright.
- `playwright.config.ts` and the headers in `next.config.ts` match the plan. `next.config.ts` also gained one comment.
- The first e2e run failed only on "security headers are set", as expected. It passed once the headers were in.

Deviations:
- **The bundle check doesn't fail on a bare `sb_secret_` prefix.**
  - The first `npm run build` with the plan's script failed on the sign-in page's chunk. The secret wasn't there: the key's name matched 0 times, and the only match was supabase-js 2.117.2's own `isNewApiKey` check, `key.startsWith("sb_secret_")`, which `browserClient()` pulls in for Google sign-in.
  - So the rule is now "an `sb_secret_` key", the regex `sb_secret_[A-Za-z0-9_-]{8,}`. It still catches this project's key, the placeholder and any other project's secret key, and ignores the library's literal, which has a quote straight after the prefix.
  - The name rule and the value rule are unchanged.
- **The check also scans the prerendered `.html` and `.rsc` files under `.next/server/app`.** They're served to browsers as they are, so a server component that rendered the key into a static page would leak it without touching `.next/static`. There are 32 files in total today.
- **The check names the rule each file matched** (labels only, never the text). If `.next/static` is missing, it exits 1 with "Run `next build` first."
- **`@next/env` is a declared devDependency, pinned to `16.3.8`** like `next`. The script imports it directly. This is the same reasoning as `sharp` in Task 3.
- **The e2e smoke covers more of the admin gate.**
  - `/admin` and `/admin/anything` each redirect to `/admin/sign-in?next=…` (`%2Fadmin`, then `%2Fadmin%2Fanything`) and show the sign-in h1.
  - `/admin/sign-in?error=not_admin` shows the icon-and-words message and the Google button, and passes axe with no serious or critical issues.
  - `/admin/auth/callback?next=//evil.com` with no code lands on `/admin/sign-in?error=failed`.
  - Alerts are matched by their text, because Next's route announcer is also `role="alert"` and a bare `getByRole('alert')` hits strict mode.

Proof that the check works:
- With `console.log(process.env.SUPABASE_SECRET_KEY)` added to `SignInButton.tsx`, `npm run build` exited 1 with `Secret material found in client bundles (values not printed):` and `.next\static\chunks\13rka70h4z2-f.js (the SUPABASE_SECRET_KEY name)`.
- It was reverted with `git checkout -- src/app/admin/sign-in/SignInButton.tsx`. After that, `git status` listed only this task's files, and the file has no `process.env` reference.

Checked by hand:
- **The built CSP** (`.next/routes-manifest.json`) has `connect-src 'self' https://lvmibgzaaegamfesjfsk.supabase.co https://upload.imagekit.io` and ends with `upgrade-insecure-requests`.
- **Home under the CSP**, on the real GPU (`scripts/shoot.mjs local`): the field's canvas renders (1440x900, and 585x1266 at 390x844) with no CSP violations. The only console errors are the known prefetch 404s for pages that don't exist yet.
- **`upgrade-insecure-requests` didn't break `next start` on `http://localhost`.** Assets and hydration loaded, and the reduced-motion e2e, which needs hydration, passes.
- *For Task 10:* the CSP's Supabase origin is fixed at build time (it's in `routes-manifest.json`), so each Vercel environment needs `NEXT_PUBLIC_SUPABASE_URL` set for its builds, not only at runtime. HSTS has no effect over plain http, so it only takes effect on the deployed https site.

Final checks for Tasks 8 and 9: `npm run verify` passes (13 test files, 51 tests, then `client bundles are clean (32 files checked)`), and `npx playwright test` reports `10 passed`. No server is left listening on port 3000 or 3100 afterwards.

## Day 1 review and fixes (2 Oct, finished 5 Oct)

Three reviewers (security, correctness, visual and accessibility) reported 13 confirmed findings. The fixer agent committed five before a usage limit stopped it:
- `e557126`: `requireAdmin()` in every admin page, not only the layout.
- `1eb24e7`: PUBLIC's global default EXECUTE on new functions revoked, with `privileges.sql` checking every public function.
- `25b05f4`: the bundle check scans every browser-served build file (`.body`, `.meta`, `.css`, `.map`).
- `20ad0e0`: the HeroField and mobile-nav focus tests can now fail.
- `4065da9`: shadcn pinned to 4.21.0.

The orchestrator finished the rest by hand (ultracode off, so no more workflows):
- **Env fail-fast (spec 5).**
  - `src/lib/env-startup.ts` makes `register()` print the bad variable names and `process.exit(1)`.
  - Next would otherwise keep serving 500s after a failed `register()`.
  - It never exits during `next build`, and it's tested in `src/instrumentation.test.ts`.
- **Admin titles.** The admin layout uses a title template, so the sign-in tab reads "Sign in | Admin | Robotics Club, VIT Chennai". The e2e test pins it.
- **One site gutter.**
  - The `site-gutter` utility (20px, then 7vw from 640px) is now on the header, the hero, the 404 and the footer. The logo, the h1 and the footer start on one left edge at every width. Checked on the GPU at 1440.
  - The fixer had tried the opposite: moving the hero into the header's centred `max-w-7xl` container. That was reverted, because every Day 2 brief and the approved prototype use the 7vw left gutter. `_shared.md` now names `site-gutter`.
- **Mobile menu.**
  - The open panel fills the viewport under the bar (solid `bg-rc-bg`), and page scroll is locked while it's open.
  - It closes when the viewport grows to the desktop nav.
  - Two tests pin this.
- **Desktop nav targets.** Each link is `px-2` with a minimum 44px width, and the list gap is `gap-2`, so the words keep their 24px rhythm and every target is at least 44×44.
- **Poster.** The `.field-poster` fallback was a faint dot grid. It's now dense dots cut into 18px glyph cells by 4px gaps, masked into clusters brightest where the live field's cursor halo starts.
  - Checked with `shoot.mjs --no-webgl` at both sizes: it reads as a still of the same field.
  - A real rendered still frame (WebP) for no-WebGL devices is a possible post-launch upgrade. It wasn't done now, because it adds about 150 KB that every first visit would download for a fallback under 2% of visitors need.
- **404 on the dimmed field** (brought forward from Task 15): `HeroField dim` behind calm copy, with the brief's exact text.
- **`scripts/shoot.mjs` options:**
  - `--port <n>`, so parallel builds don't collide;
  - `--no-webgl`, to judge the poster fallbacks;
  - `--reduced-motion`, to judge the still fallbacks.
  - In Git Bash, paths need `MSYS_NO_PATHCONV=1` or no leading slash.
- **This log.** The stale Task 6 history-file entry is corrected.

Checks: `npm run typecheck`, `npm run lint` and `npx vitest run` (18 files, 86 tests) all pass. `npm run build` passes, with `client bundles are clean (41 files checked)`. `npx playwright test` reports `10 passed`. GPU shots of `/` and `/no-such-page` at both sizes, with and without WebGL, were opened and judged.

## Day 2: data layer, Events, Gallery, Join, About (5 Oct)

Built natively, one page at a time. Each page was judged in GPU shots at 1440x900 and 390x844, with and without WebGL and under reduced motion.

- **Data layer (`src/lib/data/`).**
  - Every public read selects a fixed column list (`EVENT_PUBLIC_COLUMNS` and the rest). None includes `email`, `consent_at` or `contact_email`.
  - Data functions throw on a query error. Optional sections wrap them in `safe(label, run, fallback)`, which logs the label and renders the fallback.
  - `DATA_FIXTURES=1` serves the real-content fixtures: the 5 TechnoVIT '26 events, 9 photos, the 17-person roster plus the faculty coordinator, no partners, and recruitment closed. It throws if `VERCEL_ENV` is `production`.
  - Migration `20261005000100_gallery_dimensions.sql` adds `width` and `height` to `gallery_items`, so the grid lays out before images load. It's applied to rcweb-dev, and `database.types.ts` is patched to match.
  - `supabase/dev/fixtures.sql` seeds the same content into rcweb-dev. Only the faculty coordinator's member row is published there.
  - Images go through a custom `next/image` loader (`src/lib/imagekit-loader.ts`) that asks ImageKit for the width, so Vercel's optimiser isn't used.
- **Events.**
  - The Hyperspeed port reads its props through refs, pauses offscreen, renders a still frame under reduced motion, lowers its quality on slow frames, and reports failure to a `FieldBoundary`.
  - A bug found on the GPU: the canvas had no CSS size, so each resize fed the next until the backbuffer reached 33554432px. It's fixed with explicit size classes on the canvas.
  - ScrollStack is ported as a sticky stack without Lenis. Its CSS variables use `var()` fallbacks, so the page's own values win.
  - `/api/events` and `/api/gallery` validate `status` and `limit` with zod, answer 400 or 503, and send a cache header.
- **Gallery.**
  - DomeGallery is a rewritten port. The tiles preload, then fade in.
  - The grid is justified rows of links. `?photo=` opens the viewer and works with history.
  - The viewer's caption now starts at the image's left edge (`w-0 min-w-full` on the figure and the caption).
- **Join.**
  - In the LiquidEther port, the still frame is a seeded 240-step simulation, and the live fluid warm-starts so it never opens as a small blob.
  - `scripts/make-join-posters.mjs` captures that still into `public/join/fluid-1440.webp` and `fluid-390.webp` (run it after a build).
  - The waitlist API rate-limits by IP (30 an hour) and by email (5 an hour), and fails closed. In fixtures mode it accepts sign-ups without storing them.
  - After a successful sign-up, focus moves to the answer's heading, using an effect on `done`; a requestAnimationFrame ran before the commit.
- **About and Partners.**
  - About has the Genesis copy, two photos, the aims, the faculty coordinator and how to find the club. The footer links to it.
  - The faculty coordinator's ProfileCard port gained `cardMaxHeight` and `showDetails`. It also gained a `clip-path`, because Chrome didn't clip the composited avatar to the card's corners.
  - The avatar loads eagerly, because a lazy load never started inside the clip: the unloaded image is 0px tall and sits 1px below the clip edge.
  - The 354px-square photo is cropped by ImageKit to the card's 0.718 shape, so it fills the card.
  - `/partners` 404s until a partner is published. The Partners nav item appears only while one is, and a failed query just hides it.
- **e2e.** The about footer test checks the link's `href` instead of clicking it. Under five parallel WebGL home pages, the client navigation sometimes outlasted the 5s timeout.

Checks: `npm run verify` passes (32 test files, 170 tests, then `client bundles are clean (86 files checked)`). `npx playwright test` reports `36 passed`.

## Day 2 finished and Day 3 (6 to 7 Oct): Team, Home, event pages, certificates, admin

- **Team and profiles (Task 16).**
  - The Board's badges hang on one canvas (the Lanyard fork): one WebGL context, one physics world, a collision group per band.
  - Each face is printed at runtime on a 1024 x 948 atlas. Measured from `card.glb`, the face UVs cover 0.499 by 0.751 of the texture while the mesh face is 0.7164 wide per unit tall, so that atlas size makes each face rect the mesh's own shape and nothing stretches.
  - `card.glb` went from 2.46 MB to 163 KB: `scripts/slim-card-glb.mjs` removes the React Bits demo texture, which was also fetched from a `blob:` URL the CSP refuses.
  - The CSP now allows `'wasm-unsafe-eval'`, for Rapier's WebAssembly.
  - The strap tile is 512 x 96, repeated twice. Repeated four times at 1024 x 96, the print was squashed about 4x along the strap.
  - The HTML badges hang where the live ones rest, from the same formula in CSS container units. One trap: a size container's own `cqw` measures the container above it, so the card's corner radius moved to an inner layer.
  - `stageLayout` places the anchor wherever the rest position needs it (still hidden above the stage), instead of always 1 unit above the top, so badges rest 20px above their labels even when the rope is capped at 1.
  - The core sphere (the InfiniteMenu fork) runs full-bleed. The arrow keys turn it to the next member, and it opens facing the first. The ChromaGrid list is the default on phones, on touch and under reduced motion, and `/team#<division>` opens it filtered.
  - Profiles are `/team/<slug>`, each with its own swaying badge, the fields that exist, and previous and next within the group.
- **Member import.** `scripts/import-members.ts` with `src/lib/validation/member-import.ts`, tested on synthetic rows. It matches seeded rows by first name and role and keeps their slugs, and a later answer from the same email wins. `DATA_FIXTURES=1` rehearses against the fixture roster. A real dry run waits for the dev secret key (A3): the local key is still a placeholder.
- **Home sections (Task 12).** Coming up, the certificate prompt, What we do, Latest photos and Partners, each hidden without data. The photo stagger moved from Tailwind arbitrary variants to CSS, because the even-child reset won over the 3n+2 drop in Tailwind's output order. A caption's `block` class beat `line-clamp`'s `-webkit-box`, so it was removed.
- **Event pages.** `/events/<slug>` has a calm road hero at 70% opacity. Descriptions go through `src/lib/markdown.tsx`, which builds React elements only: no raw HTML, and https or same-site links only.
- **Certificates (Tasks 18 to 20).**
  - Import: the dry run on the owner's folder matches the survey: 321 certificates (293 participation, 28 placed) and 54 contact emails, with 317 numbered copies skipped and 4 certificates with no email.
  - Deviation: placed certificates are typed `winner` (1st) and `runner_up` (2nd and 3rd). The spec counted all 28 as winners.
  - Verify, PDF, find and mine are built as specified. Sending runs in `after()`, so the find route answers just as fast whether or not it sends.
  - `EMAIL_ENABLED=1` turns email on only once the domain is verified. Until then the form says lookup opens soon.
  - Fixtures carry two synthetic certificates (`RC26-TEST000001` and `RC26-TEST000002`) and sign links with a public fixtures-only secret.
- **Light admin (Task 21).** Events, gallery, members, partners, settings and the waitlist with its CSV export. Every page, action, route and data helper calls `requireAdmin()`, and a test shows each action refuses a non-admin before touching the database.
- **Bundle.** zod was in the browser (90 KB) through two forms, which put Join and Certificates over budget (255 and 251 KB). The forms now use a copy of zod's email pattern and a zod-free waitlist check (`src/lib/validation/waitlist-check.ts`, proven to agree with the server schema). First-load JavaScript is now 161 to 207 KB on every public page, and a guardrail keeps zod out of client components.
- **Not done, and why.**
  - Lighthouse wasn't run: it isn't installed, and every page's largest element is server-rendered text.
  - The admin's create, edit and publish flow needs a real Google sign-in, so it's for the owner to check by hand.
  - Production (Task 24) needs the owner awake: its cutover replaces the tables the old live site still uses. `docs/LAUNCH.md` is the runbook.

Checks: `npm run verify` passes (52 test files, 394 tests, then `client bundles are clean (249 files checked)`). `npx playwright test` reports `74 passed`. GPU shots of every page at both sizes were opened and judged.
