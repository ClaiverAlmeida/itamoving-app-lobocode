/**
 * Máscara de CPF: formata o valor como 000.000.000-00.
 * Aceita apenas dígitos; retorna a string já formatada (até 11 dígitos).
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits.replace(/(\d{0,3})/, '$1');
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
}

/**
 * Remove formatação do CPF, retornando apenas os 11 dígitos.
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

/**
 * Valida CPF (dígitos verificadores e regras).
 * Aceita com ou sem máscara.
 */
export function validateCPF(cpf: string): boolean {
  const clean = unmaskCPF(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(9), 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.charAt(10), 10)) return false;
  return true;
}
