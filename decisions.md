# MDMS Phase 1 decisions

## Branch and teammate work

The fork and upstream `main` matched at `ebe7d57` when I started. I based `feature/auth-utility-zone-admin` on the upstream enterprise feature commit `6ede318` because it already provided React Router, Recharts, a shared sidebar and header, and the team's larger JSON Server fixture. This gives the new screens the same navigation and data as the enterprise pages. The branch therefore includes that enterprise commit in its history. The old enterprise URLs redirect to their `/enterprise` equivalents, so existing bookmarks still work.

## Shared fields and form validation

`src/shared/components/forms/Fields.tsx` exports Input, Select, Toggle, and PasswordInput. Each form supplies its own rules and passes an error message to the field. The fields handle the label, hint, and error markup consistently. `useId` gives screen readers a reliable link between the input and its message, even when a page renders multiple copies of a field. Password visibility and checkbox state stay in the browser.

In a controlled field, React state tracks the value as the user types. Login and reset use this pattern so a shown error can update as the user corrects it. Meter and settings forms read all the fields together with `FormData` when the user submits. This keeps each form short and avoids state updates on every edit where live validation adds little. The reset rule requires at least eight characters, including a letter and a number. The three demo-role links are available directly from login. Sign-in, resend, and reset use local React state, so they work without waiting for a network request.

## Routing and feedback

`src/app/routes.tsx` holds the route paths. React Router nests the Zone, Enterprise, and End-user entries under the same layout. Each role gets its links from one menu configuration. Page code loads when needed, and a shared skeleton is shown while the route or its data is loading. A route error element shows 404 for a missing record and 500 for an unexpected request failure. The unknown URL, maintenance, and access-denied screens can also be opened directly.

## How zone data gets to a screen

`zoneService.ts` contains the typed Axios GET requests. `zoneLoaders.ts` reads the URL and asks those services for the data a page needs. The page reads the result with `useLoaderData`. For example, the meter page reads the search, status, and page number from the URL and sends them to JSON Server along with the demo zone ID. JSON Server returns up to eight rows and the matching row count. Bookmarking or going back to a filtered page restores its query. The router passes an abort signal to Axios so a slow request can be cancelled when the user navigates away.

All Zone Admin screens use zone ID 1, North Zone in the included fixture. Every list and details lookup includes that ID. In a later phase, the authenticated user's zone would supply this value. The customer view fetches meters for the customers on the current page and for the selected customer. Reports fetch only readings for the chosen zone, dates, and meter. A JavaScript Map groups readings by date or meter in one pass per summary. The dashboard compares average daily usage in the latest sample month with the average across available sample days. It uses the last seven or thirty sample days for the chart.

The zone screens share a typed data table, page headings, badges, and stat cards. Tables keep their row-specific rendering in the feature page. Recharts draws the trend charts using the same library as the enterprise screens.

## Demo data and GET-only behavior

The original enterprise fixture had meter owner names without a customer ID and some alerts linked to a different zone than their meter. `scripts/add-zone-demo-data.mjs` now gives every meter an owner in its own zone, adds a sample admin where needed, supplies at least 12 customers with meters per zone, and derives the cumulative reading history from each meter's latest reading. It also adds per-zone thresholds and channel preferences. Existing collection names and record IDs are kept. The End-user starter still reads `dailyData`, `weeklyData`, and `monthlyData`, so the generator includes the original starter samples.

The standard server command starts JSON Server in read-only mode. Zone forms show validation results, and meter status actions show previews. The enterprise pages use the same Axios instance for GET requests, with the inherited write actions removed or converted to previews. The shared login has no account lookup or email integration. The original billing fixture still needs full billing histories and hourly data for the broader team demo.

## Run locally

1. Run `npm ci` from the repository root.
2. Run `npm run server` in one terminal and `npm run dev` in a second.
3. Open the Vite URL and choose **Zone admin** from the login page. Use **Forgot password?** to walk through a demo reset.
4. Run `npm run build` and `npm run lint` to check the project.

