# Elliptic curve cryptography

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/elliptic-curve-cryptography)

**Level:** medium
**Topics:** Cryptography, Modular calculus, Double-and-add, Elliptic Curve

## Goal 

Elliptic-Curve Cryptography (ECC) is a recent approach to asymmetric cryptography. Its main benefit is an excellent ratio between the level of security and the key size. For example, the NSA recommends 384-bit keys for a top-secret level encryption using ECC, while achieving the same level of security using RSA requires 7680-bit keys. RSA is currently mostly used with 1024-bit keys, which is equivalent to 160-bit keys with ECC (Ref #1).  
  
**How it works**  
  
Given a prime number P, an elliptic curve (over a finite field) is the set of points (X,Y), 0 ≤ X,Y < P, verifying an equation of the form Y² = X^3 + A\*X + B mod P (sometimes expressed in a different way, see Ref #2) for some fixed parameters 0 ≤ A,B < P. In this puzzle, we use one of the most common curve (used for bitcoin): secp256k1 having the equation Y² = X^3 + 7, usually modulo a 256-bit prime number which we replace here by a 62-bit prime (for an easier manipulation in any programming language).  
  
Let us define an addition operator on the curve points (see Ref #3 for a visual illustration).  
To double a point C: Consider the tangent to the curve at point C. Let (X,Y) be its intersection with the curve, the point S = 2C is defined as (X,**\-**Y).  
To add two distinct points C and D: Consider the line passing through both points. Let (X,Y) be its intersection with the curve, the point S = C+D is defined as (X,**\-**Y).  
  
Let us consider a starting point G on the curve and generate a public key as k\*G (i.e. G+G+...+G k times) for some randomly chosen integer k which will be the private key. This pair of public/private keys can be used to encrypt or sign messages (e.g. through ElGamal cryptosystem), yet this is out of the scope of this puzzle. The safety of the private key is not based on the public value G but on the difficulty of retrieving k given k\*G (known as the Discrete Log problem). k is often above 2^200 to make sure not to be able to bruteforce it. As a result, to compute your key in an efficient way, you should use the **double-and-add** method (Ref #4).  
  
**Explicit formulas**  
  
To compute S = (Xs,Ys) = C+D given two distinct points C = (Xc,Yc) and D = (Xd,Yd):  

L  = (Yd - Yc) / (Xd - Xc)  mod P  
Xs = L² - Xc - Xd           mod P  
Ys = L * (Xc - Xs) - Yc     mod P  

To double a point, i.e. when C = D, L becomes (here A \= 0):  

L  = (3*Xc^2 + A) / (2*Yc)  mod P  

Note: You will have to compute a modular division, a division modulo P.  
  
**Instructions**  
Write an EC key generator: For each of the N given k values, you should provide the X-coordinate of the point k\*G.  
  
**References**  
ECC security level: https://www.ripublication.com/ijaer17/ijaerv12n19\_140.pdf  
List of EC: https://safecurves.cr.yp.to  
Maths on EC: https://www.youtube.com/watch?v=NF1pwjL9-DE  
Maths on EC: https://en.wikipedia.org/wiki/Elliptic\_curve\_point\_multiplication#Double-and-add 

Input

**Line 1:** An integer N, the number of keys to generate.  
**Next N lines:** An hexadecimal integer k.

Output

**N lines:** An hexadecimal integer X corresponding to the generated point X-coordinate.

Constraints

A \= 0  
B \= 7  
P \= 0x3fddbf07bb3bc551  
G \= (0x69d463ce83b758e, 0x287a120903f7ef5c)  
  
1 < N ≤ 50  
1 < k < 0x3000000000000000

Example

Input

1
0x2

Output

0x2544b2250b8b1e1c
