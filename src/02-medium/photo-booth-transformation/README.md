# Photo Booth Transformation

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/photo-booth-transformation)

**Level:** medium
**Topics:** Image processing, Permutations, Mathematics

## Goal 

Given a W×H image, with W and H both even, we define its **photo booth transformation** as the image obtained after the following process:  
 \- Divide the image into 2×2 blocks (which is possible as both dimensions are even);  
 \- Build four W/2×H/2 images by gathering the top-left pixels of each block into one image (following the blocks ordering) and similarly the top-right / bottom-left / bottom-right pixels into three other images;  
 \- Glue together these four images (following the inside-block ordering) to obtain a new W×H image.  
  
**Example:** 6×4 image

┌──────┐      ┌──┬──┬──┐      ┌───┬───┐      ┌──────┐  
│ABCDEF│      │AB│CD│EF│      │ACE│BDF│      │ACEBDF│  
│GHIJKL│      │GH│IJ│KL│      │MOQ│NPR│      │MOQNPR│  
│MNOPQR│  ~>  ├──┼──┼──┤  ~>  ├───┼───┤  ~>  │GIKHJL│  
│STUVWX│      │MN│OP│QR│      │GIK│HJL│      │SUWTVX│  
└──────┘      │ST│UV│WX│      │SUW│TVX│      └──────┘  
              └──┴──┴──┘      └───┴───┘

This transformation results in an image which contains four reduced versions of the original image, though none of them have a single a pixel in common (each of them contains exactly 1/4 of the original pixels).  
  
**Illustrations:**  
\- https://i.imgur.com/632iL82.png  
\- https://i.imgur.com/nK8s3c7.png  
\- https://i.imgur.com/rMfqTYM.png  
  
Iterating this transform from a given image always brings us back to the original image after a (positive) number of steps that we call a **period** of the image.  
  
Given some even dimensions W and H, **what is the minimum period common to all W×H images?**  
  
**Back to the example:** Assuming all pixel values are distinct, we have:

┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐  
│ABCDEF│    │ACEBDF│    │AEDCBF│    │ADBECF│    │ABCDEF│  
│GHIJKL│    │MOQNPR│    │GKJIHL│    │MPNQOR│    │GHIJKL│  
│MNOPQR│ ~> │GIKHJL│ ~> │MQPONR│ ~> │GJHKIL│ ~> │MNOPQR│  
│STUVWX│    │SUWTVX│    │SWVUTX│    │SVTWUX│    │STUVWX│  
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘

Hence the minimum period is **4**.  
  
**Additional illustrations (and references in French):**  
 \- http://www.lifl.fr/\~pmathieu/transform/joc\_phot.html  
 \- http://www.lifl.fr/\~pmathieu/transform/earth\_phot.html 

Input

**Line 1:** One single integer T for the number of testcases to follow.  
**Next T lines:** Two space-separated integers Wi and Hi corresponding to the width and height of the image.

Output

**T lines:** One single integer corresponding to the period of the photo booth map on Wi×Hi images.

Constraints

1 ≤ T ≤ 10  
2 ≤ W, H ≤ 2000  
Both W and H are even.

Example

Input

2
6 4
4 6

Output

4
4
