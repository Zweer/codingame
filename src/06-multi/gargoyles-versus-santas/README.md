# Gargoyles versus Santas

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/gargoyles-versus-santas)

**Level:** multi

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league based** challenge. 

For this challenge, multiple leagues for the same game are available. Once you have proven your worth against the first Boss, you will access the higher league and unlock new opponents. Good luck.   

A group of Santas will be dropping off gifts for local children. For the gargoyles, this is a great opportunity to get in the way of the giveaways and show that this is their area. Unfortunately, it turns out on the spot that your gargoyle team is not the only one here.   
  
Control your gargoyles to destroy more valuable presents and score more points than your opponent's team. 

  
# The Goal 

Gather more points than your opponent by destroying more falling presents. 

# Rules 

The game lasts 200 turns or until at least 30 presents reach the ground. 

### Game Area

The game takes place on a rectangular area with coordinates x=0 y=0 being bottom left, and x=1920 y=750 top right corner of the map. 

### Gargoyles

Each player controls a single gargoyle. 

Gargoyles can move in any direction (FLY instruction), but the maximum distance they can travel in one turn is 150. 

### Presents

Presents are dropped by Santas from above, from an area inaccessible to gargoyles (they are so massive that they cannot rise above y=750). Presents that reach the ground are picked up by humans and have the effect of speeding up the end of the game. 

Presents fall downward with uniform velocity equal to 60. 

A gargoyle destroys the present if, at the end of the turn, he and the present are within distance 30. Destroying a present gives the team 5 points. 

If several gargoyles from the same team destroys the same present the points will be calculated only once. If gargoyles from both teams destroy the same present, points are awarded to both teams. 

  
### 🐞 Debugging Tips

* Hover over an entity to see more information about it.
* Add text at the end of an instruction to display that text above your gargoyle.
* Click on the gear icon to display additional visual options.
* In particular use **Debug Mode**, to see more information about the game state.
* Use the keyboard to control actions: space for play/pause, arrows for step-by-step forward movement.

  
**Acknowledgments**

This contribution was developed for the high schoolers Saint Nicholas Day visiting University of Wroclaw, 2024.

Authored by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)).

Special thanks for testing and other help to [Sko0owi](https://www.codingame.com/profile/bd53fc0e0b06bd53e633f552c346e5cf4768943). 

  
# Game Input 

Initialization Input

Line 1: integer gargoylesPerPlayer containing the number of gargoyles in each team. Always 1 in this league.   
  
Input for One Game Turn

First line: integer missedPresentsToEnd how many presents need to fall to the ground to finish the game.  
Second line: integer myScore containing your current points.  
Next gargoylesPerPlayer lines:  3 space-separated integers describing your gargoyles: 
* x: x position of the gargoyle.
* y: y position of the gargoyle.
* cooldown: Always 1 in this league.
Next line: integer foeScore containing opponent's current points.  
Next gargoylesPerPlayer lines: 3 space-separated integers describing opponent's gargoyles: 
* x: x position of the gargoyle.
* y: y position of the gargoyle.
* cooldown: Always 1 in this league.
Next line: single integer entityCount withe the number of falling presents.  
Following entityCount lines:  5 space-separated integers describing present: 
* id: unique id of the present.
* value: Always 1 in this league.
* x: x position of the present.
* y: y position of the present.
* vy: falling speed of the present.

Output

gargoylesPerPlayer lines, each with an instruction for each of your gargoyles (the order of gargoyles is the same as appearing on input).  
  
 Optionally, you can append a message to display above your gargoyle. Messages up to length 15 will be fully visible, longer messages will be truncated. 
* FLY x y \[message\] to make gargoyle fly towards x y.

Constraints

Response time for the first turn: ≤ 1s  
Response time for following turns: ≤ 50ms  
Turn limit: 200
