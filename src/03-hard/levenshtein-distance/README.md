# Levenshtein distance

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/levenshtein-distance)

**Level:** hard

## Goal 

You must find the **Levenshtein distance** between two strings.  
  
The **Levenstein distance** is the minimum number of single-character edits (**insertions**, **deletions** or **substitutions**) required to change one string into the other.  
  
**Ex**: "kitten" and "sitting". The distance is 3.  

kitten -> kitt**i**n -> **s**ittin -> sittin**g**
  
  
**NB:** This distance has a wide range of applications, for instance, spell checkers, correction systems for optical character recognition and many other. 

Input

**Line 1 :** First string  
**Line 2 :** Second string

Output

**Line 1 :** The Levenshtein distance

Constraints

The length of the strings does not exceed 50.

Example

Input

book
back

Output

2
