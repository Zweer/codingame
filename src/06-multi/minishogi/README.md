# Minishogi

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/minishogi)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Shogi, Chess

This is a port of the board game [Minishogi](https://en.wikipedia.org/wiki/Minishogi), which is a small variant of [Shogi](https://en.wikipedia.org/wiki/Shogi).   
Click [here](https://github.com/jdermont/MiniShogi/) for the referee.   
Shogi pieces are from [Lishogi](https://lishogi.org/) and overall graphics inspired by Lishogi.  

# The Goal 

The goal is to checkmate your opponent's king. 

# Rules 

**Grid:**   
 Game is played on a 5x5 board. There can be also pieces on the players' "hands".  
Each player begins with a set of 6 pieces: King, Gold General, Silver General, Bishop, Rook and Pawn.  
**The board starting position:** 

![](https://i.imgur.com/Lj7VLOi.png)

  
* Player 0(**red**/black) has pieces at the bottom and Player 1(**blue**/white) has pieces at the top.
* For the **Player 0**, at the bottom from left are: King, Gold General, Silver General, Bishop, Rook. Pawn is at the front of the King.
* For the **Player 1**, at the top from left are: Rook, Bishop, Silver General, Gold General, King. Pawn is at the front of the King.
* Black always goes first and white goes next.
  
**Movement:**   
Each piece has its own movement:  
* **King (王,K)** moves one square in any direction (horizontally, vertically, or diagonally).
* **Rook (飛,R)** moves as many squares as desired horizontally or vertically.
* **Bishop (角,B)** moves as many squares as desired diagonally.
* **Gold General (金,G)** moves one square in any direction: horizontally, vertically, or diagonally. Except it cannot move backward diagonally.
* **Silver General (銀,S)** moves one square diagonally or one square forward.
* **Pawn (歩,P)** moves one square forward.
* **Promoted Silver General (金,+S), Promoted Pawn (と,+P)** move like Gold General.
* **Promoted Rook (Dragon,龍王,+R)** has movements of Rook and King.
* **Promoted Bishop (Horse,龍馬,+B)** has movements of Bishop and King.
  
**Promotion:**   
Whenever a piece **reaches, moves on, or moves out of** its furthest rank (row) (rank 5 for black player and rank 1 for white player), it can be promoted. Promotions are optional except for pawn, it has to be promoted when it reaches the furthest rank. 
* **Rook** promotes into **Promoted Rook (Dragon)**.
* **Bishop** promotes into **Promoted Bishop (Horse)**.
* **Silver General** promotes into **Promoted Silver General**.
* **Pawn** promotes into **Promoted Pawn**.
* **King, Gold General** cannot be promoted.
  
**Captures:**   
When a player's piece goes into a square occupied by the opponent's piece, the opponent's piece is captured and goes **unpromoted** into the player's hand. In the subsequent turns, the player may choose to drop the piece onto the board under his control.   
  
**Drops:**   
On any turn, instead of moving a piece on the board, a player may select a piece in his hand and place it **unpromoted** on any empty square on the board, under his control. There are some restrictions: 
* **Pawn** cannot be placed onto its furthest rank (row).
* **Pawn** cannot be placed onto file (column) that already contains player's unpromoted pawn.
* **Pawn** cannot deliver checkmate in the same turn. But it can do so in the subsequent turns.
* Dropped piece on the furthest rank (row) doesn't get promoted in the same turn. But it may be promoted in the subsequent turns.
  
**Check, checkmate and stalemate:**  
If player's king is under attack of opponent's piece and would be captured in the next turn, it is in **check**. The player must remove the check. If he cannot, then his king is **checkmated** and the player loses game.  
If player's king isn't in **check**, but also the player doesn't have any legal move, then it is **stalemate**, and the player also loses game.   
  
**Threefold repetition and perpetual check:**   
If the same position (the same board configuration, the same side to move, and the same pieces in hand) occurs for the third time (the repetitions need not be consecutive), the game ends and the **Player 0** loses. Except if a **King** is in check, then the checking player loses. 

# Expert Rules 

* Game lasts at most 300 rounds. If no ending game condition occurs by then, the game is draw.
* In the settings you can select western type piece set. You can also select to show [sfen notation](https://en.wikipedia.org/wiki/Shogi%5Fnotation#SFEN).

Victory Conditions

* Deliver checkmate to your opponent's king.
* Opponent doesn't have any legal moves in his turn (stalemate).
* Position repeats for the third time and opponent is Black Player (Player 0)

Loss Conditions

* Your king is checkmated.
* You don't have any legal moves in your turn (stalemate).
* Position repeats for the third time and you are Black Player (Player 0)
* You timeout, crash or give unrecognizable output.

# Game Input 

Pieces notation

First player: K \- King, G \- Gold General, S \- Silver General, B \- Bishop, R \- Rook, P \- Pawn, +S \- Promoted Silver General, +B \- Promoted Bishop, +R \- Promoted Rook, +P \- Promoted Pawn   
Second player: k \- King, g \- Gold General, s \- Silver General, b \- Bishop, r \- Rook, p \- Pawn, +s \- Promoted Silver General, +b \- Promoted Bishop, +r \- Promoted Rook, +p \- Promoted Pawn   

Initial input

First line: The id of the player(id), 0 \- first player, 1 \- second player   
Second line: boardSize: the number of rows and columns on the board, always 5. 

Input for one game turn

boardSize lines: a string of characters representing one line of the board, top to bottom. (.: empty, K: first player king, k: second player king, and so on, see Pieces notation above).  
Next line: First player's current hand, or \- if he has no pieces in the hand. Examples: \-, G, BB  
Next line: Second player's current hand, or \- if he has no pieces in the hand. Examples: \-, g, bb  
Next line: Last opponent's action or none if first turn of first player.  
Next line: actionCount for the number of legal actions for this turn.  
Next actionCount lines: a string representing a legal action.   

Output

A single line containing the coordinates where you want to play. Or random. 
* For the movement, it is columnFrom rowFrom columnTo rowTo with + for promotion. Examples: 4534, 1425+
* For the drop, it is Piece \* columnTo rowTo. Examples: G\*33, p\*24
* Output piece notation is not case sensitive.
You can also print message after space following action. Example: 4534 Take this!.   

Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.
