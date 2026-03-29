# Nature of triangles

[:link: Puzzle on CodinGame](https://www.codingame.com/training/easy/nature-of-triangles)

**Level:** easy
**Topics:** Conditions, Trigonometry, Mathematics, Geometry

## Goal 

You have to output the nature of the triangles whose vertices’ coordinates are given. The output should follow this format:  
  
Name of triangle is a/an side nature and a/an angle nature triangle.  
  
Name of triangle follows the same order as the vertices given.  
  
Side nature is:  
• “scalene” if all sides have different lengths, or  
• “isosceles in vertex” if exactly two sides have the same length and they have a common vertex of vertex.  
  
Angle nature is:  
• “acute” if all angles are acute, or  
• “right in vertex” if the angle at vertex is 90°, or  
• “obtuse in vertex (degrees°)” if the angle at vertex is obtuse. In this case, output the measure of the obtuse angle in degrees, rounded to the nearest integer.  
  
**Output examples**  
BAC is a scalene and a right in A triangle.  
DEF is an isosceles in D and an obtuse in D (120°) triangle. 

Input

**Line 1:** An integer N for the number of triangles.  
**Next N lines:** Each vertex followed by its x and y coordinates, one triangle per line.

Output

**N lines:** The nature of the triangles, one triangle per line, in the same order as the input.

Constraints

1 ⩽ N ⩽ 8  
\-20 ⩽ x, y ⩽ 20  
x and y are integers.  
Degenerate triangles do not appear in this puzzle.  
Equilateral triangles do not appear in this puzzle because they involve non-integer coordinates (calculation involves √3).

Example

Input

2
A 5 -2 B 8 2 C -1 -9
O 0 0 A 3 0 B 1 2

Output

ABC is a scalene and an obtuse in A (176°) triangle.
OAB is a scalene and an acute triangle.
