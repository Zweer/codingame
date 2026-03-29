# EUROPEAN RUGBY CHAMPIONS CUP RANKING

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/european-rugby-champions-cup-ranking)

**Level:** medium

## Goal 

Every year the best rugby teams in Europe compete in the European Rugby Champion's Cup (ERCC). Since 2014 the tournament is organized as follows:  
\- 20 teams are split into 5 pools of 4 teams. During the pool stage, each team plays the 3 other teams of the pool twice (home/away games).  
\- Then the 8 best teams (the 5 pool leaders and 3 best runners-up) play the quarter-finals, such as:  
 \- The best leader (#1) receive the third best runners-up(#8)  
 \- The second best leader (#2) receive the second best runners-up(#7)  
 \- The third best leader (#3) receive the best runners-up(#6)  
 \- The fourth best leader (#4) receive the worst leader (#5)  
\- Then it is classical semi-finals and final.  
  
**Given the 4 teams of each group and the 60 games results of the pool-stage, your goal is to display the 4 quarter-finals**.  
  
  
INTRA-POOL RANKING RULES:  
\- Each team plays 6 games. A **victory** is worth **4 ranking-points**, a **draw 2 ranking-points**, a **loss 0 ranking-point**. Each team can have up to **2 bonus ranking-points** per game: **1 ranking-point for each team** that **scored at least 4 tries**, **1 ranking-point for the losing team** if they **lost by a maximum of 7 game-points**.  
\- In the event of a tie between two or more teams, the best-ranked team is selected using following tie-breakers:  
 \- The team with the **greatest number of ranking-points** (including bonus points) from **only games involving tied teams**.  
 \- If equal, the team with the **best aggregate game-points difference** from **those games**  (game-points scored minus game-points conceded) (In this puzzle, you won't need more tiebreaker criteria).  
  
INTER-POOL RANKING RULES:  
To rank teams that are not in the same pool (in order to find who is qualified to the quarter-finals), the following criteria are used:  
 \- **Ranking** in their pool (Leader, runner-up, third place, last place)  
 \- **Highest number of ranking-points** in their pool  
 \- If equal, **best aggregate game-points difference** (game-points scored minus game-points conceded) (In this puzzle, you won't need more tiebreaker criteria). 

Input

**5 lines**: 4 Teams for each pool, separated by a comma. Ex:  
ASM Clermont Auvergne,Saracens,Munster,Sale Sharks  
**60 lines**: games, format: TEAM\_A,GAME\_POINTS\_TEAM\_A,NB\_TRIES\_TEAM\_A,TEAM\_B,GAME\_POINTS\_TEAM\_B,NB\_TRIES\_TEAM\_BEx:  
Harlequins,25,1,Castres Olympique,9,0  
means that Harlequins defeated Castres Olympique 25 to 9, with Harlequins scoring 1 try and Castres Olympique scoring no try.

Output

**4 lines**: The four 1/4 finals, in order:  
TEAM\_RANKED\_#1 \- TEAM\_RANKED\_#8  
TEAM\_RANKED\_#2 \- TEAM\_RANKED\_#7  
TEAM\_RANKED\_#3 \- TEAM\_RANKED\_#6  
TEAM\_RANKED\_#4 \- TEAM\_RANKED\_#5

Constraints

0 <= Game\_Points <= 120  
0 <= Nb\_Tries <= 20

Example

Input

Cardiff Blues,FC Grenoble,London Irish,Rovigo Delta
Atlantique Stade Rochelais,Aviron Bayonnais,Connacht,Exeter Chiefs
Bucuresti Wolves,Newcastle Falcons,Newport Dragons,Stade Francais Paris
Edinburgh Rugby,London Welsh,Lyon Olympique Universitaire,Union Bordeaux-Begles
CA Brive,Gloucester Rugby,US Oyonnax,Zebre
Cardiff Blues,37,5,FC Grenoble,14,1
London Irish,70,10,Rovigo Delta,14,2
Rovigo Delta,18,2,Cardiff Blues,33,5
FC Grenoble,15,0,London Irish,25,4
FC Grenoble,68,10,Rovigo Delta,10,1
Cardiff Blues,24,3,London Irish,14,2
Rovigo Delta,17,1,FC Grenoble,20,4
London Irish,34,3,Cardiff Blues,23,2
Cardiff Blues,104,16,Rovigo Delta,12,2
London Irish,43,6,FC Grenoble,41,4
Rovigo Delta,6,0,London Irish,34,5
FC Grenoble,3,0,Cardiff Blues,28,4
Connacht,48,7,Atlantique Stade Rochelais,12,2
Aviron Bayonnais,30,3,Exeter Chiefs,24,2
Atlantique Stade Rochelais,25,3,Aviron Bayonnais,13,1
Exeter Chiefs,33,5,Connacht,13,1
Atlantique Stade Rochelais,10,1,Exeter Chiefs,36,4
Connacht,42,5,Aviron Bayonnais,19,1
Exeter Chiefs,41,6,Atlantique Stade Rochelais,17,2
Aviron Bayonnais,27,3,Connacht,29,2
Aviron Bayonnais,14,2,Atlantique Stade Rochelais,0,0
Connacht,24,4,Exeter Chiefs,33,3
Exeter Chiefs,45,6,Aviron Bayonnais,3,1
Atlantique Stade Rochelais,20,2,Connacht,30,4
Newcastle Falcons,43,7,Bucuresti Wolves,19,3
Stade Francais Paris,22,1,Newport Dragons,38,4
Newport Dragons,26,3,Newcastle Falcons,30,3
Bucuresti Wolves,9,0,Stade Francais Paris,13,1
Newcastle Falcons,30,4,Stade Francais Paris,23,2
Bucuresti Wolves,10,1,Newport Dragons,37,5
Stade Francais Paris,31,5,Newcastle Falcons,24,3
Newport Dragons,69,11,Bucuresti Wolves,17,3
Stade Francais Paris,47,7,Bucuresti Wolves,12,0
Newcastle Falcons,29,4,Newport Dragons,40,6
Newport Dragons,30,2,Stade Francais Paris,19,3
Bucuresti Wolves,10,1,Newcastle Falcons,52,8
Union Bordeaux-Begles,13,1,Edinburgh Rugby,15,2
Lyon Olympique Universitaire,28,4,London Welsh,18,2
London Welsh,20,2,Union Bordeaux-Begles,52,7
Edinburgh Rugby,25,1,Lyon Olympique Universitaire,17,2
Union Bordeaux-Begles,37,5,Lyon Olympique Universitaire,29,2
Edinburgh Rugby,25,3,London Welsh,13,1
Lyon Olympique Universitaire,37,4,Union Bordeaux-Begles,28,3
London Welsh,6,0,Edinburgh Rugby,24,2
Union Bordeaux-Begles,26,4,London Welsh,3,0
Lyon Olympique Universitaire,21,2,Edinburgh Rugby,19,2
Edinburgh Rugby,38,4,Union Bordeaux-Begles,20,2
London Welsh,12,2,Lyon Olympique Universitaire,17,3
Gloucester Rugby,55,7,CA Brive,0,0
Zebre,24,2,US Oyonnax,33,3
CA Brive,21,3,Zebre,26,2
US Oyonnax,15,0,Gloucester Rugby,25,1
CA Brive,22,3,US Oyonnax,30,3
Gloucester Rugby,35,4,Zebre,10,2
Zebre,16,2,Gloucester Rugby,32,4
US Oyonnax,22,3,CA Brive,17,2
Gloucester Rugby,33,5,US Oyonnax,3,0
Zebre,23,2,CA Brive,13,1
CA Brive,20,2,Gloucester Rugby,31,4
US Oyonnax,20,3,Zebre,3,0

Output

Gloucester Rugby - Connacht
Exeter Chiefs - Newcastle Falcons
Newport Dragons - Cardiff Blues
London Irish - Edinburgh Rugby
