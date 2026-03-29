# Street Fighter : Level I

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/street-fighter-level-i)

**Level:** easy

## Goal 

Given two champions with list of hits performed by each of them, output who is the winner and the number of hits he made on his opponent.  
  
Rules:  
\- All champions start with rage \= 0  
\- When a champion is hit, his/her rage increases by one.  
\- When a champion uses their special attack,their rage resets to 0.  
\- The fight stops when we reach the last line read or when one fighter is dead (life <= 0)  
  
In the input, each hit is preceded by the direction of the attack:  
\- \> means champion1 hits champion2.  
\- < means champion2 hits champion1.  
  
The table below shows the starting life and the damage caused by punch, kick and special attack of the champions.  

  
Champ.|Life|Punch|Kick|Special Attack  
KEN   |25  |6    |5   |3 * KEN's rage  
RYU   |25  |4    |5   |4 * RYU's rage  
TANK  |50  |2    |2   |2 * TANK's rage  
VLAD  |30  |3    |3   |2 * (VLAD's rage + opponent's rage); and resets opponent's rage to 0  
JADE  |20  |2    |7   |(number of previous hits JADE has made) * JADE's rage  
ANNA  |18  |9    |1   |damage ANNA received * ANNA's rage  
JUN   |60  |2    |1   |1 * JUN's rage; and rage is added to JUN's life  
  
**Example**  
INPUT    COMMENT                                       
KEN RYU  KEN and RYU are fighting   
4        total number of hits performed  
< KICK   Ryu kicks Ken, Ken's life decreases by 5  
< PUNCH  Ryu punches Ken, Ken's life decreases by 4  
> KICK   Ken kicks Ryu, Ryu's life decreases by 5  
< PUNCH  Ryu punches Ken, Ken's life decreases by 4  
         Ryu's life is: 20, Ken's life is: 12          
  
OUTPUT: Ryu beats Ken in 3 hits  

Input

**Line 1**: champion1 champion2 separated by a space where each champion is one of: KEN, RYU, TANK, VLAD, JADE, ANNA, or JUN  
**Line 2**:n is an integer: the total number of hits performed by the champions  
**Next n Lines**: d ATTACK separated by a space where d is \> or < and gives the direction of the attack; ATTACK is one specific attack : PUNCH, KICK or SPECIAL

Output

winner beats opponent in m hits, where m is the number of hits made by the winner against their opponent.

Constraints

champion1 is always different from champion2.  
There is always a winner and a loser. No tie  
If there is no KO, the winner is the one with more life.

Example

Input

KEN RYU
4
< KICK
< PUNCH
> KICK
< PUNCH

Output

RYU beats KEN in 3 hits
