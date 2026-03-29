# Legends of Code & Magic: Constructed

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/legends-of-code-magic-constructed)

**Level:** multi
**Topics:** Card games

Constructed mode version 

In this version, we further extend [LOCM 1.0](https://www.codingame.com/multiplayer/bot-programming/legends-of-code-magic) and [LOCM 1.2](https://www.codingame.com/contribute/view/162759566f5a132f64b4de78ed637a2f309a) by completely revamping the way players are building decks.   
  
Instead of choosing one card from each of 30 sets, now a new, bigger set of 120 cards is generated every game. And player gets to freely build his deck out of the presented cards.   
  
Additionally, Area effect has been added. 

## The Goal 

Construct a deck of cards, battle an opponent with those cards and reduce their Health Points (HP) from 30 to 0\. 

## Rules 

 This game is a two-player card game which is played in two phases: the Constructed phase and the Battle phase. 
* During the Constructed phase, both players must create a deck of 30 cards.
* Once the Constructed phase is over, both decks are shuffled.
* During the Battle, the board is divided in two parts: each player plays cards from their hand on their side of the board.
* Each player starts with 30 HP. Some cards can increase this number.
* To reduce the health points of an opponent, the player must make use of cards to deal **damage**.

## Constructed Phase 

* Each player is presented with 120 cards. From them, each player chooses 30 cards for their deck.
* Each card can be chosen by each of the players up to 2 times. Players will receive copies of that card, each with its own instanceId.
* By default, the PASS command will pick the first still available card.

## Battle Phase 

  
**Card Draw** 
* First player starts with 4 cards in hand whereas the second player starts with 5.
* Each turn, the active player draws one additional card from their deck.
* Some cards can make players draw additional cards at the beginning of the next turn when played.
* Player draws an additional card for every 5 HP lost due to opponent dealing damage to player in last round.
  
**Mana** 
* Mana is necessary to play cards from the hand.
* The first player starts with 1 max mana, the second with 2 max mana.
* Each player can spend as much mana per turn as they have max mana.
* The second player receives his +1 max mana bonus until he spends all his mana during a turn.
* Each turn, the active player is granted one additional max mana, unless they already have 12 max mana (13 for the second player who didn't spend his bonus).

## Card Types 

There are two different types of cards: Creatures and Items.   
  
**Creatures**  
* Placing a creature card from the hand to the board is called **summoning**.  
A player summons creatures to their side of the board by paying their cost in **mana**. They are used to attack the opponent and also serve as a defense against the creatures of the opposing player.
* Creatures have a cost in mana, attack points and defense points. Some creatures start with certain abilities.
* By default, creatures can't attack the turn they are summoned. They can attack once per turn only.
* When a creature attacks another one, they both deal **damage** equals to their attack to the defense of the other creature. When a creature attacks the opponent, it deals **damage** equals to its attack to the HP of the opponent.
* Creatures are removed from play when their defense reaches 0 or less.
* Creatures can have an effect on the player's health, the opponent's health or the card draw of the player when played.
* Creatures can be placed on one of two lanes. Creatures on different lanes can not interact with each other.
* Creatures can have different abilities:  
  * Breakthrough: Creatures with Breakthrough can deal extra **damage** to the opponent when they attack enemy creatures. If their attack **damage** is greater than the defending creature's defense, the excess **damage** is dealt to the opponent.
  * Charge: Creatures with Charge can attack the turn they are summoned.
  * Drain: Creatures with Drain heal the player of the amount of the **damage** they deal (when attacking only).
  * Guard: Enemy creatures from the same lane must attack creatures with Guard first.
  * Lethal: Creatures with Lethal kill the creatures they deal **damage** to.
  * Ward: Creatures with Ward ignore once the next **damage** they would receive from any source. The "shield" given by the Ward ability is then lost.
* Single card with Area effect can summon multiple copies with single summon:  
  * Target: During summoning a single copy of that creature is created.
  * Lane1: During summoning creature is cloned, and additional copy appears on the **same** lane (if there is free space).
  * Lane2: During summoning creature is cloned, and additional copy appears on the **other** lane (if there is free space).
* Effects of myHealthChange, opponentHealthChange and cardDraw are applied for every clone of creature summoned.
* The main summon gets ID of the original card, while additional copies are given IDs following ID of the original card. For example, if the player uses the command "SUMMON 5 1" on a card with Lane2 effect, the game will summon the creature with ID 5 on lane 1 and the creature with ID 6 on lane 0\.

**Items**  
  
* When played, items have an immediate and permanent effect on the board or on the players. They are then removed from play.
* Items have a cost in mana and one or multiple effects out of the following:  
  * Permanent modifier of a creature's attack and/or defense characteristics. Example: +0/+2 or -1/-1\.
  * The addition or removal of one or more abilities to one creature.
  * Additional card draw the next turn they're played.
  * Health gain for the player or health loss for the opponent.
* There are three types of items:  
  * Green items should target the active player's creatures. They have a positive effect on them.
  * Red items should target the opponent's creatures. They have a negative effect on them.
  * Blue items can be played with the "no creature" target identifier (\-1) to give the active player a positive effect or cause **damage** to the opponent, depending on the card. Blue items with negative defense points can also target enemy creatures.
* Items with Area effect have effect on multiple creatures:  
  * Target: affects only target creature.
  * Lane1: affects all creatures on the same lane and side of board as the original target.
  * Lane2: affects all creatures on all lanes and same side of the board as the original target.
* Effects of myHealthChange, opponentHealthChange and cardDraw are applied for every creature affected by item.

## Gameplay 

  
**Possible Actions** 
* SUMMON id lane to summon the creature id from your hand to the lane lane (0 - left, 1 - right).
* ATTACK id1 id2 to attack creature id2 with creature id1  that has to be on the same lane.
* ATTACK id -1 to attack the opponent directly with creature id.
* USE id1 id2 to use item id1 on creature id2.
* USE id -1 to use item id.
* PASS to do nothing this turn.
A player can do any number of valid actions during one turn. Actions must be separated by a semi-colon ;.  
  
**Game End** 
* The game is over once any player reaches 0 or less HP.

Victory Conditions

* Reduce your opponent Health Points (HP) from 30 to 0 or less.

Loss Conditions

* Your HP gets reduced to 0 or less.
* You do not respond in time or output an unrecognized command.

  
## Advanced Details 

You can see the game's source code on <https://github.com/acatai/Strategy-Card-Game-AI-Competition>.   
  
**Constraints** 
* If a player already has the maximum number of 8 cards in hand and must draw, the draw is cancelled.
* If a player already has the maximum number of 3 creatures on a lane and tries summoning a new one on this lane, the summoning action is cancelled.
* If a player tries to attack an untargetable target (wrong instance id or presence of other defensive creatures with Guard) with one of his creatures, the attack action is cancelled.
* Once a player has played over 50 turns, they will take 10 damage each passing turn.
* When player has empty deck and has to draw a card, then that player is dealt 10 damage.
**Abilities special cases** 
* Giving an ability to a creature with that same ability has no effect.
* Attacking a creature with Ward with a creature with Lethal does not kill the creature (since no **damage** is dealt to the creature).
* Attacking a creature with Ward with a creature with Breakthrough never deals excess **damage** to the opponent (since no **damage** is dealt to the creature).
* Attacking a creature with Ward with a creature with Drain does no heal the player (since no **damage** is dealt to the creature).
**Changes from [1.2 version](https://www.codingame.com/contribute/view/162759566f5a132f64b4de78ed637a2f309a)** 
* Replaced Draw phase with Constructed phase.
* New ability Area has been added. It allows creatures to summon two copies at once, and items to affect several targets at once.
* Runes have been completely removed.
* Player gets to draw additional card for every 5 health lost in previous round.
* Response time for Constructed round has been extended to 4000 ms.
**Changes from [1.0 version](https://www.codingame.com/multiplayer/bot-programming/legends-of-code-magic)** 
* Creatures can now be placed on two lanes.
* Number of creatures per lane has been limited to 3.
* Creature can only attack creature, if it is on the same lane.
* Guard works only for creatures on the same lane.
* Response time per Battle round has been extended to 200 ms.
* All the changes from 1.2\.

## Game Input 

Input for one game turn

First 2 lines: for each player, playerHealth, playerMana, playerDeck and playerDraw: 
* Integer playerHealth: the remaining HP of the player.
* Integer playerMana: the current maximum mana of the player.
* Integer playerDeck: the number of cards in the player's deck.
* \---- NO RUNES ---
* Integer playerDraw: the additional number of drawn cards - this turn draw for the player, next turn draw (without reward for damage received) for the opponent.
The player's input comes first, the opponent's input comes second.  
  
During the Constructed phase, playerMana is always 0.  
  
Next line: 
* Integer opponentHand, the total number of cards in the opponent's hand. These cards are hidden until they're played.
* Integer opponentActions, the number of actions performed by the opponent during his last turn.
Next opponentActions lines: for each opponent's action, string cardNumberAndAction containing the cardNumber of the played card, followed by a space, followed by the action associated with this card (see **Possible Actions** section).  
  
Next line: Integer cardCount: during the Battle phase, the total number of cards on the board and in the player's hand. During the Constructed phase, always 120.   
  
Next cardCount lines: for each card, cardNumber, instanceId, location, cardType, cost, attack, defense, abilities, myHealthChange, opponentHealthChange, cardDraw, area and lane: 
* Integer cardNumber: the identifier of a card.
* Integer instanceId: the identifier representing the instance of the card (there can be multiple instances of the same card in a game).
* Integer location, during the Battle phase:  
  * 0: in the player's hand
  * 1: on the player's side of the board
  * \-1: on the opponent's side of the board  
Always 0 during the Constructed phase.
* Integer cardType:  
  * 0: Creature
  * 1: Green item
  * 2: Red item
  * 3: Blue item
* Integer cost: the mana cost of the card,
* Integer attack:  
  * Creature: its attack points
  * Item: its attack modifier
* Integer defense:  
  * Creature: its defense points
  * Item: its defense modifier. Negative values mean this causes damage.
* String abilities of size 6: the abilities of a card. Each letter representing an ability (B for Breakthrough, C for Charge and G for Guard, D for Drain, L for Lethal and W for Ward).
* Integer myHealthChange: the health change for the player.
* Integer opponentHealthChange: the health change for the opponent.
* Integer cardDraw: the additional number of cards drawn next turn for the player.
* Integer area:  
  * 0: Target
  * 1: Lane1
  * 2: Lane2
* Integer lane:  
  * Creature on board: 0 - left, 1 - right
  * Other: -1

Output for only game turn of the Constructed phase 

Series of 30 actions separated by semi-colon ;: 
* CHOOSE id where id is id of chosen card.
* PASS to do nothing (fills rest of the deck with subsequent available cards).

Output for one game turn of the Battle phase

The available actions are: 
* SUMMON id lane to summon the creature of instanceId id from the player's hand to the lane lane (0 - left, 1 - right).
* ATTACK idAttacker idTarget to attack an opposing creature or opposing player of instanceId idTarget with a creature on the board of instanceId idAttacker.  
idTarget can be the "no-creature" identifier \-1. It is used to attack the opponent directly.
* USE idCard idTarget to use an item of instanceId idCard on a creature of instanceId idTarget or without a target with the "no-creature" identifier \-1.
* PASS to do nothing.
Players may use several actions by using a semi-colon ;.   
Players may append text to each of their actions, it will be displayed in the viewer.   
  
Example: SUMMON 3 1;ATTACK 4 5 yolo; ATTACK 8 -1 no fear. 

Constraints

0 ≤ cost ≤ 12  
0 ≤ **creatures on each lane of the board (per player)** ≤ 3  
0 ≤ **cards in hand** ≤ 8  
  
Response time for the Constructed turn ≤ 4000ms  
Response time for the first Battle turn ≤ 1000ms  
Response time per turn ≤ 200ms  

**Acknowledgments**

Created as a part of the master's thesis _**Developing New Track for Strategy Card Game AI Competition: Constructed Mode**, University of Wrocław, 2022_by _**Krzysztof Bednarek**_ ([@Krzybe](https://www.codingame.com/profile/db2e3f0916f9b0e74f4ae3971b2e6df0835705)). 

Supervised by _**Jakub Kowalski**_ ([@aCat](https://www.codingame.com/profile/b528dd3b279d7578674a1129305918e0400484)) and (informally) _**Radosław Miernik**_ ([@radekmie](https://www.codingame.com/profile/2b872a07bc65786f280864cadc2f635c0763881)). 

Part of the **_[Strategy Card Game AI Competition](https://legendsofcodeandmagic.com/)_**supported by **[IEEE CIS](https://cis.ieee.org/)**.
