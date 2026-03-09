/**
 * Máscara de telefone Brasil: formata o valor como +55 (00) 0000-0000 ou +55 (00) 90000-0000.
 * Aceita apenas dígitos; retorna a string já formatada (até 11 dígitos).
 * Mesma base de formatação progressiva do formatCPF.
 */
export function formatNumberTelephoneBrasil(value: string): string {
  let digits = value.replace(/\D/g, '');
  // Remove o 55 do início se o usuário digitou o código do país (evita duplicar +55)
  if (digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);
  if (digits.length === 0) return '';
  const prefix = '+55 ';
  // Com 2 dígitos não fechamos o ")" para permitir backspace/delete sem travar em "+55 (11)"
  if (digits.length <= 2) return prefix + (digits.length === 2 ? `(${digits}` : digits);
  if (digits.length <= 6) return prefix + digits.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  if (digits.length <= 10) return prefix + digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return prefix + digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Máscara de telefone EUA: formata o valor como +1 (000) 000-0000.
 * DDD (area code) tem 3 dígitos; número completo tem 10 dígitos.
 * Remove o 1 do início se o usuário digitou o código do país (evita duplicar +1).
 */
export function formatNumberTelephoneEUA(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  if (digits.length === 0) return '';
  const prefix = '+1 ';
  // 1–2 dígitos: só o prefixo + dígitos
  if (digits.length <= 2) return prefix + digits;
  // 3 dígitos (area code): "+1 (123" (sem ")" para permitir backspace)
  if (digits.length === 3) return prefix + `(${digits}`;
  // 4–6: +1 (123) 4 até +1 (123) 456
  if (digits.length <= 6) return prefix + digits.replace(/(\d{3})(\d{0,3})/, '($1) $2');
  // 7–10: +1 (123) 456-7 até +1 (123) 456-7890
  return prefix + digits.replace(/(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3');
}