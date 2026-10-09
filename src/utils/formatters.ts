const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnNum(num: number | string): string {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)] || d);
}

export function parseBnNum(str: string): number {
  if (!str) return 0;
  // Convert any Bengali digits to English
  const enStr = str.replace(/[০-৯]/g, (d) => {
    const idx = bnDigits.indexOf(d);
    return idx >= 0 ? idx.toString() : d;
  }).replace(/[^0-9.]/g, '');
  return parseFloat(enStr) || 0;
}

export function formatBnCurrency(amount: number): string {
  // Bengali number formatting (e.g., 1,42,500)
  const isNegative = amount < 0;
  const absVal = Math.round(Math.abs(amount));
  const numStr = absVal.toString();

  let formatted = '';
  if (numStr.length <= 3) {
    formatted = numStr;
  } else {
    // Indian / South Asian numbering system: last 3 digits, then groups of 2
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    const groups = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formatted = groups + ',' + lastThree;
  }

  const bnFormatted = toBnNum(formatted);
  return isNegative ? `-${bnFormatted}` : bnFormatted;
}

export function formatBnPercent(num: number): string {
  return `${toBnNum(Math.round(num))}%`;
}
