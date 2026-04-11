/**
 * AC: UX States (loading, errors, empty states)
 *
 * AC-UX-1   Login page shows demo credentials hint
 * AC-UX-2   Empty campaign list shows an empty state with CTA
 * AC-UX-3   API errors on login are shown meaningfully (not a blank screen)
 * AC-UX-4   Scheduled badge is blue, sent badge is green, draft badge is grey
 * AC-UX-5   Removing a recipient tag works
 * AC-UX-6   Duplicate recipient email is rejected with an error
 */

import { test, expect } from '@playwright/test';
import { loginAs, createCampaign, futureDatetimeLocal } from './helpers';

test.describe('UX States', () => {

  test('AC-UX-1: login page shows demo credentials hint', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Demo credentials:')).toBeVisible();
    await expect(page.getByText(/demo@example\.com/)).toBeVisible();
  });

  test('AC-UX-2: filtering to a status with no campaigns shows empty state', async ({ page }) => {
    await loginAs(page);
    // "Sending" should have no campaigns in seed data
    await page.getByRole('button', { name: 'Sending' }).click();
    await expect(page.getByText(/No campaigns yet/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Create your first campaign/i })).toBeVisible();
  });

  test('AC-UX-3: invalid login shows error message not a blank screen', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('nobody@nowhere.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // error alert visible
    await expect(page.locator('.alert-error')).toBeVisible();
    // page title still visible (not blank)
    await expect(page.getByRole('heading', { name: 'Campaign Manager' })).toBeVisible();
  });

  test('AC-UX-4: badge CSS classes match status colors', async ({ page }) => {
    await loginAs(page);

    // sent = green class
    await expect(page.locator('.badge-sent').first()).toBeVisible();
    // draft = grey class
    await expect(page.locator('.badge-draft').first()).toBeVisible();

    // create and schedule a campaign to get a scheduled badge
    const url = await createCampaign(page, {
      name: 'UX-4 Scheduled Badge',
      subject: 'Badge test',
      body: 'Body',
      recipients: ['badge@test.com'],
    });
    await page.goto(url);
    await page.getByRole('button', { name: 'Schedule' }).click();
    await page.getByLabel('Schedule for').fill(futureDatetimeLocal());
    await page.getByRole('button', { name: 'Confirm Schedule' }).click();
    await expect(page.locator('.badge-scheduled')).toBeVisible({ timeout: 5000 });
  });

  test('AC-UX-5: removing a recipient tag removes it from the list', async ({ page }) => {
    await loginAs(page);
    await page.goto('/campaigns/new');

    await page.getByPlaceholder('email@example.com').fill('remove@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('.recipient-tag').filter({ hasText: 'remove@test.com' })).toBeVisible();

    // click the × button on the tag
    await page.locator('.recipient-tag').filter({ hasText: 'remove@test.com' }).getByRole('button').click();
    await expect(page.locator('.recipient-tag').filter({ hasText: 'remove@test.com' })).not.toBeVisible();
  });

  test('AC-UX-6: duplicate recipient email is rejected', async ({ page }) => {
    await loginAs(page);
    await page.goto('/campaigns/new');

    await page.getByPlaceholder('email@example.com').fill('dup@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    // add same email again
    await page.getByPlaceholder('email@example.com').fill('dup@test.com');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText(/already added/i)).toBeVisible();
    // only one tag
    await expect(page.locator('.recipient-tag').filter({ hasText: 'dup@test.com' })).toHaveCount(1);
  });

});
