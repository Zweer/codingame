# Add'em Up

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/addem-up)

**Level:** easy
**Topics:** Greedy algorithms, Sorting

## Goal 

In a CardFight® game, players are fighting each other by assembling a deck of cards and use strategy and tactics to defeat their opponents. Each card has a health point recorded as an integer. Cards with too low health points are quite useless in the battle arena.  
  
However, low health point cards still have their value. CardFight® company is offering a conversion service, which is a machine allowing players to insert two cards, press a recycle button, and get output of one new card with a health point equals to the sum of the two original cards.  
  
It seems there is no upper limit to the health points in cards produced by the machine. Hurray! By making good use of this conversion machine, you can trade-in your cards to get new cards with as high health points as you wish.  
  
You know the business rule - nothing is free. Every time when you obtain a new card from the machine, you have to pay a service fee proportional to the health point on the new card. For example, if you insert an old 1-point card and another old 2-point card, you will obtain a new card of 3 points. CardFight® will debit you 3 dollars from your account.  
  
When you have a stack of cards wishing to add up their points into a new card, you find that ordering matters.  
  
Say, you have three cards of points 1, 2 and 3.  
Insert 1 and 2 to get a new card of 3 points. Cost $3.  
You now have a new 3-point card and your original 3-point card.  
Insert 3 and 3 to get a new card of 6 points. Cost $6.  
Total cost is $9.  
  
Doing it in another way.  
Insert 2 and 3 to get a new card of 5 points. Cost $5.  
You now have a new 5-point card and your original 1-point card.  
Insert 1 and 5 to get a new card of 6 points. Cost $6.  
Total cost is err... $11?!  
  
Being a smart player you should find the best strategy to finish the trade-in with the lowest cost. 

Input

**Line 1:** An integer N for the number of cards to trade-in.  
**Line 2:** N positive integers separated by space, representing the point value on each card.  
Your target is to trade-in all the cards in the list into one new card.

Output

**Line 1 :** The lowest total cost to finish the conversion

Constraints

2 ≤ N ≤ 5000  
each integer x will be 0 < x ≤ 100000

Example

Input

3
1 2 3

Output

9
