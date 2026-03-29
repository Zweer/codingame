# Mask-Matching

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/mask-matching)

**Level:** medium
**Topics:** Mathematics, Number theory, Combinatorics

## Goal 

You are given a positive integer called mask in **hexadecimal** notation. Your task is to find up to 15 integers that match the condition:  
  
(mask & n) == n  
  
where n is a positive integer. These integers are called **mask-matching** integers.  
  
Output the mask-matching integers in decimal form, starting from the smallest. If there are more than 15 integers that match, output the **first 13 smallest** numbers, followed by ,..., and the **last 2 largest** numbers. 

Input

**Line 1:** A single positive integer mask in **hexadecimal** notation

Output

**Line 1:** A comma-separated list of up to 15 **mask-matching** integers in decimal.

Constraints

1 ≤ mask ≤ 0x3FFF\_FFFF\_FFFF\_FFFF (i.e. 2^62 - 1)

Example

Input

e

Output

2,4,6,8,10,12,14
