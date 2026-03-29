# Adversarial Mate with Rook

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/adversarial-mate-with-rook)

**Level:** hard
**Topics:** Minimax, Chess

Here, we consider [Chess](https://en.wikipedia.org/wiki/Chess) endgames with only black king, white king, and white rook. Your goal, as the white player, is to checkmate the black king as quickly as possible. 

# The Goal 

For a given initial state of the game, your goal is to compute moves of the white player leading to the fastest checkmate. You need to consider an opponent, who may try to prolong play and achieve a draw when possible. 

# Rules 

The initial game state is described by the position of each piece: white king, white rook, and black king, formatted as e3 h5 e1. The white player is always the one who moves first.

The goal of this puzzle is to, in each turn, provide a move leading to quickest checkmate, according to the Chess rules. Each move should be formatted as h5h1.

After each white move, black's reply will be given in the same format.

  
Victory Conditions

* Given moves leads to the fastest checkmate possible in the current board position.

Loss Conditions

* Given sequence of moves does not lead to a fastest checkmate.
* Given move is illegal.
* Given answer is not properly formatted.
* Response time exceeds the time limit.

# Detailed rules 

* If the black player makes a suboptimal move and a quicker checkmate becomes possible, you should find the faster checkmate.
* Given board state is always a valid Chess game position.
* You can hide showing legal moves in the settings panel (![](https://www.codingame.com/servlet/fileservlet?id=3463235186409))..

# Related puzzles 

* Cooperative variant of single rook endgames, requiring you to reach the fastest checkmate by controlling both players, is available [here](https://www.codingame.com/contribute/view/638293decff575b25b7a73c0cbf1c9d958dd).
* To play full version of Chess as a bot programming game you can go [here](https://www.codingame.com/multiplayer/bot-programming/chess).

# Game Input 

Initial input

A single line  containing space-separated strings, whiteKing whiteRook blackKing positions in column-row format, e.g. a1.

Input for the following turns

A single line  containing a string opponentMove wih the opponent move encoded as from-to in column-row format, e.g. a1h8.

Output each turn

A single line containing a moves in a1h8 format. 

Constraints

1 ≤ depth of the quickest checkmate solution ≤ 13   
Response time for first turn ≤ 25s  
Response time for the following turns ≤ 200ms
