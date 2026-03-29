# Surakarta

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/surakarta)

**Level:** hard
**Topics:** Loops, Backtracking, Recursion

## Goal 

The surakarta is a traditional board game from Indonesia. Here is what the board looks like.  

  
╭───╮╭───╮  
│╭─╮││╭─╮│  
││┏┿┿┿┿┓││  
│╰╂┼┼┼┼╂╯│  
╰─╂┼┼┼┼╂─╯  
╭─╂┼┼┼┼╂─╮  
│╭╂┼┼┼┼╂╮│  
││┗┿┿┿┿┛││  
│╰─╯││╰─╯│  
╰───╯╰───╯  

  
It is played on a board of 6 by 6\. The pieces are placed on intersections or edges of the grid. To move, they follow the lines horizontally or vertically as far as they wish.  
  
\- If a piece reaches the **edge of the grid represented in bold**, It can still move forward, by doing a loop following the lines on the side of the board.  
\- A piece cannot pass through another.  
\- To capture a piece of the other player, you have to go to its position **after doing one or more loops**.  
  
Example of how to capture a piece: https://cdn.store-factory.com/www.lecomptoirdesjeux.com/media/diagsurakarta2.jpg  
  
Each piece can potentially move in 4 directions, and potentially capture an enemy piece in every direction (it can be 4 times the same piece, if different moves lead to the capture of the same piece).  
  
It is your turn. You have to find how many moves can be done to capture a piece this turn for every piece you have.  
  
If you have 3 pieces:  
3 moves of the first piece reach to capture.  
1 moves of the second piece reach to capture.  
2 moves of the third piece reach to capture.  
  
The output will be 6.  
  
For the sake of clarity, corner lines will not be in input. 

Input

**6 lines**: the state of your grid.  
X represents your pieces  
O represents the opponent pieces  
. represents an empty square

Output

The number of moves that lead to a capture this turn.

Constraints

0 < opponent pieces count < 13  
0 < your pieces count < 13

Example

Input

.O....
......
......
.X....
......
......

Output

1
