# Spring Challenge 2021

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/spring-challenge-2021)

**Level:** multi
**Topics:** Graphs, Minimax

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven yourself against the first Boss, you will access a higher league and extra rules will be available.  
  
Starter AIs are available in the [Starter Kit](https://github.com/CodinGame/SpringChallenge2021/tree/main/starterAIs). They can help you get started with your own bot. 

_The theme and game for this challenge are strongly inspired by **Hjalmar Hach**'s excellent board game [Photosynthesis](https://blueorangegames.eu/en/games/photosynthesis/)._ 

_Tutorial video by **Gaurav Sen**: <https://youtu.be/gZMdOiqchDk>_ 

## Goal 

End the game with more **points** than your opponent. 

![](https://static.codingame.com/servlet/fileservlet?id=61574189838986) 

The game takes place in a **forest**, in which gentle wood spirits reside. Their job is to make sure trees complete their **lifecycle**.   
Two wood spirits have started to compete over which one is the most efficient. 

Grow trees at strategic locations of the forest to maximize your points. 

## Rules 

Each player embodies a **wood spirit**. The game takes place on a hexagonal grid representing the **forest**. 

The game is played over several rounds called **days**. Each day can be made up of several game **turns**. On each turn, both players perform one action simultaneously. 

In this league, there is only 1 day. 

### Forest

The forest is made up of 37 hexagonal cells, arranged to form a larger hexagon. 

Each cell may contain a **tree**. Each tree is owned by one of the players. 

Each cell has a richness which can be: 
* 1 for low quality soil.
* 2 for medium quality soil.
* 3 for high quality soil.

### Days

At the start of each day, players receive **sun points**.  
Then, players take **actions** by spending their sun points.  
The day ends when both players stop taking actions.  
More information on sun points and actions further down. 

### Sun Points

Helping the wood spirits are **lesser spirits** hiding among all the trees.  

The forest's lesser spirits will harvest **sun points** from each tree.  
The points will be given to the **owner** of the tree. 

In this league, you gain 3 sun points per tree. 

![](https://static.codingame.com/servlet/fileservlet?id=61574060405023) 

_A sun point_ 

### Actions

After collecting sun points, both players take simultaneous turns performing one of two possible actions.   
As long as you have enough sun points, you can take any number of actions. 

The possible actions are: 
* COMPLETE: Command a tree to complete its lifecycle. This removes the tree from the forest and scores you points. More information about points further down.
* WAIT: Spend the rest of the day asleep. For this league, when both players are asleep, the game ends.

### Complete action 

Completing a tree's lifecycle requires 4 sun points.  

The forest starts with a nutrient value of 20.  
Completing a tree's lifecycle will award you with as many points as the current nutrient value + a bonus according to the richness of the cell:  
* 1: +0 points.
* 2: +2 points.
* 3: +4 points.
Then, the nutrient value is decreased permanently by 1. 

### ⛔ Game end

For this league, the game lasts **1 day**. 

Players gain an extra 1 point for every 3 sun points they have at the end of the game.

If players have the same score, the winner is the player with the most trees in the forest. Note that a seed is also considered a tree.

Victory Conditions

* The winner is the player with the most **points**.

Defeat Conditions

* Your program does not provide a command in the allotted time or it provides an unrecognized command.

  
### 🐞 Debugging tips

* Hover over a cell to see extra information about it
* Append text after any command and that text will appear next to your wood spirit
* Press the gear icon on the viewer to access extra display options
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time

## Technical Details 

* Players start the game with size 3 trees placed randomly on the grid.
* If both players complete a lifecycle on the same turn, they both receive full points and the nutrient value is decreased by two.
* The nutrient value cannot drop below 0.
* You can check out the source code of this game [on this GitHub repo](https://github.com/CodinGame/SpringChallenge2021).

## Game Protocol 

Initialization Input

First line: numberOfCells equals 37.  
Next numberOfCells lines: 8 space-separated integers: 
* index for the cell's index.
* richness for its richness.
* 6 neigh variables: _Ignore for this league._

Input for One Game Turn

First line: An integer day: the current day. Equals 0 for this league.  
Next line: An integer nutrients: the current nutrient value of the forest.  
Next line: 2 space-separated integers: 
* mySun: your current sun points.
* myScore: your current score.
Next line: 3 space-separated integers: 
* oppSun: your opponent's sun points.
* oppScore: your opponent's score.
* oppIsWaiting: equals 1 if your opponent is asleep, 0 otherwise.
Next line: An integer numberOfTrees for the current number of trees in the forest.  
Next numberOfTrees lines: 4 space-separated integers to describe each tree: 
* cellIndex: the index of the cell this tree is on.
* size: the size of the tree. From 0 (seed) to 3 (large tree).
* isMine: 1 if you are the owner of this tree, 0 otherwise.
* isDormant: _Ignore in this league._
Next line: An integer numberOfPossibleActions for the number of legal moves you can make this turn.  
Next numberOfPossibleActions lines: A string possibleAction containing one of the actions you can output this turn.  
This list is provided to help you get started.  

Output

A single line with your command: 
* COMPLETE index: make your large tree on the specified cell complete its lifecycle. This removes the tree.
* WAIT: go to sleep.

Constraints

Response time per turn ≤ 100ms   
Response time for the first turn ≤ 1000ms 

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png)

What is in store for me in the higher leagues? 

extra rules available in higher leagues are: 
* Help young trees grow.
* Choose where to plant trees, trees will also cast shadows on neighbouring trees.
