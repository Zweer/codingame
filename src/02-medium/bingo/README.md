# Bingo!

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/bingo)

**Level:** medium
**Topics:** Loops, Arrays

## Goal 

Provided with a set of **bingo cards**, and the order in which the numbers will be called, output how many numbers need to be called before somebody has a **line**, followed by how many numbers need to be called before somebody has "bingo" (all numbers on their sheet filled in).  
  
A **bingo card** is defined as a 5x5 set of numbers between 1 and 90\. The center of a bingo card is a "free space", meaning it is already filled in - this is denoted with a 0 in this puzzle.   
  
A **line** on the bingo card is defined as any row, column or diagonal of 5 numbers on the card. 

Input

**Line 1**: An integer n for the number of bingo cards in play.  
**Next n\*5 lines**: The numbers bn on the bingo cards, separated by spaces ("free space" is signified with a 0).  
**Next line**: The order in which the numbers cn will be called, separated by a space. You are provided all 90 numbers.

Output

**Line 1**: The amount of numbers that need to be called before a bingo card has a complete line.  
**Line 2**: The amount of numbers that need to be called before a bingo card has a full house (all numbers filled).

Constraints

0 < n ≤ 100  
0 ≤ bn ≤ 90  
0 < cn ≤ 90

Example

Input

1
1 67 89 69 48
72 65 38 85 28
37 29 0 54 22
83 80 10 75 58
25 35 49 87 27
65 4 48 59 26 24 3 60 36 29 54 47 78 32 18 9 83 90 2 50 17 45 11 20 55 33 30 64 35 75 39 81 71 70 5 52 53 46 88 6 41 66 86 67 49 38 62 31 85 27 13 84 58 1 40 80 16 82 22 76 57 37 14 19 79 73 44 68 15 43 87 72 8 42 69 12 34 89 77 21 74 51 63 25 10 61 56 28 7 23

Output

54
88
