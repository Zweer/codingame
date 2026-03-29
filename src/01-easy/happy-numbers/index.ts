import { isHappy } from './handler.js';

const n = Number(readline());
for (let i = 0; i < n; i++) {
  const num = readline();
  console.log(`${num} ${isHappy(num) ? ':)' : ':('}`);
}
