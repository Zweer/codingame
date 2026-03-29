# Derivative time !!! - part1

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/derivative-time---part1)

**Level:** medium
**Topics:** Recursion, Abstraction

## Goal 

Story:  
Louise is learning calculus in her maths courses and she likes the idea. When doing her homework, she is not sure and she wants to check her answers with yours. Could you create a program so that we can check the answers?  
  
Calculate, evaluate the partial derivative of a given formula.  
  
For instance,   
given the function formula "(5\*(x\*(y^2)))"   
and "y x", the variables in respect with you must derive it  
So here f(x,y) = 5xy²  
and you have to calculate:  

    d²f(x,y)  
   ----------  
     dxdy

  
it gives you the formula 10\*y,  
At last "x 2 y 6" means x=2, y=6,  
gives you the values with which you must evaluate the obtained derivative  
So the answer should be 60  
  
Note:  
  
To simplify the task, only consider +, \* and ^. And assume that +, \* and ^ always take two arguments and that expressions are fully parenthesized.   
  
Negative power has no parenthesis.   
e.g. (((18\*(x^\-1))+y)+z)  
  
vars may be in other forms other than x, y, and z. Similar to identifiers in many programming languages, the var would be some letter followed by letters, numbers or underscore.  
  
link about calculus rules: **https://en.wikipedia.org/wiki/Differentiation\_rules**  
The rules needed here:  
a'=0  
(a\*x)'=a  
(x^a)'=a\*x^(a-1) (when a is not 0)  
(u+v)'=u'+v'  
(u\*v)'=u'\*v+v'\*u 

Input

**Line 1**: formula  
**Line 2**: list of vars for partial derivative, separated by space, length of the list will be 1, 2 or 3.  
**Line 3**: vars' values, paired and separated by space

Output

The result (always an integer).

Constraints

All numbers are integers.  
  
**Line 2** would give a list from 1 to 3 different/same vars to do partial derivative.  
  
You can assume that the second argument of ^ is constant, to be simple and avoid "ln" or "e^x".  
e.g.:  
will appear:  
(x^y)  
x  
x 1 y 1  
won't appear (this could be too complex):  
(x^y)  
y  
x 1 y 1

Example

Input

(5*(x*y))
x
x 2 y 6

Output

30
