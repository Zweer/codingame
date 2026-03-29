# 7-segment scanner

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/7-segment-scanner)

**Level:** easy
**Topics:** Conditions, Loops, String manipulation, Ascii Art

## Goal 

Given an ASCII art representation of 7-segment display you need to convert it to a number.  
  
Note: number should be converted as is, including leading zeroes. 

Input

**3 lines:** 7-segment display image consisting only of vertical lines, underscores and spaces.  
Length of every line is divisible by 3 (so trailing spaces are preserved).

Output

**One line:** The number. Leading zeros should be preserved.

Constraints

3 ≤ digit count ≤ 300

Example

Input

 _     _  _     _  _  _  _  _ 
| |  | _| _||_||_ |_   ||_||_|
|_|  ||_  _|  | _||_|  ||_| _|

Output

0123456789
