import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('should return healthy status', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.status()).toBe(200);

    const body = await response?.json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('timestamp');
  });
});
