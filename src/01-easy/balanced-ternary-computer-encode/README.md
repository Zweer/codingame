# Balanced ternary computer: encode

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/balanced-ternary-computer-encode)

**Level:** easy
**Topics:** Arithmetic

## Goal 

**Balanced ternary**(3 base) is a non-standard positional numeral system. In the standard (unbalanced) ternary system, digits have values 0, 1 and 2\. The digits in the **balanced ternary** system have values −1, 0, and 1\. We use letter T to represent -1, so the digits are (T, 0, 1).  
  
E.g.: 1T0 \= 1 \* (3\*\*2) + (-1)\*(3\*\*1) + 0\*(3\*\*0) = 9 - 3 + 0 = 6  
  
You must convert input integer (decimal) number to its balanced ternary representation. 

Input

**Line 1** An integer (decimal) number N

Output

**Line 1** A balanced ternary number BT as string matching the input.

Constraints

\-30 000 < N < 30 000

Example

Input

8

Output

10T
