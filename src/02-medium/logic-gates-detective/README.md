# Logic Gates Detective

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/logic-gates-detective)

**Level:** medium
**Topics:** Logic, Dependency Graph

## Goal 

Given a graph of logic gates, can you deduce the values of expected nodes?  
  
In the example case, from (1) a or b -> d and (2) a=0, d=1, we can deduce that b=1.  
Based on the other dependency rules, we got c=0, f=0, g=1 and h=1.  
So the output for h c g is 101. 

Input

**line 1:** the observations for some of the nodes, formatted as node name:value, separated by a space  
**line 2:** the names of the nodes to output, separated by a space  
**line 3:** number of dependency rules n  
**following n lines**: the dependency rules on the graph. formatted as node\_a operation node\_b \-> node\_c, meaning that node\_c is the result of the operation on node\_a and node\_b

Output

a single concatenated string containing the values of the specified nodes in the given order.

Constraints

every node's value is either 1 or 0.  
operation: or, and, xor.  
node name is alphanumeric and always starts with a letter.  
While multiple solutions may exist for a given graph, the sequence of values for the output nodes is guaranteed to be unique.

Example

Input

a:0 d:1 e:0
h c g
5
f or g -> h
d or e -> g
a xor c -> f
b and c -> e
a or b -> d

Output

101
