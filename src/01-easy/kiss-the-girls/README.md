# Kiss the girls

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/kiss-the-girls)

**Level:** easy

## Goal 

At an HxW rave, Bob wants to kiss as many girls as possible without his odds of catching monkeypox exceeding 40%. The chances of catching monkeypox from any given girl at position (x,y) are min(x, y) / (x^2 + y^2 + 1). 

Input

**Line 1:** H W  
**Next H lines:** The grid values (G indicates a girl), where (0,0) is the upper left corner.

Output

The maximum number of girls Bob can kiss.

Constraints

4 ≤ H,W ≤ 50

Example

Input

6 6
G....G
.G..G.
..GG..
..GG..
.G..G.
G....G

Output

8
