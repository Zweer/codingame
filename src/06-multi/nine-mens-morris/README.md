# nine men's morris

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/nine-mens-morris)

**Level:** multi
**Topics:** Minimax

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **Community Contribution** game. 

For this challenge, two leagues are available. There are no rule or game changes between the leagues. 

Nine men's morris is a classical strategic board game, like checkers or chess. More information on [Wikipedia](https://en.wikipedia.org/wiki/Nine%5Fmen%27s%5Fmorris). 

## Goal 

The game is based on a grid with 24 fields organized on X-axes A..G and Y-axes 1..7   
  
![Board](https://github.com/bindstone/nine-mens-morris/raw/master/config/board1.png)   
  
In Debug the field positions are shown on the board.  
  
The game is played in 3 phases:  
1. **Placing** Each player has 9 stones. On each turn a player place one of his stones on a vacant field.
2. **Moving** When all 18 stones are placed, the player can move one stone/round to an adjacent vacant field.
3. **Flying** Once a player has only three stones left, he can move a stone to any vacant position on the board and not just to an adjacent vacant field.
  
**Capture**  
When a player forms a mill by placement or movement, he must take an opponent stone. A mill means three stones from the player forms a horizontal or vertical line.  

![mill_horizontal](https://github.com/bindstone/nine-mens-morris/raw/master/config/mill1.png) ![mill_vertical](https://github.com/bindstone/nine-mens-morris/raw/master/config/mill2.png) 

The order to take a stone is first only opponents stones not connected in a mill. When all opponent stones are connected in a mill, the player can take any stone from the opponent   
  
**Winning**  

The player who takes all but 2 stones from the opponent or prevents the opponent to do a legal move next turn, wins.

**Draw**  

After 200 turns when no player has won, the game is declared as draw.

## Commands 

A separator "**;**" is used between action and fields.   
  
**Place stone**

PLACE; field1   
_PLACE_: Command to place a stone.  
_field1_: Field on the board to place the stone. It must be vacant.  
_example_: PLACE;A1  
  
PLACE&TAKE; field1; field2   
_PLACE&TAKE_: Command to place a stone with mill. This command must be used when placing and forming a mill.  
_field1_: Field on the board to place the stone. It must be vacant.  
_field2_: Field on the board with the opponent's stone to take.  
_example_: PLACE&TAKE;A1;D1 

  
**Move stone**

MOVE; field1; field2  
_MOVE_: Command to move a stone.  
_field1_: Field on the board containing the stone the player wants to move.  
_field2_: Field on the board to move the stone to. It must be a vacant and adjacent field.  
_example_: MOVE;A1;D1  
  
MOVE&TAKE; field1; field2; field3   
_MOVE&TAKE_: Command to move a stone with mill. This command must be used when moving and forming a mill.  
_field1_: Field on the board containing the stone the player wants to move.  
_field2_: Field on the board to move the stone to. It must be vacant and adjusting to field1.  
_field3_: Field on the board with the opponent's stone to take.  
_example_: MOVE&TAKE;A1;D1;D2 

  
**Flying**

MOVE; field1; field2  
_MOVE_: Command to move a stone.  
_field1_: Field on the board containing the stone the player wants to move.  
_field2_: Field on the board to move the stone to. It can be any field on the board but it must be vacant.  
_example_: MOVE;A1;D1  
  
MOVE&TAKE; field1; field2; field3   
_MOVE&TAKE_: Command to move a stone with mill. This command must be used when moving and forming a mill.  
_field1_: Field on the board containing the stone the player wants to move.  
_field2_: Field on the board to move the stone to. It can be any free field on the board.  
_field3_: Field on the board with the opponent's stone to take.  
_example_: MOVE&TAKE;A1;D1;D2 

  
## Game Input 

Initialization Input

First line playerId IntInteger value for playerId (0,1) 

Next line fields Intnumber of fields (24) on the board 

Next X lines (fields) neighbors StringOne field per line in in format: field ":" and it's adjusting fields separated with ";" as example: A1:A4;D1 
  
  
Input for one game turn

First line opMove StringLast move of the opponent. In case of no move yet done (first player on first move), it returns - 

Next line board StringThe current board listed as: field and state(0:Player0 | 1:Player1 | 2:Empty) in format field: stateseparated by ";" in single string. 

Next line nbr intNumber of valid commands provided as input. 

Next X lines (nbr) command StringOne command per line in in format COMMAND and the corresponding fields separated with ";" as example: PLACE;A1 

  
Output for one game turn

Line 1: command StringOne single line containing one COMMAND and the corresponding fields separated with ";" 

  
Victory Conditions

* Take an opponent stone and your opponent has only 2 stones on the board.
* Block all of opponents stones, to do a valid move.

Loss Conditions

* Not responding in time (50ms).
* Provide an invalid command.
* Provide an invalid move or field (invalid stone selected, invalid destination field provided).
* Capture a wrong stone, or not capturing when forming a mill.

  
If after 200 moves no one has won, the game is declared a draw.
