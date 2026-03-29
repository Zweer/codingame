# The Grand Festival - II

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/the-grand-festival---ii)

**Level:** medium
**Topics:** Dynamic programming, Recursion

## Goal 

**Story:**  
  
The Grand Festival has started! Merry and Pippin decide to participate in its competitions. There are a variety of competitions, like archery, swordifighting, hunting, riding, etc.  
However, they realize that after playing some tournaments consecutively, they need to rest a week. They gather information about the prize money of each competition. 1 competition is held every week.  
Merry and Pippin decide they will try to get the maximum prize money. For this, they ask Gandalf for help. Help Gandalf choose which tournaments They should play.  
  
\-------------------------------------------------- xxx --------------------------------------------------  
  
**Rules:**  
  
There are N tournaments in all, held from week 1 to week N.  
Merry and Pippin can play at most R consecutive tournaments before they have to rest.  
The prize money for all the tournaments will be given to you.  
You need to display the tournaments they should play in order to get maximum prize money.  
  
\-------------------------------------------------- xxx --------------------------------------------------  
  
**Example:**  
  
Let there be 10 tournaments  
Let Merry and Pippin be able to play 4 weeks consecutive  
Let the prize moneys be: 15, 32, 22, 29, 19, 39, 20, 30, 12, 47  
To get the maximum they must play in the following weeks:   
1\>2\>3\>4\>6\>7\>8\>10  
Your program must display the above output  
  
\-------------------------------------------------- xxx --------------------------------------------------  
  
**Note:**  
  
This is the second in a series of puzzles. The first puzzle required you to display the maximum prize money. This one requires you to display the path. It is recommended to solve the first puzzle before starting this. 

Input

**Line 1:** An integer N  
**Line 2:** An integer R  
**Next N Lines:** An integer PRIZE, the prize for the tournament that week

Output

**Line 1:** The weeks in which Merry and Pippin should play, to get the maximum prize money, in the following format:  
"W1\>W2\>W3\>...>Wk"

Constraints

Example

Input

7
3
13
12
11
9
16
17
100

Output

1>2>3>5>6>7
