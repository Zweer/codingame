# CGX Formatter

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/cgx-formatter)

**Level:** hard
**Topics:** Parsing, Strings

At CodinGame we like to reinvent things. XML, JSON etc. that’s great, but for a better web, we’ve invented our own text data format (called CGX) to represent structured information.

  
Here is an example of data structured with CGX:​ 

![](fileservlet?id=296581345074)

Example of CGX formatted content.

![](fileservlet?id=296604210021)

Graphical representation of the example.

  
​  
CGX content is composed of ELEMENTs.  
  
**ELEMENT**  
An ELEMENT can be of any of the following types BLOCK, PRIMITIVE\_TYPE or KEY\_VALUE.  
  
**BLOCK**  
A sequence of ELEMENTs separated by the character `;`  
A BLOCK starts with the marker `(` and ends with the marker `)`.  
  
**PRIMITIVE\_TYPE**  
A number, a Boolean, null, or a string of characters (surrounded by the marker `'`)  
  
**KEY\_VALUE**  
A string of characters separated from a BLOCK or a PRIMITIVE\_TYPE by the character `=`  

![](fileservlet?id=367851360867)

  
Your mission: write a program that formats CGX content to make it readable!  
  
Beyond the rules below, the displayed result should not contain any space, tab, or carriage return. No other rule should be added.​ 
* The content of strings of characters must not be modified.
* A BLOCK starts on its own line.
* The markers at the start and end of a BLOCK are in the same column.
* Each ELEMENT contained within a BLOCK is indented 4 spaces from the marker of that BLOCK.
* A VALUE\_KEY starts on its own line.e.
* A PRIMITIVE\_TYPE starts on its own line unless it is the value of a VALUE\_KEY.
**INPUT:**  
**Line 1**: The number N of CGX lines to be formatted  
**The N following lines**: The CGX content. Each line contains maximum 1000 characters. All the characters are ASCII.  
  
**OUTPUT:**  
The formatted CGX content  
  
**CONSTRAINTS :**  
The CGX content supplied will always be valid.  
The strings of characters do not include the character `'`  
0 < N < 10000 

**EXAMPLE :**

**Input**

4  
  
  
true

**Output**

true

**Input**

1  
'spaces and tabs'

**Output**

'spaces and tabs'

**Input**

1  
(0)

**Output**

(  
0  
)

**Input**

1  
()

**Output**

(  
​)

**Input**

1  
(0;1;2)

**Output**

(  
0;  
1;  
2  
​)

**Input**

1  
(('k1'=1);('k2'=2))

**Output**

(  
(  
'k1'=1  
);  
(  
'k2'=2  
)  
)

**Input**

10  
'users'=(('id'=10;  
'name'='Serge';  
'roles'=('visitor';  
'moderator'  
));  
('id'=11;  
'name'='Biales'  
);  
true  
)

**Output**

'users'=  
(  
(  
'id'=10;  
'name'='Serge';  
'roles'=  
(  
'visitor';  
'moderator'  
)  
);  
(  
'id'=11;  
'name'='Biales'  
);  
true  
)

**Input**

9  
( 'user'= (  
'key'='1= t(c)(';  
'valid'=false  
);  
'user'= (  
'key'=' = ; ';  
'valid'= true  
); ()  
​)

**Output**

(  
'user'=  
(  
'key'='1= t(c)(';  
'valid'=false  
);  
'user'=  
(  
'key'=' = ; ';  
'valid'=true  
);  
(  
​)  
​)
