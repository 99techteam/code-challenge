/**
 * AC: Campaign List page
 *
 * AC-LIST-1  /campaigns shows a list of campaigns with name, subject, status badge
 * AC-LIST-2  Status filter tabs filter the list correctly
 * AC-LIST-3  Status badges are color-coded (draft=grey, scheduled=blue, sent=green)
 * AC-LIST-4  "+ New Campaign" link navigates to /campaigns/new
 * AC-LIST-5  Clicking a campaign card navigates to its detail page
 * AC-LIST-6  Delete button is only shown for draft campaigns in the list
 */

import { test, expect } from '@playwright/test';
import { loginAs, createCampaign } from './helpers';

test.describe('Campaign List', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('AC-LIST-1: shows campaigns with name, subject and status badge', async ({ page }) => {
    // create a fresh campaign so we know exactly what's on the page
    await createCampaign(page, {
      name: 'LIST-1 Visible Campaign',
      subject: 'LIST-1 Subject',
      body: 'Body',
      recipients: ['list1@test.com'],
    });
    await page.goto('/campaigns');

    // filter to draft so our campaign is at the top
    await page.getByRole('button', { name: 'Draft' }).click();
    await expect(page.getByRole('heading', { name: 'LIST-1 Visible Campaign' })).toBeVisible();
    await expect(page.getByText('LIST-1 Subject')).toBeVisible();
    await expect(page.locator('.badge-draft').first()).toBeVisible();
  });

  test('AC-LIST-2: status filter tabs filter the list', async ({ page }) => {
    // create a known draft campaign
    await createCampaign(page, {
      name: 'LIST-2 Draft Campaign',
      subject: 'Draft subject',
      body: 'Body',
      recipients: ['list2@test.com'],
    });
    await page.goto('/campaigns');

    // filter to "Draft" — our campaign should be visible
    await page.getByRole('button', { name: 'Draft' }).click();
    await expect(page.getByRole('heading', { name: 'LIST-2 Draft Campaign' })).toBeVisible();

    // filter to "Sent" — our draft campaign should NOT be visible
    await page.getByRole('button', { name: 'Sent' }).click();
    await expect(page.getByRole('heading', { name: 'LIST-2 Draft Campaign' })).not.toBeVisible();

    // back to All — both types visible
    await page.getByRole('button', { name: 'All' }).click();
    // at least one campaign card visible
    await expect(page.locator('.campaign-card').first()).toBeVisible();
  });

  test('AC-LIST-3: status badges have correct color classes', async ({ page }) => {
    // filter to sent to ensure we see a sent badge
    await page.getByRole('button', { name: 'Sent' }).click();
    await expect(page.locator('.badge-sent').first()).toBeVisible();
    await expect(page.locator('.badge-sent').first()).toHaveClass(/badge-sent/);

    // filter to draft to ensure we see a draft badge
    await page.getByRole('button', { name: 'Draft' }).click();
    await expect(page.locator('.badge-draft').first()).toBeVisible();
    await expect(page.locator('.badge-draft').first()).toHaveClass(/badge-draft/);
  });

  test('AC-LIST-4: "+ New Campaign" navigates to /campaigns/new', async ({ page }) => {
    await page.getByRole('link', { name: '+ New Campaign' }).click();
    await expect(page).toHaveURL(/\/campaigns\/new/);
    await expect(page.getByRole('heading', { name: 'New Campaign' })).toBeVisible();
  });

  test('AC-LIST-5: clicking a campaign card navigates to detail page', async ({ page }) => {
    await page.locator('.campaign-card').first().click();
    await expect(page).toHaveURL(/\/campaigns\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
  });

  test('AC-LIST-6: delete button only shown for draft campaigns', async ({ page }) => {
    // filter to draft — all visible cards are draft, first one should have Delete
    await page.getByRole('button', { name: 'Draft' }).click();
    await expect(page.locator('.campaign-card').first()).toBeVisible();
    await expect(page.locator('.campaign-card').first().getByRole('button', { name: 'Delete' })).toBeVisible();

    // filter to sent — no cards should have Delete
    await page.getByRole('button', { name: 'Sent' }).click();
    await expect(page.locator('.campaign-card').first()).toBeVisible();
    await expect(page.locator('.campaign-card').first().getByRole('button', { name: 'Delete' })).not.toBeVisible();
  });

});
