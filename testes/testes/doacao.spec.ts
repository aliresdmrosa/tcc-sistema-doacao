import { test, expect } from '@playwright/test';

test('cadastrar doacao', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.locator('div').filter({ hasText: 'Doe equipamentos em desuso,' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('doador@sistemadoacao.com');
  await page.getByRole('textbox', { name: 'Senha' }).fill('usuario123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('link', { name: 'Cadastro de Doação' }).click();
  await page.getByRole('combobox', { name: 'Tipo do item' }).locator('span').click();
  await page.getByText('NOTEBOOK').click();
  await page.getByRole('textbox', { name: 'Descrição' }).click();
  await page.getByRole('textbox', { name: 'Descrição' }).fill('bom estado para uso');
  await page.getByText('upload Selecionar imagens').click();
  await page.getByLabel('upload Selecionar imagens').setInputFiles('fixtures/notebook.png');
  await page.getByRole('button', { name: 'Confirmar doação' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
});