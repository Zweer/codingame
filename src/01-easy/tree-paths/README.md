# Tree Paths

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/tree-paths)

**Level:** easy
**Topics:** Graphs, Binary Tree

## Goal 

You are given a binary tree, where each node in the tree has two or zero children. If a node **X** has two children, they are called L Left & R Right children respectively. **X** is a **Parent** of L and R.  
  
All trees have one root node, which is the only node without **parent**. All the other nodes have exactly one **parent**.  
  
All tree nodes have assigned a unique number called **index**.  
Given a tree and an index V, **print the path from the root to the tree node with index V**  
  
A **tree path** starts at the root node, and it goes down by choosing the left or the right children until it arrives to the target value. Print the Left & Right elements from the path in a single line.  
  
For instance, if we have the following tree.  

  
     1  
    / \  
   /   \  
  2     \  
 / \     3  
4   5   / \  
       9   \  
            8  
           / \  
          6   7  

  
For this sample tree, **Node 1** is the root, the only one without parents.  
if V \= 5, the Tree Path is Left Right  
if V \= 7, the Tree Path is Right Right Right  
if V \= 6, the Tree Path is Right Right Left 

Input

**Line 1:**  Integer N, the number of nodes in the tree.  
**Line 2:**  Integer V, the index of the target node.  
**Line 3:**  Integer M, the number of nodes with two children.  
**Followed by M lines** containing three numbers P L R each:  
P is the node index  
L is the left children of P  
R is the right children of P

Output

A sequence of Left and Right commands in a single line, representing the tree path from the root node, to the target node V.  
  
If the target node V is the root, print Root.

Constraints

All N node indexes are unique and go from 1 to N.  
All tree nodes belong to a single tree.  
  
0 < N < 128  
1 ≤ V, P, L, R ≤ N

Example

Input

3
2
1
1 2 3

Output

Left
