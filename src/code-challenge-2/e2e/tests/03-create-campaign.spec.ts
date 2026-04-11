/**
 * AC: Create Campaign
 *
 * AC-CREATE-1  Form has name, subject, body, recipient fields
 * AC-CREATE-2  Adding recipients via the Add button shows tags
 * AC-CREATE-3  Pressing Enter in recipient input adds the tag
 * AC-CREATE-4  Invalid email in recipient input shows an error
 * AC-CREATE-5  Submitting without recipients shows a validation error
 * AC-CREATE-6  Valid submission creates campaign and redirects to detail page
 * AC-CREATE-7  Newly created campaign has status "draft"
 * AC-CREATE-8  Cancel navigates back to /campaigns
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Create Campaign', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/campaigns/new');
  });

  test('AC-CREATE-1: form has all required fields', async ({ page }) => {
    await expect(page.getByLabel('Campaign Name')).toBeVisible();
    await expect(page.getByLabel('Email Subject')).toBeVisible();
    await expect(page.getByLabel('Email Body')).toBeVisible();
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible();
  });

  test('AC-CREATE-2: adding recipient via Add button shows tag', async ({ page }) => {
    await page.getByPlaceholder('email@example.com').fill('alice@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('.recipient-tag').filter({ hasText: 'alice@test.com' })).toBeVisible();
  });

  test('AC-CREATE-3: pressing Enter in recipient input adds the tag', async ({ page }) => {
    await page.getByPlaceholder('email@example.com').fill('bob@test.com');
    await page.getByPlaceholder('email@example.com').press('Enter');
    await expect(page.locator('.recipient-tag').filter({ hasText: 'bob@test.com' })).toBeVisible();
  });

  test('AC-CREATE-4: invalid email in recipient input shows error', async ({ page }) => {
    await page.getByPlaceholder('email@example.com').fill('not-an-email');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('AC-CREATE-5: submitting without recipients shows validation error', async ({ page }) => {
    await page.getByLabel('Campaign Name').fill('Test');
    await page.getByLabel('Email Subject').fill('Subject');
    await page.getByLabel('Email Body').fill('Body');
    await page.getByRole('button', { name: 'Create Campaign' }).click();
    await expect(page.getByText(/at least one recipient/i)).toBeVisible();
  });

  test('AC-CREATE-6: valid submission creates campaign and redirects to detail', async ({ page }) => {
    await page.getByLabel('Campaign Name').fill('E2E Test Campaign');
    await page.getByLabel('Email Subject').fill('E2E Subject');
    await page.getByLabel('Email Body').fill('E2E body content');
    await page.getByPlaceholder('email@example.com').fill('e2e@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Create Campaign' }).click();

    await expect(page).toHaveURL(/\/campaigns\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'E2E Test Campaign' })).toBeVisible();
  });

  test('AC-CREATE-7: newly created campaign has status draft', async ({ page }) => {
    await page.getByLabel('Campaign Name').fill('Draft Check Campaign');
    await page.getByLabel('Email Subject').fill('Draft Subject');
    await page.getByLabel('Email Body').fill('Draft body');
    await page.getByPlaceholder('email@example.com').fill('draft@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Create Campaign' }).click();

    await expect(page).toHaveURL(/\/campaigns\/[a-z0-9-]+$/);
    await expect(page.locator('.badge-draft')).toBeVisible();
  });

  test('AC-CREATE-8: Cancel navigates back to /campaigns', async ({ page }) => {
    await page.getByRole('link', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/campaigns$/);
  });

});
