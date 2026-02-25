/**
 * Máscara de dimensões: formata o valor como NxNxN ou NxNxNcm (ex: 40x30x25cm).
 * Aceita apenas dígitos e "x"; até 3 segmentos, cada um com no máximo 4 dígitos.
 * Adiciona "cm" só quando a terceira medida tem 2+ dígitos, para o usuário poder
 * apagar e editar (ao voltar para "40x30x2" o "cm" some).
 */
export function formatDimensions(value: string): string {
  if (!value) return '';
  // Só permite dígitos e 'x'; remove o resto (mesmo mecanismo do telefone)
  const cleaned = value.replace(/[^\dx]/gi, '');
  if (cleaned.length === 0) return '';
  if (cleaned.includes('xx')) return '';

  // Até 3 segmentos separados por 'x'; cada segmento só dígitos, máx. 4
  const parts = cleaned
    .split('x')
    .map((p) => p.replace(/\D/g, '').slice(0, 4))
    .slice(0, 3);
  const seg1 = parts[0] ?? '';
  const seg2 = parts[1] ?? '';
  const seg3 = parts[2] ?? '';

  let out = seg1;
  if (parts.length > 1) out += 'x' + seg2;
  if (parts.length > 2) out += 'x' + seg3;
  // Não adiciona "cm" se o valor termina em "c" ou "m" (usuário está apagando "cm")
  const raw = value.trim().toLowerCase();
  const userIsDeletingCm = raw.endsWith('c') || raw.endsWith('m');
  if (seg1 !== '' && seg2 !== '' && seg3.length >= 2 && !userIsDeletingCm) {
    out += 'cm';
  }

  return out;
}
