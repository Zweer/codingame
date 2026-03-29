# Counter Attack

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/counter-attack)

**Level:** hard
**Topics:** Dynamic programming

## Goal 

Billy is recording a counter of the latest breakages of his precious GeForce RTX 3060\. Whenever Bob tries to break his GeForce RTX 3060, Billy's counter will immediately update.  
  
The way in which the counter works is that the counter will record how many days before latest breakage of Billy's GeForce RTX 3060\. If the latest breakage of Billy's GeForce RTX 3060 is at day i, the ith element of the counter will be 0\. If the latest breakage of Billy's GeForce RTX 3060 5 days before day i, the ith element of the counter will be 5.  
  
Finally, Billy has recorded enough evidence that lasts for N days. Bob will be facing justice before the court of NVIDIA company. But something feels off, Bob has modified his counter!  
  
Because Billy doesn't know how many times Bob broke his GeForce RTX, your goal is to help Billy write a program that will show, for each number of times Bob has broken Billy's GeForce RTX 3060 from 1 to N, the minimum possible number of modifications to his counter.  
  
**Example**  
If Bob broke Billy's GeForce RTX 3060 at days 1, 3 and 6, and Billy has recorded for 7 days, the counter will read:  

[0,1,0,1,2,0,1]

If Bob modified Billy's counter for day 3 to be 2, the counter will read:  

[0,1,2,1,2,0,1]

If Bob has broken Billy's GeForce RTX 3060 once, Bob must make 4 modifications to make the counter appear this way (consider Bob has broken Billy's GeForce RTX 3060 at day 1).  
If Bob has broken Billy's GeForce RTX 3060 twice, Bob must make 2 modifications to make the counter appear this way (consider Bob has broken Billy's GeForce RTX 3060 at days 1 and 6).  
If Bob has broken Billy's counter three times, Bob must make 1 modification to make the counter appear this way (consider Bob has broken Billy's GeForce RTX 3060 at days 1, 3 and 6).  
...  
So on and so forth.  
  
**Note**: The first time Bob broke Billy's counter must be at day 1. 

Input

**Line 1**: An integer N for the number of days Billy has been recording.  
**Line 2**: N space-separated integers a for the elements of the counter.

Output

**N lines**: Where the ith line will be a single integer for the minimum possible number of modifications to his counter when Billy's GeForce RTX 3060 has been broken i times.

Constraints

1 <= N <= 100  
1 <= a <= 100

Example

Input

7
0 1 2 1 2 0 1

Output

4
2
1
2
3
4
5
