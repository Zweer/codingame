# Find the missing plus signs in addition

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/find-the-missing-plus-signs-in-addition)

**Level:** medium
**Topics:** Recursion

## Goal 

The sum of a set of N integers is S.  
Unfortunately, the plus signs have disappeared and the integers have been concatenated in a string O...  
You have to find the positions of the plus signs to recover the addition.  
If there is no solution , then print No solution, otherwise print the solution(s) in lexicographic order ( 1+11 before 11+1 ). 

Input

**Line 1 :** An integer N as the number of terms in the addition  
**Line 2 :** A long integer S as the sum of the N integers  
**Line 3 :** A string O as the concatenation of the N integers

Output

If there is no solution, print No solution.  
Otherwise, print the solution(s), one per line, ordered in lexicographic order (+ before 0,1,2,3...) , formatted as a valid equation a1+a2+...+aN\=S

Constraints

2 <= N <= 10

Example

Input

2
177
44133

Output

44+133=177
