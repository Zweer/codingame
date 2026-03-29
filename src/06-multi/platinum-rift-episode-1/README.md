# Platinum Rift - Episode 1

[:link: Puzzle on CodinGame](https://www.codingame.com/multiplayer/bot-programming/platinum-rift-episode-1)

**Level:** multi
**Topics:** Pathfinding, Multi-agent, Resource management

**Important news: what will happen at the end of the contest?**  
  
 At the end of the contest, the following events will unfold: 
* Once the end of contest time had passed, during a first phase, the system will wait for all matches from the last players to have pushed in the arena to end (up to 100 matches).
* Once this first phase is complete, a new batch of 100 matches will be launched **for each of the first 100 players in the leaderboard**. These 100 players will **keep their rank** when starting the new set of matches – i.e. there will be no reset of scores.
* Once all matches are over, a final set of 100 matchs will be launched for the 100 top players in the leaderboard (may not be exactly the same players from phase two).
* Once all matches are done, the leaderboard is final.
 The goal is to make sure that 1) participants have no hesitation sending their AI in the arena just before the end of the contest, 2) the top of the leaderboard is stable. The first 100 players will play more than 300 matches no matter what (in fact way more than 300 matches as they will also play other players' matches, 3000 on average).  
  
 Keep Coding ! 

VIEW MORE +**Planet Earth - Solar year 276453** 

![](https://www.codingame.com/servlet/fileservlet?id=1607059449303)

Biological life forms have long ceased to exist on Earth. They were wiped clean more than 200,000 years ago by sentient synthetic beings: the Platicons. The Platicons were named by their creators – the now extinct humans – in reference to the Platinum, a chemical compound critical to the performance of their central nervous system. 

 The Platicons left Earth on year 63678 at the start of a major period of glaciation. This newly exiled race then divided into four rival factions which now fight each others for survival and universe domination.

 Following major tectonic shifts caused by the glaciation, large Platinum Rifts now abound at the surface of the Earth. As the glacial period is now getting to an end, it is time for Platicons to return to Earth, to mine and extract Platinum and produce more members of their faction.

**You are at the head of a faction and your objective is to conquer back planet Earth.**

**You can navigate within the map in the same way you would on google maps: zoom/unzoom with the mouse wheel and move using drag'n drop. Debug mode is available from the settings panel (the dented wheel).**  
  
**THE PROGRAM:**

 Game is played on a map representing planet Earth continents. Each continent is shaped using **hexagonal zones**.  
  
 Links between zones are provided at the start of a game as a graph.  
  
 When the game starts, all zones are neutral. Platinum-beds are located on a given number of zones. **They produce 1 to 6 bars of Platinum per game round**.  
  
**Your goal is to conquer a maximum of zones using war PODs**. Taking ownership of zones allow you to win more Platinum and buy more PODs. You get ownership of a neutral zone by placing or moving a POD on it.  
  
 You start a game with 200 Platinum bars which is equivalent to 10 war PODs.  
  
 With each game round, the following actions are executed sequentially : 
* First step: **distributing**. Each player receives a number of Platinum bars related to the number of Platinum available on their owned zones.
* Second step: **moving**. Each player moves as many troops as they want on the map.
* Third step: **buying**. Each player buys PODs et puts them on the map.
* Fourth step: **fighting**. Once all players have completed steps 1, 2 and 3, fights are triggered on zones.
* Fifth step: **owning**. Ownership of zones changes.
  
**Rules for distributing:**

* Each player receives as many Platinum bars as the number of bars available on the zones which belongs to the player.
* These bars add up to the number of bars already mined by the player and not yet converted to PODs.
  
**Rules for moving:**

* A POD (or group of PODs) can only make **one move per game round**.
* A POD can only move from one zone to a contiguous zone – either neutral, already owned or owned by an enemy.
* A POD located on a zone where a fight is ongoing – meaning a zone with enemy PODs on it – can only move to a neutral zone or a zone he/she owns. Simply put, **a POD that flees a fight can only retreat on a zone which does not belong to an enemy**.
  
**Rules for buying:**

* Each player can buy as many troops as their Platinum stock allows. **A war POD costs 20 Platinum bars**.
* A freshly bought POD can only be placed on a neutral zone or on a zone owned by the buyer.
  
**Rules for fighting:**

* A fight is triggered on every zone having PODs from 2, 3 or 4 different players.
* For each fight zone, a POD from each player is first destroyed. If PODs from different players are still present on the zone after this destruction, an additional POD from each player still present is destroyed. This phase reproduces itself one more time. **For each fight zone, a player loses a maximum of 3 PODs per game round**.
  
**Rules for owning:**

* A zone with only one player's PODs on it is won – or kept – by this player.
* **A zone with no PODs on it or with PODs from multiple players on it does not change ownership**: it remains neutral or kept by its previous owner.
  
**At the end of a game – 200 rounds –, the player owning the more zones wins.** A game may end sooner if the system realizes that a player has won no matter what, for example if he/she conquered the super-continent Europe-Africa-Asia-Oceania.  
  
 Your program must first read the initialization data from standard input, then, **in an infinite loop**, read the contextual data of the game (ownership of zones and location of PODs) and write to standard output the actions for your PODs. The protocol is detailed below.  
  
**Your program has 100ms maximum each round to send all instructions to your PODs.** 
  
  
**INPUT FOR THE INITIALIZATION PHASE:**  
**Line 1**: 4 integers: 
* playerCount: number of players
* myId: id of your player (0, 1, 2, or 3)
* zoneCount: number of hexagonal zones on the map. Zones are identified with a unique id ranging from 0 to (zoneCount - 1)
* linkCount: number of links between zones – i.e. number of frontiers between zones.
**zoneCount following lines**: for each zone, two integers zoneId platinumSource providing the number of platinum bars that can be mined on that zone per game round.  
**linkCount following lines**: two integers zone1 zone2 providing the ids of two connected zones – meaning a movement is possible from zone1 to zone2 and vice-versa.  
  
**INPUT FOR A ROUND:**  
**Line 1**: an integer platinum providing the number of platinum you have in stock.  
**zoneCount following lines**: for each zone, six integers: 
* zId: id of the zone
* ownerId: player id of the zone owner (-1 for a neutral zone)
* podsP0: number of PODs for player with id 0 on the zone
* podsP1: number of PODs for player with id 1 on the zone
* podsP2: number of PODs for player with id 2 on the zone (always 0 for a two player game)
* podsP3: number of PODs for player with id 3 on the zone (always 0 for a two or three player game)
  
**OUTPUT FOR A ROUND:**  
**Line 1**: A series of movement commands. A movement command is composed of 3 integerspodsCount zoneOrigin zoneDestination which indicate the number of PODs to move from one zone to another.  
 For example 4 2 1 3 2 6 \= two commands: moving four PODs from zone 2 to zone 1 and moving three PODs from zone 2 to 6.  
 Just write WAIT if you do not wish to make any movements.  
  
**Line 2**: A series of purchase commands. A purchase command is composed of 2 integers podsCount zoneDestination which indicate the number of PODs to add to a zone.  
 For example 2 32 1 11 \= two commands: buy two PODs for zone 32 and buy one POD for zone 11.  
 Just write WAIT if you do not want to buy anything.  
  
**CONTRAINTS:** 

2 <= playerCount <= 4

0 <= myId, ownerId < playerCount

zoneCount \= 154 (may be changed during the contest if balancing is required < 200) 

linkCount \= 306 (may be changed during the contest if balancing is required < 400) 

0 <= platinumSource <= 6

0 <= platinum < 100000

0 <= podsP0, podsP1, podsP2, podsP3 < 2000

0 < podsCount < 2000

0 <= zone1, zone2, zoneOrigin, zoneDestination < zoneCount

Duration for a game round: 100ms
