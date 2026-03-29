# Horse-racing Hyperduals

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/horse-racing-hyperduals)

**Level:** easy
**Topics:** Loops

## Goal 

Casablanca’s hippodrome has grown tired of old-fashioned dual racing and has kicked it up a notch: they will now be organizing hyperduals.  
  
During a hyperdual, only two horses will participate in the race. In order for the race to be interesting, it is necessary to try to select two horses with similar strength.  
  
Write a program which, using a given number of strengths, identifies the two closest strengths and shows their difference with an integer.  
  
In a hyperdual, a horse's strength is a bidimensional (Velocity,Elegance) vector. The distance between two strengths (V1,E1) and (V2,E2) is abs(V2-V1)+abs(E2-E1).  
  
(This is a harder version of training puzzle “Horse-racing duals”. You may want to solve that problem first.)  
(To date there is no specific achievement if you solve this one in pure bash. Rest assured it \*is\* possible nonetheless!) 

Input

**Line 1:** the number N of horses  
**N following lines:** the speed Vi and elegance Ei of each horse, space-separated

Output

**Line 1:** the distance D between the two closest strengths

Constraints

10 ≤ N ≤ 600  
0 ≤ Vi,Ei ≤ 10000000  
D ≥ 0  
All values are integral.

Example

Input

10
6850207 0
8707138 0
8028585 0
3635318 0
8612162 0
6854699 0
7106093 0
3721952 0
2670046 0
1746583 0

Output

4492
