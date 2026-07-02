import { test, expect } from '@playwright/test';

test('realizar login', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('admin@sistemadoacao.com');
  await page.getByRole('textbox', { name: 'E-mail' }).press('Tab');
  await page.getByRole('textbox', { name: 'Senha' }).fill('admin123');
  await page.getByRole('button', { name: 'Entrar' }).click();
});