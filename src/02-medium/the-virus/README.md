# The Virus

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/the-virus)

**Level:** medium
**Topics:** BFS, Backtracking

# The Goal 

The Virus is spreading! Your mission: guide it safely out of the system. Slide and shift the molecules, plan every move, and clear the path. Outsmart the infection before it’s too late!

# Rules 

The game is played on a **4×4 board**, rotated by 45°, with the **exit in the far-left corner**. The **Virus**, a red 2×1 molecule, must be guided out of the body through the exit.

 The board may also contain: 

* **Dead cells**: (marked with a skull) – these are immovable obstacles.
* **Enzymes**: molecules which you can slide around to clear the path for the Virus.

You can control molecules — including the Virus — using these rules: 

1. Each molecule has a unique moleculeId.
2. The Virus moleculeId is always equal to 0.
3. In each turn, you may move any molecule one space LEFT, UP, RIGHT, DOWN.
4. **No rotating** or flipping is allowed.
5. If a molecule bumps into another, **both will slide together** in that direction.
6. If any molecule hits a dead cell or leaves the board (except for the exit space), **you fail**.
7. The exit space \[-1, 3\] can be used by any molecule.

Check the image below for a visual explanation of the rules: 

![](https://cdn-games.codingame.com/community/3996809-1755770133429/332699ddbd16748b7a0e8af640bc4944a33229a1e01b1dfe75433b240e261ce9.jpg) 

_Coordinate system, valid (green arrows) and invalid (red arrows) moves_

Victory Conditions

* You guide the Virus to the exit \[-1, 3\]

Loss Conditions

* You do not respond in time.
* You output an unrecognized moleculeId.
* You output an unrecognized direction.
* Any molecule leaves the board or hits a dead cell.
* You exceed the number of turns allowed.

# Additional Info 

\- Press the gear icon on the viewer to access extra display options  
\- This puzzle is based on a board [game named Anti-Virus](https://www.smartgames.eu/uk/one-player-games/anti-virus)  
\- Source code in my [GitHub repo](https://github.com/VizGhar/CG-The-Virus)  
\- Background image from [Freepik.com](https://www.freepik.com/free-photo/red-wooden-christmas-trees-table%5F3347782.htm#fromView=keyword&page=4&position=41&uuid=b7002b40-73dd-4dd9-b20b-2a32355859ad&query=Wood+Wallpaper+1920x1080)  

# Game Input 

Initial input

Line 1: maxTurns \- the maximum number of turns allowed before the Virus kills the body. 

Line 2: deadCount \- the number of dead (immovable) cells 

Next deadCount lines:  2 space-separated integers x y \- the coordinates of each dead cell

Turn input

Line 1: cellCount \- the number of cells currently occupied by molecules (including the Virus).

Next cellCount lines:  3 space-separated integers moleculeId x y the molecule ID and coordinates of a cell, where cells with the same moleculeId belong to the same molecule.

Output

Single line per turn: 2 space-separated integers moleculeId direction \- move the molecule with the given moleculeId in one of the directions: LEFT, UP, RIGHT, DOWN

Constraints

0 ≤ deadCount ≤ 2  
2 ≤ cellCount ≤ 14  
0 ≤ moleculeId ≤ 8  
  
Allotted response time to output in first turn is ≤ 10s

Allotted response time to output in other turns is ≤ 100ms
