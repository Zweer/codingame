# Goldbach’s Conjecture

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/goldbachs-conjecture)

**Level:** medium
**Topics:** Loops, Hash tables, Memoization, Mathematics, Primes

## Goal 

Goldbach's conjecture is one of the oldest and best-known unsolved problems in number theory and all of mathematics. It states that every even natural number greater than 2 is the sum of two prime numbers.  
  
For each given even integer m, find all distinct prime couples summing to m, and print their count.  
  
**Example explanation:** 38 get these 2 possible sums  
38 = 7 + 31  
38 = 19 + 19 

Input

**Line 1 :** An integer n, the number of numbers to compute  
**n next lines :** an even integer m, the number for which all the couples of prime numbers must be found, counted and printed.

Output

n lines, each containing the count to each of the n given numbers

Constraints

0 < n <= 120  
2 < m <=1 000 000

Example

Input

1
38

Output

2
