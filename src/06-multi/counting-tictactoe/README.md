# Counting TicTacToe

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/counting-tictactoe)

**Level:** multi
**Topics:** Monte Carlo tree search, Minimax

## The Goal 

 Tic-tac-toe is a turn-based game, where the objective is to get three in a row, but in this game, player who have greater count of three in a row(vertically, horizontally or diagonally), when the 10x10 board is full,wins the game. 

## Rules 

 • The game is played on a 10x10 grid. You must output the coordinate of the cell you want to mark. The player who have greater count of three in a row(vertically, horizontally or diagonally), when the 10x10 board is full, wins the game.

 • During a game, each player plays two matches with reversed colors in order to avoid the first player advantage and keep the game balanced. The final score is the sum of the points scored by each player during the two matches. 

Victory Conditions

* The winner is the player with the most **3 in a row**.

## Game Input 

Input for one game turn

Line 1: 2 space separated integers opponentRow and opponentCol, the opponent's last action (\-1 \-1 for the first turn).   
Line 2: the number of valid actions for this turn, validActionCount.   
Next validActionCount lines: 2 space separated integers row and col, the coordinates you're allowed to play at.

Output for one game turn

Line 1: 2 space separated integers row and col.

Constraints

Response time per turn ≤ 100ms 

Source code

The game source code is available at: <https://github.com/RezaSi/counting-tic-tac-toe>.
