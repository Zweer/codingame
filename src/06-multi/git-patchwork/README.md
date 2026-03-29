# Git Patchwork

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/git-patchwork)

**Level:** multi
**Topics:** Flood fill, Monte Carlo tree search, Minimax

![](//cdn.codingame.com/smash-the-code/statement/league_wood_04.png) 

This is a **league-based** game. 

For this challenge, multiple leagues for the same game are available. Once you have proven yourself against the first Boss, you will access a higher league and extra rules will be available.   
  
**Initial rules** 

In this league, you will be introduced to the game of Patchwork. Now let's learn what the game turn looks like and how you pay for tetris-like patches using your time token. 

# The Goal 

Become the master of patchworking by filling your quilt canvas with patches. Be careful! Every patch costs you a few **Buttons**, and it also takes some **Time** to sew it on your canvas. Those are your most valuable resources.  
  
This game is a port of the 2 player board game [Patchwork](https://boardgamegeek.com/boardgame/163412/patchwork).  
  
My thanks to [Butanium](https://www.codingame.com/profile/b3168ed8b0bc58c683ae18284d2087e21969904) for his help with the custom interaction module (zooming to patches on mouse hover). 

# Rules 

This is a turn-based game, but players do not necessarily alternate between turns. The player furthest behind on the **Timeline** takes his turn. This may result in a player taking multiple turns in a row before his opponent can take one. If there are both **Time tokens** on the same spot, the player that played last takes his turn.   
  
![](https://cdn-games.codingame.com/community/3996809-1661712962734/040aa5fb711fa0bef0af0c3a43311ded84efe973f3622aac60f5c5c66b8d8469.png)   
  
The game starts with a pre-shuffled deck of 33 patches. All patches are placed on the table and are visible to both players.   
  
Your goal is to collect more **Buttons** than your opponent and to cover as much of your quilt board with patches as possible. Uncovered squares on the quilt board will cost you 2 **Buttons** per piece at the end of the game.   
  
On your turn, you carry out one of the following actions: 
* Advance and Receive Buttons using SKIP command
* Take and Place a Patch using PLAY command
If you use PLAY incorrectly, SKIP will be used instead. 

  
# Advance and Receive Buttons - the SKIP command 

Your **Time token** will move on the **Timeline** so that it occupies the space directly in front of your opponent's **Time token**. 

  
# Take and Place a Patch - the PLAY command 

This action consists of a few steps: 
* Choose from the available **Patches** and place it on your quilt board
* Pay the depicted number of **Buttons** to the supply
* Move your **Time token** on the time board by a number of spaces as depicted on the label.
A patch can be placed anywhere on the quilt board as long as it won't cover already placed patches. 

  
# Timeline 

The **Timeline** consists of a starting point and 19time points. Regardless of the action you take, you always move your time token on the Timeline.   
  
#   
End of the game and scoring 

The game ends after both time tokens reach the last point of the **Timeline**. If a time token were to move past the last space, it simply stops on the last space.   
  
Starting with 200points 
* Subtract 2points for each empty space on your quilt board
The player with the higher score wins. In case of a tie, the player who gets to the final time point first wins. 

Victory Conditions

* You have more points at the end of the game **or**
* You scored the same number of points, but you finished first

Defeat Conditions

* Unknown command (only SKIPor PLAYare allowed)
* Your opponent has more points at the end of the game or he has the same number of points and finishes first

# Expert Rules 

* The UI supports single-line message bubbles. Anything after the last valid entry is considered a message.
* The patch with id 32 and OO shape is always last in the deck after initial shuffling as per official rules.
* Source code on [GitHub](https://github.com/VizGhar/CG-Patchwork) (Kotlin).
* Design on [Figma](https://www.figma.com/file/7diUIxEWdBphhC6MSSp48s/Patchwork---Codingame?node-id=0%3A1) made by me. Feel free to do whatever you want with the assets.
* Official board game version on [Publisher's site](https://lookout-spiele.de/upload/en%5Fpatchwork.html%5FRules%5FPatchwork%5FEN.pdf).
* There are some [Expert Mode fields](https://github.com/VizGhar/CG-Patchwork/blob/master/src/main/kotlin/com/codingame/game/Config.kt) (if you don't know what Expert Mode is ask in forum/discord)
* Game is [CG Brutaltester](https://github.com/dreignier/cg-brutaltester) compatible. Compiled referee can be found on [releases page](https://github.com/VizGhar/CG-Patchwork/releases) of game repository. Instructions in [readme](https://github.com/VizGhar/CG-Patchwork).

# Game Input/Output 

Initialization Input

Line 1: integer incomeEvents how many **Button Income** events are there on the **Timeline** _(always 0 for this league)_ 

Line 2: incomeEvents integers of incomeTime \= when the **Button Income** event will occur 

Line 3: integer patchEvents how many **Special Patch** events are there on the **Timeline** _(always 0 for this league)_ 

Line 4: patchEvents integers of patchTime \= when the **Special Patch** event will occur

Game turn Input

Line 1:  3 integers myButtons \= amount of **Buttons** you currently own; myTime \= how far is your token on the **Timeline**; myEarning \= how much you will earn during   **Button Income** event _(always 0 for this league)_ 

Line 2-10:  9 lines representing rows of your board - Ois taken field .is empty

Line 11:  3 integers opponentButtons \= amount of **Buttons** your opponent currently owns; opponentTime \= how far is your opponent's token on the **Timeline**; opponentEarning \= how much your opponent will earn during   **Button Income** event _(always 0 for this league)_ 

Line 12-20:  9 lines representing rows of opponent board - Ois taken field .is empty 

Line 21: patches \- count of patches not yet used (you can play only the first 3 of these) 

Next patches lines: patchId patchEarning patchButtonPrice patchTimePrice patchShape

Next line: integer specialPatchId: ignore _(always 0 for this league)_ 

Next line:  integer opponentMoves: how many moves your opponet played since your last move 

Next opponentMoves lines: opponentMove \- move description (SKIP or PLAY with all its attributes except message)

To describe all fields of patch: 
* patchId \- patch identifier in range 0 - 32
* patchEarning \- how much will this patch earn during each **Button Income** event _(ignore for this league)_
* patchButtonPrice \- how much buttons this patch costs
* patchTimePrice \- how much time this patch costs
* patchShape \- single string representing patch shape as follows: |separates rows of patch. Each rows consists of .and Ocharacters. Omeans current square is taken by this patch.  
    
For example: patchShape O.O|OOO|O.Orepresents Hshaped patch

Output for one Game Turn

A single line with either of 2 actions: 
* SKIP
* PLAY patchId x y
Example:  
  
PLAY   
patchId  
x and y \- coordinates of top/left corner of your patch   
  
PLAY 3 1 2\- places patch with id 3on position 1 2of you quilt board. 

Constraints

Duration of first turn - 1000ms   
Duration of game turn - 100ms
