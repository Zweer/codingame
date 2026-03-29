# Detective Geek

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/detective-geek)

**Level:** easy
**Topics:** Loops, Arrays, Strings, Cryptography

## Goal 

Detective Geek has a superpower of knowing when and where a crime is going to happen; unfortunately his superpower is encrypted, and he takes a lot of time decrypting it.  
Everytime he sees a crime using his superpower he starts writing on paper and the result looks like this:  
**#\*######\*#\***  
**mayjul sepsep octapr octsep sepjun octjan**  
  
As he is the one and only detective geek he wants to write a program to help him decrypt faster.  
  
The **first line** represents binary: #\*######\*#\* becomes 10111111010.  
This equals the decimal number 1530, which means the time when the crime is going to happen is 15:30.  
  
The **second line** encodes the address where the crime will take place. Every word in the encrypted address represents a character in the real address.  
A word such as octapr can be split into two strings of length 3 oct and apr which are abbreviations for months **October** and **April**.  
Each month represents a number according to its order in the year. jan \= 0, feb \= 1, mar \= 2, ..., dec \= 11.  
The string of two months represents a two-digit base 12 number. So octapr is 93.  
93 in base 12 becomes 111 in decimal.  
The final step is to look in ASCII table to see what letter corresponds to 111.  
So **octapr** \-> o. 

Input

**line 1** : time **string** representing the time  
**line 2** : address **string** representing the address

Output

**line 1** : time in hh:mm format  
**line 2** : decrypted address

Constraints

date : contains only # and \* ,1<=length<13, represents a valid 24-hr time.  
address : 5<=length<100, decodes to printable ASCII characters.

Example

Input

#*######*#*
mayjul sepsep octapr octsep sepjun octjan

Output

15:30
6hotel
