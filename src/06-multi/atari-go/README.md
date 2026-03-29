# Atari Go

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/atari-go)

**Level:** multi
**Topics:** Minimax, Uncategorized, Classic board games

This is a slight modification of the board game [Go](https://en.wikipedia.org/wiki/Go%5F%28game%29)   
Click [here](https://senseis.xmp.net/?BasicRulesOfGo) for an introduction into the rules of Go.   
Click [here](https://github.com/tfassbender/codingame%5Fatari%5Fgo) for the Referee code  

# Rules 

 Atari Go is a modification of the classical board game [Go](https://en.wikipedia.org/wiki/Go%5F%28game%29), that is often used to teach new players the rules of Go.  
 The rules are basically the same as the Go rules with some modifications to make the game a bit easier: 
* You don't gain points by occupying fields
* The only way to gain points is to capture the stones of your opponent
* The game does not end after both players have passed (the game ends after 80 turns)
* All other rules stay the same as in the game of Go

### Go Rules

 A game of Go is usually played on a board of 19x19 fields. In the first leagues a board of 9x9 or 13x13 fields is used, but in the later leagues a 19x19 board is used.   
 While playing, both players place one of their stones (per turn) on a free position on the field. The stones are not moved after they are placed. You can only add new stones.   
 The goal of the game is to capture the stones of your opponent. This can be done by surrounding the stones (or groups) of your opponent with your stones. If a stone or group has no free fields beneath it, it is captured and removed from the board (see example 2).   
 If a stone is surrounded by other stones of the same color this stone is not captured, but all stones that are directly touching each other form a group. This group shares it's free fields. So a group of stones is often stronger and more difficult to capture than a single stone (see example 1).   
  
 Beside these simple rules there are a view more rules, on where stones can be placed and where not. 
* You can only place a stone on a field where no stone is placed yet
* You can not play a stone that would directly be removed (no suicidal moves). An exception to this rule is that the opponent stones are removed before this rule is applied. So if your stone seems to be directly surrounded by other stones, but it captures and removes at least one of the surrounding stones it can be played (see example 3)
* You can not play a stone that would lead to the same board, like in the last turn when you played a stone. This is called the Ko-Rule (see example 4)

# Examples 

### Example 1 - Groups

 In the image below the three white stones form a group. Therefore the two upper stones (that are completely surrounded) are not captured as long as one stone of the group is not completely captured. 

![](https://senseis.xmp.net/diagrams/41/49d804c30e36bd3cf3666a6d76f39644.png)
  
  
### Example 2 - Capturing stones

 In the image below the white stone is almost captured. The last free field it has is marked with a red square. The other fields (marked with red crosses) are not directly adjacent to the white stone and are therefore no free fields for the white stone. 

![](https://senseis.xmp.net/diagrams/0/7cac8afadce46df1d520ee56b4eece8b.png)

 Now if the back stone is placed like in the image below... 

![](https://senseis.xmp.net/diagrams/48/ceb2245b3fbf4c62872f4bdf2796ac95.png)

 ...the white stone has no free fields around it and therefore it is captured. So it will be removed and after the turn of the black stone the field will look like in the image below. 

![](https://senseis.xmp.net/diagrams/13/6e7dc384eb2e8b494e097f38d4259bcb.png)
  
  
### Example 3 - Suicidal moves

 In the image below, a white stone that is placed in the middle of the four black stones would have no free fields beneath it and would be directly removed. Therefore a white stone can't be placed in the middle of the black stones in this case. 

![](https://senseis.xmp.net/diagrams/13/6e7dc384eb2e8b494e097f38d4259bcb.png)

 An exception to this rule is shown in the following image: In this image it seems to be the same case. A white stone that is placed in the middle of the black stones would have no free fields adjacent to it and would be removed. But in this case the white stone can be placed in the middle of the black stones as shown in the next image. 

![](https://senseis.xmp.net/diagrams/37/0708d56ffed33ef1058f0185803a7f46.png)

 Before the free fields of the white stone are counted, first the black stones are to be removed. This leads to the following field after the white stone is placed: 

![](https://senseis.xmp.net/diagrams/47/00bb7694a7980ec3018ee6a2e721f212.png)

 Since the white stone now has a free field adjacent to it (where the black stone was removed) it can be played.   
  
### Example 4 - Ko-Rule

 In the third example it was shown that in a field, like the one in the image below, a white stone can be placed in the middle of the four black stones... 

![](https://senseis.xmp.net/diagrams/37/0708d56ffed33ef1058f0185803a7f46.png)

 ... which would lead to a board that looks like this: 

![](https://senseis.xmp.net/diagrams/47/00bb7694a7980ec3018ee6a2e721f212.png)

 Now it seems that a black stone could do a similar move by placing it in the middle of the four white stones like this: 

![](https://senseis.xmp.net/diagrams/28/8da1b11165650ffa0964df5ff2debbe1.png)

 This would normally be a valid move (just like in the third example), but to prevent the game to get stuck on this (both players just capturing the same stones again and again), the above move is not possible for the black stone, because it would lead to the same board like one turn before (the first image of this example).  
 But it would be possible to place a black stone on any other field, let white place a stone too, and then come back to this formation of stones and place the black stone in between the white stones (like in the image above) because now it would no longer lead to the same board like in the first image of this example (there are now two more stones placed somewhere on the board).   
  
  
Victory Conditions

* Capture more stones than your opponent
* If no player has captured any stones after the maximum number of turns is reached, the player that has played more stones wins (to prevent a draw if a player passes in every move)

Loss Conditions

* You send an illegal move
* You don't respond in time or output an unrecognized command

# Game Input 

Initial input

First line: myColor: B if you are playing the black stones or W if you're playing the white stones.   
Next line: boardSize: an integer representing the size of the board   
  
Input for one game turn

First line: x y: two integers representing the position of the last stone, that your opponent played ("-1 -1" in the first turn)   
Next line: myScore opponentScore: two integers representing your current score and your opponent's current score (the number of captured stones)   
Next boardSize lines: line: one line of the current board, where B marks a black stone, W marks a white stone and . marks an empty field   

Output

A single line containing: either the x and y coordinates of the next stone you want to play or PASS if you don't want to play a stone (PASS is always a valid move)  
  
Constraints

 Response time first turn is ≤ 1000 ms.   
Response time per turn is ≤ 100 ms.   
  
The game ends after 80 turns (40 stones for each player)
