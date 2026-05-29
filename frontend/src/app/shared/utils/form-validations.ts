export const CURSOS = [
  { valor: 'TADS', label: 'TADS' },
  { valor: 'BCC', label: 'BCC' },
  { valor: 'GI', label: 'GI' }
];

export const SENHA_FORTE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function apenasNumeros(valor: string | null | undefined): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function formatarCpf(valor: string | null | undefined): string {
  const numeros = apenasNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function normalizarGrr(valor: string | null | undefined): string {
  return apenasNumeros(valor).slice(0, 8);
}
