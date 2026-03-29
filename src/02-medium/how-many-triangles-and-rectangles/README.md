# How many triangles and rectangles?

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/how-many-triangles-and-rectangles)

**Level:** medium
**Topics:** Image processing, Ascii Art, Counting

## Goal 

Find the number of triangles and rectangles in the ASCII art picture.  
**Warning**: For the rectangles, we will only take the horizontal or vertical sides and not the diagonal sides...  
  
\* A little **rectangle** :  

+-+  
|.|  
+-+

  
\* Some little **triangles** :  

+..+-+..+-+..+....+...+---+  
|\..\|..|/../|.../.\...\./.  
+-+..+..+..+-+..+---+...+..

Input

**Line 1** : height h and width w of the ASCII art picture.  
**h following lines**: the content of the picture :  
. for empty spaces  
+ for polygon corners  
\-, |, / or \\ for strokes

Output

**Line 1**: Number of triangles  
**Line 2**: Number of rectangles

Constraints

3 <= h <= 21  
4 <= w <= 141

Example

Input

4 5
+---+
|...|
|...|
+---+

Output

0
1
