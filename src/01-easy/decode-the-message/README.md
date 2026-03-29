# Decode the message

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/decode-the-message)

**Level:** easy
**Topics:** Encoding, Cryptography, Modular calculus

## Goal 

As an FBI agent you intercepted a message from terrorists.  
This message has to be decrypted, and to do so you have access to 2 pieces of information : P and C.  
  
C is the alphabet used to write the message, and contains all the letters/characters needed to decode it.  
  
P corresponds to the encoded value of the message.  
Thankfully, you happen to know how this value is computed, and now need to reverse the following process :  
 \- Assuming the alphabet is 'abcd', each letter is associated to its index : a = 0, b = 1, c = 2, d = 3.  
 \- For the following values, a new letter is either added or switched :  
 \- aa = 4, ba = 5, ca = 6, da = 7  
 \- ab = 8, bb = 9, cb = 10, db = 11  
 \- ...  
 \- aaa = 20, baa = 21, caa = 22, daa = 23, and so on.  
 \- The whole message gets a unique value this way. For example with a full alphabet (26 letters) 'hello' would be 7073801.  
  
Get it done agent ! (Good Luck) 

Input

first line : an integer P, the encoded value of the message.  
second line : a string C, the alphabet used for the message. Every character in the string is unique, and a space can be one of them.

Output

One line containing the decoded message.

Constraints

0 < P < 10^16

Example

Input

35
abcdefghijklmnopqrstuvwxyz

Output

ja
