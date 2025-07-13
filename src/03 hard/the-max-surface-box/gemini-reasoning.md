The problem asks us to find the minimum and maximum possible surface areas of a cuboid built using `N` 1x1x1 bricks. This means the volume of the cuboid must be exactly `N` cubic units. Let the dimensions of the cuboid be `l`, `w`, and `h` (length, width, height), where `l`, `w`, `h` are positive integers. The volume is `l * w * h = N`. The surface area of the cuboid is `2 * (l*w + l*h + w*h)`.

We need to find the pair of (minimum surface area, maximum surface area).

### 1. Minimum Surface Area

To minimize the surface area of a cuboid with a fixed volume, its dimensions `l`, `w`, and `h` should be as close to each other as possible. Ideally, this would be a cube, where `l = w = h = N^(1/3)`. However, `N^(1/3)` might not be an integer. So, we need to find three integer factors `l, w, h` of `N` that are as close to `N^(1/3)` as possible.

We can systematically search for these factors:
1. Iterate through possible values for `l` starting from 1. Since we want `l, w, h` to be close, and we can enforce `l <= w <= h` to avoid redundant calculations and ensure we are moving towards a balanced shape, `l` cannot be larger than `N^(1/3)`. If `l > N^(1/3)`, then `l*l*l > N`, which implies that `w` and `h` (which are at least `l`) would make `l*w*h` greater than `N`. So, `l` iterates from 1 up to `floor(N^(1/3))`.
2. For each `l` that divides `N`, calculate the remaining volume `remainingVolume = N / l`. This `remainingVolume` must be equal to `w * h`.
3. Now, iterate through possible values for `w`. Since we require `l <= w <= h`, `w` must be at least `l`. Also, `w` cannot be larger than `sqrt(remainingVolume)`. If `w > sqrt(remainingVolume)`, then `w*w > remainingVolume`, which means `h = remainingVolume / w` would be less than `w`, violating `w <= h`. So, `w` iterates from `l` up to `floor(sqrt(remainingVolume))`.
4. For each `w` that divides `remainingVolume`, calculate `h = remainingVolume / w`.
5. At this point, we have a valid set of dimensions `(l, w, h)` such that `l * w * h = N` and `l <= w <= h`. Calculate the surface area `2 * (l*w + l*h + w*h)`.
6. Keep track of the minimum surface area found across all valid `(l, w, h)` triplets.

This systematic search guarantees finding the minimum surface area because it explores all valid combinations of factors while prioritizing dimensions that are close to each other. Given `N <= 1,500,000`, `N^(1/3)` is approximately `114`, and `sqrt(N)` is approximately `1224`. The nested loop operations are roughly `114 * 1224`, which is efficient enough for the given constraints.

### 2. Maximum Surface Area

To maximize the surface area for a fixed volume, the cuboid should be as "flat" or "long and thin" as possible. This means making two dimensions as small as possible and the third dimension as large as possible. The smallest positive integer dimension is 1.
So, we set `l = 1` and `w = 1`. This forces `h = N / (1 * 1) = N`.
The dimensions of the cuboid become `(1, 1, N)`.
The surface area for these dimensions is `2 * (1*1 + 1*N + 1*N) = 2 * (1 + N + N) = 2 * (1 + 2N) = 2 + 4N`.
This configuration will always yield the maximum surface area.

### Example Walkthrough (N=12)

**Min Surface:**
- `l=1`: `rem = 12`.
  - `w=1`: `h=12`. Dimensions `(1,1,12)`. Area: `2*(1+12+12) = 50`. `minSurface = 50`.
  - `w=2`: `h=6`. Dimensions `(1,2,6)`. Area: `2*(2+6+12) = 40`. `minSurface = 40`.
  - `w=3`: `h=4`. Dimensions `(1,3,4)`. Area: `2*(3+4+12) = 38`. `minSurface = 38`.
  - `w=4`: `w*w=16 > rem=12`. Stop `w` loop.
- `l=2`: `l*l*l = 8 <= 12`. `rem = 6`.
  - `w=2`: (since `w >= l`) `h=3`. Dimensions `(2,2,3)`. Area: `2*(4+6+6) = 32`. `minSurface = 32`.
  - `w=3`: `w*w=9 > rem=6`. Stop `w` loop.
- `l=3`: `l*l*l = 27 > 12`. Stop `l` loop.

Final `minSurface = 32`.

**Max Surface:**
- Dimensions `(1,1,N) = (1,1,12)`.
- Area: `2 * (1 + 2*12) = 2 * (1 + 24) = 2 * 25 = 50`.

Result for N=12: `32 50`.

### Constraints and Data Types

`N` is up to `1,500,000`.
The maximum surface area `2 + 4N` for `N=1,500,000` is `2 + 6,000,000 = 6,000,002`. This value comfortably fits within standard integer types (and TypeScript's `number` type, which uses 64-bit floating point, can precisely represent integers up to `2^53 - 1`). Intermediate calculations for `l*w`, `l*h`, `w*h` will also fit.