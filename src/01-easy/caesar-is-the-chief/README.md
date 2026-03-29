# Caesar is the chief

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/caesar-is-the-chief)

**Level:** easy
**Topics:** String manipulation, Cipher

## Goal 

During the galactic war against the Zorglons, the Earth Intelligence Agency intercepted a lot of messages.  
  
It is your task to decode them.  
  
You know that:  
1/ The messages are always in capital letters. Words are separated with white spaces. You do not have to decode these spaces.  
2/ They are coded with a Caesar cipher.  
3/ The Zorglons always include the word CHIEF in them to be sure there are true messages. Be careful, this must be a separate word: a message such as HANDKERCHIEF is not a true message.  
  
Note that the Caesar cipher is a shift in the alphabet: for example, with a right shift of 3, A becomes D, B becomes E... and Z becomes C (reference: https://en.wikipedia.org/wiki/Caesar\_cipher).  
  
Given a message, you must decode it (i.e. find the correct shift and output the text containing the word CHIEF) or output WRONG MESSAGE if it is not a true message. 

Input

**Line 1** One string to decode

Output

**Line 1** One decoded string or WRONG MESSAGE

Constraints

Example

Input

HELLO

Output

WRONG MESSAGE
