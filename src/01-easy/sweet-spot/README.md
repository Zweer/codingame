# Sweet spot

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/sweet-spot)

**Level:** easy
**Topics:** Chebyshev distance

## Goal 

The aim of this puzzle is to simulate the impact of the shock wave of bombs on a square grid. Display the greatest intensity of shockwaves felt at each cell after the bombs explode.  
  
The grid initially contains cells labeled 0 along with several bombs of type A, H, or B. However, in some cases, the place may already have felt the effect of other bombs before the grid bombs exploded. In this case the number of the cell will be different from 0 as soon as the grid is given.  
  
The three bombs have different explosion patterns. Consider the following generic configuration, where the X will be replaced by the different types of bombs. Note that for each bomb, **the bomb's location is not replaced by a number**.  

000000000  
000000000  
000000000  
000000000  
0000X0000  
000000000  
000000000  
000000000  
000000000  

  
For the A\-bomb:  

000000000  
011111110  
012222210  
012333210  
0123A3210  
012333210  
012222210  
011111110  
000000000  

  
For the H\-bomb:  

000000000  
055555550  
055555550  
055555550  
0555H5550  
055555550  
055555550  
055555550  
000000000  

  
For the B\-bomb:  

000000000  
000010000  
000020000  
000030000  
0123B3210  
000030000  
000020000  
000010000  
000000000  

  
Unlike the other bombs, the B\-bomb will not explode unless it is within the shockwave of another exploding bomb. 

Input

¤ **First line**: An integer N representing the size of the square grid  
¤ **The following N lines**: Strings representing each line of the grid

Output

¤ **N lines**: Strings representing each line of the grid after the bombs explode. If two effects from two different bombs are felt on a square, the stronger effect is recorded on the square

Constraints

¤ 1 ≤ N ≤ 25  
¤ There are only three types of bomb: A, B, H  
¤ There may be no explosion

Example

Input

15
000000000000000
A00A0000000000A
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
0000000A0000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
A000000000000AA

Output

333332100001233
A33A3210000123A
333332100001233
222222100001222
111111100001111
000011111110000
000012222210000
000012333210000
0000123A3210000
000012333210000
000012222210000
111111111111111
222100000012222
332100000012333
A321000000123AA
