# Kangaroo words

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/kangaroo-words)

**Level:** easy
**Topics:** Loops, Strings, Sorting

## Goal 

Given a thesaurus, each input line being one group of synonyms, identify all kangaroo words and their corresponding joey words within each group.  
  
A **kangaroo word** is a word that contains all the letters of one of its synonyms, called a **joey word**, arranged so that these letters appear in the same order in both words. For example, the word in**flammable** is a kangaroo word containing the joey word **flammable**; the words: **act**ion, **health**iness, also, each include their own synonyms. In the kangaroo word, the letters may also be separated, as in **ma**scu**l**in**e**, which contains the letters of **male** scattered throughout. - From Wikipedia.  
  
The program must first identify all kangaroo words (note: there may be one or more) and all their joey words for each input line of synonyms, and then output them in alphabetical order of the kangaroo words, one line per kangaroo word. If there are multiple joey words for a kangaroo word, the joeys should be output in alphabetical order too.  
  
The program must output NONE instead if none of the lines in the given thesaurus contains kangaroo words.  
  
Example:  
Given a thesaurus with 2 groups of synonyms:  
  
detect, examine, inspect, note, see, **observe**  
bag, box, can, **container**, tank, tin  
  
There are two kangaroo words, **observe** and **container**. Their joey words are **see**, and **can** and **tin** respectively. After sorting, the output should be:  
  
container: can, tin  
observe: see 

Input

**Line 1:** An integer N for the number of groups of synonymous words to check.  
**Next N lines:** A string containing words that are synonyms, separated by , 

Output

**For each kangaroo word a line containing:** Kangaroo word: First joey, /.../ Last joey   
**OR:** NONE

Constraints

1 ≤ N ≤ 10  
All words contain only lowercase letters.

Example

Input

1
act, action, deed, move, step

Output

action: act
