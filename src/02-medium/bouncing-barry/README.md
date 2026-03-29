# Bouncing Barry

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/bouncing-barry)

**Level:** medium
**Topics:** Ascii Art

## Goal 

Barry the bouncing bunny is a bit braindead. Barry mindlessly jumps around on an infinitely large square grid, comprising tiles that initially display the . character. Each time Barry **lands** on a tile, the tile toggles between displaying . and #.  
  
Barry's bouncing behavior is described with a space-separated sequence of directions d\_1 d\_2 d\_3... followed by an index-matched integer sequence for bounce count b\_1 b\_2 b\_3... Directions are any of the four cardinal directions NSEW. Bounce count describes how many tiles Barry bounces forward in a straight line. **Turning does not count as a bounce.**  
  
After Barry has finished his bouncing business, print the appearance of the floor, cropped to the smallest rectangle that includes all #'s.  
  
For example, the input  

E S E  
4 3 1

  
would produce the floor as shown:  

........  
..####..  
.....#..  
.....#..  
.....##.  
........

  
but this should be printed instead:  

####.  
...#.  
...#.  
...##

  
If no tiles show # at the end of Barry's bouncing, simply print . instead. 

Input

**Line 1:** A string containing a space-separated sequence of characters NSEW representing bouncing direction  
**Line 2:** A string containing a space-separated sequence of integers representing bounce count

Output

A map of the floor, consisting of characters # and .

Constraints

1 ≤ bounces per action ≤ 100000  
1 ≤ sequence length ≤ 500

Example

Input

E S W
4 3 2

Output

####
...#
...#
.###
