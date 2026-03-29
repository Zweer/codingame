# FireControl

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/firecontrol)

**Level:** easy
**Topics:** Conditions, Loops, Arrays, Lists, Strings

## Goal 

You need to cut down some trees in a forest fire to stop the fire from spreading. Write code to help you determine the least amount of trees to cut to contain the fire.  
  
The size of the forest is a **6 by 6 grid**.  
Fire can spread sideways as well as diagonally, and continue to spread until it is stopped.  
To stop the fire, it must be surrounded by **two layers** of non-flammable space, consisting of either cut-down trees or empty space.  
  
# Tree  
\= Cut-down tree  
o Empty space  
\* Fire  
  
If there are no trees that can be saved by blocking the fire, output: JUST RUN.  
if there is no fire, output: RELAX.  
  
**Example**  
  
Input:  

*#####  
######  
######  
######  
######  
######

  
To be cut:  

*12###  
345###  
678###  
######  
######  
######

  
Output:   

8

Input

**6 lines of 6 characters** for the 6x6 grid of the forest.

Output

The number of trees to be cut  
or JUST RUN  
or RELAX

Constraints

Example

Input

######
######
######
######
######
******

Output

12
