import { test, expect } from '@playwright/test';

test('cadastrar solicitacao', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.locator('div').filter({ hasText: 'Doe equipamentos em desuso,' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('doador@sistemadoacao.com');
  await page.locator('div').filter({ hasText: 'Doe equipamentos em desuso,' }).click();
  await page.getByRole('textbox', { name: 'Senha' }).click();
  await page.getByRole('textbox', { name: 'Senha' }).fill('usuario123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.getByRole('link', { name: 'Solicitação de Doação' }).click();
  await page.getByRole('combobox', { name: 'Equipamento' }).locator('span').click();
  await page.getByRole('option', { name: 'Notebook' }).click();
  await page.locator('.mat-mdc-select-placeholder').click();
  await page.getByRole('option', { name: 'TADS' }).click();
  await page.getByRole('textbox', { name: 'GRR' }).click();
  await page.getByRole('textbox', { name: 'GRR' }).fill('20202020');
  await page.getByRole('textbox', { name: 'Motivo da solicitação' }).fill('preciso para estudo');
  await page.getByRole('checkbox', { name: 'Declaro que não possuo' }).check();
  await page.getByRole('checkbox', { name: 'Confirmo que minha matrícula' }).check();
  await page.getByRole('button', { name: 'Confirmar' }).click();
  await page.getByRole('button', { name: 'Fechar modal' }).click();
});