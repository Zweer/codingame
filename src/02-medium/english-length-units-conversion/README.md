# English length units conversion

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/english-length-units-conversion)

**Level:** medium
**Topics:** Graphs, BFS

## Goal 

You have to convert an English length unit into another one.  
You are given the relations needed to calculate some unit into some other unit.  
  
Note: You might know that 1 nautic mile = 6080 feet and not 6000 feet. For the purpose of this puzzle, we removed this contradiction. 

Input

**Line 1**: unit 1 in unit 2  
**Line 2**: The number n of relations below  
**Next n lines**: number unit x \= number unit y

Output

number unit 1 \= number unit 2

Constraints

The numbers in the relations are integers, not always ones on the left, the smallest numbers possible.

Example

Input

inch in twip
3
1 point = 20 twip
1 inch = 12 line
1 line = 6 point

Output

1 inch = 1440 twip
