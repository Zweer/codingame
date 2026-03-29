# Code a la Mode

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/code-a-la-mode)

**Level:** multi
**Topics:** Programming Fundamentals, Data Structures, Coop Game, State machine, Maths / Physics, Reverse engineering

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

Wood leagues should be considered as a tutorial which lets players discover the different rules of the game.   
In Bronze league, all rules will be unlocked and the real challenge will begin.   
  
Starter AIs are available in the [Starter Kit](https://github.com/csj/code-a-la-mode/tree/master/src/test/starterkit). They can help you get started with coding your own bot. 

## The Goal 

Control a chef and prepare food for customers as quickly as possible to earn more points than the other players. 

## The Game 

This is a three-player game played on a grid 11 cells wide and 7 cells high. A match is played in 3 rounds, each round with only 2 of the players. 

* **Round 1:** player A with player B.
* **Round 2:** player C with player A.
* **Round 3:** player B with player C.

Each player will thus play two rounds in each match. A player's total points is the sum of both rounds' points. 

Each round lasts for 200 turns and is played with the same **kitchen** and **customers**. 

  
**A round** 

Each player controls a chef who moves around the kitchen and prepares food for customers. 

Both players play collaboratively, and perform their actions one after the other. Each player will have 100 turns to act per round. 

  
**The kitchen** 

The kitchen contains: 
* Floor cells, on which the chefs can move (., 0, 1).
* Empty tables (#).
* A dishwasher (D).
* A customer window represented by a bell (W).
It also contains different food crates that dispense: 
* Blueberries (B).
* Ice cream (I).
  
**The desserts** 

The chefs can prepare two basic desserts: 
* Blueberries (BLUEBERRIES).
* Ice cream (ICE\_CREAM).
![](https://www.codingame.com/servlet/mfileservlet?id=25786355937691)   

**The customers** 

At most 3 customers are waiting for their order. Each delivered order rewards both active chefs with points, but the longer the customer waits, the fewer points the chefs get. 

Every customer requests exactly ICE\_CREAM and BLUEBERRIES. 

A customer's order should be served on a dish (DISH). 

There are at maximum 3 dishes in play. As soon as an order is sent through the window, a new dish appears in the dishwasher. 

  
**Actions** 

MOVE x y 

Use this command to move towards a different cell. The chefs move horizontally and vertically, of 4 cells at most. They can't occupy the same cell or pass through each other. 

  
USE x y 

Use this command to interact with the cell (x,y). If the chef is adjacent to the cell when using the USE command, the action is successful. Otherwise, the chef will move closer to that cell. The USE command works diagonally (8-adjacency). 

Depending on the cell and what the chef is holding, the USE will have different effects. The main effects are summarized below: 

* The USE action on an equipment will make you use that equipment.
* The USE action on a table with an item (food or dish) while holding nothing will make you pick up that item.
* The USE action on a table with a finished dessert while holding a dish will make you add that dessert to the dish.
  
WAIT 

Use this command to do nothing. 

  
To display a message in a viewer, append a semicolon followed by your message to the output.   
Ex: USE 0 0; my message 

Victory Conditions

* You earn more points than your opponents after the three rounds.

Loss Conditions

* Your program times out.
* Your program provides invalid output.

  
## Advanced Details 

You can see the game's source code here: <https://github.com/csj/code-a-la-mode>. 

* The chefs cannot exchange any food or dish with each other. They need to put it down on a table for the other to pick it up.
* The chefs cannot put food or dishes on the floor.
* The chefs cannot pick up a dish if they're already carrying one.
* As soon as food is put on a dish, it cannot be removed from it. To empty a dish, USE the dishwasher while holding it.
* A dish cannot contain more than 4 desserts.
* All possible cases of the USE are listed [here](https://github.com/csj/code-a-la-mode/blob/master/USE.md).
* For every turn a customer waits for an order, the reward is decreased by 1.

## Game Input 

Input for the first turn

First line: an integer numAllCustomers for the total number of customers (same list of customers for each round).  
Next numAllCustomers lines: 
* A string customerItem for the customer's order  
Ex: DISH-BLUEBERRIES-ICE\_CREAM
* An integer customerAward for the number of points awarded if the customer's order is delivered
Next 7 lines: A string kitchenLine of size 11 representing a part of the kitchen.   
* .: walkable cell
* 0: first player spawn location (also walkable)
* 1: second player spawn location (also walkable)
* D: the dishwasher
* W: the window
* B: the blueberry crate
* I: the ice cream crate

Input for one game turn

First line: An integer turnsRemaining for the number of turns remaining before the end of the current round.   
Next 3 lines: 
* Two integers playerX and playerY for the player's chef position
* A string playerItem for what the player's chef is carrying  
Ex: DISH-BLUEBERRIES-ICE\_CREAM  
If no item is being carried: NONE
Next 3 lines: 
* Two integers partnerX and partnerY for the other player's chef position
* A string partnerItem for what the other player's chef is carrying
Next line: An integer numTablesWithItems for the number of non-empty tables   
Next numTablesWithItems lines: 
* Two integers tableX and tableY for the table's position
* A string item for what's on the table.  
Ex: DISH-BLUEBERRIES-ICE\_CREAM
Next line: to ignore in this league   
First line: an integer numCustomers for the current number of customers waiting for their order.   
Next numCustomers lines: 
* A string customerItem for the customer's order  
Ex: DISH-BLUEBERRIES-ICE\_CREAM
* An integer customerAward for the number of points awarded if the customer's order is delivered

Output for a turn

* MOVE x y to move to the cell (x,y).
* USE x y to interact with the cell (x,y).
* WAIT to do nothing.

Constraints

Response time for the first turn ≤ 1s  
Response time per turn ≤ 50ms  

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

What is in store in the higher leagues? 

The extra rules available in higher leagues are: 
* In Wood 2, chefs can cut strawberries at the chopping board.
* In Wood 1, chefs can cook a dough into croissants.
* In Bronze, chefs can prepare blueberry tarts.
