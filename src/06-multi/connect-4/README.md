# Connect 4

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/connect-4)

**Level:** multi
**Topics:** Minimax

# The Goal 

 The aim of this game is to connect at least 4 of your chips in any direction. 

# Rules 

 The game takes place in a 7x9 board (7 Rows, and 9 Columns).  
 Each player takes turns to drop chips into one of the columns.  
  
 The game works as follows: 
* A player gets full state of the board as input.
* The player chooses a column to drop their chip in (outputs a single integer in range \[0,8\])
* The chip falls in that column of the board and settles in the bottom most empty cell.
**Note:**  
 There are 9 columns, indices are \[0,8\].  
 0 => left most column.  
 8 => right most column.   
  
**The STEAL move for the second player: (optional)**  
* The second player can play "STEAL" for their first action.
* This action does not place a new chip on the board but will convert the opponent's one and only existing chip into the second player's own chip.
* This action is available only to the second player, and only for their first action.
* An example is illustrated below  

| ![Img: First player's action](https://github.com/AshKcg/cg-multi-connect4/raw/master/config/board250-1.jpg) | ![Img: Second player's action](https://github.com/AshKcg/cg-multi-connect4/raw/master/config/board250-2.jpg) |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| First player placed a chip inthe middle column.                                                             | Second Player used "STEAL"and converted the existing chip.                                                   |
* The second player can output either the word STEAL or the integer \-2 for this action.

Victory Conditions

* At least 4 of your chips are connected in any one direction (horizontal, vertical, or diagonal).

Defeat Conditions

* Your program does not provide a command in the allotted time or one of the commands is unrecognized.
* It chooses a column which is already filled, or, not in range i.e. not in \[0,8\].

  
### 🐞 Debugging tips

* Append text with a preceding space after your output and that text will appear below your player's name. Longer messages will be shown in lines of 15 characters.
* Press the gear icon on the viewer to access extra display options.
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time.
  
# Game Input 

The program must first read the initialization data from standard input. Then, within an infinite loop, read the contextual data from the standard input and provide to the standard output one line with the index of the chosen column.

Initialization Input

One line: 2 integers myId, oppId. One of them will be 0 and the other will be 1. myId will be 0 for first player and 1 for second player. 

Input for one game turn

 First Line: integer turnIndex. Index of the current turn. As the game progresses, first player receives 0,2,4,... and second player receives 1,3,5,....

  
 Next 7 lines: A string boardRow representing one row of the board containing 9 characters (one character per column) with '.' for empty cells, '0' for cells with first player's chips, and '1' for cells with second player's chips. The rows are given one by one from top to bottom.

  
Next line: integer numValidActions: the number of valid actions available to your bot (equal to the number of unfilled columns in the board, plus one for "STEAL" if it is second turn of the game).

  
Next numValidActions lines: 1 integer action: one valid action (index of an unfilled column, or, -2 for STEAL in the second turn of the game).

  
Next line: integer oppPreviousAction: the column index chosen by the opponent in the previous turn (first player gets \-1 at the beginning, and \-2 if the opponent used STEAL).

Output

A single integer the index of the column to drop the chip in. (Optional: If it is the second turn of the game (turnIndex == 1), then the second player can output STEAL or -2)   

Constraints

0 <= turnIndex < 64. (63 cells(7\*9), and one STEAL turn if used)  
1 <= numValidActions <= 10. (9 cols, and one STEAL in second turn for second player)  
 Response time per turn ≤ 100 ms.  
 Response time for the first turn <= 1000 ms. 

The source code of this game is available on [GitHub](https://github.com/AshKcg/cg-multi-connect4/).
