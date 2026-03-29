# Heart of the City

[:link: Puzzle on CodinGame](https://www.codingame.com/training/expert/heart-of-the-city)

**Level:** expert

## Goal 

Consider an imaginary city which is an n × n square cells where a building is located at center of each cell (except the central cell), so in total there are n \* n \- 1 buildings. The buildings in this city are all circular and very very small width-wise. All the buildings in the city are the same.   
  
One day you decided to take a walk in this city and go to its center. From that spot you could see many other buildings, but not all of them, because the buildings in the same directions block each other. You have super vision and you can see for miles if nothing is obstructing your vision. How many of these buildings could you see in this city?  
  
**EXAMPLE**  
For n \= 7, the output should be 32\.   
**C** represents center of the city.  
**A** represent the buildings which you could see from there.   
**B** represent the buildings that you could not see.  
  
  
B**A** **A**B**A** **A**B  
**A**B**A**B**A**B**A**  
**A** **A** **A** **A** **A** **A** **A**  
BB**A**C**A**BB  
**A** **A** **A** **A** **A** **A** **A**  
**A**B**A**B**A**B**A**  
B**A** **A**B**A** **A**B  

Input

An odd number n denoting the size of the city.

Output

The amount of buildings you could see from the center of the city.

Constraints

1 < n < 10,000,000 where n is always odd

Example

Input

3

Output

8
