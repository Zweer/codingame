# Simplify Selection Ranges

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/simplify-selection-ranges)

**Level:** hard

## Goal 

You are given an array of numbers and must simplify the array by replacing ranges of 3 or more items with the shorthand #-# equivalent and returning the result as a string, sorted from lowest to highest 

Input

**Line 1:** A string representing an array of digits to simplify and reduce.

Output

A comma separated string containing the sorted and simplified range sets.

Constraints

1 ≤ N ≤ 100 where N is each item in the array

Example

Input

[1,2,5,6,7,9,12,55,56,57,58,60,61,62,64,65,70]

Output

1,2,5-7,9,12,55-58,60-62,64,65,70
