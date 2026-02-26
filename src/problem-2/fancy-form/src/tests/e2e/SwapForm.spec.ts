import { test, expect, type Page } from "@playwright/test";

// ── helpers ───────────────────────────────────────────────────────────────────
async function waitForAppReady(page: Page) {
  await expect(page.getByText("Loading markets…")).not.toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: /Swap Now/i })).toBeVisible();
}

/**
 * Tìm combobox theo text token hiện tại đang hiển thị.
 * Dùng filter({ hasText }) thay vì locator("..") để tránh strict mode violation.
 */
function fromCombobox(page: Page) {
  return page.getByRole("combobox").filter({ hasText: /ETH|BTC|USDC|SWTH|WBTC/ }).first();
}

/**
 * Mở popover token selector và chọn token theo symbol.
 * shadcn CommandItem dùng [cmdk-item] không phải role="option",
 * nên dùng getByText kết hợp filter.
 */
async function selectTokenInPopover(page: Page, symbol: string) {
  const searchInput = page.getByPlaceholder("Search token…");
  await searchInput.fill(symbol);
  // CommandItem render với data-value attribute và text content
  await page.locator(`[cmdk-item][data-value="${symbol}"]`).click();
}

// ── tests ─────────────────────────────────────────────────────────────────────
test.describe("SwapForm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
  });

  // ── Loading & initial state ────────────────────────────────────────────────
  test("renders Swap heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Swap" })).toBeVisible();
  });

  test("shows ETH as default fromToken", async ({ page }) => {
    // Filter combobox cụ thể theo text ETH
    await expect(page.getByRole("combobox").filter({ hasText: "ETH" })).toBeVisible();
  });

  test("shows USDC as default toToken", async ({ page }) => {
    await expect(page.getByRole("combobox").filter({ hasText: "USDC" })).toBeVisible();
  });

  test("shows Live rates badge", async ({ page }) => {
    await expect(page.getByText("Live rates")).toBeVisible();
  });

  // ── Amount input ───────────────────────────────────────────────────────────
  test("typing in 'You Pay' auto-fills 'You Receive'", async ({ page }) => {
    const inputs = page.getByRole("spinbutton");
    const fromInput = inputs.first();
    const toInput = inputs.last();
    await fromInput.fill("1");
    // Đợi toInput được fill
    await expect(toInput).not.toHaveValue("");
    const toValue = await toInput.inputValue();
    expect(parseFloat(toValue)).toBeGreaterThan(0);
  });

  test("typing in 'You Receive' auto-fills 'You Pay'", async ({ page }) => {
    const inputs = page.getByRole("spinbutton");
    const fromInput = inputs.first();
    const toInput = inputs.last();
    await toInput.fill("2000");
    await expect(fromInput).not.toHaveValue("");
    const fromValue = await fromInput.inputValue();
    expect(parseFloat(fromValue)).toBeGreaterThan(0);
  });

  test("shows USD equivalent below 'You Pay'", async ({ page }) => {
    const fromInput = page.getByRole("spinbutton").first();
    await fromInput.fill("1");
    await expect(page.getByText(/≈ \$.*USD/).first()).toBeVisible();
  });

  // ── Rate display ───────────────────────────────────────────────────────────
  test("displays exchange rate row", async ({ page }) => {
    await expect(page.getByText(/1 ETH = .* USDC/)).toBeVisible();
  });

  // ── Token selector ─────────────────────────────────────────────────────────
  test("opens token search popover on trigger click", async ({ page }) => {
    await page.getByRole("combobox").first().click();
    await expect(page.getByPlaceholder("Search token…")).toBeVisible();
  });

  test("filters tokens by search query", async ({ page }) => {
    await page.getByRole("combobox").first().click();
    await page.getByPlaceholder("Search token…").fill("BTC");
    // Chờ filtered results xuất hiện
    await expect(page.locator("[cmdk-item]").filter({ hasText: "BTC" }).first()).toBeVisible();
  });

  test("selecting a token updates the trigger label", async ({ page }) => {
    const firstCombobox = page.getByRole("combobox").first();
    await firstCombobox.click();
    await selectTokenInPopover(page, "BTC");
    await expect(firstCombobox).toContainText("BTC");
  });

  // ── Flip tokens ────────────────────────────────────────────────────────────
  test("flip button swaps token labels", async ({ page }) => {
    // Lấy text hiện tại trước khi flip
    const fromCombo = page.getByRole("combobox").first();
    const toCombo = page.getByRole("combobox").last();
    const fromBefore = await fromCombo.textContent();
    const toBefore = await toCombo.textContent();

    // Click flip button – button có ArrowDown icon nằm giữa 2 separator
    await page.getByTestId("flip-button").click();

    await expect(fromCombo).toContainText(toBefore?.trim().slice(0, 4) ?? "");
    await expect(toCombo).toContainText(fromBefore?.trim().slice(0, 4) ?? "");
  });

  // ── Validation errors ──────────────────────────────────────────────────────
  test("shows error when submitting with no amount", async ({ page }) => {
    await page.getByRole("button", { name: /Swap Now/i }).click();
    await expect(page.getByText("Enter a valid amount")).toBeVisible();
  });

  test("shows error when same token selected for both sides", async ({ page }) => {
    const toCombo = page.getByRole("combobox").last();
    await toCombo.click();
    await selectTokenInPopover(page, "ETH");

    const fromInput = page.getByRole("spinbutton").first();
    await fromInput.fill("1");
    await page.getByRole("button", { name: /Swap Now/i }).click();
    await expect(page.getByText("Select different tokens")).toBeVisible();
  });

  test("error disappears when user starts typing again", async ({ page }) => {
    await page.getByRole("button", { name: /Swap Now/i }).click();
    await expect(page.getByText("Enter a valid amount")).toBeVisible();

    const fromInput = page.getByRole("spinbutton").first();
    await fromInput.fill("1");
    await expect(page.getByText("Enter a valid amount")).not.toBeVisible();
  });

  // ── Successful swap ────────────────────────────────────────────────────────
  test("shows swapping state then success message", async ({ page }) => {
    const fromInput = page.getByRole("spinbutton").first();
    await fromInput.fill("1");
    await page.getByRole("button", { name: /Swap Now/i }).click();

    await expect(page.getByText("Swapping…")).toBeVisible();
    await expect(page.getByText("Swap confirmed successfully!")).toBeVisible({ timeout: 5_000 });
  });

  test("clears amounts after successful swap", async ({ page }) => {
    const inputs = page.getByRole("spinbutton");
    const fromInput = inputs.first();
    const toInput = inputs.last();
    await fromInput.fill("1");
    await page.getByRole("button", { name: /Swap Now/i }).click();
    await expect(page.getByText("Swap confirmed successfully!")).toBeVisible({ timeout: 5_000 });

    await expect(fromInput).toHaveValue("");
    await expect(toInput).toHaveValue("");
  });

  test("Swap Now button is disabled while swapping", async ({ page }) => {
    const fromInput = page.getByRole("spinbutton").first();
    await fromInput.fill("1");
    await page.getByRole("button", { name: /Swap Now/i }).click();
    await expect(page.getByRole("button", { name: /Swapping/i })).toBeDisabled();
  });
});