import { test, expect } from '@playwright/test';

test('renders the SWEEP home page', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /SWEEP — Smart Waste Exchange & Eco Platform/i }),
  ).toBeVisible();
});
