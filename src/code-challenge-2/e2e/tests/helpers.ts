import { Page, expect } from '@playwright/test';

export const BASE_URL = 'http://localhost:5173';
export const API_URL  = 'http://localhost:3001';

export const DEMO_EMAIL    = 'demo@example.com';
export const DEMO_PASSWORD = 'password123';

/** login via the UI and return to /campaigns */
export async function loginAs(page: Page, email = DEMO_EMAIL, password = DEMO_PASSWORD) {
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/campaigns/);
}

/** create a campaign via the UI and return its detail page URL */
export async function createCampaign(
  page: Page,
  opts: { name: string; subject: string; body: string; recipients: string[] }
) {
  await page.goto('/campaigns/new');
  await page.getByLabel('Campaign Name').fill(opts.name);
  await page.getByLabel('Email Subject').fill(opts.subject);
  await page.getByLabel('Email Body').fill(opts.body);

  for (const email of opts.recipients) {
    await page.getByPlaceholder('email@example.com').fill(email);
    await page.getByRole('button', { name: 'Add' }).click();
  }

  await page.getByRole('button', { name: 'Create Campaign' }).click();
  // wait for redirect to detail page and for the Schedule button to be ready
  await expect(page).toHaveURL(/\/campaigns\/[a-z0-9-]+$/);
  await expect(page.getByRole('button', { name: 'Schedule' })).toBeVisible({ timeout: 10000 });
  return page.url();
}

/** returns a future datetime-local string (YYYY-MM-DDTHH:MM) offset by `offsetMs` */
export function futureDatetimeLocal(offsetMs = 3_600_000): string {
  const d = new Date(Date.now() + offsetMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** returns a past datetime-local string (YYYY-MM-DDTHH:MM) offset by `offsetMs` */
export function pastDatetimeLocal(offsetMs = 3_600_000): string {
  return futureDatetimeLocal(-offsetMs);
}
