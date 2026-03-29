# Chained Matrix Products

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/chained-matrix-products)

**Level:** medium
**Topics:** Dynamic programming, Optimization, Matrix product, Complexity

## Goal 

The matrix product is an operation that, given matrices A\[i,k\] (i rows and k columns) and B\[k,j\], produces matrix C\[i,j\] where C\_x,y is, for each x in 1..i and y = 1..j, the sum of A\_x,z\*B\_z,y for all z in 1..k  
One can see that i\*j\*k multiplications are needed to compute C.  
  
Matrix product is an associative operation. This means that given matrices A, B and C with consistent dimensions, then (A.B).C = A.(B.C) = A.B.C; in other words the result remains the same whatever the product order.  
  
**But complexity is not associative!** Given A\[3,1000\], B\[1000,5\] and C\[5,2000\] for example:  
\- (A.B).C requires 3x1000x5 + 3x5x2000 = 45.000 multiplications  
\- A.(B.C) requires 1000x5x2000 + 3x1000x2000 = 16.000.000 multiplications!!!  
And this is a (bit extreme) case for 2 products, but the longer the product chain, the more important the difference can be.  
  
The goal is, given N pairs of dimensions, to compute the least number of multiplications needed.  
  
Note 1: Actually, there are more efficient algorithms for matrix product that use for example divide and conquer to reduce complexity. But we will only consider the common way described above.  
For more information, you can have a look at Strassen or Coppersmith–Winograd algorithms.  
Note 2: This product ordering optimization works anyway for different matrix product algorithms. 

Input

**Line 1:** The number N of matrices to multiply.  
**Next N lines:** Two space-separated integers row and col, dimensions of the N matrices.

Output

The least number of multiplications needed to compute product.

Constraints

3 ≤ N ≤ 100  
0 < row,col ≤ 2000  
Dimensions are product-compatible (**id est** each col is equal to next line's row)

Example

Input

3
3 1000
1000 5
5 2000

Output

45000
