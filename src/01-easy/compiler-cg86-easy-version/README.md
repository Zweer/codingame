# Compiler CG86 (Easy Version)

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/compiler-cg86-easy-version)

**Level:** easy
**Topics:** Conditions, Loops, Arrays, Hash tables, Data Types

## Goal 

**CG86** is a minimal arithmetic compiler targeting a fictional assembly language. It supports only addition and subtraction, using a single register cgx, initialized to zero.  
  
To reduce the instruction count, repeated operations can be compressed using the REPEAT instruction.  
  
**Instruction Set**:  
  
ADD cgx X: Adds X to cgx   
SUB cgx X: Subtracts X from cgx   
REPEAT N: Repeats the next instruction N times   
EXIT: Terminates the program  
  
The REPEAT instruction applies only to **identical operations** — that is, instructions of the same type and operand (e.g., multiple instances of ADD cgx 5).  
  
The REPEAT instruction must come before the instruction it repeats.  
  
Identical operations must be compressed using the REPEAT instruction, even if they do not appear consecutively in the original expression.  
  
Instructions must preserve the original order of computation and may only be optimized using the REPEAT instruction. Reordering or merging of non-identical operations is not allowed.  
  
The program must end with an EXIT instruction. 

Input

A single line containing a space-separated arithmetic expression, alternating between integers and + or - operators.

Output

A sequence of CG86 instructions, with one instruction per line, following the specified order and optimization rules.

Constraints

The length of the input expression is less than 1024 characters.  
All numbers in the input expression are integers between 1 and 9 (inclusive).  
The expression is well-formed and contains at least two numbers and one operator.

Example

Input

1 + 2 + 2 + 2 + 2 - 3

Output

ADD cgx 1
REPEAT 4
ADD cgx 2
SUB cgx 3
EXIT
