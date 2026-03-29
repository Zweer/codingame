The problem asks us to find a starting position $P_B = (x_b, y_b, z_b)$ and a constant velocity vector $V_B = (vx_b, vy_b, vz_b)$ for a bullet such that it hits three given ducks. Each duck $i$ has an initial position $P_i = (x_i, y_i, z_i)$ and a constant velocity $V_i = (vx_i, vy_i, vz_i)$.

Let $t_i$ be the time at which the bullet hits duck $i$. At this time, the bullet's position must match the duck's position:
$P_B + V_B t_i = P_i + V_i t_i$

We have three such equations for $i = 1, 2, 3$:
1. $P_B + V_B t_1 = P_1 + V_1 t_1$
2. $P_B + V_B t_2 = P_2 + V_2 t_2$
3. $P_B + V_B t_3 = P_3 + V_3 t_3$

Let's rearrange these equations to express $P_B$:
$P_B = P_i + (V_i - V_B) t_i$

This means that the bullet's path must pass through the positions of the ducks at their respective hit times. Let $M_i = P_i + V_i t_i$ be the position of duck $i$ at time $t_i$.
For the bullet to hit all three ducks, the points $M_1$, $M_2$, and $M_3$ must be collinear (they must lie on the bullet's path).
The condition for three points to be collinear is that the vector between the first two is parallel to the vector between the second two. This can be expressed using the cross product:
$(M_1 - M_2) \times (M_2 - M_3) = 0$

Substitute the expressions for $M_i$:
$M_1 - M_2 = (P_1 + V_1 t_1) - (P_2 + V_2 t_2)$
$M_2 - M_3 = (P_2 + V_2 t_2) - (P_3 + V_3 t_3)$

This gives us a system of three scalar equations (one for each component of the cross product) in terms of $t_1, t_2, t_3$.
To simplify, we can fix one of the times. Since the problem allows firing from any position at any speed, we can shift the time origin such that $t_1$ takes any convenient non-zero value. Let's set $t_1 = 1$. This simplifies the equations and still allows us to find a valid solution (if $t_1$ was originally zero, or if the actual integer $t_1$ is not 1, we will find $t_2, t_3$ as fractions relative to $t_1=1$, but the final $P_B$ and $V_B$ should be integers).

Let $t_1 = K$ (where we will set $K=1$ in implementation).
Let $vecA = (P_1 + V_1 K) - P_2 - V_2 t_2 = (P_1 - P_2 + V_1 K) - V_2 t_2$.
Let $vecB = (P_2 - P_3) + V_2 t_2 - V_3 t_3$.

Let $ConstA = P_1 - P_2 + V_1 K$ and $CoeffA = -V_2$. So $vecA = ConstA + CoeffA \cdot t_2$.
Let $ConstB = P_2 - P_3$, $CoeffB_2 = V_2$, $CoeffB_3 = -V_3$. So $vecB = ConstB + CoeffB_2 \cdot t_2 + CoeffB_3 \cdot t_3$.

The condition $(vecA \times vecB)_c = 0$ for component $c \in \{x, y, z\}$ expands to:
$(vecA_c)_1 (vecB_c)_2 - (vecA_c)_2 (vecB_c)_1 = 0$ (using cyclic components, e.g., for x: $y_1 z_2 - z_1 y_2$)
Expanding this product:
$(ConstA_{o1} + CoeffA_{o1} t_2) (ConstB_{o2} + CoeffB_{2,o2} t_2 + CoeffB_{3,o2} t_3)$
$- (ConstA_{o2} + CoeffA_{o2} t_2) (ConstB_{o1} + CoeffB_{2,o1} t_2 + CoeffB_{3,o1} t_3) = 0$
where $o1, o2$ are the other two components (e.g., for $x$, $o1=y, o2=z$).

Collecting terms by powers of $t_2, t_3$:
1. Coefficient of $t_2 t_3$: $(CoeffA_{o1} CoeffB_{3,o2} - CoeffA_{o2} CoeffB_{3,o1})$
   Substituting $CoeffA = -V_2$ and $CoeffB_3 = -V_3$:
   $(-V_{2,o1})(-V_{3,o2}) - (-V_{2,o2})(-V_{3,o1}) = V_{2,o1} V_{3,o2} - V_{2,o2} V_{3,o1} = (V_2 \times V_3)_c$.
   This forms the vector $A = V_2 \times V_3$.

2. Coefficient of $t_2^2$: $(CoeffA_{o1} CoeffB_{2,o2} - CoeffA_{o2} CoeffB_{2,o1})$
   Substituting $CoeffA = -V_2$ and $CoeffB_2 = V_2$:
   $(-V_{2,o1})(V_{2,o2}) - (-V_{2,o2})(V_{2,o1}) = -V_{2,o1}V_{2,o2} + V_{2,o1}V_{2,o2} = 0$.
   This is a crucial simplification: there are no $t_2^2$ terms (and no $t_3^2$ terms either).

So each component equation of $(vecA \times vecB) = 0$ has the form:
$A_c \cdot t_2 t_3 + B_c \cdot t_2 + C_c \cdot t_3 + D_c = 0$
where $A_c, B_c, C_c, D_c$ are constant scalar coefficients calculated from $P_i, V_i, K$.

The coefficients $A, B, C, D$ (as Vec3R) are:
$A = V_2 \times V_3$
$B = (P_1 + V_1 K - P_2) \times V_2 + (-V_2) \times (P_2 - P_3)$ (from $ConstA \times CoeffB_2 + CoeffA \times ConstB$)
$C = (P_1 + V_1 K - P_2) \times (-V_3)$ (from $ConstA \times CoeffB_3$)
$D = (P_1 + V_1 K - P_2) \times (P_2 - P_3)$ (from $ConstA \times ConstB$)

This yields a system of three quadratic equations (one for x, y, z components) in two unknowns ($t_2, t_3$).
We can solve this system:
1. Pick two of the equations (e.g., x and y components).
2. Eliminate the $t_2 t_3$ term between them to get a linear equation in $t_2$ and $t_3$.
3. Substitute the expression for $t_3$ (or $t_2$) from this linear equation back into one of the original quadratic equations. This will result in a quadratic equation in a single variable ($t_2$ or $t_3$).
4. Solve this quadratic equation. Since inputs are integers and the example outputs integer times, the solutions for $t_2$ (and $t_3$) are expected to be rational (or integer) numbers. Use `BigInt` for intermediate calculations and a `Rational` class to maintain precision. There might be two solutions. Either will work.
5. Once $t_2$ and $t_3$ are found, calculate $V_B$ and $P_B$.
   From $P_B + V_B t_1 = P_1 + V_1 t_1$ and $P_B + V_B t_2 = P_2 + V_2 t_2$:
   $V_B (t_1 - t_2) = (P_1 - P_2) + (V_1 t_1 - V_2 t_2)$
   So, $V_B = \frac{(P_1 - P_2) + (V_1 t_1 - V_2 t_2)}{t_1 - t_2}$
   And $P_B = P_1 + (V_1 - V_B) t_1$.

The problem constraints "All coordinates and velocities are integers." and "every number is within range (-2^49, 2^49)" necessitate using `BigInt` for calculations to prevent precision loss and handle large numbers. The `Rational` class will be built on `BigInt` to manage fractions. The final output must be integers, which implies that the denominators of $P_B$ and $V_B$ components will cancel out to 1.

The code implements the above method, setting $t_1 = 1$. It handles the general case of solving the linear system using Cramer's rule. Edge cases like zero coefficients are implicitly handled by Cramer's rule (if the determinant is zero, it implies degeneracy, but the problem guarantees a solution under non-degenerate conditions like linearly independent velocities).