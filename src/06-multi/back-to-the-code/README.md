# Back to the Code

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/back-to-the-code)

**Level:** multi
**Topics:** Flood fill, Simulation, Distances

## The Goal

The aim of this game is to own **the largest number of cells in a grid**.

## Rules

You have two ways to claim ownership of a cell: 
* By moving onto a neutral cell (and being the only one on that cell).
* By surrounding a collection of neutral cells with your own cells.
The grid works as follows: 
* The grid is composed of 35 columns and 20 rows.
* The coordinates of the **top left** cell are (0 0).
* You can move around on the grid by specifying a target cell (X Y). You will then move **only one cell** in the direction of that target, vertically if you are on the same column, horizontally otherwise.
Each round, all players are moving at the same time. For a two-player game, the match will last at most 350 rounds (300 for three, 250 for four). Note that the game may end sooner if the game ranking cannot change no matter what happens next.

Victory Conditions

The winner is decided depending on the number of cells owned at the end of the game.

## Expert Rules

For expert CodinGamers (don't bother with this until you've really tried the rest), you can go back in time: 
* Instead of moving, you can decide to go back in time using the BACK command followed by a number of rounds. For example the output BACK 10 on round 30 will revert the game state back to what it was on round 20.
* All players are affected, their last movements and cell ownership are rolled back by the specified number of rounds.
* The number of rounds you attempt to go back in time cannot exceed 25 rounds.
* If you try to go back to before the beginning of the game, you will only go back to the first round.
* If multiple players want to go back in time on the same round, the number of rounds they want to go back are added up. In this case, it is possible to go back more than 25 rounds :)
* You can go back in time **only once** per game.
You will no longer be able to play if: 
* You try to go back in time more than once.
* The number of rounds you want to go back in time exceeds 25 rounds.

## Example

![](https://cdn-games.codingame.com/back-to-the-code/statement/0.png) 

Turn 1

Player 1 starts out on cell (3,2) and intends to draw a square. Action: 1 0

![](https://cdn-games.codingame.com/back-to-the-code/statement/1.png) 

Turn 2

Player 1 moves towards cell (1,0), but is still not there. Action: 1 0

![](https://cdn-games.codingame.com/back-to-the-code/statement/2.png) 

Turn 3

Player 1 moves towards cell (1,0), but is still not there. Action: 1 0

![](https://cdn-games.codingame.com/back-to-the-code/statement/3.png) 

Turn 4

Player 1 moves towards cell (1,0), but is still not there. Action: 1 0

![](https://cdn-games.codingame.com/back-to-the-code/statement/4.png) 

Turn 5

Player 1 arrives. Next move is to go back to the starting cell. Action: 3 2

![](https://cdn-games.codingame.com/back-to-the-code/statement/5.png) 

Turn 6

Player 1 moves towards cell (3,2), but is still not there. Action: 3 2

![](https://cdn-games.codingame.com/back-to-the-code/statement/6.png) 

Turn 7

Player 1 moves towards cell (3,2), but is still not there. Action: 3 2

![](https://cdn-games.codingame.com/back-to-the-code/statement/7.png) 

Turn 8

Player 1 has surrounded the neutral cell (1,2) and takes ownership of it.

## Note

The program must first read the initialization data from standard input. Then, **within an infinite loop**, read the contextual data from the standard input (player positions and state of the grid) and provide to the standard output the desired instructions.

## Game Input

Initialization input

Line 1: opponentCount: number of opponents (1, 2 or 3)

Input for one game turn

Line 1: gameRound: index of the current round (can help you detect back in time actions)

Line 2: 3 integers x , y , backInTimeLeft:

* ( x , y ) indicates your coordinates on the grid.
* backInTimeLeft indicates the amount of back in time actions you may still use (0 or 1).

Next opponentCount lines:  for each opponent, 3 integers opponentX , opponentY , opponentBackInTimeLeft :

* ( opponentX , opponentY ) indicates the opponent's coordinates on the grid.
* opponentBackInTimeLeft indicates the amount of back in time actions the opponent may still use (0 or 1).
* You will receive \-1 -1 0 if the opponent is no longer playing.

Next 20 lines:  for each row of the grid, one string of 35 characters indicating which player owns each cell. These characters are any of the following:

* . \-> neutral cell
* 0 \-> your cell
* 1 \-> cell of opponent 1
* 2 \-> cell of opponent 2
* 3 \-> cell of opponent 3

Output for one game turn

A single line (followed by a carriage return) specifying your desired action: 
* Move towards a cell: X Y.
* Go back in time (for expert CodinGamers): BACK followed by the number of rounds. For example, BACK 7.
  
Optionally, you may append to the line a message that will be displayed on the monitor at the bottom left of the game screen (20 characters max). For example, 3 5 I WILL WIN.

Constraints

1 ≤ opponentCount ≤ 3

1 ≤ gameRound ≤ 350

0 ≤ x, opponentX < 35

0 ≤ y, opponentY < 20

0 ≤ backInTimeLeft, opponentBackInTimeLeft ≤ 1

  
Response time per turn ≤ 100ms

## Synopsis

_“ Wait, what!?#! Mingu no! Not this button! You just released and wasted the energy needed to get you back to 1985... ”_

_“ Oops… sorry Boss! Can we repair it, Boss? ”_

_“ Gathering the 1.21 gigawatts of energy required will not be easy. Luckily for you, I created this minature temporal apparatus which gathers the positronic energy caused by the fluctuations from disturbances in the space-time continuum. All there is to do is to trace geographical zones with the device and it takes care of the rest. Do you follow, Mingu? ”_

_“ Er... not sure Boss. But you are the Boss, Boss. How can I help? ”_

_“ Comb the city with the mini-device at your wrist. It will delineate zones and accumulate energy. It will also allow you to make a small jump back in time in case of emergency. Last but not least, the device is useful for spotting what young Roger and old Roger are up to. They stole two of the devices from me and we cannot allow them to go back in time with the almanac before we do. That would be a catastrophe! ”_ 

_“ Ok Boss! But I am not sure where to go. ”_

_“ Mingu, wait! I have an idea: give me your hoverboard. We are going to program it in order to optimize your movements. ”_

_“ Programming? Oh yes, like on a computer? I have a neighbor who just bought a Macintosh last year. Are we talking about the same thing? I can try for sure... ”_

_“ Uh uh... Mingu, let's take this to an expert instead. I know someone who will be happy to do the programming for us! ”_

In case you have not guessed, you are this someone!
