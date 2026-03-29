# Lost astronaut

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/lost-astronaut)

**Level:** medium
**Topics:** Loops, Brute-force, Radix

## Goal 

We lost an astronaut in space! But luckily the astronaut survived and he made a signal transmitter from broken parts of his spaceship. It is transmitting but some letters are converted to binary, octal, or hexadecimal randomly.   
  
You are the best programmer we got. We need you to make a program to convert these values and decode an original sentence typed by the astronaut.  
  
You should assume that the transmission contains only the ASCII codes for **letters and space**.  
For example, if you receive "45" it is the hexadecimal code for the character E. It cannot be octal code for % because that character is not a letter or space.  
  
good luck! 

Input

**Line 1**: integer N number of characters in original message   
**Line 2**: string MESSAGE which consists of N values (can be in binary, octal, hexadecimal or original character) separated by spaces.

Output

the original sentence typed by the astronaut.

Constraints

2 ≤ N ≤ 350  
MESSAGE only has A to Z, a to z, and space ( )

Example

Input

4
1110100 1100101 1110011 1110100

Output

test
