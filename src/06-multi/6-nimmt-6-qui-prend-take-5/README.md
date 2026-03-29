# 6 nimmt! / 6 qui prend! / Take 5!

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/6-nimmt-6-qui-prend-take-5)

**Level:** multi
**Topics:** Card games

This challenge is inspired from the board game [6 nimmt!](https://boardgamegeek.com/boardgame/432/6-nimmt) (known as 6 qui prend! in French and Takes 5! in English  
 All images were taken from this [repository](https://github.com/sandra-laduranti/6QuiPrend) and are property of the game license owners 

# The Goal 

 The objective of the game is to have as few cows as possible. 

# Rules 

 This game is played with numbered cards from 1 to 104, where each card is unique and has some cows on it. The objective is to get as few cows as possible !  
 At the beginning of the game, the dealer deals 10 cards to each player and puts 4 right away on the table. These 4 cards are starting 4 lines.  
 Unlike more common card games, 6 nimmt! doesn't follow a classic turn structure, but is based on simultaneous choice. In other words, everybody plays in the same time rather than one after the other. Each player chooses the card he wants to play, but we reveal all cards and put them appropriately on the table only when everybody has made up his mind.  
 When all players have chosen a card of their hand, one proceed to the placement in the series. The player having the smallest card goes first, and then we play in order, the greatest card goes last.  
  
 Lines are always going in ascending order: the next card to put in must always be greater than the last card already present in the line.  
 If several lines are possible, then we must, among the different possible lines, put our card on the line where the last card already present is the greatest one. Another way to express that is to say, we must put the card on the line where the difference between this card and the last card already present in the line is minimum.  
  
 A line is full when it contains 5 cards. The player who completes it with a sixth card must first pick the five cards already there. His card then starts a new line.  
 If a card can't go to any line because it's too small, then the player who played it must pick one of the lines already present, and this card will start a new line.  
  
 Picked cards don't go back to the hand of the player picking them, but are instead discarded and are contributing to the scoring at the end of the round.   
  
 Once all played cards have been put on the table according to the rules above, each player chooses the card he wants to play next, and one again follow the same rules.   
 The round ends when all players have played their 10 cards.  
 The game ends after 5 rounds. 

# Expert Rules 

 The cards will score depending on the number of cows they have.   
* Multiples of 5 that aren't multiple of 10 give 2 cows
* Multiples of 10 give 3 cows
* Multiples of 11 give 5 cows
* All other cards give one single cow
* Note: 55 being both a multiple of 11 and 5, this card gives 7 cows!

# Example 

 Here is an example to illustrate the rules explained above. Suppose there are four players: Alice, Bob, Celia and David, and that the following lines are currently on the table :  
  
 9, 12 and 21  
 19 and 24  
 33, 42, 50 and 57  
 69, 72 and 81  
  
 Alice plays a 23, Bob a 88, Celia a 7 and David a 64\.   
  
 Here is what happens:  
  
 Celia goes first because 7 is the smallest amongst 23, 64, 7 and 88.  
 7 is smaller than 21, smaller than 24, smaller than 57 and smaller than 81; none of the lines can accept it.  
 Celia thus decides to pick 69, 72 and 81, which gives her 3 cows.   
The card 7 starts a new line which can be immediately used right away.   
  
 Alice goes second. 23 can either go after 7, or following 21\. Between 7 and 21, 21 is the greatest; 23 will therefore be put following 21.  
  
 Bob goes third with his 64\. He has four options: after 7, after 23, after 24 and after 57\. 57 being the greatest of those four, it's where 64 will go.  
  
 Finally, David goes last with his 88\. Always by following the same rules, 88 must go after 64\. But the line has already 5 cards!  
 David must so pick 33, 42, 50, 57 and 64, which gives him 11 cows. His 88 starts a new fresh line.   
 Bad luck! David probably thought that his 88 would go after the 81 picked up by Celia...  
  
 Everybody has played for this turn; the game continues by letting each player choosing the next card to play. 

# Game Input 

Initialization Input

Line 1: 2 integers: playerCount which is always 4 and playerId (between 0 and 3).   

Input for One Game Turn

Line 1: gamePhase the name of the current game phase.   
It can be CHOOSE\_CARD\_TO\_PLAY or CHOOSE\_LINE\_TO\_PICK   
Line 2: playerCount integers: the last played cards by each player (-1 in the first turn or if the player is disqualified).   
Line 3: the number of cards in the first line   
Line 4: the cards in the first line, separated by spaces   
Line 5: the number of cards in the second line   
Line 6: the cards in the second line, separated by spaces   
Line 7: the number of cards in the third line   
Line 8: the cards in the third line, separated by spaces   
Line 9: the number of cards in the fourth line   
Line 10: the cards in the fourth line, separated by spaces   
Line 11: playerCount integers: the players scores. (-999 if the player is disqualified)   
Line 12: the number of cards in your hand   
Line 13: the cards in your hand, separated by spaces   

Output for One Game Turn

1 line containing one of the following actions depending on the game phase: 
* PLAY cardId: the player plays the given card from their hand.  
This action is mandatory and is only available in the CHOOSE\_CARD\_TO\_PLAY phase.
* PICK lineId: the player picks (and scores) the given line (between 0 and 3) and can now play the previously selected card in this line.  
This action is mandatory and is only available in the CHOOSE\_LINE\_TO\_PICK phase.

Constraints

 Response time per turn ≤ 100ms  
 Response time for the first turn ≤ 1000ms
