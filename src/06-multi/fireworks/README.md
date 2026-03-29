# Fireworks

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/fireworks)

**Level:** multi
**Topics:** Coop Game, State machine

# The Goal 

Fireworks is a cooperative game, i.e. a game where the players do not play against each other but work together towards a common goal.

In this case they are absent minded firework manufacturers who accidentally mixed up powders, fuses and rockets from a firework display. The show is about to start and panic is setting in. They have to work together to stop the show becoming a disaster! The pyrotechnicians have to put together 5 fireworks, 1 white, 1 red, 1 blue, 1 yellow, 1 green), by making an increasing series of numbers (1, 2, 3, 4, 5) with the same coloured cards.

This game is inspired from <https://coopboardgames.com/cooperative-board-game-reviews/hanabi-card-game-review>

  
# Rules 

Each game is for 4 players. With this number of players, 4 rounds are created by the referee. Each round, 3 of the 4 players are cooperating to solve the problem. The final score of one player is the sum of the scores of the 3 rounds, he has played. The better a player cooperates with the others during the rounds, the higher the accumulated score.

Progress of a round: 

There are 50 cards available. The values on the cards to be dealt are 1, 1, 1, 2, 2, 3, 3, 4, 4, 5 for each color.

At the beginning of the round, each player receives 5 cards (named from 'A' to 'E') but can only see the card of the other players and not the ones he has in his hand.

In one round 3 mistakes can be made and "give information" can be performed 12 times.

On his turn, a player must complete one, and only one, of the following three actions (you are not allowed to skip your turn): 

* 1/ Give one piece of information.
* 2/ Discard a card.
* 3/ Play a card.
  
1\. Giving a piece of information 

In order to carry out this task, one "give information" is lost.

Seeing the cards of others players, the current player can give to, only one player, one information on one color or on one level.

Important : The complete information is given by the referee in the input to all the players

Note: This action cannot be performed if there is no more "give information". The player has to perform another action.

  
2\. Discarding a card 

Performing this task allows to get back one more "give information" to the team.

The player discards a card from his hand and puts it in the discard pile (next to the box, face up). He then takes a new card and adds it to his hand without looking at it.

Note : This action cannot be performed if there are already 12 "give information" available. The player has to perform another action. 

  
3\. Playing a card 

The player takes a card from his hand and puts it in front of him.

Two options are possible:

* The card either begins or completes a firework and it is then added to this firework.
* Or the card does not continue any firework: it is then discarded and the max number of allowed mistakes is decremented.

He then takes a new card and adds it to his hand without looking at it.

How the fireworks are made up: There can only be one firework of each color. The cards for a firework have to be placed in increasing order (1, then 2, then 3, then 4 and finally 5). There can only be one card of each value in each firework (so 5 cards in total).

BONUS for a complete firework

When a player completes a firework – i.e. he plays the card with a value of 5 – he gains one more "give information". This addition is free; the player does not need to discard a card. This bonus is lost if all the 12 "give information" are already available. 

  
End of the game

There are 3 ways to end the game of Fireworks:

The game ends immediately if the fourth mistake is made.

The game ends immediately and it is a stunning victory if the firework makers manage to make the 5 fireworks before the cards run out.

The game ends if a firework maker takes the last card from the pile: each player plays 3 more time, including the player who picked up the last card. The players cannot pick up cards during these last round (as the pile is empty). Once this last round is complete, the game ends and the players can then add up their scores.

  
Score of a round: 10 points + the sum of all the level of each color well played by the team.

When a player makes a mistake by proposing a bad card, he loses 1 point.

best score for a round is: 10+(1+2+3+4+5)\*5 = 85 points.

Victory Conditions

* Have more points than your opponent(s).

Loss Conditions

* Have less points than your opponent(s).
* Not respond in due time or output an invalid command.

# Game Input 

Initial input

None. 

  
Input for one game turn

First 1 line:numberOfRemainingMistake numberOfGiveInformation.  
Next : Number of information given by the referee (consequences of the players actions during the last turn).  
Each information: playerId:NEWGAME|PLAY|DISCARD|ERROR|SAYLEVEL|SAYCOLOR|CARD:complementaryInformation.  
complementaryInformation=.  
* nothing for NEWGAME (playerId for NEWGAME is the bot id in this round),
* A|B|C|D|E:WHITE|RED|BLUE|GREEN|YELLOW\-1|2|3|4|5 for PLAY,
* A|B|C|D|E:WHITE|RED|BLUE|GREEN|YELLOW\-1|2|3|4|5 for DISCARD,
* A|B|C|D|E:WHITE|RED|BLUE|GREEN|YELLOW\-1|2|3|4|5 for ERROR (for an erroneous PLAY),
* informedPlayerId:WHITE|RED|BLUE|GREEN|YELLOW for SAYCOLOR,
* informedPlayerId:1|2|3|4|5 for SAYLEVEL,
* A|B|C|D|E:WHITE|RED|BLUE|GREEN|YELLOW|?\-1|2|3|4|5|? for CARD.
  
Output for one game turn

A single line containing an action: PLAY|DISCARD:Letter or SAY::playerToInform:WHITE|RED|BLUE|GREEN|YELLOW|1|2|3|4|5.   
Example: PLAY:A or DISCARD:D or SAY:0:WHITE or SAY:2:3 

  
Constraints

Response time for first turn ≤ 1s  
Response time for one turn ≤ 50ms
