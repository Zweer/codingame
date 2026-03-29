# The G Note

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/the-g-note)

**Level:** medium
**Topics:** Arrays, Memoization, Recursion, Mathematics, Polynomials

## Goal 

This puzzle is related to Ada Lovelace's G Note.  
  
Compute S\_N \= (0^N \+ 1^N \+ 2^N \+ ... + (N^N)^N) mod M with M \= 2^53.  
  
**Examples**  
  
S\_2 = (0^2 + 1^2 + 2^2 + 3^2 + 4^2) mod 2^53 = 30  
S\_4 = (0^4 + 1^4 + 2^4 + ... + 256^4) mod 2^53 = 222055401600  
S\_5 = 155369480450947265625 mod 2^53 = 4300505919894617  
  
**Note**  
  
For N\=513, (513^513)^513 is an integer on the order of 1E713210.  
It might be worth considering avoiding actually computing it. 

Input

An integer N.

Output

The integer S\_N (mod 2^53).

Constraints

0 ≤ N ≤ 513

Example

Input

5

Output

4300505919894617
