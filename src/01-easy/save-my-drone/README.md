# Save my Drone!

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/save-my-drone)

**Level:** easy
**Topics:** Loops, Parsing, Run-length encoding

## Goal 

Inspired by the modular ship builder game "Droneboi" by Beau.  
Generate a save-file for your drone from an ASCII represenation, though make sure to flip it upright first!  
  
Given a representation of a drone rotated 0° or 180°, rotate it back into the correct orientation of 0°, and compress it using Run-Length encoding.   
  
Each character should be replaced by its corresponding tile name in the output.  
**However, junk tiles (any characters other than** #, ^, @, +, **and** $, **including newlines and spaces) should be ignored and should not interrupt the encoding.**  
  
The following are the valid tiles and their names:  
\- # Block  
\- ^ Thruster  
\- @ Gyroscope  
\- + Fuel  
\- $ Core   
  
**Run-Length Encoding:** https://en.wikipedia.org/wiki/Run-length\_encoding 

Input

**Line 1:** An integer X for the width of the grid.  
**Line 2:** An integer Y for the height of the grid.  
**Line 3:** An integer R that is either 0 or 1, corresponding to 0° and 180° rotation.  
**Next Y lines:** A string of X characters representing the drone.

Output

A string containing the Run-Length encoded data in the format #Tile occurrences Tile name, and **followed by** s **if plural**, separated by a comma and a space.  
**If no ship exists, print** Nothing

Constraints

14 > X \> 0  
14 > Y \> 0

Example

Input

3
3
0
.@.
+$+
^.^

Output

1 Gyroscope, 1 Fuel, 1 Core, 1 Fuel, 2 Thrusters
