# Saving Snoopy

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/saving-snoopy)

**Level:** easy
**Topics:** String manipulation, Data Types, Stack

## Goal 

Snoopy has once again been shot down by the Red Baron and is trapped behind enemy lines. Decode encrypted messages to help rescue Snoopy using the following rules:  
  
The encoded message must be read from left to right.  
  
Character swap rules provided in program input must be honored. Character swaps are case sensitive. Only honor the exact cases specified in the program input.  
  
All plus signs (+) may be ignored in the encoded message.  
  
Stars (\*) are never part of the decoded message. However, any time a star (\*) is observed in the encoded message, the most recently observed (but not discarded) character should be added to the end of the decoded message. You may then discard the star (\*) and the character you just added to the decoded message.  
  
For instance, an encoded message equal to t+c+\*+a+\*+\* would be decoded to cat. Moving from left to right, upon observing the first \*, the c would be added to the decoded message (and then discarded) as it was most recently observed. Upon observing the second \*, the a would be added to the decoded message as it was the most recently observed character that has not yet been discarded. When you get to the last \*, you only have a single character left that has not yet been discarded and you add the t to the decoded message resulting in cat.  
  
Your commanding officer is very particular about formatting. When printing the decoded message, make sure no line has beginning or trailing spaces and make sure each line is as close to 75 characters as possible without going over.  
  
These messages are extremely important. **Make sure your commanding officer reads every word!** 

Input

**Line 1:** An integer n for the number of character swaps.  
**Next n lines:** A string swap containing a character a, an arrow \-> and a second character b, all three separated by spaces, indicating that any time a is seen in an encoded message, it should be replaced with b  
**Next line:** An integer length indicating the length of the encoded message.  
**Next line:** A string encoded\_message containing the encoded message.

Output

The decoded message, broken into multiple strings separated by line breaks if necessary, where no string has leading or trailing spaces and each string is as close to 75 characters as possible without going over.

Constraints

2 ≤ n ≤ 26  
10 ≤ length ≤ 2000

Example

Input

13
v -> m
e -> v
g -> e
l -> g
s -> l
f -> h
a -> f
y -> a
z -> y
i -> z
k -> i
m -> s
h -> k
1419
m+g+W+*+*+k+s+*+t+ +g+v+o+c+*+*+*+*+o+t+ +*+*+*+*+*+ +g+f+*+*+*+m+g+r+*+*+*+*+*+s+y+t+*+*+g+g+c+n+*+*+*+u+o+Y+ +!+*+*+*+*+*+f+ +r+*+*+*+*+*+m+k+p+*+ +*+*+*+o+.+y+k+g+r+g+r+l+ +*+*+*+*+s+t+y+*+*+*+z+*+p+p+y+ +*+*+*+*+*+*+c+*+*+*+t+*+d+g+*+*+*+a+n+U+ +*+*+*+*+*+k+n+s+g+n+u+t+r+*+*+*+*+t+y+*+*+*+*+S+ +,+z+*+*+*+*+*+y+l+y+z+p+o+o+*+*+*+*+ +f+ +*+*+o+ +m+y+*+*+*+*+g+c+n+*+*+*+*+*+*+*+*+B+ + +m+ + +n+*+*+n+g+g+b+*+*+*+*+*+*+n+t+o+f+*+*+*+w+o+d+ +*+*+*+*+*+*+g+z+b+*+*+f+t+ +*+*+*+*+R+ +*+*+d+g+*+*+*+*+f+ +r+y+*+*+ +n+o+*+*+*+z+ +d+n+y+*+*+*+*+*+r+u+o+*+*+*+*+*+r+o+d+g+g+k+ +p+s+g+*+*+*+*+*+g+n+ +m+*+*+*+*+*+d+*+*+*+w+g+r+y+W+ +.+*+*+*+ +g+*+*+*+*+*+ +*+*+*+*+p+m+g+d+ +k+h+*+*+l+n+*+*+*+*+*+*+*+g+*+z+s+g+y+r+*+*+t+*+*+*+*+g+d+ +*+o+t+*+*+ +*+*+*+ +y+f+k+v+r+g+t+*+*+*+*+*+ +g+n+*+*+*+*+ +m+k+*+*+s+ +*+*+n+o+k+t+y+c+o+*+*+*+*+*+*+*+*+*+d+n+*+*+*+o+o+c+*+*+*+c+y+ +n+d+r+*+*+y+t+y+n+k+*+*+*+*+ +g+*+*+*+*+*+t+x+g+*+*+*+r+*+*+*+m+o+k+t+*+*+*+o+t+ +d+ +g+p+ +n+*+*+*+W+ +n+y+s+*+*+*+.+*+*+*+*+*+g+g+n+*+*+*+*+*+*+*+o+u+c+m+g+r+ +*+*+*+*+*+*+ +g+*+*+o+n+S+*+*+*+*+s+s+y+r+g+b+ +z+p+*+*+*+*+*+o+a+*+*+*+f+ +g+*+*+*+ +g+*+*+a+*+*+*+*+*+g+g+ +o+t+n+k+ +*+*+*+*+*+*+*+g+h+ +z+v+g+n+*+*+*+*+*+n+y+f+*+*+*+!+m+d+*+*+*+ +y+g+s+P+ +*+*+*+*+*+g+m+*+*+*+*+*+*+v+o+c+ +p+*+*+*+*+v+*+*+o+k+c+k+n+u+*+*+*+*+t+y+*+*+*+*+o+ +n+*+m+*+*+*+p+*+ + + +n+g+*+*+*+d+n+y+*+*+*+*+z+d+ +b+*+g+*+*+y+g+r+*+*+*+*+*+o+t+ +*+*+*+*+!+g+o+v+*+*+e+*+*+*

Output

Welcome to the resistance! Your help is greatly appreciated. Unfortunately,
Snoopy has once again been shot down by the Red Baron and your help is
needed. We are working desperately to determine his location and coordinate
an extraction plan. We need to rescue Snoopy before he falls into enemy
hands! Please keep communications open and be ready to move!
