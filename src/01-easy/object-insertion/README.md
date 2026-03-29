# Object Insertion

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/object-insertion)

**Level:** easy
**Topics:** Loops, 2D array

## Goal 

You have an object to insert into a partially filled 2D grid.  
  
You need to count the number of ways the object can fit into the empty areas of the grid.  
If there is one and only one way, you also must display the grid with the inserted object.  
Flips and rotations are NOT allowed on the object.  
  
The object is represented as a series of strings, in which dots "." are empty areas and stars "\*" are physical parts of the object.  
  
**Example:**  

*.  
**  
.*

  
The grid is provided in a similar fashion, dots "." are empty areas and number signs "#" are filled areas of the grid.  
  
Notes:  
\- The representation of the object never presents empty rows or columns.  
\- The dimensions of the object are always less than or equal to the dimensions of the grid. 

Input

**First line:** Two integers a and b separated by a space, denoting the numbers of rows and columns of the representation of the object.  
**Next a lines:** Line of length b composed of the characters "." and "\*".  
**Next line:** Two integers c and d separated by a space, denoting the numbers of rows and columns of the grid.  
**Next c lines:** Line of length d composed of the characters "." and "#".

Output

**First line:** Number of ways to insert the object in the grid.  
If this number equals **1**:  
**Next c lines:** Line of length d composed of the characters ".", "#" and "\*", showing grid state after object insertion.

Constraints

1 ≤ a ≤ c ≤ 10  
1 ≤ b ≤ d ≤ 10

Example

Input

3 2
.*
**
.*
8 10
#..#######
#.##..####
###..##...
####.#####
##.#######
##......##
##.....###
########..

Output

1
#..#######
#.##*.####
###**##...
####*#####
##.#######
##......##
##.....###
########..
