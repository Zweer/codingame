# Bulgarian solitaire

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/bulgarian-solitaire)

**Level:** medium
**Topics:** Loops, Cycle detection

## Goal 

In Bulgarian solitaire you are given piles of cards. In each turn you do 2 steps:  
**Step 1:** Take a card from each pile. Piles with no cards are ignored.  
**Step 2:** Make a new pile with the cards taken in Step 1.  
  
You repeat the steps until you find a **loop**, meaning a configuration which has appeared previously. Again, piles with no cards are ignored. Also, ordering is not important, e.g. 1 card in the first pile and 2 cards in the second pile is considered the same as 2 cards in the first and 1 card in the second.  
  
Card values are irrelevant.  
  
The goal of this puzzle is to find the length of the loop (there is always a loop).  
  
In the examples below, Turn 0 refers to the starting number of cards in each pile, and the other Turns refer to the number of cards in each pile (including a newly created pile) after each turn.  
  
**Example 1:**  
  
Turn 0 | 3  
Turn 1 | 2 1  
Turn 2 | 1 0 2

  
Ignoring ordering and piles with no cards, Turn 1 and Turn 2 show the same configuration of 1 2\. The length of the loop is 1.  
  
**Example 2:**  
  
Turn 0 | 1 3 3 4  
Turn 1 | 0 2 2 3 4  
Turn 2 | 0 1 1 2 3 4  
Turn 3 | 0 0 0 1 2 3 5  
Turn 4 | 0 0 0 0 1 2 4 4  
Turn 5 | 0 0 0 0 0 1 3 3 4

  
Ignoring ordering and piles with no cards, Turn 0 and Turn 5 show the same configuration of 1 3 3 4\. The length of the loop is 5.  
  
**Example 3:**  
  
Turn 0 | 1 0 5 1  
Turn 1 | 0 0 4 0 3  
Turn 2 | 0 0 3 0 2 2  
Turn 3 | 0 0 2 0 1 1 3  
Turn 4 | 0 0 1 0 0 0 2 4  
Turn 5 | 0 0 0 0 0 0 1 3 3  
Turn 6 | 0 0 0 0 0 0 0 2 2 3

  
Ignoring ordering and piles with no cards, Turn 2 and Turn 6 show the same configuration of 2 2 3\. The length of the loop is 4.  
  
  
Reference: https://en.wikipedia.org/wiki/Bulgarian\_solitaire 

Input

**Line 1:** An integer N for the initial number of piles.  
**Line 2:** N space-separated integers C representing the initial number of cards in each pile.

Output

**Line 1:** An integer representing the length of the loop.

Constraints

1 ≤ N ≤ 100

Example

Input

1
3

Output

1
