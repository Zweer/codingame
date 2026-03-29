# Poker Chip Race

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/poker-chip-race)

**Level:** multi
**Topics:** Simulation, Distances

## The Goal

Your objective is simple: program the movements of your poker chips during a PokerChipRace game to win.  
  
A PokerChipRace game is played on a table top where chips can move around, eat oil droplets as well as other chips and avoid getting swallowed, in order to be the last chip standing.

## Rules

* Each player controls **one to six poker chips** placed randomly across the game area.
* The table top is 800 units wide and 515 units high.
* A random number of **neutral oil droplets** (i.e. not owned by a player) of various sizes will also be placed in the game area.
* Each turn, the players indicate whether they want their chips to **move and accelerate in any given direction.**
* Every time a chip accelerates, **the chip will expel a fifteenth (1/15) of its surface area and will shrink in diameter.** The matter lost in this way will become a small oil droplet, propelled in the opposite direction of the chip's movement with a relative speed of 200 units per turn. _(For more information on the physics engine, ask your questions on the [forum)](https://www.codingame.com/forum/t/pokerchiprace-multiplayer-challenge-discussion/)_
* If a chip comes into contact with an oil droplet or another chip, **the larger entity will absorb the smaller one** and will grow in diameter (the areas will combine). The smaller entity is destroyed.
* Once propelled, an entity will **keep a constant speed by inertia,** and can only be sped up or slowed by absorbing or expelling other entities. It will bounce off the edges of the table and entities of equal diameter.
* **The aim of the game is to be the only player left with chips on the table.**
* If several players are left on the board after 300 rounds, the player with the biggest chips wins.

## Game Input

Your program must first read the initialization data from standard input. Then, within an infinite loop, read the game data (position and velocity for all entities) from the standard input and provide to the standard output the next movement instruction for each of your poker chips.

Initialization input

Line 1:  1 integer: playerId. It is your id for the game (0 to 4).

Input for one game turn

Line 1:  2 integers playerChipCount and entityCount:

* playerChipCount is the number of chips on the table that you still own.
* entityCount is the number of total entities on the table (chips & droplets).

Next entityCount lines (1 line per entity):  6 numbers on each line id playerId radius x y vx vy:

* id : the unique identifier for the entity.
* playerId : the player id of the entitiy's owner. Will be -1 for oil droplets.
* radius : the entity's radius.
* x et y : the position of the entity on the table top. (0, 0) = (top, left).
* vx et vy: the velocity vector of the entity.

Output for one game turn

playerChipCount lines: each line is an order you give to a chip. The order is either the keyword WAIT, or the x y real number coordinates of a point on the table towards which your chip should propel itself. The first line you output controls the first chip you received on the standard input, the second line corresponds to the second chip, and so on.

Optionally, you may append to each line a message that will be displayed above the corresponding chip (20 characters max).

## Agua Caliente, Mexico - In a squalid hotel on the side of the town's one road...

A ray of burning sunlight piercing through the dirty windows of my hotel room, lit up my face and brutally interrupted my sleep.

The sting of my hangover was harsh. The night before was filled with unsubtle attempts to gather information on the strategies of my drunk opponents through the exchange of large quantities of cheap whisky.

I needed to be in top condition to process all my findings. I decided to fight fire with fire and headed to the hotel bar...  
“ _Barman ! Double whisky, dry._ ”  
“ _Si se_ _ñ_ _or !_ ”  
I downed my whisky in one go then whipped out a cigar from the case I always carry with me from under my coat.

I'd been waiting for this day for an entire year. A year scouring all the poker rooms I could find in order to win what I needed to participate in the competition.

Yes, today was the day of the great PokerChipRace, or as we call it here, the Race. More of a battle really. A battle pitting thousands of the best poker chip trainers in the world, all desperate to win the 1 000 000 peso prize money.

I had the best poker chips a man could find... My hangover was dissipating, I could feel euphoria take its place, I couldn't possibly lose...

In fact, I had a trick or two up my sleeve... I acquired a small device that would let me control the free will of my chips. All I needed now was the right program to take over... This wasn't very legal and I was taking the risk of finding myself dangling from a tree... by the neck. But this was the opportunity of a lifetime...

I crossed the dusty street and entered the saloon to begin that fateful night. All the best trainers were already there, I could see LouJo, god, yvesmocq, Gangrene, hau, ... The battle would certainly be a rough one!
