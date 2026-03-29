# Langton s Ant

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/langton-s-ant)

**Level:** multi
**Topics:** Monte Carlo tree search

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league** based challenge. 

For this challenge, multiple versions of the same game are available. Once you have proven your skills on this first version, you will access a higher league and extra rules will be unlocked.  
In the first leagues, you will play on your own grid but in higher leagues, you will play on the same grid.  

Warning

In order to balance the game, the following changes have been done : 
* There is now two rounds in a game to allow players to swap their initial position. At the end, scores of the two rounds are added, the winner is the one who have the best result.
* Inputs are slighty modified : The first player of each round still receives as input \-1 \-1.  
However, the player who plays the first round receives \-2 \-2 to report to him the beginning of the second round.

  
## Objectif 

This game is inspired by the [Langton's ant](https://en.wikipedia.org/wiki/Langton%27s%5Fant).  
The game is played in two times : First, each player chooses to color tiles on the grid. Then, an ant move from the center of the grid changing the color of tiles along the way.  
The goal is to have most of tiles colored with our color. There is now two rounds : The player who plays first the first round will play in second position in the second round.  
At the end, scores of the two rounds are added, the winner is the one who have the best result. 

## Rules 

In this league, both players play on their own grid.

First, each player chooses to color tiles on the grid. Then, an ant move from the center of the grid changing the color of tiles along the way.

To move, the ant play by the following rules :  
If the ant is on a colored tile, it turns left, becomes of the tile's color, then the tile become white and the ant move forward on the next tile.  
If the ant is on a white tile, it turns right and the tile become of the ant's color, then the ant move forward on the next tile.

At the beginning, the ant has the first player's color and is centered (more precisely on the tile of coordinates (dimension /2;dimension /2)) and its direction is upward

If the ant exit the grid, the game is over.

  
Victory Conditions

* Have more colored tiles than your opponent.

Loss Conditions

* Have less colored tiles than your opponent.
* You do not respond in time or output an unrecognized command.

  
## Input 

Initial input

Line 1: The dimension of the square grid.   
Line 2: The number number\_rounds of tiles each player will choose.  
Line 3: The number path\_length of steps of the ant.  

Input for one game turn

Line 1: Two integers separated by a space opponentRow and opponentCol corresponding to the coordinates of the tile chosen by the opponent in the previous round.   

Warning : This two integers will be \-1 \-1 if you are the first player of a round and \-2 \-2 if you don't play this turn ( between the first and the second round, your answer will not be considered). You must take advantage of this input to reset data used in the first round.  

Output for one game turn

One line: Two integers separated by a space row and col corresponding to the coordinates of the tile chosen.

Constraints 

dimension\=15  
numberRounds\=20  
pathLength\=150  
Response time per turn≤300ms
