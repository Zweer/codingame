# Self-driving car testing

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/self-driving-car-testing)

**Level:** easy
**Topics:** Ascii Art

## Goal 

**Display the trajectory of a self-driving car on the road, from its log file.**  
  
The self driving car is represented by a hash mark # and the pattern of the road to display is given in the log file.  
  
On an ASCII road, you display the car moving from the top to the bottom.  
  
Each command logged by the car is represented by an integer and a character: L for left, R for right, S for straight. For each step, the car moves down one line. At the same time, it shifts one column to the left for L, one column to the right for R, or stays in the same column for S.  
  
For example, 4S;3R means the car is moving four times straight ahead (down), then three times down and right (from a sky point of view).  
  
If the car's position coincides with a road character, display only the car (#) in that position. 

Input

**Line 1:** The number N of lines describing the road pattern  
**Line 2:** The column position (1-based index) of the car at the beginning, then a list of commands, all separated by a semi-colon ;  
**N next lines:** The number R of similar consecutive patterns, then, separated with a semi-colon ; the pattern of the road to be repeated R times.

Output

The road, line by line, with the character # representing the self-driving car at its current position

Constraints

1 ≤ N ≤ 20  
Output: 1 ≤ number of lines, length of each line ≤ 40

Example

Input

1
2;10S
10;|     |     |

Output

|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
|#    |     |
