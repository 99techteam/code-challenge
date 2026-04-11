/**
 * AC: Business Rules (server-side enforcement)
 *
 * AC-BIZ-1   Schedule campaign: date picker appears, future date accepted, status → scheduled
 * AC-BIZ-2   Schedule with past date is rejected by the API (error shown)
 * AC-BIZ-3   Send Now on a draft campaign: status transitions to sent, action buttons disappear
 * AC-BIZ-4   Sent campaign cannot be sent again (Send Now button absent)
 * AC-BIZ-5   Delete a draft campaign: removed from list, redirected to /campaigns
 * AC-BIZ-6   Cannot delete a sent campaign (Delete button absent on detail page)
 * AC-BIZ-7   After sending, all recipients show status "sent" in the table
 * AC-BIZ-8   Stats update after send: send_rate becomes 100%
 */

import { test, expect } from '@playwright/test';
import { loginAs, createCampaign, futureDatetimeLocal, pastDatetimeLocal } from './helpers';

test.describe('Business Rules', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('AC-BIZ-1: schedule a campaign — date picker appears and status changes to scheduled', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-1 Schedule Test',
      subject: 'Schedule subject',
      body: 'Schedule body',
      recipients: ['sched@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Schedule' })).toBeVisible();

    // open schedule panel
    await page.getByRole('button', { name: 'Schedule' }).click();
    await expect(page.getByLabel('Schedule for')).toBeVisible();

    // fill with a future datetime-local value
    await page.getByLabel('Schedule for').fill(futureDatetimeLocal());
    await expect(page.getByRole('button', { name: 'Confirm Schedule' })).toBeEnabled();
    await page.getByRole('button', { name: 'Confirm Schedule' }).click();

    // status badge should change to scheduled
    await expect(page.locator('.badge-scheduled')).toBeVisible({ timeout: 8000 });
    // Schedule button should be gone
    await expect(page.getByRole('button', { name: 'Schedule' })).not.toBeVisible();
  });

  test('AC-BIZ-2: scheduling with a past date shows an error', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-2 Past Date Test',
      subject: 'Past date',
      body: 'Body',
      recipients: ['past@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Schedule' })).toBeVisible();

    await page.getByRole('button', { name: 'Schedule' }).click();
    // fill with a past datetime-local value
    await page.getByLabel('Schedule for').fill(pastDatetimeLocal());
    await page.getByRole('button', { name: 'Confirm Schedule' }).click();

    // error message should appear
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.alert-error')).toContainText(/future/i);
    // status should still be draft
    await expect(page.locator('.badge-draft')).toBeVisible();
  });

  test('AC-BIZ-3: Send Now transitions draft campaign to sent', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-3 Send Test',
      subject: 'Send subject',
      body: 'Send body',
      recipients: ['send1@test.com', 'send2@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Send Now' })).toBeVisible();

    // accept the confirm dialog
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Send Now' }).click();

    // status should become sent
    await expect(page.locator('.badge-sent').first()).toBeVisible({ timeout: 8000 });
    // action buttons should disappear
    await expect(page.getByRole('button', { name: 'Send Now' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    await expect(page.getByText(/This campaign has been sent/i)).toBeVisible();
  });

  test('AC-BIZ-4: sent campaign has no Send Now button', async ({ page }) => {
    // use the seeded sent campaign
    await page.getByRole('button', { name: 'Sent' }).click();
    await page.locator('.campaign-card').first().click();
    await expect(page.getByRole('button', { name: 'Send Now' })).not.toBeVisible();
  });

  test('AC-BIZ-5: delete a draft campaign removes it from the list', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-5 Delete Test',
      subject: 'Delete subject',
      body: 'Delete body',
      recipients: ['del@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    // accept the confirm dialog
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Delete' }).click();

    // should redirect to /campaigns
    await expect(page).toHaveURL(/\/campaigns$/, { timeout: 8000 });
    // filter to draft and wait for list to refresh — campaign should be gone
    await page.getByRole('button', { name: 'Draft' }).click();
    await page.waitForTimeout(500); // allow React Query cache invalidation
    await expect(page.getByRole('heading', { name: 'BIZ-5 Delete Test' })).not.toBeVisible({ timeout: 5000 });
  });

  test('AC-BIZ-6: sent campaign has no Delete button on detail page', async ({ page }) => {
    await page.getByRole('button', { name: 'Sent' }).click();
    await page.locator('.campaign-card').first().click();
    await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
  });

  test('AC-BIZ-7: after sending, all recipients show status "sent"', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-7 Recipients Test',
      subject: 'Recipients subject',
      body: 'Recipients body',
      recipients: ['r1@test.com', 'r2@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Send Now' })).toBeVisible();

    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Send Now' }).click();
    await expect(page.locator('.badge-sent').first()).toBeVisible({ timeout: 8000 });

    // all recipient status badges in the table should be "sent"
    const recipientStatuses = page.locator('.recipients-table .badge');
    const count = await recipientStatuses.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(recipientStatuses.nth(i)).toHaveText('sent');
    }
  });

  test('AC-BIZ-8: stats show 100% send rate after sending', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'BIZ-8 Stats Test',
      subject: 'Stats subject',
      body: 'Stats body',
      recipients: ['s1@test.com', 's2@test.com', 's3@test.com'],
    });
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Send Now' })).toBeVisible();

    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Send Now' }).click();
    await expect(page.locator('.badge-sent').first()).toBeVisible({ timeout: 8000 });

    // send rate should be 100%
    const sendRateCard = page.locator('.stat-card').filter({ hasText: 'Send Rate' });
    await expect(sendRateCard.locator('.stat-value')).toHaveText('100%');

    // total should equal number of recipients
    const totalCard = page.locator('.stat-card').filter({ hasText: 'Total' });
    await expect(totalCard.locator('.stat-value')).toHaveText('3');
  });

});
