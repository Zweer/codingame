# Twixt-PP

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/twixt-pp)

**Level:** multi

# The Goal 

Twixt-PP is a two-player paper-and-pencil board game. Each player in turn places a peg on the board that may connect with the other pegs he has previously placed. The goal for the player is to connect his opposite borders with a chain of connected pegs.   
  
Twixt was developed by Alex Randolph and was very popular in 60s and 70s. More history and details, can be found [HERE](https://www.littlegolem.net/jsp/games/gamedetail.jsp?gtid=twixt&page=rules)and [THERE](https://en.wikipedia.org/wiki/TwixT). 

# Rules 

The board is a 12x12 square grid of holes, minus the corner holes. The first player to play owns the top and bottom rows. The second player owns the left and right edge rows. 
* Each player in turn places a peg of his color in a vacant hole. The player cannot place a peg in the opponent's border rows.
* A peg links with another peg of the same color if they are a chess knight move away from each other and if the link would not cross an already present opponent's link.
* In the PP variant of Twixt, a link is allowed to cross another link of the same color. But this does not establish a connection.
  
SWAP rule: 
* During the first turn, the second player has the ability to swap the opponent's peg instead of placing a new peg.
* The swapped peg changes color and is symetrically moved on the board. For example, peg C5 would become E3.
You **win** if: 
* You connect your two opposite border rows with a continuous chain of pegs.
It is a **draw** if: 
* There are no vacant hole, and no border connection has been made.
You **lose** if: 
* You play an invalid move.
* You do not respond in due time.

# Game Input 

The program must first read the game state input data from standard input. Then, provide to the standard output one line with the player's move.

Input

1 line: hisLastPeg One string that indicates where the opponent placed his last peg (D6 or H10 for instance), or FIRST if you are the first to play, or SWAP if the opponent has chosen to swap the first turn.

1 line: numYourPegs One integer that indicates how many of your pegs are present on the board.

numYourPegs lines: yourPeg One string for each of your pegs.

1 line: numYourSegments One integer that indicates how many segments (links) you have on the board.

numYourSegments lines: yourSegPeg1 yourSegPeg2 Two strings for the two ending pegs of each of your segments.

1 line: numHisPegs One integer that indicates how many pegs of your opponent are on the board.

numHisPegs lines: hisPeg One string for each of his pegs.

1 line: numHisSegments One integer that indicates how many segments the opponent has.

numHisSegments lines: hisSegPeg1 hisSegPeg2 Two strings for the two ending pegs of each of his segments.

Output

A single line containing yourPeg optionalInfoText : The first string indicates your peg placement or SWAP. The second string is optional. It is up to 20 characters long, it can contain spaces and it will be displayed in the player's hud.   

Constraints

  
Allotted response time to output is 1 s for the first turn, then 300 ms for the other turns.
