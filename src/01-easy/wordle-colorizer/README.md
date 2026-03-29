# Wordle colorizer

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/wordle-colorizer)

**Level:** easy

## Goal 

You are given the answer to today's **Wordle** and a list of N attempts to solve it.  
  
For each attempt, you must print the result (5 characters) corresponding to the 5 letters of attempt consisting of:  
\- # if the letter is at the right place  
\- O if the letter is in answer but at another place  
\- X for all other cases  
  
Example:  
If answer is POLKA and attempt is SOLAR, then result should be X##OX:  
 \- S is not in answer  
 \- O is at the right place  
 \- L is at the right place  
 \- A is in answer but at another place  
 \- R is not in answer  
  
Additionally, if a particular letter appears in attempt and in answer a different number of times, the result should be based on the following priority:  
1\. # for correctly placed letters  
2\. O for misplaced letters which appear earlier in attempt  
3\. X for any excess appearances 

Input

**Line 1:** An uppercase word which is the answer to today's Wordle  
**Line 2:** An integer N, the number of attempts to solve the Wordle  
**N next lines:** An uppercase word which is an attempt to solve the Wordle

Output

**N Lines:** Each containing the result for an attempt to solve the Wordle

Constraints

1 ≤ N ≤ 6  
**answer and attempt** always have a length of 5 letters

Example

Input

POLKA
4
QUICK
BROWN
GLADY
POLKA

Output

XXXXO
XXOXX
XOOXX
#####
