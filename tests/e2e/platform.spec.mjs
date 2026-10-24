import { test, expect } from '@playwright/test';
test.beforeAll(async ({ browser }) => { console.log(`Navegador de QA: ${browser.browserType().name()} ${browser.version()}`); });
async function login(page, username) {
  await page.goto('/pruebas/');
  await page.locator('#username').fill(username);
  await page.locator('#password').fill('1234');
  await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('[data-nav="home"]')).toBeVisible();
}
test('rechaza clave incorrecta y permite ingresar al administrador del demo', async ({ page }) => {
  await page.goto('/pruebas/');
  await expect(page.getByText(/LOCAL · PRUEBAS/)).toBeVisible();
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

test('compra, venta con cambio, gasto y devolución parcial desde los formularios', async ({ page }) => {
  await login(page, 'admin');
  await page.locator('[data-nav="inventory"]').click();
  await page.locator('#inventory-new').click();
  const product = page.locator('#product-form');
  await product.locator('[name="barcode"]').fill('QA-E2E-ARITHMETIC');
  await product.locator('[name="name"]').fill('Producto QA aritmética');
  await product.locator('[name="category"]').selectOption('Otros');
  await product.locator('[name="referenceCost"]').fill('3000.10');
  await product.locator('[name="price"]').fill('4100.01');
  await product.locator('button.primary').click();
  await page.locator('#inventory-receive-selected').click();
  const purchase = page.locator('#purchase-form');
  await purchase.locator('[name="qty"]').fill('10');
  await purchase.locator('[name="cost"]').fill('3000.10');
  await purchase.locator('button.primary').click();
  await expect(page.locator('#toast')).toContainText('Compra registrada');

  await page.locator('[data-nav="shift"]').click();
  await page.locator('#new-shift').click();
  for (const checkbox of await page.locator('#assign-form [name="members"]').all()) await checkbox.uncheck();
  await page.locator('#assign-form [name="members"][value="vendedor1"]').check();
  await page.locator('#assign-form [name="members"][value="vendedor2"]').check();
  await page.locator('#assign-form [name="owner"]').selectOption('vendedor1');
  await page.locator('#assign-form [value="approve"]').click();
  await page.locator('#open-form [name="base"]').fill('100000');
  await page.locator('#open-form button').click();
  await page.locator('[data-nav="sale"]').click();
  await page.locator('#search').fill('Producto QA aritmética');
  const add = page.locator('.product-box').filter({ hasText: 'Producto QA aritmética' }).locator('[data-add]');
  await add.click(); await add.click();
  await page.locator('#received').fill('10000');
  await page.locator('#pay-form button.primary').click();
  await expect(page.locator('.voucher-paper')).toBeVisible();
  await page.locator('#voucher-close').click();
  await expect(page.locator('#sale-completed')).toContainText('1.799,98');
  const saleId = await page.evaluate(() => JSON.parse(localStorage.getItem('margaret-testing-v1')).sales.at(-1).id);

  await page.locator('[data-nav="expenses"]').click();
  const expense = page.locator('#expense-form');
  await expense.locator('[name="detail"]').fill('Gasto QA');
  await expense.locator('[name="amount"]').fill('5.01');
  await expense.locator('[name="source"]').selectOption('Caja del turno');
  await expense.locator('button.primary').click();
  await expect(page.locator('#toast')).toContainText('Gasto registrado');

  await page.locator('[data-nav="returnsPage"]').click();
  await page.locator('#return-sale-select').selectOption(String(saleId));
  await page.locator('#return-scope').selectOption('partial');
  await page.locator('#return-request-form [name="qty-0"]').fill('1');
  await page.locator('#return-request-form [name="reason"]').fill('Prueba QA parcial');
  await page.locator('#return-request-form button.primary').click();
  await page.locator('#approve-return').click();
  await page.locator('#refund-form [name="confirmed"]').check();
  await page.locator('#refund-form button.primary').click();
  await expect(page.locator('.voucher-paper')).toContainText('4.100,01');
  await page.locator('#voucher-close').click();
  const data = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('margaret-testing-v1'));
    return { product: d.products.find(p => p.barcode === 'QA-E2E-ARITHMETIC'), sale: d.sales.at(-1), refund: d.returns.at(-1) };
  });
  expect(data.product.stock).toBe(9);
  expect(data.product.inventoryValue).toBe(27000.9);
  expect(data.sale.total).toBe(8200.02);
  expect(data.refund.total).toBe(4100.01);
  await page.locator('[data-nav="shift"]').click();
  await expect(page.locator('#main')).toContainText('104.095');
});
