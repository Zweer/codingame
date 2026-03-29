# Maximum sub-sequence

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/maximum-sub-sequence)

**Level:** medium

## Goal 

Given a list of N random integers Ik, you must return the maximum-length incrementing sequence contained in this list (for each Ik in the sequence, Ik\=I(k-1)+1). The incrementing sequence must be ordered, but need not be adjacent in the given sequence.  
  
In case of multiple maximum-length sequences, return the one with the lowest starting integer. 

Input

**Line 1:** a single integer N.  
**Line 2:** a list of N integers Ik separated by space.

Output

**Line 1:** a list of integers separated by space.

Constraints

\-10^7 <= Ik <= 10^7  
0 < N < 1500

Example

Input

5
0 -1 1 2 4

Output

0 1 2
