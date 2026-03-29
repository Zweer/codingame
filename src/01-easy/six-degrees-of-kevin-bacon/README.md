# Six Degrees of Kevin Bacon

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/six-degrees-of-kevin-bacon)

**Level:** easy
**Topics:** Graphs, Lists, BFS

## Goal 

**Six Degrees of Kevin Bacon** is a pop-culture game in which an arbitrarily chosen actor is repeatedly connected to another actor via a movie that both actors have appeared in together, repeating this process to try to find the shortest path that ultimately leads to the prolific American actor Kevin Bacon.  
  
Given an actor\_name, an integer n and then that many movie\_casts determine the **Bacon number** of actor\_name, i.e. the minimum number of movies needed to link actor\_name to Kevin Bacon.  
  
**Example:**  
Elvis Presley  
3  
**Change of Habit**: Elvis Presley, Mary Tyler Moore, Barbara McNair, Jane Elliot, Ed Asner  
**JFK**: Kevin Costner, Kevin Bacon, Tommy Lee Jones, Laurie Metcalf, Gary Oldman, Ed Asner  
**Sleepers**: Kevin Bacon, Jason Patric, Brad Pitt, Robert De Niro, Dustin Hoffman  
  
The answer is 2 because Elvis Presley → Ed Asner → Kevin Bacon, using **Change of Habit** to connect Presley and Asner and then **JFK** to connect Asner to Bacon \= 2 degrees of separation. 

Input

**Line 1 :** actor\_name, the name of the actor whose **Bacon number** is being calculated  
**Line 2 :** an integer n  
**Next n lines :** a string movie\_cast in the format Movie\_name: Actor 1, Actor 2, ...

Output

**1 line :** an integer representing the **Bacon number** of actor\_name: the minimum number of movies needed to connect actor\_name to Kevin Bacon

Constraints

There will always be a path to Kevin Bacon.  
0 < n < 50  
Movie casts will contain at most 10 actors.  
A single colon (followed by a space) is used to separate the movie title from the movie cast. A single comma (followed by a space) is used to separate the cast members.  
There will be no colons (:) in movie titles or actor names.

Example

Input

Elvis Presley
3
Change of Habit: Elvis Presley, Mary Tyler Moore, Barbara McNair, Jane Elliot, Ed Asner
JFK: Kevin Costner, Kevin Bacon, Tommy Lee Jones, Laurie Metcalf, Gary Oldman, Ed Asner
Sleepers: Kevin Bacon, Jason Patric, Brad Pitt, Robert De Niro, Dustin Hoffman

Output

2
