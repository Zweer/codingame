# Tulips and Daisies

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/tulips-and-daisies)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax

Defeat the Boss to advance to the next league and compete against the best bots! 

# The Goal 

Plant flowers and harvest them for gold. In order to win, have more gold than your opponent does.   
  
# Rules 

## Definitions

* The game is played on a rectangular field.
* Players alternate and each turn plant one of their flowers in the field.
* When 4 or more flowers of the same type are planted in a line (vertical, horizontal or diagonal), they are harvested and the player earns gold.

Victory Conditions

* Have more gold than your opponent at the end of the game.

Lose Conditions

* Output an invalid command or don't respond in time.
* Run out of gold.
* Have less gold than your opponent at the end of the game.

# Expert Rules 

## Details

* After harvest, grass is found on the tiles.
* The field has fieldHeight rows and fieldWidth columns.
* The top-left corner has position (0,0).
* col goes to the right, row increases downwards.
* Each turn you specify where you want to plant your flower by giving row and col.

## Planting costs

It is allowed to plant your flower anywhere within the field. However, there is a cost associated with planting, which depends on the state of the tile, you want to plant in. The cost is deducted from your gold stockpile before planting the flower. You lose, if you do not have enough gold. Planting on soil is free, on grass it costs 1 gold, on rocks 5 gold and on opponents flower 10 gold. The following table presents the costs of planting your flower on different tiles graphically:   
![This example shows how you earn 7 gold.](https://github.com/WildSmilodon/Tulips-and-Daisies/blob/master/statement-images/costs.png?raw=true) 

## Harvesting flowers

The flowers are harvested according to the following algorithm. `
* for each direction (horizontal, vertical, both diagonals)  
  * count the number of adjacent flowers starting from the flower just planted in both ways
  * if the number of adjacent flowers in this direction is larger or equal to 4, all adjacent flowers in this direction are harvested.
` 

## Earning gold

* The gold earned from N harvested flowers is calculated by summing the first N numbers in the Fibonacci sequence.
* Example: when harvesting 4 flowers, the player earns 1+1+2+3=7 gold, when harvesting 6 flowers, player earns 1+1+2+3+5+8=20 gold.

# Examples 

Here is an example where the Daisy player harvests 4 flowers and earns 1+1+2+3=7 gold.   
![This example shows how you earn 4 gold.](https://github.com/WildSmilodon/Tulips-and-Daisies/blob/master/statement-images/4d-7g.png?raw=true)   
Here is an example where the Tulip player plants a tulip on grass and then harvests 4 flowers and earns 1+1+2+3=7 gold. He first pays the fee for planting on grass (1 gold) and only then earns gold from harvesting, thus turning a profit of 6 gold.   
![This example shows how you earn 4 gold.](https://github.com/WildSmilodon/Tulips-and-Daisies/blob/master/statement-images/4t-7g.png?raw=true)   
Here is an example where the Daisy player harvests 5 flowers and earns 1+1+2+3+5=12 gold.   
![This example shows how you earn 4 gold.](https://github.com/WildSmilodon/Tulips-and-Daisies/blob/master/statement-images/5d-12g.png?raw=true)   
Finally, here is an example where the Daisy player harvests 7 flowers in 2 directions and earns 1+1+2+3+5+8+13=33 gold.   
![This example shows how you earn 4 gold.](https://github.com/WildSmilodon/Tulips-and-Daisies/blob/master/statement-images/7d-33g.png?raw=true) 

# Game Input 

The program must first read the initialization data from standard input. Then, provide to the standard output one line with the location of the tile you want to plant in.

Input

Initialization input: 

Line 1: two integers fieldWidth and fieldHeight

Line 2: four integers costSoil, costGrass, costRocks, costFlower

Line 3: two strings yourFlowers and opponentsFlowers

During each turn: 

Line 1: an integer turnsLeft

Line 2: two integers yourGold and opponentGold

fieldHeight lines:  a string gridLine of length fieldWidth representing the tiles encoded by S \- soil, G \- grass, R \- rocks, T \- tulip, D \- daisy. 

Output

A single line containing row and col of the tile you want to plant in. A comment can be appended, which will be displayed.   

Constraints

8 ≤ fieldWidth ≤ 16  
8 ≤ fieldHeight ≤ 16  
You start the game with 100 gold.  
Initially, 5 to 10 percent of tiles are rocks, the others are soil.  
There are 256 turns in the game.   
 Response time first turn ≤ 1000 ms   
Response time per turn ≤ 50 ms   

Source code

The game source code is available at: <https://github.com/WildSmilodon/Tulips-and-Daisies>.   

# Tulips & Daisies

Back in the 1980s, children in school had math notebooks in which the pages were printed by a grid of squares. Ideal for playing Tic-Tac-Toe. Since playing Tic-Tac-Toe gets boing really quick, a new game was invented. It was played on the whole page of the notebook and points were scored if you got 4 in a row. The game ended when the school bell rang or when the page of the notebook was full. Tulips and daisies was inspired by this game.
