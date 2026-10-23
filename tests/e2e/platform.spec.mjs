import { test, expect } from '@playwright/test';
async function login(page, username) {
  await page.goto('/pruebas/');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill('1234');
  await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('[data-nav="home"]')).toBeVisible();
}
test('rechaza clave incorrecta y permite ingresar al administrador del demo', async ({ page }) => {
  await page.goto('/pruebas/');
  await expect(page.getByText(/PRUEBAS · DEMO/)).toBeVisible();
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('incorrecta');
  await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('#login-error')).toBeVisible();
  await page.locator('#password').fill('1234');
  await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('[data-nav="team"]')).toBeVisible();
  await page.locator('[data-nav="inventory"]').click();
  await expect(page.locator('#main')).toContainText('Inventario');
});
test('el vendedor no recibe el menú de administración del equipo', async ({ page }) => {
  await login(page, 'vendedor1');
  await expect(page.locator('[data-nav="team"]')).toHaveCount(0);
  await expect(page.locator('[data-nav="sale"]')).toBeVisible();
});
test('las dos vistas del mismo navegador mantienen inventarios independientes', async ({ context, page }) => {
  await page.goto('/');
  await expect(page.locator('#login-form')).toBeVisible();
  const before = await page.evaluate(() => localStorage.getItem('margaret-demo-v1'));
  const testing = await context.newPage();
  await testing.goto('/pruebas/');
  await expect(testing.locator('#login-form')).toBeVisible();
  await testing.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('margaret-testing-v1'));
    data.products[0].stock += 17;
    localStorage.setItem('margaret-testing-v1', JSON.stringify(data));
  });
  expect(await page.evaluate(() => localStorage.getItem('margaret-demo-v1'))).toBe(before);
  await testing.reload();
  await expect(testing.locator('#login-form')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('margaret-demo-v1'))).toBe(before);
});
