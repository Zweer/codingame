# Hex

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/hex)

**Level:** multi
**Topics:** Monte Carlo tree search, Neural network, Bitboarding

# The Goal 

Connect your sides: if you are red, create a path that connect both red sides. If you are blue, connect blue sides. 

# Rules 

Players alternately place a stone, on any empty cell. Once placed, a stone cannot be removed. 

Board has hexagonal cells, and is rhombus shaped. It has a side length of 11. 

A path consists of a full path of adjacent stones, touching both sides of player color. 

## Swap move

First player has a big advantage, so to counter that, the "pie rule", or "swap" move can be invoked. 

It works as follows: 

* Turn 1: red (first player) places a stone
* Turn 2: blue (second player) thinks first player's move is too strong, he outputs swap-pieces to steal first move
* Red's first move becomes blue's first move, and is mirrored to stay equivalent (e.g. if red played near a red side, it is mirrored to go near blue side. Red a2 becomes blue b1).

Victory Conditions

* You connected your sides.

Defeat Conditions

* Your opponent connected his sides (thus you cannot connect yours)
* You provide invalid move (cell already played, invalid cell, trying to swap while it is not second turn)
* Your program does not provide a valid command in time.

## Details

* Red plays first, then blue
* Red connects top to bottom, blue connects left to right
* Swap move can only be played by blue on turn 2, to mirror first move
* Mirror works like this: b1 becomes a2, c3 becomes c3 (\[row, col\] becomes \[col, row\])

## Coordinates system 

* Cell a1 is at top left
* first line is a1, b1, c1, ...
* first column is a1, a2, a3, ...
* letters are always lowercase

## External resources 

* [HexWiki](https://www.hexwiki.net/index.php/Main%5FPage) \- A wiki about the game of Hex
* [HexWorld](https://hexworld.org/) \- List of resources about Hex: empty board to simulate game, websites to play Hex

# Game Input 

The program must first read the initialization data from standard input. Then, provide to the standard output one line with the move to play.

Initial input

Line 1: boardSize, size of the board, and playerColor, your color, red or blue. 

Turn input

First line: lastMove played, empty if no move played yet, or cell coordinates like d4, or swap-pieces 

Next boardSize lines: Rows of the board, .for empty cell, r for a red stone, b for a blue stone. Example of a single row: "r r . . r b b r r . . b r".

Output

A single line containing the move to play, which can be cell coordinates like d4, or for turn 2 only, swap-pieces. You can add display a message, visible by everyone, by adding it next to your move like: d4 Hello !.   

Constraints

boardSize \= 11  
  
Allotted response time to output is ≤ 100 ms.   
First turn allotted time is 1 s. 

Examples

Initial input and turn 1:

11 red  
empty  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  

Output

You are red (first player), board is empty (so no last move), you play a2  
a2 

Turn 3:

d4  
. . . . . . . . . . .  
r . . . . . . . . . .  
. . . . . . . . . . .  
. . . b . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  

Output

Opponent played d4\. You play e2.  
e2 

Alternative turn 3, opponent swaps your first move:

swap-pieces  
. b . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  

Output

Opponent swapped. You play e2.  
e2 

Other example, you are blue, initial input and turn 2:

11 blue  
d5  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . r . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  
. . . . . . . . . . .  

You want to swap, you play:

swap-pieces  
Now, you removed red stone, and placed your blue stone on e4 (mirror of d5). 

# Story of Hex

Hex is pretty new. Created, or I should say "discovered" because the game is so simple, in 1942 by Piet Hein, and discovered again by John Nash in 1948, independently or not, we will never know. 

The game is also called "Polygon", "Nash Hex", or "Con-tac-tix". The latter would make it easier to find on search engines, but... never mind. 

Hex is very easy with its single rule, and allows children to play from an early age, and deep enough to be played for years, while learning new things with every game.
