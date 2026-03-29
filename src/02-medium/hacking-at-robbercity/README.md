# Hacking at RobberCity

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/hacking-at-robbercity)

**Level:** medium
**Topics:** Cryptography, Cipher, XOR

## Goal 

At RobberCity, it is really hard to send a parcel safely. Postmen are thieves, and you can be sure that without a proper lock, your box will be opened and emptied prior to "delivery".  
This is a famous riddle: how can Alice send a parcel to Bob, without having to send the lock key?  
  
The answer is:  
\* step 1: Alice locks the box using her own lock and send it to Bob.  
\* step 2: Bob receives the unopened parcel, but cannot open it without the key. He add his own lock on the parcel and send it back to Alice.  
\* step 3: Alice gets her parcel back with the 2 locks. She can now remove hers and send it Bob again.  
\* step 4: Bob receives the parcel with his lock, that he can open.  
  
Now, the electronic version!  
This time, Alice wants to send secured data to Bob. They both read this wikipedia article: https://en.wikipedia.org/wiki/XOR\_cipher#Use\_and\_security about the XOR cipher  
**With a key that is truly random, the result is a one-time pad, which is unbreakable in theory.**  
Wow. Unbreakable.  
  
Alice and Bob decided to use the riddle solution applied to XOR.  
\* step 1: Alice encodes her message with her random key, as long as the message itself. She sends it to Bob.  
\* step 2: Bob encodes the ciphered message with his own random key, as long as the message itself. He sends it back to Alice.  
\* step 3: Alice decodes the message with her initial key, and sends it to Bob.  
\* step 4: Bob decodes the message with his initial key, and gets the clear text.  
  
And it works! XOR is both commutative and associative, and A XOR 0 = A and A XOR A = 0\. Hence  

Message XOR AliceKey XOR BobKey XOR AliceKey XOR BobKey  
 = Message XOR (AliceKey XOR AliceKey) XOR (BobKey XOR BobKey)  
 = Message XOR 0 XOR 0  
 = Message

  
You are a man-in-the-middle, intercepting any message between Alice and Bob.  
(Btw, your existence proves that they both really had good reasons to put a data cipher process in place...)  
So, you intercept the 3 messages message1, message2 and message3.  
  
Your goal is to be smarter than the smarties, and to break their code.  
  
Note: intercepted messages are made of bytes (values from 0 to 255), that will be displayed in hexadecimal form.   
Thus, each message will be an hexadecimal string of size 2n, each digit pair corresponds to a byte (from 00=0 to FF=255).  
  
Once you get the clear message bytes, convert to clear text using ASCII encoding. 

Input

**Line 1:** message1, the first message Alice sends to Bob (hexadecimal)  
**Line 2:** message2, the second message Bob sends back (hexadecimal)  
**Line 3:** message3, the last message Alice sends (hexadecimal)

Output

The clear text message

Constraints

Message length ≤ 250 chars (i.e. message1, message2 and message3 lengths are ≤ 500 hexadecimal digits)

Example

Input

391813c092a2d5ac9acb705dfe41be3df08de67d1145cbcc3f
03adeae2c8c2f2336c8a8d312733c2456e76e0b2d9068adc3f
72d0954e354045f09461dc4c911d0b58ff8963efb12c34303f

Output

Hello bob ! How are you ?
