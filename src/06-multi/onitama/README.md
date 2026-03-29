# Onitama

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/onitama)

**Level:** multi
**Topics:** Minimax, Uncategorized, Classic board games

# The Goal 

The goal is to reach the opponent shrine with your master or to capture the opponent master. 

# Rules 

Onitama is played on a 5x5 board. Each player has 1 master and 4 students. The players have to protect a shrine, which is at the starting cell of their master. The game will end as a tie, if no player succeeds within 200 turns.  
  
**Cards**  
Each player has 2 cards. A 5th card is in between both players. When a player uses one of his cards, he places it in the center and gets the other card from the center in return.   
A card gives a set of 2 to 4 possible move actions.   
The card placed in the center will be rotated by 180 degrees. This gives each move a direction such as "forward", which translates to "up" or "down" depending on the player.   
  
**Moving units**  
To move a unit, a player selects one of his cards. He then chooses a move pattern defined by the card and applies it to any of his own figures.   
The destination field must either be free or occupied by an opponent. The opponent on that cell will then be eliminated from the game.   
If there is no valid move, a player can PASS a card of his choice, effectively exchanging it with the center card without moving any unit. 

# Expert Rules 

You can find the sourcecode of the game on <https://github.com/eulerscheZahl/onitama> 

# Game Input 

Initial input

In the first turn you are given your playerId, which is 0 or 1.

Input per turn

Line 1 - 5: the current board. A line consists of 5 characers. The characters can be: 

* .: empty cell
* W: the master of player 0
* B: the master of player 1
* w: a student of player 0
* b: a student of player 1

Line 6 - 10: the cards in use. A card is defined by: 

* owner: 0 or 1 for the player, \-1 for the card in the center
* cardId: the id of the card
* dx1: the x movement of the first action
* dy1: the y movement of the first action
* dx2: the x movement of the second action
* dy2: the y movement of the second action
* dx3: the x movement of the third action
* dy3: the y movement of the third action
* dx4: the x movement of the fourth action
* dy4: the y movement of the fourth action
Note: if both dx and dy are 0, it does not denote a valid move (this is done to provide a valid code stub).   
The current rotation of the card is addressed in the input: the dx and dy values of the next player using the card are given. When the card is played, both values will be multiplied by \-1. 

Line 11: actionCountthe number of possible actions

Next actionCount lines: cardId move denoting a valid move

Output

A single line cardID MOVE message   
MOVE can be either a movement, giving source and destination cell (e.g. A2B3 will move the figure from A2 to the cell B3) or PASS to perform no action. Message is a text to display next to the avatar of the player.   

Constraints

Allotted response time to output is ≤ 50 ms.

**Asset sources:**   
<https://craftpix.net/freebies/wizard-character-free-sprite/>   
<https://craftpix.net/freebies/knight-character-free-sprite/>   
<https://wallpaperaccess.com/japanese-dark>   
<https://gooloc.com/creative-scroll-paper-background-vector-set-12/>
