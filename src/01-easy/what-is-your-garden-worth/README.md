# What 🌼 is 🌷 your 🌸  garden 💐 worth?

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/what-is-your-garden-worth)

**Level:** easy
**Topics:** Hash tables, Mathematics, String manipulation

## Goal 

You have planted an emoji garden, but it has some empty spots and some ASCII-weeds growing in it too.  
  
The local buying co-op has published its offeringStatement which shows the emojis it will buy this season, and how much it is offering for each (dollarAmount) .  
(It likely won't buy every type of emoji and of course it doesn't buy weeds or empty space.)  
  
Calculate the worth of your garden.  
  
NOTE: garden is not necessarily a perfect rectangle.  
  
  
.  
  
  
.  
  
  
.  
  
  
\~ \~ \~ \~ \~  
Hint if needed:   
Currently the console of CodinGame cannot display non-ASCII characters properly. One way to print (debug) the input in the console is to convert the input characters to their character codes and print those codes instead. 

Input

**Line 1:** An integer numOfLinesOfOfferingStatement, which is the number of lines of offeringStatement  
**Next numOfLinesOfOfferingStatement:** A string consisting of $dollarAmount (an integer), followed by  \=  (with a space on either side), followed by each emoji that is worth that dollarAmount. (There is no space between emojis.)  
  
**Next Line:** An integer, gardenHeight, representing the number of rows that are the garden  
**Next gardenHeight Lines:** the garden

Output

**Line 1:** An integer, the worth of your garden. Include $ and include a comma (,) as needed for "thousands separator"

Constraints

All emojis in the cases can be found on https://emojipedia.org/

Example

Input

2
$12 = 🍓🥒🌿🌹
$10 = 🍃🍍
5
🌱 #~
%+ @🍓
>{~🌱
};-🥜
 ?!${

Output

$12
