# Cross the lines

[:link: Puzzle on CodinGame](https://www.codingame.com/training/expert/cross-the-lines)

**Level:** expert
**Topics:** Graph theory, Topology

## Goal 

You are given a set of line segments, and your goal is to compute a cyclic continuous curve that:  
\* does **not** intersect **any** endpoint of a segment  
\* intersects every segment at least once  
\* minimizes the number of intersections  
Your algorithm should return said minimum number of intersections.  
  
Two examples are given at https://imgur.com/a/8kUNhS6, a valid and optimal one and an invalid one crossing an endpoint.  
  
The cyclic curve may self-intersect when necessary. This does not count as crossing a line segment. 

Input

**Line 1:** An integer n, the number of segments in **S**  
**n next lines :** four integers x1 y1 x2 y2 describing a segment of **S** with two endpoints (x1, y1) and (x2, y2)

Output

**Line 1:** The minimum number of segments that should be crossed in a cyclic curve that crosses every segment at least once.

Constraints

1 <= n <= 25  
1 <= xi, yi <= 100  
Two segments may meet at one of their endpoints. They never cross, overlap, intersect, or touch midway.  
No segment reduces to a point: for every segment, the two endpoints are distinct.

Example

Input

3
0 0 10 10
10 10 10 0
0 0 10 0

Output

4
