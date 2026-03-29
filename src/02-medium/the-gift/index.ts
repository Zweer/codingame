const N = Number(readline());
const C = Number(readline());
const budgets: number[] = [];
for (let i = 0; i < N; i++) budgets.push(Number(readline()));
budgets.sort((a, b) => a - b);

if (budgets.reduce((s, b) => s + b, 0) < C) {
  console.log('IMPOSSIBLE');
} else {
  const payments: number[] = [];
  let remaining = C;
  for (let i = 0; i < N; i++) {
    const fair = Math.floor(remaining / (N - i));
    const pay = Math.min(budgets[i], fair);
    payments.push(pay);
    remaining -= pay;
  }
  // Distribute leftover due to floor rounding
  for (let i = N - 1; i >= 0 && remaining > 0; i--) {
    const add = Math.min(remaining, budgets[i] - payments[i]);
    payments[i] += add;
    remaining -= add;
  }
  console.log(payments.join('\n'));
}
