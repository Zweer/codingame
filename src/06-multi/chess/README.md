# Chess

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/chess)

**Level:** multi
**Topics:** Chess

# The Game 

Chess, the Game of Kings, is a classical board game that has been played for centuries, and has also been a cornerstone of artificial intelligence development for decades. You can easily learn all about how this game is played by doing an online search or reading this [Wikipedia article](https://en.wikipedia.org/wiki/Chess).

  
This Codingame implementation makes use of the [Chess960](https://en.wikipedia.org/wiki/Chess960) rules, also known as Fischer Random Chess, where the initial starting position is randomly shuffled among 960 possibilities. This is done to promote variety as well as to prevent the hardcoding of initial moves using an opening book.

  
Special thanks to the [Chess Merida Unicode](http://mip.noekeon.org/HTMLTTChess/chess%5Fmerida%5Funicode.html) font for the rendering of piece graphics and [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chess%5FSet.jpg) for the cover picture.

# Rules 

Play 2 games against your opponent, once as each color using the same starting position, where a win gives 1 point and a draw gives ½ point.

  
If any of the following happens, the current game will result into a draw:

* A player is unable to make a legal move while their king is not being under check, a [Stalemate](https://en.wikipedia.org/wiki/Stalemate) occurs.
* The same position occurring for the third time, also known as a [Threefold Repetition](https://en.wikipedia.org/wiki/Threefold%5Frepetition).
* There is insufficient material for either player to deliver a checkmate. This includes:  
  * King vs king
  * King+knight vs king
  * King+bishop vs king
  * King+bishop vs king+bishop if both bishops are on the same square color.
* No piece capture and no pawn has moved for 50 moves, using the [Fifty-Move rule](https://en.wikipedia.org/wiki/Fifty-move%5Frule).
* After maxMoves moves are played.
* If one side offers a draw and the other side accepts it, also known as a draw by agreement.
  
Victory Conditions

* You complete both matches having more points than your opponent.
* Your opponent loses.

Defeat Conditions

* You attempt to make an illegal move.
* You do not provide an output in the alloted time.

  
# Technical details 

* The current game state is encoded as a single line using the [Forsyth–Edwards Notation](https://en.wikipedia.org/wiki/Forsyth-Edwards%5FNotation), hereby referred to as FEN.
* Game moves are internally encoded as done in the [Universal Chess Interface](https://en.wikipedia.org/wiki/Universal%5FChess%5FInterface) protocol, hereby referred to as UCI.
* Game moves are displayed in the viewer using the [Algebraic Notation](https://en.wikipedia.org/wiki/Algebraic%5Fnotation%5F%28chess%29).
* Piece characters are using the english language, therefore P for pawns, N for knights, B for bishops, R for rooks, Q for queens and K for kings.
* You can access and copy/paste the FEN of the current position and PGN ([Portable Game Notation](https://en.wikipedia.org/wiki/Portable%5FGame%5FNotation)) of both games by opening the settings panel (![](https://www.codingame.com/servlet/fileservlet?id=3463235186409)).
* You can force the initial position to be the classical one by specifying seed=0 in the game options.

The source code of this game is available on [GitHub](https://github.com/recurs3/codingame-chess/).

# Notes and examples 

Draw offers only last for one turn. If the opponent does not accept it, it is revoked.

  
# Input

Because of Chess960, the castling field of the FEN string does not make use of KQkq. The column names are used instead, so the classical castling positions would be encoded as AHah.

  
The presence of an en-passant square in the FEN does not mean that a legal en-passant capture is possible.

  
# Output

As mentioned above, specifying the move to make is done through the UCI protocol. It is simply the source square immediately followed by the destination square. For example, the classical king's pawn opening 1\. e4 would be encoded as e2e4.

  
Piece promotion is specified by appending the piece character at the end. For example, h7h8q would promote the white h pawn to a queen.

  
Castling is done as a king moving to its own rook. In a classical starting position, a king-side castling would be e1h1, and a queen-side castling would be e1a1. Because of the Chess960 setup, a king moving by 2 squares to signal castling is **not** allowed.

  
You can make use of the moves input to validate your own move generation and the move you make as output.

# External resources 

* [Chess programming wiki](https://www.chessprogramming.org/)

# Game Protocol 

The first turn is used for the referee to communicate the **game constants** and for the bot to configure its desired **inputs**.

Input

Line 1: constantsCount, the number of constants communicated by the game referee.

Next constantsCount lines: 2 space-separated values indicating the name and value of the constant.

  
Currently defined constants are:

* crazyHouse: Boolean integer with 0 as false and 1 as true, indicating whether crazyhouse rules are enabled. Always 0 for this arena.
* maxMoves: Integer indicating the maximum number of moves per player per game. After this, a draw will be forced as a game result. Currently set at 125.

Output

A single line configuring which inputs will be sent by the referee on each game turn. You can write any of the following values separated with spaces to receive the associated input, in the same order that is given. 
* fen: The [FEN representation](https://en.wikipedia.org/wiki/Forsyth-Edwards%5FNotation) of the current game. **Strongly recommended**.
* moves: The list of legal moves.
* lastmove: The last move made by the opponent.
* draw: Whether the opponent has made a draw offer.
* game: The game number currently being played.
* score: The current score for each player.
  
For all the following turns this protocol is used to play out the games.

Input

The values sent are in accordance with the configuration sent on the first turn, in the same order they were given.

* fen: A line containing 6 fields board color castling enPassant halfMoveClock fullMove separated with spaces, representing a [FEN string](https://en.wikipedia.org/wiki/Forsyth-Edwards%5FNotation).
* moves: A line containing an integer movesCount, followed by movesCount lines having one move per line, a string with a UCI move.
* lastmove: A line with a string containing the UCI move played by the opponent last turn, or none if it is the first turn of the game.
* draw: A line containing a boolean integer, 1 if a draw was offered last turn by the opponent, 0 otherwise.
* game: A line containing an integer representing the current game number, starting at 1 for the first game.
* score: A line containing 2 integers separated by a space, the score of the current player followed by the score of the opponent. The score is given in half-points, so ½ \= 1.

Output

A single line with the move to be made, encoded with the UCI protocol. 
* A comment can be added to be displayed in the viewer by adding a space after the move and writing its content.
* You can offer a draw to your opponent by adding \= right after the move, without a space.
* You can accept a draw offer by outputting draw instead of a move. Note that this is only legal if a draw offer was made the previous turn! Make sure to check the input first.
* You can resign the current game by outputting resign instead of a move. This will proceed to the next game or end the match if no more is to be played.
* You can play a random move by outputting random instead of a move. This is admittedly only useful for stub code generation.
  
Constraints

 Response time per turn ≤ 50 milliseconds.  
 Response time for the first turn ≤ 1 second.
