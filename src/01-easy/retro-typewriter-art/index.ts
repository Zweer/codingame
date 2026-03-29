import { handler } from './handler';

// @ts-expect-error 'readline' is proper of the codingame interface
const input: string = readline();
console.error(input);
console.log(handler(input));
