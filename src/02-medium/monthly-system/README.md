# Monthly System

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/monthly-system)

**Level:** medium
**Topics:** Strings, Modular calculus

## Goal 

A friend of yours has decided to represent numbers in a base-12 system using months as digits. She has given you a list of such numbers to add together. Each number is written in base-12 using the short forms (first three letters) of the months as the digits:  
  
Jan = 0  
Feb = 1  
Mar = 2  
Apr = 3  
May = 4  
Jun = 5  
Jul = 6  
Aug = 7  
Sep = 8  
Oct = 9  
Nov = 10  
Dec = 11 

Input

**Line 1:** An integer N, the number of numbers to add.  
**Next N Lines:** A string M representing a number in base-12 using the short forms of months as digits.

Output

The sum of the input numbers, expressed in base-12 using the short forms of months as digits.

Constraints

2 ≤ N ≤ 4  
M is always valid and contains at most 7 digits (months).

Example

Input

2
FebSepDec
JunMarJan

Output

JulNovDec
