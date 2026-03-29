# Brackets, Ultimate Edition

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/brackets-ultimate-edition)

**Level:** medium
**Topics:** parenthesis

## Goal 

You must determine the minimum number of bracket-flipping operations needed to make a given expression valid. An expression has a valid bracketing when all the parentheses (), square brackets \[\], curly braces {}  and angle brackets <> are correctly paired and nested.  
  
You can flip a bracketing element in-place by replacing it with its counterpart, e.g. replace a ( with a ), or a \> with a <. For example, flipping both parentheses around in the expression below would make it valid with a cost of 2: 

<{[)abc(]}> → <{[(abc)]}>

  
(This is an arguably harder variant of community puzzle “Brackets, Enhanced Edition”. You may want to complete that one first.) 

Input

**Line 1:** the number N of expressions  
**Next N lines:** an expression

Output

**N lines:** the number F of flips needed to make the expression valid. If the expression cannot be made valid, output \-1.

Constraints

N ≤ 100  
expression length ≤ 10000  
number of bracketing elements ≤ 25  
The expression contains no whitespace.

Example

Input

2
<{[(abc(]}>
<{[(abc>}])

Output

1
-1
