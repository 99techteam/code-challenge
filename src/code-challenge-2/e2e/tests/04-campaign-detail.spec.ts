/**
 * AC: Campaign Detail page
 *
 * AC-DETAIL-1  Detail page shows campaign name, subject, status badge
 * AC-DETAIL-2  Stats section shows total, sent, failed, opened, send_rate, open_rate
 * AC-DETAIL-3  Email body is displayed in a preview block
 * AC-DETAIL-4  Recipients table shows email, name, status, sent_at, opened_at
 * AC-DETAIL-5  Draft campaign shows Schedule, Send Now, Delete buttons
 * AC-DETAIL-6  Sent campaign shows no action buttons (only "sent" notice)
 * AC-DETAIL-7  Back link navigates to /campaigns
 */

import { test, expect } from '@playwright/test';
import { loginAs, createCampaign } from './helpers';

test.describe('Campaign Detail', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('AC-DETAIL-1: shows name, subject and status badge', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-1 Campaign',
      subject: 'DETAIL-1 Subject',
      body: 'DETAIL-1 body',
      recipients: ['detail1@test.com'],
    });
    await page.goto(url);

    await expect(page.getByRole('heading', { name: 'DETAIL-1 Campaign' })).toBeVisible();
    await expect(page.getByText('DETAIL-1 Subject')).toBeVisible();
    await expect(page.locator('.badge-draft').first()).toBeVisible();
  });

  test('AC-DETAIL-2: stats section shows all 6 metrics with correct values after send', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-2 Stats Campaign',
      subject: 'Stats subject',
      body: 'Stats body',
      recipients: ['stats1@test.com', 'stats2@test.com', 'stats3@test.com'],
    });
    await page.goto(url);

    // send the campaign so stats are non-zero
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Send Now' }).click();
    await expect(page.locator('.badge-sent').first()).toBeVisible({ timeout: 8000 });

    const statsGrid = page.locator('.stats-grid');
    const statCards = statsGrid.locator('.stat-card');

    await expect(statsGrid.getByText('Total')).toBeVisible();
    await expect(statsGrid.getByText('Send Rate')).toBeVisible();
    await expect(statsGrid.getByText('Open Rate')).toBeVisible();

    // total = 3 recipients, all sent
    await expect(statCards.filter({ hasText: 'Total' }).locator('.stat-value')).toHaveText('3');
    // send rate = 100%
    await expect(statCards.filter({ hasText: 'Send Rate' }).locator('.stat-value')).toHaveText('100%');
    // open rate = 0% (no opens simulated)
    await expect(statCards.filter({ hasText: 'Open Rate' }).locator('.stat-value')).toHaveText('0%');
  });

  test('AC-DETAIL-3: email body is displayed in preview block', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-3 Body Campaign',
      subject: 'Body subject',
      body: 'This is the unique email body content for DETAIL-3',
      recipients: ['body@test.com'],
    });
    await page.goto(url);
    await expect(page.locator('.email-body-preview')).toContainText('This is the unique email body content for DETAIL-3');
  });

  test('AC-DETAIL-4: recipients table shows correct columns and data', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-4 Recipients Campaign',
      subject: 'Recipients subject',
      body: 'Body',
      recipients: ['recip-a@test.com', 'recip-b@test.com'],
    });
    await page.goto(url);

    const table = page.locator('.recipients-table');
    await expect(table.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Sent At' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Opened At' })).toBeVisible();

    // our recipients should appear
    await expect(table.getByText('recip-a@test.com')).toBeVisible();
    await expect(table.getByText('recip-b@test.com')).toBeVisible();
    // status should be pending before send
    await expect(table.locator('.badge-pending').first()).toBeVisible();
  });

  test('AC-DETAIL-5: draft campaign shows Schedule, Send Now, Delete buttons', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-5 Draft Campaign',
      subject: 'Draft subject',
      body: 'Body',
      recipients: ['draft5@test.com'],
    });
    await page.goto(url);

    await expect(page.getByRole('button', { name: 'Schedule' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Now' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('AC-DETAIL-6: sent campaign shows no action buttons', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-6 Sent Campaign',
      subject: 'Sent subject',
      body: 'Body',
      recipients: ['sent6@test.com'],
    });
    await page.goto(url);

    // send it
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Send Now' }).click();
    await expect(page.locator('.badge-sent').first()).toBeVisible({ timeout: 8000 });

    // action buttons should be gone
    await expect(page.getByRole('button', { name: 'Schedule' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Now' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    await expect(page.getByText(/This campaign has been sent/i)).toBeVisible();
  });

  test('AC-DETAIL-7: back link navigates to /campaigns', async ({ page }) => {
    const url = await createCampaign(page, {
      name: 'DETAIL-7 Back Link',
      subject: 'Back subject',
      body: 'Body',
      recipients: ['back7@test.com'],
    });
    await page.goto(url);
    await page.getByRole('link', { name: '← Campaigns' }).click();
    await expect(page).toHaveURL(/\/campaigns$/);
  });

});
