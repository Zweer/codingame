# BobTheScience and the Food Stack

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/bobthescience-and-the-food-stack)

**Level:** medium
**Topics:** Loops, Brute-force, Greedy algorithms, Sorting

## Goal 

BobTheScience went to a food store. He saw a food store which sells m colorful pancakes, each weigh p\[i\]. He wants to eat all the pancakes, but with the following exceptions:  
**1\.** You need to serve the m pancakes in n stacks.  
**2\.** You need to make it so that the difference between the maximum weight and the minimum weight doesn't exceed d.  
  
**Example:** You need to rearrange 7 pancakes into 3 different stacks, and d is 3\. The weights of the pancakes are **\[1, 2, 3, 1, 2, 3, 1\]**. 1 optimal solution for this testcase is:  
**1\.** Place the 1st pancake in the 1st stack.  
**2\.** Place the 2nd pancake in the 1st stack.  
**3\.** Place the 3rd pancake in the 2nd stack.  
**4\.** Place the 4th pancake in the 2nd stack.  
**5\.** Place the 5th pancake in the 3rd stack.  
**6\.** Place the 6th pancake in the 3rd stack.  
**7\.** Place the 7th pancake in the 3rd stack.  
The total weight of each stack is now **\[3, 4, 6\]**, and the difference between the maximum stack and the minimum stack does not exceed d, which is 3  
  
**Note:**  
Each pancake's weight doesn't exceed d.  
Make sure you add an end line character ('\\n') to the code. (For some programming languages only)  
**\*ALL INDEXES ARE STARTING WITH 1.\*** 

Input

**Line 1:** 3 space-separated unsigned integers m, n, d  
**Line 2:** m space-separated unsigned integers p\[i\] 

Output

**Line 1:** m space-separated unsigned integers, each corresponding to the index of the stack of the ith pancake, starting with 1\. 

Constraints

1<=n<=m<=2500  
1<=p\[i\]<=d<=5000
