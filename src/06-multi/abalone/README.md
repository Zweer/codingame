# Abalone

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/abalone)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax, Neural network

This is a port from the board game [Abalone](https://en.wikipedia.org/wiki/Abalone%5F%28board%5Fgame%29)

# The Goal 

The goal of the game is to push six of the opponent's marbles out of the board. 

# Rules 

**Game Board**  
  
The game is played on a hexagonal board. The board does not change during the game.  
 Each player starts with 14 marbles placed on opposite sides of the grid.   
  
**The coordinates of each cell are represented on the image below. White and black cells depict the initial positions of the marbles.**   

![](https://i.imgur.com/HbCb9QE.png)
  
  
The players take turns, black starts.   
On their turn, each player chooses from one to three marbles of their color that lie in a straight line and moves them one cell in a choosen direction. Each direction is labelled from 0 to 5.  
  
**The directions:** 

![](https://i.imgur.com/Y5W2Yl7.png)
  
  
The marbles can be moved only into empty cells.  
 If the direction of the move is parallel to the line of marbles, the move is called an _in-line move_.   
  
**Sumito**  
  
When the player's in-line move is blocked by enemy marbles, the player might sometimes apply a _Sumito_ move.  
If the length of player's marbles column is strictly longer than the number of enemy marbles in a consecutive line in that direction and after the enemy marbles' line there is an empty space or the end of the board, the player may still apply an in-line move and push the enemy marbles.  
If the last marble of the pushed enemy column gets pushed out of the board, the marble is then removed.  
  
**Winning**  
  
The first player that successfuly removes six enemy marbles wins. The game lasts for 350 turns. If after the last round both players removed less than six marbles, to avoid excessive amount of draws, the player that removed more marbles wins.   
 If both of the players removed the same amount of marbles, there is a draw. 

# Examples 

![](https://i.imgur.com/gQFLl5K.png)  
An example of an in-line move made by the black player.

![](https://i.imgur.com/sXSUidU.png?1)  
An example of a side-step move made by the white player.

![](https://i.imgur.com/amM2dpJ.png?1)  
An example of a Sumito move made by the white player (there are two white marbles blocked by only one black, white marbles can push the black marble.

![](https://i.imgur.com/foKkCUJ.png?1)  
An example of an another Sumito move made by the white player, who manages to remove the black's marble.

  
**Acknowledgment**

This contribution was developed for the _**Programming Programming Games**_ course, University of Wrocław, 2021.

Authored by _**Dominik Kowalczyk**_ ([@DomiKo](https://www.codingame.com/profile/cf4e1a99c35a5c4b9774dfd98702b03f5308692)), _**Bartosz Stefaniak**_ ([@magmasa](https://www.codingame.com/profile/3accc4d8154d01032b2c47d5f0e86bab6536792)), _**Michał Maras**_ ([@maras](https://www.codingame.com/profile/d98dddd75d69266df8af422c706d06b91819692)).

Supervised by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)).

# Game Input 

Initial input

First line: The id of the player(myId) - 1: white, 2: black.  

Input for one game turn

First line: Your score Opponent score   
Next 9 lines: characters representing one line of the game board's grid, top to bottom. (0: empty, 1: white, 2: black).   
Next line: five integers representing your opponent's last move (see _Output_ section for details). If this is the first turn and you're the starting player, each integer is equal to \-1.   
Next line: The number of valid moves(legalActionsCount).   
Next legalActionCount lines: five integers representing each of the legal moves (see _Output_ section for details).   

Output

A single line containing the position of the first marble and the last marble of the chosen marble column and the direction of their move.  
 Example: "2 3 3 5 4" - moving marbles from cells (2, 3), (3, 4) and (3, 5) in the direction labbeled by number 4.  

Constraints

Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 75 ms.
