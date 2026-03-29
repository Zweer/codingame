# De-FizzBuzzer

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/de-fizzbuzzer)

**Level:** medium
**Topics:** Strings, Arithmetic

## Goal 

We have a mysterious machine, the FizzBuzzer, that implements an advanced version of **FizzBuzz**.   
  
The FizzBuzzer receives a positive integer, and outputs a single string by joining the substrings produced by the rules below and in that order:  
\- produce Fizz for each time the digit 3 appears in the integer;  
\- produce Fizz for each time the integer can be divided by 3;  
\- produce Buzz for each time the digit 5 appears in the integer;  
\- produce Buzz for each time the integer can be divided by 5;  
\- if no Fizz or Buzz has been produced so far, produce the original integer as the substring.  
  
Your task is to **invert** the behaviour of the FizzBuzzer. You will receive some strings, and for each string you should determine the smallest positive integer (up to 1000 inclusive), if any, that would produce that string when fed to the FizzBuzzer. 

Input

**Line 1:** An integer N for the number of strings.  
**Next N lines:** On each line, a string that may have been produced by the FizzBuzzer.

Output

**N lines:** The smallest positive integer (up to 1000 inclusive) that would produce the given string, or the string ERROR if no such integer exists.

Constraints

1 ≤ N ≤ 100  
length of each string ≤ 100  
1 ≤ each output integer ≤ 1000

Example

Input

20
1
2
FizzFizz
4
BuzzBuzz
Fizz
7
8
FizzFizz
Buzz
11
Fizz
Fizz
14
FizzBuzzBuzz
16
17
FizzFizz
19
Buzz

Output

1
2
3
4
5
6
7
8
3
10
11
6
6
14
15
16
17
3
19
10
