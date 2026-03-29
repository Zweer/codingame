# Ted's compiler

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/teds-compiler)

**Level:** easy
**Topics:** Parsing, parenthesis

## Goal 

Ted wants to develop a compiler and knows that one of the most important elements in a compiler is its **parser**  
  
Parsing, syntax analysis, or syntactic analysis is the process of analyzing a string of symbols, either in natural language, computer languages or data structures, conforming to the rules of a formal grammar.  
  
https://en.wikipedia.org/wiki/Parsing  
  
Today, Ted is concerned with an abstract instruction which is composed of the characters < and \> , which he will use on the design of his language, T++ :D.  
  
He understand that, for an expression to be valid, a < symbol must always have a matching \> character somewhere (nested expression are valid) after it. In addition, each \> symbol must exactly match a < symbol.  
  
So, for instance, the instructions:  
  
**<<**\>>  
  
<>  
  
<><>  
  
are all valid. While:  
  
\>>  
  
\><><  
  
are not.  
  
**Given expression which represent some instructions to be analyzed by Ted's compiler, you should tell the length of the longest prefix of this expression that is valid, or 0 if there is not such a prefix.** 

Input

Input will consist of a single line, representing a possible expression in T++.

Output

You should output the length of the longest prefix that is valid or 0 if there is not such a prefix

Constraints

1 ≤ The length of line ≤ 100

Example

Input

<<>>>

Output

4
