# Fall Challenge 2020

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/fall-challenge-2020)

**Level:** multi
**Topics:** BFS, Monte Carlo tree search, graph traversal

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven your skills against the first Boss, you will access a higher league and extra rules will be available. 

_Tutorial video by Errichto: <https://youtu.be/kGCAgaZv99M>_ 

## Goal 

End the game with more **rupees** than your opponent. 

![Earn more rupees than your opponent!](https://static.codingame.com/servlet/fileservlet?id=52461989331356) 

The game takes place in a **potion shop**, in which two twin-sister **witches** are trying to prove they are the better potion brewer.  
They have set up a contest: make more rupees selling potions than your sister.  
However, the **witch's hut** in which they set up shop is quite small, so they must share the same workspace, and deal with the same **client orders**. 

## Rules 

Each player controls a **witch**, each witch has access to their own **inventory** of potion ingredients. 

Each **client order** is a list of ingredients required to brew a potion and earn some rupees.

The game is played over several rounds. Each player performs one action each turn, simultaneously. 

### Ingredients

There are 4 tiers of ingredient, indexed from 0 to 3 . 

![](https://static.codingame.com/servlet/fileservlet?id=53644389710672) 

_Higher tier ingredients are typically necessary in more expensive potion recipes but take longer to acquire._

Each witch starts with a full inventory of 10 ingredients. 

The inventory is represented by inv: **4 numbers** each representing the amount of each ingredient tier.

![](https://static.codingame.com/servlet/fileservlet?id=53661988029913) 

_If inv0 is 3 then you have 3 tier-0 ingredients._

### Action overview

For this league, you must Brew two potions from the list of client orders. The witch having earned the most rupees wins.

### Brewing

**Client orders** have a delta: **4 numbers**, one for each ingredient tier.  
Negative numbers represent the amount of ingredients that are consumed by the recipe.  
Therefore, the numbers are **never positive** because they represent a loss of ingredients from your inventory. 

For instance, a client order with delta \= -2, -1, 0, 0 means you have to consume 2 tier-0 ingredients and 1 tier-1 ingredients from your inventory in order to brew the potion.

The selling price of the client order is the amount of rupees will you earn by completing it.

![](https://static.codingame.com/servlet/fileservlet?id=53662009164687) 

_This potion requires five ingredients and is worth 10 rupees. delta0 is \-2, so you need at least 2 tier-0 ingredients in the inventory. Check this with the inv0 variable._ 

The client orders are queued up from left to right. Only five clients can fit inside the hut so a maximum of 5 orders will be available every turn.

If both witches brew the same potion, they **both** earn its price in rupees. 

At the start of each new turn, new orders are queued up to fill the missing spaces.

Each order has a unique id and can be undertaken with the BREW id command. 

You may also opt to skip a turn with the WAIT command.

### ⛔ Game end

The game ends once at least one witch has brewed 2 potions.   
  
The game stops automatically after 100 rounds.  
  
Victory Conditions

* The winner is the player with the most rupees.

Defeat Conditions

* Your program does not provide a command in the alloted time or one of the commands is unrecognized.

  
### 🐞 Debugging tips

* Hover over a spell or recipe to see extra information about it
* Append text after any command and that text will appear next to your witch
* Press the gear icon on the viewer to access extra display options
* Use the keyboard to control the action: space to play/pause, arrows to step 1 frame at a time

## Game Protocol 

Input for One Game Turn

Line 1: one integer actionCount for the number of all available client orders.  
Next actionCount lines: 11 space-separated values to describe a game action.  
* actionIdthe id of this action
* actionType: a string  
  * BREW for a potion recipe
* delta0, delta1, delta2, delta3: the four numbers describing the consumption/producion of ingredients for each tier.
* price the amount of rupees this will win you if this is a potion recipe, 0otherwise.
* tomeIndex: ignore for this league.
* taxCount: ignore for this league.
* castable: ignore for this league.
* repeatable: ignore for this league.
Next 2 lines: 5 integers to describe each player, **your** data is always first: 
* inv0 for the amount of tier-0 ingredients in their inventory
* inv1 for the amount of tier-1 ingredients in their inventory
* inv2 for the amount of tier-2 ingredients in their inventory
* inv3 for the amount of tier-3 ingredients in their inventory
* score for the amount of rupees earned so far

Output

A single line with your command: 
* BREW id: your witch attempts to brew the potion with the given id.
* WAIT: your witch does nothing.

Constraints

0 < actionCount ≤ 100  
6 ≤ price ≤ 23  
Response time per turn ≤ 50ms   
Response time for the first turn ≤ 1000ms 

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png)

What is in store for me in the higher leagues ? 

The extra rules available in higher leagues are:
* Cast spells to generate and transform ingredients
* Learn new spells from the magic tome
