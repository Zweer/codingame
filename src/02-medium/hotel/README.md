# Hotel

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/hotel)

**Level:** medium
**Topics:** DFS

## Goal 

You are at the reception desk of a 4-floor hotel and a group of c customers arrive and ask for a room.  
  
But what should have been a routine task becomes a nightmare when you realise they have very specific demands !  
  
Your job is to assign a floor (from 0 to 3) for each of them while respecting their r rules.  
  
There are 10 types of rules:  
  
customer\_name is at floor y   
customer\_name is NOT at floor y   
There's nobody at floor y  
There are exactly two customers at floor y  
customer\_name is alone at his/her floor  
customer\_name is with two other customers at his/her floor  
customer\_name is just above customer\_name   
customer\_name is higher than customer\_name  
customer\_name is at the same floor as customer\_name  
customer\_name is NOT at the same floor as customer\_name  
  
There is a unique solution for each test.  
  
This puzzle is inspired by the boardgame Gamme Logic - Hôtel 

Input

**Line 1:** An integer c for the number of customers.  
  
**Next c lines:** A string customer\_name  
  
**Next line:** An integer r for the number of rules.  
  
**Next r lines:** A string rule

Output

**c lines in input order** A string with customer\_name floor separated by a space

Constraints

3 <= c <= 6  
3 <= r <= 8

Example

Input

3
Jon Snow
Daenerys Targaryen
The Night King
4
The Night King is alone at his/her floor
There's nobody at floor 0
Jon Snow is just above Daenerys Targaryen
Jon Snow is at floor 2

Output

Jon Snow 2
Daenerys Targaryen 1
The Night King 3
