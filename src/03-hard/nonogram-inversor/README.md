# Nonogram inversor

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/nonogram-inversor)

**Level:** hard

## Goal 

**Nonograms** are also know as Hanjie, Picross or Griddlers.  
To solve one, you are given the number of contiguous cells of the same color in rows and columns.   
Progressively you can see what the pixelized picture looks like.  
  
You can check for more information: https://en.wikipedia.org/wiki/Nonogram.  
  
In this version, we have only two colors, black and white.  
You will be given the length of all black groups.  
Your work is to describe the puzzle by the length of all white groups.  
  
**Example**  

  
Input:  
─────  
4 4  
1 1  
2  
3  
4  
4  
3  
2  
1 1  
  
Looks like:  
──────────  
    1  
    1 2 3 4  
   ┌─┬─┬─┬─┐  
  4│■│■│■│■│  
   ├─┼─┼─┼─┤  
  3│ │■│■│■│  
   ├─┼─┼─┼─┤  
  2│ │ │■│■│  
   ├─┼─┼─┼─┤  
1 1│■│ │ │■│  
   └─┴─┴─┴─┘  
  
Inversor:  
────────  
    2 2 1 0  
   ┌─┬─┬─┬─┐  
  0│ │ │ │ │  
   ├─┼─┼─┼─┤  
  1│■│ │ │ │  
   ├─┼─┼─┼─┤  
  2│■│■│ │ │  
   ├─┼─┼─┼─┤  
  2│ │■│■│ │  
   └─┴─┴─┴─┘  
  
Output:  
──────  
2  
2  
1  
0  
0  
1  
2  
2         

  
Note: All puzzles have one solution that can be deduced logically. 

Input

**Line 1:** Two space-separated integers for the width and height of the grid  
**Next width lines:** length of adjacent black cells in the columns from left to right  
**Next height lines:** length of adjacent black cells in the rows from top to bottom

Output

**First width lines:** length of adjacent white cells in the columns from left to right  
**Last height lines:** length of adjacent white cells in the rows from top to bottom

Constraints

1<width<21  
1<height<21

Example

Input

5 5
1
3
2
5
1
1
1 3
3
1 1
1 1

Output

1 3
2
1 2
0
1 3
3 1
1
1 1
1 1 1
1 1 1
