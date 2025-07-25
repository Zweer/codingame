# Power of Thor - episode 2

## The Goal

Thor must annihilate all the giants on the map: by striking the ground with his hammer he sends out a bolt of light which wipes out the giants which are nearby.

## Rules
In the same way as for the previous game, you will move on a map of **40** wide by **18** high.

Each turn, you must either specify an action:

`WAIT` : Thor does nothing.
`STRIKE` : Thor strikes.

Each time Thor strikes, **all the giants in a square centered on Thor and of 9 spaces wide are destroyed**.

The number of times you can strike the ground is limited.

Or you can move in the same way as in the previous game:

`N` (North)
`NE` (North-East)
`E` (East)
`SE` (South-East)
`S` (South)
`SW` (South-West)
`W` (West)
`NW` (North-West)

On each turn during the game, once Thor has carried out an action, all the remaining giants on the map move in the direction of Thor (without ever overlapping each other).

You lose:
- if a giant moves on top of Thor
- if there are giants remaining on the map and Thor doesn't have any hammer strikes left.
- if Thor moves off the map
- if the program exceeds the maximum number of authorized turns, which is fixed at 200

Victory Conditions
You win when there are no more giants left on the map.

## Note
Do not hesitate to reuse your code from the previous question (copy/paste).

The tests provided are similar to the validation tests used to compute the final score but remain different.

## Game Input
The program must first read the initialization data from standard input. Then, **within an infinite loop**, read the data from the standard input related to Thor's current state and provide to the standard output Thor's movement instructions.

### Initialization input
Line 1: 2 integers `TX` `TY`. (`TX`, `TY`) indicates Thor's starting position.

### Input for one game turn
Line 1: 2 integers `H` `N`:
`H` indicates the remaining number of hammer strikes.
`N` indicates the number of giants which are still present on the map.

N next lines: the positions `X` `Y` of the giants on the map.

### Output for one game turn
A single line, which indicates the movement or action to be carried out: `WAIT` `STRIKE` `N` `NE` `E` `SE` `S` `SW` `W` or `NW`

### Constraints
0 ≤ `TX` < 40
0 ≤ `TY` < 18
0 < `H` ≤ 100
0 < `N` ≤ 100
0 ≤ `X` < 40
0 ≤ `Y` < 18
Response time for each turn ≤ 100ms

### Example
Thor’s starting position on the map is (3, 6). A single giant is on position (3, 8).

#### Initialization input
3 6	Thor = (3, 6)

#### No output expected

#### Input for turn 1
10 1 (Thor has 10 strikes left, there is 1 giant left on the map) 3 8 (The giant is in position (3,8))

#### Output for turn 1
`WAIT` Thor does nothing.

#### Input for turn 2
10 1 (Thor has 10 strikes left, there is 1 giant left on the map)
3 7 (The giant moves towards Thor in position (3,7))

#### Output for turn 2
`STRIKE` Thor strikes and sends out a bolt of light.

Thor has won: the giant has been annihilated!

## Synopsis
Thor strides bravely into the ultimate battle of the Ragnarök, armed with his hammer, which has regained its powers.

In the forefront, a large number of Fire giants, who are the secular enemies of the gods, have come down to the plains of Vigrid to fight Thor.

Thor is counting on the strength of his hammer’s light bolt of power to beat them, but he is still weak and he can only use his hammer a limited number of times.

## Auto generated hint

```ts
/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

var inputs: string[] = readline().split(' ');
const TX: number = Number.parseInt(inputs[0]);
const TY: number = Number.parseInt(inputs[1]);

// game loop
while (true) {
  var inputs: string[] = readline().split(' ');
  const H: number = Number.parseInt(inputs[0]); // the remaining number of hammer strikes.
  const N: number = Number.parseInt(inputs[1]); // the number of giants which are still present on the map.
  for (let i = 0; i < N; i++) {
    var inputs: string[] = readline().split(' ');
    const X: number = Number.parseInt(inputs[0]);
    const Y: number = Number.parseInt(inputs[1]);
  }

  // Write an action using console.log()
  // To debug: console.error('Debug messages...');

  // The movement or action to be carried out: WAIT STRIKE N NE E SE S SW W or N
  console.log('WAIT');
}
```
