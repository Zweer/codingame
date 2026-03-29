export function isHappy(n: string): boolean {
  const seen = new Set<number>();
  let sum = digitSquareSum(n);
  while (sum !== 1 && !seen.has(sum)) {
    seen.add(sum);
    sum = digitSquareSum(String(sum));
  }
  return sum === 1;
}

function digitSquareSum(n: string): number {
  let sum = 0;
  for (const ch of n) {
    const d = ch.charCodeAt(0) - 48;
    sum += d * d;
  }
  return sum;
}
