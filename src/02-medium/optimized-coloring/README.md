# Optimized coloring

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/optimized-coloring)

**Level:** medium
**Topics:** Graphs, Backtracking, Flood fill, Recursion

## Goal 

Having an empty sheet of paper divided into some zones, try to fill these zones with **as few colors as possible**, respecting the following rule : **two adjacent zones must be filled with two different colors**.  
  
A zone is made of "space" characters.   
  
For exemple :  

  
/\  
\/  

  
is not a zone, while   

  
+-+  
|1|  
\-/  

  
is one (1 space, denoted with the "1" symbol).  
  
Each ASCII character fills a "cell" of the sheet of paper : the shape of the characters have no importance, it's just aestethic.  
  
Two zones are considered **adjacent** if there is at least one pair of spaces, one from each zone, such that they are separated either horizontally or vertically by a single non-space character.  
  
Below are two examples of adjacent zones:  

  
+---+  
|   |         +---+  
|   +---+     |   |  
|   |   |     +-+-+-+  
+---+   |       |   |  
    |   |       +---+  
    +---+  

  
Below are two examples of zones which are **not** adjacent:  

  
+---+         +---+  
|   +---+     |   |  
+---|   |     +---+---+  
    +---+         |   |  
                  +---+  

  
You have to find the minimum number of colors necessary to fill all the zones. 

Input

**Line 1:** an integer w representing the width of the sheet of paper  
**Line 2:** an integer h representing the height of the sheet of paper  
**h following lines :** a string representing one line of the sheet of paper

Output

**Line 1:** an integer representing the minimum number of colors necessary to fill the sheet of paper

Constraints

w < 100  
h < 20  
  
You can find the following symbols in the input : \-, |, +, /, \\ and \_

Example

Input

11
6
+---------+
|         |
|         |
|         |
|         |
+---------+

Output

1
