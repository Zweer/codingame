# 1. NGR - Basic Radar

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/1--ngr---basic-radar)

**Level:** easy

## Goal 

The NGR company experiments next generation radars.  
They plan to place some plate readers on the road and calculate speed by elapsed time between two points.  
For testing, they put two plate readers on the A21\. One at km 42 called A21-42 and One at km 55 called A21-55.  
The distance between them is 13km.  
  
Find and report all cars over 130km/h with their plate sorted alphabetically.  
  
Timestamp is the number of milliseconds elapsed since January 1, 1970.  
All speed value will be truncated to integer. ( 137.89 -> 137 ) 

Input

**Line 1:** Integer N: Scanned Plate Count  
**Next N lines:** Plate Radarname Timestamp separated by space

Output

Plate Speed separated by space, ordered alphabetically by Plate.

Constraints

10 < N < 1000

Example

Input

20
FH-790-HH A21-42 1620040132000
ET-318-NQ A21-42 1620040623000
BV-670-GV A21-42 1620040665000
FH-790-HH A21-55 1620040747000
DV-046-YY A21-42 1620040839000
ET-318-NQ A21-55 1620041044000
BV-670-GV A21-55 1620041071000
FZ-792-EC A21-42 1620041284000
DV-046-YY A21-55 1620041326000
FZ-792-EC A21-55 1620041633000
BP-301-UL A21-42 1620041863000
BV-047-TT A21-42 1620042133000
BP-301-UL A21-55 1620042487000
BV-047-TT A21-55 1620042570000
FT-918-CZ A21-42 1620042842000
DZ-507-JZ A21-42 1620043072000
DF-857-ZR A21-42 1620043398000
FT-918-CZ A21-55 1620043609000
DZ-507-JZ A21-55 1620043803000
DF-857-ZR A21-55 1620043835000

Output

FZ-792-EC 134
