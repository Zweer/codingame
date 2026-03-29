# The River I.

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/the-river-i-)

**Level:** easy
**Topics:** Conditions

## Goal 

A digital river is a sequence of numbers where every number is followed by the same number plus the sum of its digits. In such a sequence 123 is followed by 129 (since 1 + 2 + 3 = 6), which again is followed by 141.  
  
We call a digital river **river K**, if it starts with the value K.  
  
For example, river 7 is the sequence beginning with {7, 14, 19, 29, 40, 44, 52, ... } and river 471 is the sequence beginning with {471, 483, 498, 519, ... }.  
  
Digital rivers can meet. This happens when two digital rivers share the same values. River 32 meets river 47 at 47, while river 471 meets river 480 at 519.  
  
Given two **meeting** digital rivers print out the meeting point.  
  
(Idea : BIO'99) 

Input

**Line 1:** The first river r1.  
**Line 2:** The second river r2.

Output

**Line 1 :** The meeting point of the rivers given.

Constraints

0 < r1 ≤ 20000000  
0 < r2 ≤ 20000000

Example

Input

32
47

Output

47
