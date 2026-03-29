# Insert to String

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/insert-to-string)

**Level:** easy
**Topics:** Strive for Simplicity, String manipulation

## Goal 

You're given a string and a list of changes to do on that string.  
  
Each change includes a line number, a column number, and a string to add at that location.  
  
Apply all of the changes simultaneously on the original string (not sequentially on the string after each change). After that, replace every occurrence of \\n in the final string (including those originally present) with an actual newline. 

Input

**Line 1:** A string s to manipulate.  
**Line 2:** An integer changeCount for the number of changes.  
**Next changeCount lines:** A string rawChange that manipulates the string in the format of line\_num|col\_num|to\_add, where:  
  
line\_num (integer): the 0-based index of the line to modify (after interpreting each \\n in s as an actual newline)  
col\_num (integer): the 0-based position in that line where the text should be inserted (based on the original string, before any changes)  
to\_add (string): the text to insert

Output

The manipulated string.

Constraints

Length of s ≥ 1  
1 ≤ changeCount ≤ 10  
It is guaranteed that there will not be two changes with the same position.

Example

Input

Hello world
4
0|11|!
0|5|,\n
0|7| w
0|10|\n

Output

Hello,
 w worl
d!
