# Substitution Encoding

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/substitution-encoding)

**Level:** easy
**Topics:** Encoding, Strings, String manipulation, 2D array

## Goal 

You want to easily encode and decode messages with a simple and personalized method. To do so, you will use a substitution method.  
  
The principle is simple, you have a comparison table like this one:  
  
A B  
C D  
  
and a message to encode written with the characters available in your table:  
  
CBA  
  
You are going to take each of the characters that compose the message and replace them by its position in the table:  
  
C => 10 (row 1 column 0)  
B => 01 (row 0 column 1)  
A => 00 (row 0 column 0)  
  
The message becomes: 100100 

Input

**Line 1:** An integer rows for the number of rows of the table.  
**Next rows lines:** A string for each row of the table. This string is composed of characters separated by one space.  
**Final line:** The message to encode.

Output

**Line 1:** The encoded message.

Constraints

1 ≤ rows ≤ 10  
All characters in the table are unique.  
All characters in message can be found in the table.

Example

Input

2
A B
C D
CBA

Output

100100
