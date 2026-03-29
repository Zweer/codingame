# Yinsh

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/yinsh)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax

This is a port from the board game [Yinsh](https://en.wikipedia.org/wiki/YINSH)   
Click [here](http://www.gipf.com/yinsh/rules/rules.html) for more detailed rules.   
Click [here](http://www.gipf.com/yinsh/notations/notation.html) for the notation system.   
Click [here](https://github.com/MultiStruct/Yinsh) for the referee.  

# Rules 

* ### Pieces:  

  * Each player has 5 rings.
  * There is a pool of markers with a total of 51 markers available.
* ### Goal:  

  * The goal of the game is to remove 3 of your own rings. To remove 1 ring, you must form a row of 5 markers.
* ### Resolution of a turn:

  * **First turn:**  
    * On the first turn you are free to choose whether you want to receive legal moves or not, to do this you simply have to output "yes" or "no".
  * **Placement phase:**  
    * On this phase, you must place your rings, the white player goes first, black follows, this is done until all the rings from both players are in play (10 rings total).
    * Black player has an optional action on his first placement, he can choose to "STEAL" white move, this will replace white first ring by a black ring, to do this you simply need to output "STEAL".
  * **Movement phase:**  
    * On this phase, the player must move a ring.
    * Once a ring has moves, a marker of its color will be placed in its position before the move.
    * The move of the ring must be done on a straight line.
    * The move must end on an empty cell.
    * A ring can jump over N empty spaces.
    * A ring can jump over N markers as long as they are lined up.
    * A ring can jump over N empty space and N markers as long as they are lined up, once the line of markers end, the ring cant go further.
    * A ring can not jump over rings.
  * **Flipping phase:**  
    * If you moved and didn't jump over any markers, this phase won't happen.
    * If you jumped over markers, all the markers that have been jumped over are flipped, that is, all white markers become black and all black markers become white.
    * The marker that has been placed on movement will not be flipped.
  * **Removal phase:**  
    * Once you get a row of 5 markers of your own color (this row must be done in a straight line), you must remove them.
    * The markers removed are added back to the markers pool
    * After the markers are removed, you must also remove a ring.
    * If you form a row of more than 5 markers, you must choose which markers to remove.
    * It is possible to form 2 (or more) rows of 5 markers with only 1 move, if they don't intersect, you must remove all those rows, if they do intersect, you must choose which markers to remove.
    * If you form a row of 5 markers for your opponent, he will remove these markers and a ring, before his move, he may choose which markers and ring to remove.
    * If you form a row for you and a row for your opponent, you will remove yours as normal.
    * If you have 2 removed rings and have formed 2 rows of rings, you must only remove 1 row, because you only need to remove one more ring to win.
  * **End phase:**  
    * The game ends once a player removes 3 rings (form 3 rows of 5 markers), this will make the player win.
    * If both players have 2 rings removed and you make a row of 5 of your markers and a row of 5 of enemy markers, you will win, because you will remove the markers first
    * If all markers are placed before any player removes 3 rings, the game will end, the player with more removed rings win, if both have the same number of removed rings, the game will end in a draw
* ### Output notation:

  * To indicate a cell on the board, you must first output the letter (indicates the vertical row), followed by a digit (horizontal row).
  * You must put an hyphen ("-") between the coordinates of a move, example ("f2-f5").
  * To indicate a row, you must output the first marker and the last, example ("e4-i4") or ("i4-e4"), order does not matter
  * To indicate a remove of a ring you must use an "x", example ("xe4-i4xg2") this would remove the markers placed on e4 up to i4 and remove the ring placed at g2.
  * To separate moves you must use a ";", example ("h3-h5;xe4-i4xh5"), this will move ring from h3 to h5, remove row e4 up to i4 and remove the ring at h5.
  * You can start a turn by having to remove and then move a piece, example("xg2-g6xk7;d1-c1")
* ### Grid:

  * Game is played on an hex grid. Grid size will always remain the same.
  * The grid coordinates are represented in the image below:  
  ![](https://cdn-games.codingame.com/community/1540478-1590084104776/b93ce5cf27d20f1483ad6d12d2ecadfa0f8c9469e5fc346d749d13c011edc03d.png)

# Examples 

### What is a line

  
**The image below shows all possible directions that you can make a line:** 

![](https://cdn-games.codingame.com/community/1540478-1590084104776/ca8febc2b2b347300402b834b8faca93ba6e158a6052aa321f543315e9eeff96.png)

* Red line: Represents a line of 4
* Yellow line: Represents a line of 5
* Blue line: Represents a line of 5
* Pink line: Represents a line of 2
* Black line: Represents a line of 5
* Green line: Represents a line of 5

### Placement phase moves:

  
![](https://cdn-games.codingame.com/community/1540478-1590084104776/35f7d0b178ef69037749473a0b5a3b39bc3ba24e5e033adb59d42938be55c8fa.png)

* **(c6)**: First player plays on **(c6)**
* **(steal)**: Second decides to steal his move so he puts a ring there**(steal)**
* **(j6)**: First player plays on **(j6)**
* **(b6)**: Second player plays on **(b6)**

**Movement moves**

  
![](https://cdn-games.codingame.com/community/1540478-1590084104776/c2a0b5357c6f05866ba01c2e65604dbfb417ef271d29043c9e7ab3da00fd3ca2.png)

* **(b3-c3)**: Places a marker at **(b3)** and moves the ring at **(b3)** to **(c3)**.
* **(h5-j5)**: CPlaces a marker at **(h5)**, moves the ring at **(b3)** to **(j5)** and flips the marker that has been jumped over **(i5)**.

**Movement with removal moves**

  
![](https://cdn-games.codingame.com/community/1540478-1590084104776/e13af2d26fceb68e5d014706c8759d4e46fdd00f14d382be518ea5d3ea1b298f.png)

* **(h7-c7;xh5-h9xi9)**: Places a marker at **(h7)**, moves the ring at **(h7)** to **(c7)**, flips the marker that has been jumped over **(d7)**, removes the markers from **(h5)** to **(h9)** and removes the ring at **(i9)**.
* **(f7-f2;xd4-h4xf2)**: Places a marker at **(f7)**, moves the ring at **(f7)** to **(f2)**, flips the markers that have been jumped over **(f5-f3)**, removes the markers from **(d4)** to **(h4)** and removes the ring at **(f2)**.

**Remove move remove**

  
![](https://cdn-games.codingame.com/community/1540478-1590084104776/b156b4aaba1f9a94f1d9ff1d63a6c26f6ed6b4a5efe1fbe7c3d7fe83d610c89b.png)

* **(xe7-i11xd9;i7-i11;xi6-i10xh4)**: Removes the markers from **(e7)** to **(i11)**, removes the ring at **(d9)**, places a marker at **(i7)**, moves the ring at **(i7)** to **(i11)**, flips the markers that have been jumped over **(i8-i10)**, removes the markers from **(i6)** to **(i10)** and removes the ring at **(h4)**.

  
Victory Conditions

* Remove 3 rings, this can be done by removing 3 rows of 5 markers.
* Have more rings removed before all markers are used.

Loss Conditions

* You don't have legal moves.
* You don't remove a row of 5 markers on your turn.
* You don't respond in time or output an unrecognized command.

# Game Input 

Initial input

First line: The id of the player(myId) 

Input for one game turn

First line: count: the number of rows on hex grid.   
Next count lines: characters representing one line of your grid, left to right(viewer perspective). (.: empty, R: your ring, S: your marker, r: enemy ring, s: enemy marker).   
Next actionCount: the number of legal actions for this turn.   
Next actionCount lines: string represting the action.   

Output

A single line containing the action you want to do. Example "a2-a3", to display messages you need to output the action followed by MSG message, example "a2-a3 MSG message".  
  
Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.
