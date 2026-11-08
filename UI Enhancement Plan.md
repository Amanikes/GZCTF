I'll investigate the specific components behind each gap so the plan cites real paths and concrete changes.

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && ls -1 components/charts/ && echo "=== GanttTimeline ===" && cat components/charts/GanttTimeline.tsx

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== GameCard ===" && cat components/GameCard.tsx

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== ScoreboardTable head ===" && sed -n '1,80p' components/ScoreboardTable.tsx; echo "=== chart imports ==="; grep -rn 'ScoreTimeLine\|EchartsContainer\|TeamRadarMap' --include='*.tsx' . | grep -v 'charts/'

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== ScoreTimeLine ===" && cat components/charts/ScoreTimeLine.tsx && echo "=== EchartsContainer ===" && cat components/charts/EchartsContainer.tsx

Read tool output
Completed with input: {
  "path": "/tmp/1794168179513-copilot-tool-output-170422-ce0c5bdf-ee1e-4577-8142-a6b6867e6329.txt",
  "view_range": [
    1,
    150
  ]
}

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && cat styles/components/GanttTimeline.module.css

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && sed -n '150,260p' /tmp/1794168179513-copilot-tool-output-170422-ce0c5bdf-ee1e-4577-8142-a6b6867e6329.txt

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== Scoreboard page ===" && cat 'pages/games/[id]/Scoreboard.tsx' && echo "=== Empty ===" && cat components/Empty.tsx

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== settings keys ==="; grep -n 'GZCTF\|::CTF' ../src/locales/en-US/admin.json; echo "=== ScoreboardTable empty handling ==="; grep -n 'Empty\|items.length\|!scoreboard\|no_data' components/ScoreboardTable.tsx | head -20; echo "=== mobile components ==="; ls -1 components/mobile/

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== AppHeader responsive ==="; sed -n '44,52p' components/AppHeader.tsx; echo "=== Watermark ==="; sed -n '1,40p' components/Watermark.tsx; echo "=== ThemeOverride components block start ==="; grep -n 'components: {' -A 6 utils/ThemeOverride.ts | head -12

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && grep -n 'primaryShade\|defaultRadius\|radius:' utils/ThemeOverride.ts; echo "=== AdminPage ==="; sed -n '1,60p' components/admin/AdminPage.tsx

Ran terminal command: cd /home/tho/GZCTF/src/GZCTF/ClientApp/src && echo "=== admin tabs nav (Settings page) ==="; sed -n '1,60p' pages/admin/Settings.tsx | head -40; echo "=== IconHeader ==="; sed -n '1,40p' components/IconHeader.tsx

I inspected every component behind the gaps. Here is the plan.

# UI Enhancement Plan — AxumSec CTF

## 1. Objective

Raise the platform's visual quality and usability to match the AxumSec design language, and fix three concrete rendering defects found in the audit. Scope is **frontend only** — no schema, no API contract, and no new runtime dependency changes except (optionally) trimming unused webfonts.

Success means: charts render correctly, cards look intentional at all data volumes, the design system has reusable primitives (eyebrow, gradient heading, empty state, chart palette), and the UI is semantically accessible.

---

## 2. Current State Analysis

Verified against the running app and source.

| Area | Current implementation | Verified defect |
|---|---|---|
| Games timeline | `GanttTimeline.tsx` — hand-rolled absolute-positioned Gantt, `VIEW_WIDTH = 40*7*7`, `VIEW_HEIGHT = 300`, `STICKY_WIDTH = 240` | Label state machine compares `scrollPos = scrollX + 10` against `left`/`right` which are timeline coordinates plus `STICKY_WIDTH` — mixed coordinate spaces, so labels paint over bars. `.view` has `padding-bottom: 96px` dead space. `.dataRect { &::hover }` is an invalid pseudo-element selector (dead CSS). |
| Scoreboard chart | `ScoreTimeLine.tsx` — ECharts, `height: 460px`, `grid: { top: 50, left: 70, right: 40, bottom: 110 }` | Vertical `dataZoom` slider at `right: 10, width: 20` sits inside the grid → grey bar over the plot. `yAxis.max` formula returns `0` when data max is `0` → collapsed axis with one team. Placeholder series with `data: []` is first in the array, polluting legend/colour assignment. No empty state. |
| Game cards | `GameCard.tsx` — `BackgroundImage h="12rem"` with a 4rem flag glyph when no poster | Fixed-height, mostly-empty media band; cards are tall with sparse content and blank `summary` (`lineClamp={3}`). |
| Primary shade | `ThemeOverride.ts` — no `primaryShade` | Mantine defaults to `{ light: 6, dark: 8 }`, so dark-mode filled controls use `brand[8] = #991B1B` (maroon) instead of `#DC2626`. |
| Type system | No eyebrow/label token, no gradient heading utility (only `LogoHeader.module.css` has one) | Flat heading hierarchy; axumsec uses 700–800 headings + tracked uppercase eyebrows. |
| Charts theming | `EchartsContainer` uses library defaults | No `color` array → ECharts palette (green/blue) clashes with red/slate. |
| Empty states | `Empty.tsx` exists, used in `ChallengePanel.tsx` | `ScoreboardTable.tsx` has no empty branch; renders headers only. |
| Semantics | `LogoHeader.tsx` uses `Title` (→ `h1`); pages also render `h1` | Two `h1` per page on 14/15 routes. `IconHeader` uses `Title order={3}` for the slogan. |
| Form labels | `ScoreboardTable` uses `Select`/`TextInput` with `placeholder` only | 3 inputs / 0 labels measured on scoreboard. |
| Admin responsive | `AdminPage.tsx` → `WithNavBar minWidth={1080}` | Below 1080px users get “Not wide enough / Try to use a wider device” with no route back. Deliberate guard, but a dead end. |
| Copy | `admin.content.settings.platform.name.description` = “Platform name will be displayed with ::CTF”; logo placeholder = “Use GZCTF Icon” | Stale brand text. |
| Watermark | `Watermark.tsx` repeats SVG text | Not `aria-hidden`; screen readers encounter it. |

**Baseline that must not regress:** contrast passes (body 17:1, dimmed 6.96:1 dark / 7.24:1 light), keyboard focus is visible (1.875px outline), no horizontal overflow at 390px, fonts load as `Geist`.

**Testing baseline:** there is no frontend test runner (`package.json` scripts are `dev/lint/check/build/preview/prettier/genapi`). Validation is `pnpm check` + `oxlint` + `prettier` + `pnpm build` + browser verification. Adding Playwright is proposed as optional, not assumed.

---

## 3. Proposed Solution

Five layers, in dependency order:

1. **Design tokens & component overrides** — lock the visual language centrally (`primaryShade`, button/badge geometry, radius, chart palette, typography utilities) so downstream work inherits it.
2. **Defect repairs** — fix the two broken visualizations and the card layout.
3. **Reusable UI primitives** — `EmptyState`, `PageHeader` (eyebrow + gradient title), `ChartCard`.
4. **Semantics & accessibility** — heading hierarchy, labelled controls, `aria-hidden` decoration.
5. **Polish** — admin small-screen fallback, copy corrections, webfont trim.

**Design decisions and rationale**

- Set `primaryShade: { light: 6, dark: 6 }` rather than the default `dark: 8`. White on `#DC2626` measures **4.83:1** (AA for normal text) and matches axumsec's CTA exactly; `#991B1B` is measurably darker than the reference.
- Keep **red reserved for brand + danger**; move status hues to a navy/teal/amber triad so red stops competing with “ongoing/ended” badges. Red on dark surfaces stays `brand[4] = #F87171` (6.45:1) for text/links.
- Fix the Gantt by bringing both operands into one coordinate space and pinning labels to the gutter. Rejected alternative: replacing it with ECharts — too much churn for a 3-row dataset and it would lose the existing sticky-title interaction.
- Fix the scoreboard by moving the vertical `dataZoom` outside the grid and giving the y-axis a non-zero floor. Rejected alternative: removing `dataZoom` — regresses long games (>14 days) where zoom is genuinely useful.
- Keep GameCard a poster-first card but let content drive height and replace the empty media band with a deterministic gradient + category-neutral mark.

---

## 4. Files and Components Affected

**Modify**

| File | Responsibility |
|---|---|
| `utils/ThemeOverride.ts` | `primaryShade`, Button/Badge/Paper overrides, chart palette export |
| `styles/App.css` | typography utilities (`.eyebrow`, `.gradient-title`) or a new `styles/shared/Typography.module.css` |
| `components/charts/GanttTimeline.tsx` | coordinate-space fix, dynamic height, row density |
| `styles/components/GanttTimeline.module.css` | remove dead `&::hover`, drop `padding-bottom: 96px`, tighten label truncation |
| `components/charts/ScoreTimeLine.tsx` | grid insets, y-axis floor, series ordering, empty state, `color` array |
| `components/charts/EchartsContainer.tsx` | shared theme/palette defaults |
| `components/GameCard.tsx` | responsive media band, content-driven height, poster fallback |
| `components/ScoreboardTable.tsx` | empty-state branch, `aria-label`/`Input.Wrapper` on filter controls |
| `components/LogoHeader.tsx` | wordmark → non-`h1` (`Title order={2}` or `div` with accessible name) |
| `components/IconHeader.tsx` | slogan → `Text`, not `Title` |
| `components/Watermark.tsx` | `aria-hidden` on decorative SVG |
| `components/WithWiderScreen.tsx` | actionable fallback (link home, min-width hint) |
| `components/WithNavbar.tsx` | surface header on desktop content pages (optional, P4) |
| `locales/*/admin.json` | settings copy (11 locales) |
| `vite.config.mts` | trim webfont families (optional, P5) |

**Create**

| File | Responsibility |
|---|---|
| `components/EmptyState.tsx` | or extend `Empty.tsx` with `title` + `action` slot |
| `components/PageHeader.tsx` | eyebrow + gradient title + optional actions |
| `components/charts/chartTheme.ts` | single source for axis/grid/palette colours used by all charts |

**Untouched by design:** `hooks/useConfig.ts` and `components/Copyright.tsx` (`LicenseRef-GZCTF-Restricted`), backend, database.

---

## 5. Implementation Phases

### Phase 0 — Design foundations (blocks everything)
*Goal:* one place defines the visual language.

- Add `primaryShade: { light: 6, dark: 6 }` to `CustomTheme`.
- Add `Button.extend({ defaultProps: { radius: 'sm' } })` (8px) and `fontWeight: 500` to match axumsec; keep filled/hover/active shades on `brand`.
- Export `ChartPalette` (brand + slate + semantic) and wire it into `EchartsContainer` as the default `color`.
- Add `styles/shared/Typography.module.css` with `.eyebrow` (12–14px, 600, `letter-spacing: .35px`, uppercase) and `.gradientTitle` (`linear-gradient(to right, gray-0 → gray-4)` with `background-clip: text`).
- *Depends on:* nothing. *Outcome:* theme-level change; every screen picks up the crimson CTA.

### Phase 1 — Repair the games timeline (H1)
- Reconcile coordinates: compute the label state from `scrollPosition.x + STICKY_WIDTH + EDGE_PADDING` versus `left`/`right`, or subtract `STICKY_WIDTH` from `left`/`right` before comparing.
- Pin labels to the sticky gutter when the segment is under the column; hide when fully scrolled past.
- Derive container height from `items.length` (`68 + n*33 + 16`) instead of the fixed `300`/`padding-bottom: 96px`.
- Add an `EmptyState` when `items.length === 0`.
- Remove the dead `&::hover` block, or convert to `@mixin hover`.
- *Depends on:* Phase 0 (palette, radius). *Outcome:* labels never overlap bars; no blank bands for small datasets.

### Phase 2 — Repair the scoreboard chart (H2)
- Move the vertical `dataZoom` outside the plot (e.g. `right: -30` or drop it for short games) and raise `grid.right`.
- Give `yAxis` a floor: `max: (v) => Math.max(1000, (Math.floor(v.max/1000)+1)*1000)`.
- Drop the empty placeholder series; attach the “now” marker as a `markLine` on the first real series (or `graphic`) so legend/colours stay clean.
- Reserve space for `toolbox` and `legend` (avoid `top: 420` colliding with a 460px canvas); consider flex height instead of fixed 460.
- Render `EmptyState` when no accepted teams.
- *Depends on:* Phase 0. *Outcome:* chart is legible with 0, 1, and many teams.

### Phase 3 — Game cards (H3)
- Replace the fixed `h="12rem"` band with a responsive aspect ratio; when no poster, render a subtle brand gradient + muted mark instead of a floating 4rem glyph.
- Let content set height; keep `lineClamp` for title/summary but collapse the summary row when empty.
- Make status badges use the semantic triad (ongoing = teal, coming = amber, ended = slate) and keep red for brand only.
- Verify grid density at 1/3/6/12 games.
- *Depends on:* Phase 0. *Outcome:* cards look intentional at any count.

### Phase 4 — Shared primitives and semantics
- `EmptyState` / `PageHeader` adopted on games, scoreboard, admin tables.
- `aria-label` or `Input.Wrapper` on filter inputs in `ScoreboardTable`, `admin/Users`, `admin/Teams`, `admin/Games` (target: inputs ≤ labels).
- Wordmark → `h2`/`div`; slogan → `Text`; one `h1` per page.
- `aria-hidden` on `Watermark`.
- *Depends on:* Phases 1–3 (so they consume the primitives). *Outcome:* `h1Count === 1` and labelled controls verified per route.

### Phase 5 — Polish
- `WithWiderScreen` fallback gains “Back to home” + a minimum-width hint.
- Optional: show the translucent `AppHeader` on desktop content pages.
- Fix `admin.content.settings.platform.name.description` and the logo placeholder in all 11 locales.
- Trim the webfont list to Geist + Geist Mono if no surface still needs Lexend/JetBrains.
- *Depends on:* Phase 0. *Outcome:* no stale copy; smaller font payload.

---

## 6. Testing Strategy

Frontend has no test runner, so validation is:

1. **Static:** `pnpm check` (`tsc --strict`), `pnpm exec oxlint`, `pnpm exec prettier --check`, `pnpm build`.
2. **Browser regression matrix** (Playwright or manual, viewports 390 / 1024 / 1440):

| Route | Assert |
|---|---|
| `/games` | 0/1/3/12 games → no label/bar overlap, no blank band, no h-scroll |
| `/games/{id}/scoreboard` | 0 teams, 1 team, many teams → axis not collapsed, no slider over plot, empty state at 0 |
| `/` | card grid 1/3/6 → uniform, no orphan empty space |
| `/account/login`, `/profile`, 4 admin pages | `h1Count === 1`; inputs ≤ labels |
| All above at 390px | `scrollWidth - clientWidth === 0` |
| Any page | `--mantine-primary-color-filled` = `#DC2626` in dark and light |

3. **Contrast spot-checks** (re-run the earlier script): white-on-brand ≥ 4.5:1, dimmed text ≥ 4.5:1 both schemes, status badges vs card background.
4. **Keyboard:** Tab through each page; focus ring visible on every interactive element.
5. **Cache-sensitive check:** the scoreboard payload shape is unchanged, but if any DTO field is added, flush the scoreboard cache (`Edit → Flush Scoreboard`) — noted for future work, not needed here.

---

## 7. Risks and Considerations

| Risk | Mitigation |
|---|---|
| Gantt coordinate math is fragile; a wrong sign silently re-breaks labels | Extract the state derivation into a pure function with explicit viewport vs timeline variables; verify at 3 scroll offsets |
| Changing `primaryShade` to `6` dark affects every filled control and selected tab — some may become too bright on dark cards | Inventory `variant="filled"` usages first; check tabs, pagination, progress, switch tracks |
| `defaultRadius: 'sm'` on Button changes many screens | Restrict via `Button.extend` rather than global radius |
| ECharts palette change affects radar chart in `ScoreboardItemModal` and `MemberContributionPie` | Add palette to `EchartsContainer` defaults and verify all four chart components |
| Trimming webfonts could cause FOUT or unexpected fallback in CJK locales | Keep Lexend in the stack as fallback; verify zh-CN/ja-JP rendering before removing |
| Touching `useConfig.ts`/`Copyright.tsx` is prohibited (Restricted License) | Plan excludes them; footer copyright stays as-is unless authorized |
| Admin `minWidth` guard is intentional | Change only the *message*, not the guard |

---

## 8. Execution Checklist

**Phase 0**
- [ ] Add `primaryShade: { light: 6, dark: 6 }`
- [ ] Button radius/weight overrides
- [ ] `components/charts/chartTheme.ts` + `EchartsContainer` default `color`
- [ ] `Typography.module.css` with `.eyebrow` / `.gradientTitle`

**Phase 1 — Gantt**
- [ ] Unify label state coordinate space
- [ ] Pin/hide labels under the sticky column
- [ ] Dynamic height; remove `padding-bottom: 96px`
- [ ] Fix or delete `&::hover`
- [ ] Empty state

**Phase 2 — Scoreboard chart**
- [ ] Move vertical `dataZoom` out of the grid
- [ ] Non-zero `yAxis` floor
- [ ] Remove placeholder series; relocate “now” marker
- [ ] Space `toolbox`/`legend`
- [ ] Empty state

**Phase 3 — Cards**
- [ ] Responsive media band with poster fallback
- [ ] Content-driven height; collapse empty summary
- [ ] Status badge triad

**Phase 4 — Primitives & a11y**
- [ ] `EmptyState` / `PageHeader` adopted
- [ ] Labels on filter inputs
- [ ] One `h1` per page; slogan demoted
- [ ] `aria-hidden` watermark

**Phase 5 — Polish**
- [ ] `WithWiderScreen` actionable fallback
- [ ] Settings copy in 11 locales
- [ ] Optional webfont trim
- [ ] Optional desktop header

---

## 9. Definition of Done

- `pnpm check`, `oxlint`, `prettier --check`, `pnpm build` all pass with no new warnings.
- `/games`: labels never overlap bars; no blank bands at 1–3 games; no horizontal scroll at 390px.
- `/games/{id}/scoreboard`: renders correctly with 0, 1, and 10+ teams; axis not collapsed; no control overlaps the plot.
- Game card grid is visually uniform at 1, 3, 6, 12 games.
- `h1Count === 1` on all audited routes; inputs ≤ labels on filter forms.
- `--mantine-primary-color-filled` is `#DC2626` in both colour schemes.
- Contrast checks still pass (no regressions from the audit baseline).
- No changes to backend, database, or Restricted-License files.

---

## 10. Open Questions

1. **Status colours** — approve moving “ongoing/ended/coming” off red/green/blue onto a teal/amber/slate triad? This is the one change that alters meaning-laden colour, so I'd rather not decide unilaterally.
2. **Button geometry** — strict axumsec fidelity (8px radius, 500 weight) or keep Mantine's 10px/600 for consistency with inputs and tabs?
3. **Desktop header** — add the translucent blurred header (matching axumsec) to desktop content pages, or preserve the current icon-rail-only layout?
4. **Gantt investment** — fix in place (plan assumes this), or replace with an ECharts timeline later?
5. **Fonts** — is Lexend still wanted anywhere, or is Geist-only acceptable?
6. **Batching** — ship Phases 0–2 as one change set (highest impact, moderate review surface), then 3–5 separately?