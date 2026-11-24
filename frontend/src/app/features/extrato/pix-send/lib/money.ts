/** Converte a entrada inteira para centavos, sem aceitar prefixos ou notação científica. */
export function parseMoneyToCents(input: string): number | null {
  let value = input.trim();
  if (value.includes(',')) {
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(value)) return null;
    value = value.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) {
    value = value.replace(/\./g, '');
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export function centsToDecimal(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

export function moneyToCents(amount: number): number {
  return Math.round(amount * 100);
}
