# Simon's Oracle

[:link: Puzzle on CodinGame](https://www.codingame.com/training/hard/simons-oracle)

**Level:** hard
**Topics:** XOR, Constraint satisfaction

## Goal 

Consider strings of binary bits 0 and 1, where all bit strings are of the same length. **Simon's problem** is to find the secret bit string 𝒔 used in a black box function 𝓕. The function 𝓕 satisfies the following properties for any given bit strings 𝒙 and 𝒚:  
  
If 𝒙 = 𝒚 then 𝓕(𝒙) = 𝓕(𝒚). That is, the output is consistent.  
If 𝒙 ⊕ 𝒚 = 𝒔, 𝓕(𝒙) = 𝓕(𝒚). Here, ⊕ is the exclusive-or operator.  
Otherwise, 𝓕(𝒙) ≠ 𝓕(𝒚) is guaranteed.  
  
In this variation of the problem, we map 𝓕 to characters, and we require that the secret string not be all 0's. Suppose 𝒔 = 110 and that a stochastic algorithm makes the following random queries:  
  
Query 011: 𝓕(011) = A  
Query 001: 𝓕(001) = B  
Query 110: 𝓕(110) = C  
Query 100: 𝓕(100) = D  
Query 101: 𝓕(101) = A  
  
At this point, the algorithm has encountered two different bit strings that produce the same result, namely A. Since 𝓕(011) = 𝓕(101), the algorithm can now deduce 011 ⊕ 101 \= 110 as the secret string. Any subsequent queries would only serve to confirm this.  
  
It is no accident that the queries above produced sequential results A, B, C, D. This is because the results were assigned not by a predefined function but by an oracle. The oracle waited until seeing successive queries to decide what the secret string should be. Only once it had no other choice did it relent and reduplicate an earlier outcome.  
  
In other words, 𝓕 is ostensibly based on a bit string 𝒔, but internally the exact structure of 𝓕 may only be partially decided. The oracle keeps the secret string undetermined except insofar as the information revealed about 𝓕 requires. In this way, a definitive value for 𝒔 is avoided and unexposed for as long as possible.  
  
If, for instance, the first two random queries had been 011 and 101, the oracle would not have assigned A to both, so ultimately the exposed secret would have differed. In contrast, once 𝒔 is narrowed down to a single bit string, the oracle has to provide results consistent with this value.  
  
Design an oracle to do exactly that. Given N random bit strings of length L, build a function 𝓕 mapping bit strings to letters A through Z. The first query should map to A, and any subsequent queries that are likewise arbitrary should result in the next available character. At the point where the oracle has no other choice but to expose 𝒔, thereby fixing it to a single value, assign the first possible letter to that query.  
  
Output the secret string if it is found, otherwise the largest binary value of 𝒔 still possible after all queries are answered. Also output the resulting application of 𝓕 to each query. 

Input

**Line 1:** An integer L for the length of each bit string, a space, and an integer N for the number of queries  
**Next N lines:** A bit string query (consisting of L digits 0 or 1)

Output

**Line 1:** A bit string as the value or greatest possible value for 𝒔  
**Next N lines:** A single character A through Z corresponding to the result from 𝓕

Constraints

1 < L ≤ 8  
N < 30  
No characters beyond Z will be required.

Example

Input

3 5
011
001
110
100
101

Output

110
A
B
C
D
A
