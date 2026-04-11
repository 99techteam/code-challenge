/**
 * AC: Authentication
 *
 * AC-AUTH-1  Unauthenticated users are redirected to /login
 * AC-AUTH-2  Login with valid credentials succeeds and redirects to /campaigns
 * AC-AUTH-3  Login with wrong password shows an error message
 * AC-AUTH-4  Register a new user and land on /campaigns
 * AC-AUTH-5  Sign out clears session and redirects to /login
 */

import { test, expect } from '@playwright/test';
import { loginAs, DEMO_EMAIL, DEMO_PASSWORD } from './helpers';

test.describe('Authentication', () => {

  test('AC-AUTH-1: unauthenticated access to /campaigns redirects to /login', async ({ page }) => {
    await page.goto('/campaigns');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Campaign Manager' })).toBeVisible();
  });

  test('AC-AUTH-2: login with valid credentials redirects to /campaigns', async ({ page }) => {
    await loginAs(page);
    await expect(page).toHaveURL(/\/campaigns/);
    await expect(page.getByRole('heading', { name: 'Campaigns' })).toBeVisible();
    // user name shown in header
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('AC-AUTH-3: login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(DEMO_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('AC-AUTH-4: register a new user and land on /campaigns', async ({ page }) => {
    const unique = `test_${Date.now()}@example.com`;
    await page.goto('/login');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByLabel('Name').fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill(unique);
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/\/campaigns/);
    await expect(page.getByText('Test User')).toBeVisible();
  });

  test('AC-AUTH-5: sign out clears session and redirects to /login', async ({ page }) => {
    await loginAs(page);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/login/);
    // navigating back to /campaigns should redirect to login again
    await page.goto('/campaigns');
    await expect(page).toHaveURL(/\/login/);
  });

});
