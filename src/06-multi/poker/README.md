# Poker

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/poker)

**Level:** multi
**Topics:** Probability, Combinatorics, Card games

This is a port of the **Texas hold'em** version of Poker. 

The source code of this game is available [on this GitHub repository](https://github.com/wala-fr/CodingamePoker). 

  
# RULES 

The rules of **Texas hold 'em** can be found all over the [web](https://www.google.com/search?q=texas+hold'em+rules). For example : [wikipedia](https://en.wikipedia.org/wiki/Texas%5Fhold%5F'em#Rules) with the [hand ranking](https://en.wikipedia.org/wiki/Texas%5Fhold%5F'em#Hand%5Fvalues). 

## **Game parameters** 

The number of players may vary from 2to 4. The action moves **clockwise** around the table. The player 0is at the top. 

The total of all buy-ins is always $4800. So for 2 players the buy-in is $2400, for 3 players it's $1600and for 4 players it's $1200.   

The value of the small blind / big blind are $5/ $10. Then every 10hands, the **level** will increase and the blinds (small and big) are multiplied by 2(the first hand is 1so to simplify the blinds will increase at hands 10, 20,...). 

The first big blind player is random. 

These values are given as game inputs.

## **End game** 

The game ends : 
* when one player owns all the chips.
* after 600rounds and if the **last hand** is not over, it's **cancelled**.

The players are ranked by elimination round and stack.

## **Timeout** 

When a player timeouts : 
1. He is eliminated.
2. He is considered folded for the current hand.
3. The chips from his stack are removed from the game.

## **Heads-up** 

In heads-up : 
* Player 0is on the left.
* The dealer / button is the small blind.

  
# CARDS 

The card's abbreviations are 2D, KH... ([complete list](https://github.com/wala-fr/CodingamePoker/blob/main/CodingamePoker/config/md/CARDS.md)). 

| **Hand examples**     | AS\_AD                      |                                                                                                        |
| --------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------ |
|                       | TC\_5H                      |                                                                                                        |
|                       |                             |                                                                                                        |
| **Board examples**    | X\_X\_X\_X\_X               | PREFLOP                                                                                                |
|                       | 4H\_6H\_JS\_X\_X            | FLOP                                                                                                   |
|                       | 4H\_6H\_JS\_AC\_X           | TURN                                                                                                   |
|                       | 4H\_6H\_JS\_AC\_AD          | RIVER                                                                                                  |
|                       |                             |                                                                                                        |
| **Showdown examples** | QH\_3S\_E\_E\_5C\_H\_7D\_KC | player0's cards, followed by player1's cards ... player1 was eliminated ( E) at the start of the hand. |

## **Showdown** 

At the end of each hand, you will know the cards of all the players (**even the folded ones**).

  
# ACTIONS 

## **Possible actions** 

There are 5possible actions / outputs : 

* CALL
* CHECK
* BET amount, where amount is the number of chips that you add to the pot.
* ALL-IN
* FOLD

A list of all possible actions is given in your inputs. BET\_240means 240 is the minimum raise. You can bet more. If you bet less it will be replaced by CALLor BET 240(depending on your amount). 

In the inputs, BETactions have an **underscore**. In the outputs, you can use a space. 

## **Bet / Raise** 

A summary of some betting rules (with examples) can be found [here](https://github.com/wala-fr/CodingamePoker/blob/main/CodingamePoker/config/md/RAISE.md) . 

## **Action replacement** 

In some cases, if you give an "invalid" action, it will be **automatically replaced** by a "legal" one. 

For example :

* BET 500with a stack of $400 will be replaced by ALL-IN.
* TOTOor other invalid action will be replaced by FOLD.

However if you FOLDwhen you could just CHECK, it won't be replaced. 

The replacement informations are written in the output console and a complete list can be found [here](https://github.com/wala-fr/CodingamePoker/blob/main/CodingamePoker/config/md/ACTION%5FREPLACEMENT.md) . 

## **Other players actions** 

The actions of all the players are given as well as the round, hand's number, playerId and board cards when each action was done.

The action can be :

* CALL
* CHECK
* BET\_500, with an underscore after BET.
* ALL-IN
* FOLD
* NONE, if no action during the hand (for example: if all players are directly all-in). Then playerId is \-1.
* TIMEOUT, the player has timeout

The first action given is always your last action.

  
# GRAPHICS 

Only the **big wins** (more than 2 \* BB \* number of alive players) and level's changes are marked on the **scrollbar**. 

There's a **debug mode** with "bigger" cards and buttons to show / hide the **opponents cards** and the **folded cards**. 

The winning probabilities are calculated with a java version of [kennethshackleton's SKPokerEval](https://github.com/kennethshackleton/SKPokerEval/tree/develop) (a Texas Hold'em 7-card hand evaluator). 

Victory Conditions

* You own all the chips.
* After 600 rounds you own the biggest stack.

Loss Conditions

* You've lost all your chips.
* You do not respond in time.

# Game Input 

Initialization input

Line 1 : smallBlind   
Line 2 : bigBlind the initial values of the blinds.   
Line 3 : handNbByLevel number of hands to play to reach the next level.   
Line 4 : levelBlindMultiplier blinds are multiply by this coefficient when the level changes.   
Line 5 : buyIn initial stack for each player.   
Line 6 : firstBigBlindId id of the first big blind player .   
Line 7 : playerNb number of players ( 2to 4).   
Line 8 : playerId your id ( 0to 3).   

  
Input for one game turn

Line 1 : round (starts at 1, game ends when it reaches 600).   
Line 2 : handNb hand's number (starts at 1).   
 Next playerNb lines : 
* stack number of chips in the player's stack.
* chipInPot number of player's chips in the pot. The sum of all the chipInPot values is equal to the pot.
  
Next line : boardCards board cards (example : AD\_QH\_2S\_X\_X).   
Next line : playerCards your cards (example : TC\_JH).   
Next line : actionNb number of actions since your last turn.   
 Next actionNb lines : 
* actionRound round of the action.
* actionHandNb hand number of the action.
* actionPlayerId player id of the action ( \-1if action is NONE).
* action action (examples : BET\_200, FOLD, NONE...).
* actionBoardCards board cards when the action is done (example : AD\_QH\_2S\_4H\_X).
  
Next line : showDownNb number of hands that ended since your last turn.   
 Next showDownNb lines : 
* showDownHandNb hand's number.
* showDownBoardCards board cards at the showdown.
* showDownPlayerCards players cards (example : QH\_3S\_E\_E\_5C\_H\_7D\_KCplayer0's cards, followed by player1's cards ...).
  
Next line : possibleActionNb number of actions you can do.   
 Next possibleActionNb lines : possibleAction your possible action ( BET\_240means 240 is the minimum raise but you can bet more).   

  
Output

A single line containing the player action. Example: BET 200   
You can also add a message : FOLD;MESSAGE 

Constraints

2≤ number of players ≤ 4   
Response time first turn is ≤ 1000ms.   
Response time per turn is ≤ 50ms.   
1≤ round ≤ 600
