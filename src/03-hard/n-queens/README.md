# n Queens

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/n-queens)

**Level:** hard
**Topics:** Conditions, Loops, 2D array

## Goal 

We have to place n queens on a chessboard made of n x n squares.  
We need to place all of them in such a way that none of them is in direct contact nor attacking another one.  
(meaning only one queen is occupying each line, column and diagonal)  
  
Example with n \= 4, s \= 2 solutions :  
  
- Q - -  
- - - Q  
Q - - -  
- - Q -

  
and  
  
- - Q -  
Q - - -  
- - - Q  
- Q - -

Input

n : Number of queens (height and width of the cheessboard).

Output

s : Number of solutions.

Constraints

1 ≤ n ≤ 11

Example

Input

4

Output

2
