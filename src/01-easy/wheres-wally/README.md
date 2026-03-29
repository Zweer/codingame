# Where's Wally

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/wheres-wally)

**Level:** easy
**Topics:** Regular expressions, String manipulation, Ascii Art

## Goal 

You will get a representation of Wally and a Picture.  
  
You must find Wally's position inside the picture. The top left corner of the picture is (x, y)\=(0,0).  
  
**If Wally's representation contains spaces, the picture may contain others characters at these positions.**  
  
**All non-space characters of Wally will be visible in the picture.**  
  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
\* ASCII ART representations of wally are from :  
 \- https://ascii.co.uk/art/men  
 \- https://asciiart.website/index.php?art=comics/dilbert 

Input

**Line 1 :** 2 space-separated integers wallyWidth wallyHeight indicating Wally's size  
**wallyHeight next lines :** Representation of Wally  
**Next Line :** 2 space-separated integers pictureWidth pictureHeight indicating the picture size  
**pictureHeight next lines :** Picture

Output

**Line 1 :**Two space-separated integers x and y indicating the top left corner of Wally in the picture

Constraints

0 < wallyWidth <= mapWidth < 100  
0 < wallyHeight <= mapHeight < 100  
PIcture and Wally representations are limitted to ascii chars

Example

Input

3 3
 O 
/|\
/ \
10 10
..........
.......O..
....../|\.
....../.\.
..........
..........
..........
..........
..........
..........

Output

6 1
