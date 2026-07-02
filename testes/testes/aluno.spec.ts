import { test, expect } from '@playwright/test';

test('cadastrar usuario', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByRole('button', { name: 'Não tem conta? Crie uma' }).click();
  await page.getByRole('textbox', { name: 'Nome' }).click();
  await page.getByRole('textbox', { name: 'Nome' }).fill('Jose');
  await page.getByRole('textbox', { name: 'CPF' }).click();
  await page.getByRole('textbox', { name: 'CPF' }).fill('58970707093');
  await page.locator('div').filter({ hasText: 'E-mail' }).nth(4).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('jose@sistemadoacao.com');
  await page.getByRole('textbox', { name: 'E-mail' }).press('Tab');
  await page.getByRole('textbox', { name: 'Senha' }).fill('Josei@123');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.goto('http://localhost:4200/');
});

test('editar perfil usuario', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('jose@sistemadoacao.com');
  await page.getByRole('textbox', { name: 'Senha' }).click();
  await page.getByRole('textbox', { name: 'Senha' }).fill('Josei@123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('link', { name: 'Configuração de Perfil' }).click();
  await page.getByRole('button', { name: 'Editar' }).click();
  await page.locator('div').filter({ hasText: 'Nome' }).nth(3).click();
  await page.getByRole('textbox', { name: 'Nome' }).fill('Jose dos Santos');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
});