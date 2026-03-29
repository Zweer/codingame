# Haunted Manor

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/haunted-manor)

**Level:** hard

## Goal 

Given a grid representing a haunted manor filled with mirrors, empty cells, and cells containing different types of monsters, you must determine the type and position of each monster.  
  
The different types of monsters are:  
\- V: Vampire, who can be seen directly, but not inside a mirror.  
\- Z: Zombie, who can be seen both directly and in a mirror.  
\- G: Ghost, who cannot be seen directly but can be seen in a mirror.  
  
Each cell on the border of the grid has a window through which you can peer into the manor. For each border, you are given the number of monsters seen through that window. Line of sight will bounce off the mirrors, making it possible or impossible to see certain monsters.  
  
There are two types of mirror:  
\-\\: Diagonal down.   
\-/: Diagonal up.  
  
  
If your reflected line of sight crosses the same monster more than once, the number will count it each time it is visible, not just once.  
  
The manor is always a square grid. None of the cells are empty.  
  
Example:  
This 3 by 3 manor has 0 vampires, 4 zombies and 2 ghosts. 3 mirrors are present.  
  
   0   0   0  
 ┌───┬───┬───┐  
0│ / │ \ │ / │2  
 ├───┼───┼───┤  
1│   │   │   │1  
 ├───┼───┼───┤  
3│   │   │   │3  
 └───┴───┴───┘  
   3   3   2

  
No monster can be seen from the top because of the mirrors.  
The middle row seems to contain the two ghosts since only 1 monster is visible from either side.  
Using all the reported sightings of monsters through the windows, we can easily come to the configuration below.  
  
   0   0   0  
 ┌───┬───┬───┐  
0│ / │ \ │ / │2  
 ├───┼───┼───┤  
1│ G │ G │ Z │1  
 ├───┼───┼───┤  
3│ Z │ Z │ Z │3  
 └───┴───┴───┘  
   3   3   2

  
The input for this case would be:  

0 4 2  
3  
0 0 0  
3 3 2  
0 1 3  
2 1 3  
/\/  
...  
...

  
And the required output would be:  

/\/  
GGZ  
ZZZ

Input

**Line 1**: Three integers vampireCount, zombieCount, ghostCount, the number of each type of monster in the grid.  
**Line 2**: One integer size, the number of cells in each row/column of the grid.  
**Line 3**: size integers, each for the number of visible monsters from the top of the grid, from left to right.  
**Line 4**: size integers, each for the number of visible monsters from the bottom of the grid, from left to right.  
**Line 5**: size integers, each for the number of visible monsters from the left of the grid, from top to bottom.  
**Line 6**: size integers, each for the number of visible monsters from the right of the grid, from top to bottom.  
**Next size lines:** A string containing size characters. . containing one of the monsters. \\ or / for a mirror.

Output

**Exactly size lines:** size characters for one row of the grid, with each monster in its place. V for a vampire, Z for a zombie, G for a ghost. \\ or / for a mirror.

Constraints

1 ≤ size ≤ 7  
0 ≤ vampireCount ≤ size  
0 ≤ zombieCount ≤ size  
0 ≤ ghostCount ≤ size

Example

Input

0 3 3
3
2 1 2
2 1 0
1 2 2
2 2 0
../
...
/./

Output

ZG/
ZZG
/G/
