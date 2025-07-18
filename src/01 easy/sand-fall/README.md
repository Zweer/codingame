# Sand Fall

## Goal

`n` grains of sand are being dropped one at a time inside a box of dimensions `w` x `h`. Display the resulting box content after the last grain stopped falling.

Each grain of sand is represented by an alphabetical character (a-z or A-Z) and by its initial position `p` above the box.

### Sand behavior

If there is an empty space below it, it drops down.
If there is not an empty space directly below it, but there is space at either diagonally adjacent position below (left or right, see the next two rules), then it will move horizontally in that direction before falling down again.
If it is a lowercase character, it first tries to fall down, then towards the right, and then towards the left.
If it is an uppercase character, it first tries to fall down, then towards the left, and then towards the right.
If it can't fall down (below, to the right, or to the left) it has reached its final position.

### Example

With this input:

5 3
6
a 2
b 2
c 2
d 2
e 2
F 2

After **a 2**, 'a' drops to the bottom. ('x's are only here for explanation purposes.)

xxxxx
xxxxx
xxaxx

After **b 2**, 'b' couldn't go on 'a', so it tried right of 'a' (because 'b' is lowercase) and found empty space.

xxxxx
xxxxx
xxabx

After **c 2**, 'c' couldn't go on 'a', tried right but couldn't go on 'b', so it tried left and found empty space.

xxxxx
xxxxx
xcabx

After **d 2**, 'd' couldn't go on 'a', tried right but couldn't go on 'b', tried left but couldn't go on 'c', so reached its final position.

xxxxx
xxdxx
xcabx

After **e 2**, 'e' couldn't go on 'd', found empty space right of 'd', kept falling, couldn't go on 'b', found empty space right of 'b'.

xxxxx
xxdxx
xcabe

After **F 2**, 'F' couldn't go on 'd', found empty space left of 'd', kept falling, couldn't go on 'c', found empty space left of 'c'.

xxxxx
xxdxx
Fcabe

## Input

**Line 1**: Two integers `w` and `h` representing the width and height of the box.
**Line 2**: `n`: the number of grains of sand being dropped.
**Next `n` lines**: The character `s` representing the grain of sand followed by its initial position `p` above the box, separated by a space. `p` = 0 if it is above the left-most column and `p` = `w` - 1 if it is above the right-most column of the box.

## Output

`h` lines: the box content, outlined by | on both sides.
Last line: the box bottom, represented by +----+ where - is repeated `w` times.

## Constraints

2 <= `w`, `h` <= 50
0 < `n` < 256
0 <= `p` < `w`
All grains will fit inside the box.

## Example

### Input

3 3
4
n 1
e 1
o 1
A 1

### Output

|   |
| A |
|one|
+---+

## Auto Generated Hint

```ts
/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

var inputs: string[] = readline().split(' ');
const W: number = Number.parseInt(inputs[0]);
const H: number = Number.parseInt(inputs[1]);
const N: number = Number.parseInt(readline());
for (let i = 0; i < N; i++) {
  var inputs: string[] = readline().split(' ');
  const S: string = inputs[0];
  const P: number = Number.parseInt(inputs[1]);
}

// Write an answer using console.log()
// To debug: console.error('Debug messages...');

console.log('answer');
```
