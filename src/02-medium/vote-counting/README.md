# Vote counting

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/vote-counting)

**Level:** medium

## Goal 

Your program must output the number of **Yes** **No** valid votes.  
  
Voters can have proxy votes. Input gives you how many votes each voter has.  
A list of votes following the format "<Voter name> <Vote>" is given.  
  
One vote is invalid if :  
\- it is neither **Yes**, nor **No**;  
\- the voter voted more than he is allowed to (all his votes are invalid);  
\- the person that voted is not in the list of voters. 

Input

**Line 1:** The number N of voters as integer.  
**Line 2:** The number M of votes as integer.  
**The N following lines:** The name of a voter person\_name as a string, and his number of votes nb\_vote he can use.  
**The M following lines:** Two string, the voter name voter\_name, and his vote vote\_value.

Output

**Line 1:** The number of Yes and No votes.

Constraints

0 < N < 10  
0 < M < 10

Example

Input

2
3
Albert 2
Roger 1
Albert Yes
Roger No
Albert Yes

Output

2 1
