# Propositions in Frege’s ideography

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/propositions-in-freges-ideography)

**Level:** medium
**Topics:** Graphs, Parsing, Logic, Ascii Art

## Goal 

Gottlob Frege is a German mathematician and logician who created a graphical language for the first order and second order logic. Look at the right of the cover image.  
In this puzzle, we will only use propositional calculus.  
  
The following graph means "B implies A":  

--- A  
 '- B

  
This one means "not(B implies A)":  

+-- A  
 '- B

  
And now "B implies not A ":  

--+ A  
 '- B

  
This bigger one means "C implies (B implies A)", that is also "(C and B) implies A":  

----- A  
 | '- B  
 '--- C

  
This last one is not the previous one, it means "(C implies B) implies A":  

----- A  
 '--- B  
   '- C

  
Note that "B implies A" means "A or not B", ie "the case that (B is true and A is False) is False". Every three other cases makes the formula True: "B is True and A is True", "B is False and A is False" and "B is False and A is True".  
Your task is to tell if such a proposition is a tautology or not.  
If it is a tautology (ie True for every possible truth-values of the letters), answer TAUTOLOGY.  
If it is not a tautology, write down each case for which the statement is False, ordered lexicographically.  
Here is an example if the statement has three letters A, B and C and is False if and only if exactly one of the letter is True:  

A False B False C True  
A False B True C False  
A True B False C False

Input

**Line 1:** the number n of lines of the ideography formula  
**Next n lines:** The ideography formula itself

Output

TAUTOLOGY  
or  
one line for each case that makes the formula false (lexicographically ordered)

Constraints

The letters are always upper-cased.  
The formulas are justified, the length of the lines are all equal.

Example

Input

2
--- A
 '- A

Output

TAUTOLOGY
