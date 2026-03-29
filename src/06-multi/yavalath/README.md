# Yavalath

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/yavalath)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Opening Book

This is a port from the board game [Yavalath](http://cambolbro.com/games/yavalath/)

# The Goal 

 The goal of the game is to make a line of 4 without making a line of 3 beforehand.  
 Click [here](http://cambolbro.com/games/yavalath/) or [here](https://boardgamegeek.com/blogpost/2814/yavalath-evolutionary-game-design) for more detailed rules.   

# Rules 

**Grid:**   
 Game is played on an hex grid. Grid size will always remain the same.  
  
**The grid coordinates are represented in the image below:** 

![](https://i.imgur.com/WhlmAmX.png)
  
  
**Resolution of a turn:**   
  
 A bot must output the coordinates of the hexagon that he wants to play. Once the output is done, the hexagon at those coordinates will be filled.  
  
  
**Output**  
  
 If the coordinates: 
* Are outside of Hex grid, the game will end and the other player will win.
* Are inside but the hexagon at those coordinates is already filled, the game will end and the other player will win (exception if is player 2 first turn, see expert rules).
* If those coordinates result in a line of 4, then the player win.
* If those coordinates result in a line of 3, then the other player win.

# Expert Rules 

 On player 2 first turn, he has a choice to either play normally or to replace opponent first move with his own(steal player 1 first move), this will replace the hexagon color by your color.  
  
 Github repo can be found [here](https://github.com/MultiStruct/Yavalath/). 

# Examples 

**What is a line**

  
**The image below shows all possible directions that you can make a line:** 

![](https://i.imgur.com/24dwfx6.png)

* Red line: Represents a line of 4
* Green line: Represents a line of 3
* Blue line: Represents a line of 2
* Black line: Represents a line of 3
* Pink line: Represents a line of 4
* Yellow line: Represents a line of 4

**What is a winning move**

  
**The image below shows how to win a game:** 

![](https://i.imgur.com/jzNJvLx.png)

* **(2,2)**: Creates a line of 4 { **(0,0), (1,1), (2,2), (3,3)** }
* **(4,2)**: Creates a line of 4 { **(4,3), (4,2), (4,1), (4,0)** }
* **(5,3)**: Creates a line of 5 { **(3,3), (4,3), (5,3), (6,3), (7,3)** }
* **(5,4)**: Creates a line of 4 { **(3,2), (4,3), (5,4), (5,5)** }
* **(4,4)**: Creates a line of 4 { **(4,3), (4,4), (3,5), (2,6)** }
* **(2,3)**: Creates a line of 4 { **(4,3), (3,3), (2,3), (1,3)** } and also creates a line of 3 { **(2,3), (2,4), (1,5)** } but, since both lines were made one same turn the player wins.

**What is a losing move**

  
**The image below shows how to lose a game:** 

![](https://i.imgur.com/wEVZTCz.png)

* **(2,3)**: Creates a line of 3 { **(2,3), (3,3), (4,3)** }
* **(2,2)**: Creates a line of 3 { **(2,2), (3,3), (4,4)** }
* **(4,2)**: Creates a line of 3 { **(4,2), (4,3), (4,4)** }
* **(4,5)**: Creates a line of 3 { **(3,3), (4,4), (4,5)** }
* **(3,4)**: Creates a line of 3 { **(3,3), (3,4), (2,5)** }
* **(0,6)**: Plays a move on occupied cell, the other player wins.

**What is a steal**

  
**On player 2 first turn, he has the opportunity to play on the square the opponent played, and be the owner of it, the image below shows this:** 

![](https://i.imgur.com/QemBt4S.png)

* **(4,4)**: First player plays on **(4,4)**
* **(4,4)**: Second decides to steal his move and also plays on **(4,4)**

  
Victory Conditions

* Make a line of 4 or 5 before making a line of 3 beforehand.

Loss Conditions

* Make a line of 3 hexes of same color.
* You do not respond in time or output an unrecognized command.

# Game Input 

Initial input

First line: The id of the player(myId) 

Input for one game turn

First line: count: the number of rows on hex grid.   
Next count lines: characters representing one line of your grid, top to bottom. (0: empty, 1: yours, 2: opponent).   
Next opponentX: the x coordinate of opponent move (-1 on first turn for first player).   
Next opponentY: the y coordinate of opponent move (-1 on first turn for first player).   

Output

A single line containing the coordinates you want to play. Example "4 4".  
 You can also print messages by doing the following. Example: "4 4 This is a message/This is another message". The "/" will create a new line between messages.   

Constraints

 Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.
