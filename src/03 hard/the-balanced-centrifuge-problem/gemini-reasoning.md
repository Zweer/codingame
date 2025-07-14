The problem asks us to find the number of different possible values of `K` (number of tubes) for a given `N` (number of holes) such that a centrifuge can be balanced. All tubes have the same mass and are considered point masses fixed at an equal distance from the center. Balancing requires the center of mass of all tubes to coincide with the rotor's center, which means the vector sum of their positions must be zero. The positions are given by `(R*sin(a), R*cos(a))` where `a = 2*Pi*k/N`. This is equivalent to summing complex numbers `e^(i * 2*Pi*k/N)` to zero.

A set of `K` points representing `N`-th roots of unity sums to zero if and only if they form a geometrically balanced configuration. Such configurations can be broken down into fundamental building blocks:
1.  **Regular Polygons (d-gons):** If `K` tubes are placed at equally spaced positions, for example, at holes `0, N/K, 2N/K, ..., (K-1)N/K`. This forms a regular `K`-gon and balances if `K` is a divisor of `N`. (Note: `K=1` tube alone cannot balance unless `N=1`, but `N >= 2` here, so `K=1` is never possible).
2.  **Opposite Pairs:** If `N` is even, two tubes placed in opposite holes (e.g., `j` and `j+N/2`) will balance each other. Any even number of tubes `K` can be balanced by `K/2` such pairs, provided enough distinct holes are available.
3.  **Combinations:** The problem examples show that a balanced configuration can be a combination of a regular `d`-gon and additional opposite pairs. For example, `N=12, K=5` is balanced by placing 3 tubes as a regular triangle (`d=3`) and 2 tubes as an opposite pair.

The core challenge lies in determining when a combination of a `d`-gon and `2m` additional tubes (total `K = d + 2m`) is possible. The critical factor is the parity of the hole indices and `N/2`.

Let `v_2(x)` be the largest integer `p` such that `2^p` divides `x`.

**Conditions for `K` to be a possible value:**

1.  **`K = N` is always possible.** (Filling all holes forms a regular N-gon).

2.  **`K` is a divisor `d` of `N` (where `d > 1`).** This is a base `d`-gon.

3.  **If `N` is odd:**
    If `N` is odd, `N/2` is not an integer, so there are no "opposite" holes `j, j+N/2`. Thus, any balancing configuration must entirely consist of one or more regular `d`-gons. It's a known result that if `N` is odd, a set of `K` distinct `N`-th roots of unity sums to zero if and only if they form a regular `K`-gon, meaning `K` must be a divisor of `N`. Since `K=1` is impossible, for odd `N`, only `K` values that are divisors `d > 1` of `N` are possible.

4.  **If `N` is even:**
    In this case, tubes can be added in pairs of `2m`. `K = d + 2m` (where `d` is a divisor of `N`, and `2m` is the number of tubes added as pairs, `m >= 1`).
    We need to consider if the `d`-gon and the `m` pairs can use *distinct* holes. The problem is when the `d`-gon occupies holes in a way that prevents forming additional pairs from the remaining holes.

    *   **Case 4a: `d` is an even divisor of `N`.**
        A `d`-gon starting at hole 0 (`0, N/d, 2N/d, ..., (d-1)N/d`) uses a mix of even and odd holes, or only even holes. Regardless, if `d` is even, the `d`-gon does not exhaust all holes of a particular parity such that no pairs can be formed. Thus, if `d` is even, `K = d + 2m` is possible for all `m >= 1` such that `d + 2m <= N`.

    *   **Case 4b: `d` is an odd divisor of `N`.**
        If `d` is odd and `N` is even, then `N/d` must be even.
        Therefore, a `d`-gon starting at hole 0 (`0, N/d, 2N/d, ..., (d-1)N/d`) will occupy only *even-indexed* holes.
        The remaining `N-d` holes will therefore consist entirely of *odd-indexed* holes.

        Now consider the nature of opposite pairs `(j, j+N/2)`:
        *   **If `v_2(N) == 1` (i.e., `N = 2 * (odd_number)`):**
            `N/2` is odd. An opposite pair `(j, j+N/2)` will always consist of one even-indexed hole and one odd-indexed hole.
            Since the `d`-gon (with `d` odd) has used up all even holes proportional to `d`, and the remaining `N-d` holes are all odd-indexed, it is impossible to form any additional opposite pairs because you need one even and one odd hole for each pair.
            Thus, if `d` is an odd divisor of `N` and `v_2(N) == 1`, then `K = d + 2m` is **impossible** for `m > 0`. Only `K=d` itself is possible.
        *   **If `v_2(N) >= 2` (i.e., `N` is a multiple of 4):**
            `N/2` is even. An opposite pair `(j, j+N/2)` will always consist of two holes of the *same* parity (both even or both odd).
            Even though the `d`-gon (with `d` odd) used all even holes, the remaining `N-d` holes are all odd, and we can form pairs from these odd holes (e.g., `(1, 1+N/2)` if `1` and `1+N/2` are available).
            Thus, if `d` is an odd divisor of `N` and `v_2(N) >= 2`, then `K = d + 2m` is possible for all `m >= 1` such that `d + 2m <= N`.

**Algorithm Steps:**

1.  Initialize an empty `Set<number>` called `possibleValues` to store unique possible `K` values.
2.  Add `N` to `possibleValues` (as `K=N` is always balanced).
3.  Calculate `v_2(N)`. This is done by repeatedly dividing `N` by 2 until it's odd, counting the divisions.
4.  Find all divisors `d` of `N`. An efficient way is to iterate from `1` up to `sqrt(N)`. If `i` divides `N`, then `i` and `N/i` are divisors.
5.  Iterate through each divisor `d` found:
    *   If `d > 1`, add `d` to `possibleValues`. (This covers the base `d`-gon configurations).
    *   If `N` is even (`N % 2 === 0`):
        *   If `d` is an even divisor (`d % 2 === 0`):
            `d` can always be extended with `2m` tubes. For `m` from `1` such that `d + 2m <= N`, add `d + 2m` to `possibleValues`.
        *   If `d` is an odd divisor (`d % 2 !== 0`):
            `d` can only be extended with `2m` tubes if `v_2(N) >= 2` (i.e., `N` is a multiple of 4). If this condition holds, for `m` from `1` such that `d + 2m <= N`, add `d + 2m` to `possibleValues`.
6.  The `possibleValues` set now contains all distinct `K` values (`K > 0`) for which the centrifuge can be balanced. The final answer is the `size` of this set.

**Example Tracing (N=12):**
1.  `possibleValues = {12}`.
2.  `v_2(12) = 2` (since `12 = 2^2 * 3`).
3.  Divisors of 12: `1, 2, 3, 4, 6, 12`.
4.  Add `d>1` divisors: `possibleValues = {12, 2, 3, 4, 6}`.
5.  `N=12` is even. Iterate `d` through divisors:
    *   `d=1` (odd): `v_2(12) >= 2` is true. Add `1+2m`: `3, 5, 7, 9, 11`.
    *   `d=2` (even): Add `2+2m`: `4, 6, 8, 10, 12`.
    *   `d=3` (odd): `v_2(12) >= 2` is true. Add `3+2m`: `5, 7, 9, 11`.
    *   `d=4` (even): Add `4+2m`: `6, 8, 10, 12`.
    *   `d=6` (even): Add `6+2m`: `8, 10, 12`.
    *   `d=12` (even): No `2m` can be added (already `N`).
6.  `possibleValues` now contains `{2,3,4,5,6,7,8,9,10,11,12}`. Size = 11. (Matches example).

This approach accurately reflects the provided examples and the detailed rules derived from them. The time complexity for finding divisors is `O(sqrt(N))`, and iterating through divisors to add `2m` values is `O(tau(N) * N/2)`, where `tau(N)` is the number of divisors of `N`. For `N=200000`, `sqrt(N)` is ~447, and `tau(N)` is at most around 160. `160 * 100000` is `1.6 * 10^7`, which should be acceptable within typical time limits (1 second).