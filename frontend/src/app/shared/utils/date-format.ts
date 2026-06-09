export function formatarDataBr(data: unknown, fallback = '--'): string {
  if (!data) {
    return fallback;
  }

  if (data instanceof Date) {
    return formatarPartesData(
      data.getFullYear(),
      data.getMonth() + 1,
      data.getDate()
    );
  }

  const texto = String(data).trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    return texto;
  }

  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return fallback;
  }

  const [, ano, mes, dia] = match;

  return `${dia}/${mes}/${ano}`;
}

function formatarPartesData(ano: number, mes: number, dia: number): string {
  return `${preencherZero(dia)}/${preencherZero(mes)}/${ano}`;
}

function preencherZero(valor: number): string {
  return String(valor).padStart(2, '0');
}
