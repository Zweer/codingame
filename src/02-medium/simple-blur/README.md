# Simple Blur

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/simple-blur)

**Level:** medium
**Topics:** Lists, Image processing

## Goal 

Take a data representation of an image and blur it by averaging each pixel's color with its neighbors above, below, and to the left and right of it.  
  
**Rules:**  
  
The average value should be the **arithmetic mean**, that is, all the values you are combining, divided by the number of values.  
  
If the outcome of an average operation is not an integer, **round it down**.  
  
Each pixel should be blurred using five pixels: itself, and its four neighbors (above, below, left, and right). The exception is edge and corner pixels, which will use themselves and their three/two neighbors respectively. In the diagram below, X represents a target pixel, and the N's represent the other pixels that it should be blended with. The O's represent pixels that should not be included.  
  
Standard example:  

ONO  
NXN  
ONO

  
Corner example:  

XN  
NO

  
Edge example:  

NO  
XN  
NO

Input

**Line 1**: Two space-separated integers rows and cols for the number of rows and number of columns in the grid respectively.  
**Next rows x cols lines**: Each line contains three space-separated integers for a pixel's RGB (red, green, blue) values. The pixels are given in left-to-right, top-to-bottom order.

Output

**rows x cols lines**: The transformed image, one pixel per line. Each pixel will be expressed as a space-separated list of the pixel's RGB values.

Constraints

Each color value will be an integer in the range 0 ≤ r,g,b ≤ 255.  
  
Each dimension of the image grid will be an integer in the range 1 ≤ rows,cols ≤ 15.

Example

Input

2 3
0 0 0
50 25 0
150 35 200
255 0 255
198 74 241
120 15 185

Output

101 8 85
99 33 110
106 25 128
151 24 165
155 28 170
156 41 208
