# Verification

## Automated checks

```sh
bun install --frozen-lockfile --ignore-scripts
bun test
bun run typecheck
bun run build
bun audit
```

The test suite contains 23 tests covering all three summation implementations,
invalid inputs, exact arithmetic at the safe boundary, price validation and
deduplication, request cancellation, conversion, sorting and filtering, missing
prices, and React output (including the swap form's initial loading state).
The GitHub credential used for submission does not have the `workflow` scope,
so this submission does not add an Actions workflow. Run the commands above locally.

## Browser checks

Checked in Chromium against `bun run dev` at 1440 × 1000 and 375 × 812.
These are browser smoke checks, not part of the Bun unit test suite.
The same checks were repeated after moving problem 2 to React and TypeScript.

- [x] Historical price feed loads and shows the dataset date, not a live-price claim.
- [x] Entering 2.5 ETH gives approximately 4,115.3353 USDC with the supplied dataset.
- [x] During submission, amount, token selectors and reverse/submit controls are disabled.
- [x] Completion says this is a preview and no funds were moved.
- [x] Negative input disables submit and exposes `aria-invalid` with an error message.
- [x] Editing the amount clears the previous success message.
- [x] Reverse swaps the selected token pair and recalculates the quote.
- [x] Selecting the opposite token swaps the pair rather than duplicating it.
- [x] A simulated HTTP 503 shows the retry action and leaves trading controls disabled.
- [x] Retrying after restoring the feed repopulates selectors and enables the form.
- [x] The 375px layout has no horizontal overflow.
- [x] Missing icons hide without blocking the form and recover when a different token is selected.
- [x] A feed without ETH still initializes two distinct tokens and produces a valid quote.
- [x] The restored live-feed page has no JavaScript exceptions or console errors.
- [x] The production build served with `bun run preview` produces the same quote and successful simulated submission.

The screenshots show the valid 1 ETH → USDC quote. Browser failure testing uses
request interception rather than changing application code or shipping mock prices.

## Security scope

Inspected every tracked file in the initial template before installing dependencies.
There were no executable binaries, dependency manifests, package lifecycle scripts,
or tracked hooks/workflows in that template. New dependencies were installed with
`--ignore-scripts`; versions and registry integrity hashes are committed in the lockfile.
`bun audit` reported no known dependency vulnerabilities at verification time.

This is source review and advisory checking, not an antivirus scan or a guarantee
against supply-chain attacks. No credentials, wallet permissions or signing are needed.
