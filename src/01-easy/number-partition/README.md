# Number Partition

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/number-partition)

**Level:** easy
**Topics:** DFS, Backtracking, Recursion, Number theory

## Goal 

In number theory and combinatorics, an integer partition of a positive integer n is a way of expressing n as a sum of positive integers. Two sums that differ only in the order of their summands are considered the same partition.  
  
Write a program outputting all integer partitions of n in reverse lexicographic order. Each partition must satisfy the following conditions:  
  
a1 + a2 + ... + ak = n   
a1 ≥ a2 ≥ ... ≥ ak > 0  
  
Output all integer partitions of n in **reverse lexicographic order**. The integers within each partition should be **separated by spaces**. 

Input

An integer n.

Output

**Multiple lines**: each containing one partition.

Constraints

1 ≤ n ≤ 9

Example

Input

4

Output

4
3 1
2 2
2 1 1
1 1 1 1
