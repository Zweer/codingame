# 1000000000D WORLD

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/1000000000d-world)

**Level:** easy
**Topics:** Linear algebra, Two pointers

## Goal 

You are in 1000000000D World!  
In 1000000000D World all vectors consist of **exactly** one billion integers.  
  
People of 1000000000D World are quite smart and they know that due to low entropy and "curse of dimensionality" most of their billion-dimensional vectors have a lot of consequent repetitions. So they **always** store their vectors in a compressed form.  
  
For example consider a vector in canonical form:   
  
\[1 1 1 2 2 3 3 3 3 3 3 3 3 3 3 3 3 3 3 ... (999999995 times 3)\].  
  
In **compressed form** it will become just:  
  
\[3 1 2 2 999999995 3\] (which stands for 3 times 1 and 2 times 2 and 999999995 times 3).  
  
Given two 1000000000D vectors A and B in compressed form, **find the dot product of two vectors**.  
  
Dot product definition:  
For two vectors a = \[a\_1 a\_2 ... a\_n\] and b = \[b\_1 b\_2 ... b\_n\] dot product **"a • b"** \= a\_1 \* b\_1 + a\_2 \* b\_2 + ... + a\_n \* b\_n 

Input

**Line 1**: Compressed Vector A  
**Line 2**: Compressed Vector B

Output

Dot product of A and B

Constraints

The absolute values of the final result and all intermediate results are less than 2^40

Example

Input

500000001 1 499999999 -1
1000000000 1

Output

2
