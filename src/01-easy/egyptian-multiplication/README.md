# Egyptian multiplication

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/egyptian-multiplication)

**Level:** easy

## Goal 

You have to multiply two integers (a & b) by means of a method used in Ancient Egypt, described in Rhind’s hieratic papyrus written circa −1650 by Ahmes.  
  
First, sort the two numbers.  
Then follow the steps below, the algorithm uses base-2 decomposition of the biggest number.  
  
Example: We multiply 12 by 5, here is what you have to print, except the comments after hashes.  
  
  
12 * 5  
= 12 * 4 + 12       # Divide 5 by 2, 5 = 2×2+1  
                      and 12*5 = 12*(2*2+1)  
                               = 12*2*2+12  
                               = 24*2+12  
= 24 * 2 + 12       # Divide 2 by 2, 2 = 1*2+0  
                      and 12*5 = 24*(1*2+0)+12  
                               = 48*1+12  
= 48 * 1 + 12       # Divide 1 by 2, 1 = 0*2+1  
                      and 12*5 = 48*(0*2+1)+12  
                               = 12+48  
= 48 * 0 + 12 + 48  # End of the algorithm  
= 60  

Input

Two integers (a and b) separated by a space.

Output

**A number of lines**: Successive operations.

Constraints

0 <= a, b <= 32768

Example

Input

3 12

Output

12 * 3
= 12 * 2 + 12
= 24 * 1 + 12
= 24 * 0 + 12 + 24
= 36
