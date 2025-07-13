import * as readline from 'readline';

// Helper for BigInt operations (vector arithmetic)
class Vec3 {
    constructor(public x: bigint, public y: bigint, public z: bigint) {}

    add(other: Vec3): Vec3 {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    sub(other: Vec3): Vec3 {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    // Scalar multiplication
    mul(scalar: bigint): Vec3 {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    // Cross product (needed for coefficient calculation)
    cross(other: Vec3): Vec3 {
        const x = this.y * other.z - this.z * other.y;
        const y = this.z * other.x - this.x * other.z;
        const z = this.x * other.y - this.y * other.x;
        return new Vec3(x, y, z);
    }

    toString(): string {
        return `${this.x} ${this.y} ${this.z}`;
    }
}

// Rational number class to handle fractions with BigInt
class Rational {
    numerator: bigint;
    denominator: bigint;

    constructor(num: bigint, den: bigint = 1n) {
        if (den === 0n) {
            throw new Error("Denominator cannot be zero.");
        }
        if (num === 0n) {
            this.numerator = 0n;
            this.denominator = 1n;
            return;
        }

        const common = this.gcd(num, den);
        this.numerator = num / common;
        this.denominator = den / common;

        // Ensure denominator is positive
        if (this.denominator < 0n) {
            this.numerator *= -1n;
            this.denominator *= -1n;
        }
    }

    private gcd(a: bigint, b: bigint): bigint {
        a = a < 0n ? -a : a;
        b = b < 0n ? -b : b;
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    add(other: Rational): Rational {
        return new Rational(
            this.numerator * other.denominator + other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    sub(other: Rational): Rational {
        return new Rational(
            this.numerator * other.denominator - other.numerator * this.denominator,
            this.denominator * other.denominator
        );
    }

    mul(other: Rational): Rational {
        return new Rational(
            this.numerator * other.numerator,
            this.denominator * other.denominator
        );
    }

    div(other: Rational): Rational {
        if (other.numerator === 0n) {
            throw new Error("Division by zero rational number.");
        }
        return new Rational(
            this.numerator * other.denominator,
            this.denominator * other.numerator
        );
    }

    // Convert Rational to string for output. Assumes denominator is 1 after all operations.
    // If not, it means the solution is not an integer one, which contradicts problem premise
    // for this specific puzzle type.
    toString(): string {
        if (this.denominator !== 1n) {
            throw new Error(`Rational number ${this.numerator}/${this.denominator} could not be simplified to integer.`);
        }
        return this.numerator.toString();
    }
}

// Vec3 with Rational components
class Vec3R {
    x: Rational;
    y: Rational;
    z: Rational;

    constructor(x: Rational, y: Rational, z: Rational) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vec3R): Vec3R {
        return new Vec3R(this.x.add(other.x), this.y.add(other.y), this.z.add(other.z));
    }

    sub(other: Vec3R): Vec3R {
        return new Vec3R(this.x.sub(other.x), this.y.sub(other.y), this.z.sub(other.z));
    }

    mul(scalar: Rational): Vec3R {
        return new Vec3R(this.x.mul(scalar), this.y.mul(scalar), this.z.mul(scalar));
    }

    // Cross product (for Vec3R objects)
    cross(other: Vec3R): Vec3R {
        const x = this.y.mul(other.z).sub(this.z.mul(other.y));
        const y = this.z.mul(other.x).sub(this.x.mul(other.z));
        const z = this.x.mul(other.y).sub(this.y.mul(other.x));
        return new Vec3R(x, y, z);
    }
}

// Main logic
function solve() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let lines: string[] = [];
    rl.on('line', (line: string) => {
        lines.push(line);
        if (lines.length === 3) {
            rl.close();
        }
    });

    rl.on('close', () => {
        const ducks: { P: Vec3, V: Vec3 }[] = [];
        for (const line of lines) {
            const parts = line.split(' @ ');
            const posParts = parts[0].split(' ').map(BigInt);
            const velParts = parts[1].split(' ').map(BigInt);
            ducks.push({
                P: new Vec3(posParts[0], posParts[1], posParts[2]),
                V: new Vec3(velParts[0], velParts[1], velParts[2])
            });
        }

        const P1 = ducks[0].P;
        const V1 = ducks[0].V;
        const P2 = ducks[1].P;
        const V2 = ducks[1].V;
        const P3 = ducks[2].P;
        const V3 = ducks[2].V;

        // Set t1 = 1 (Rational(1n))
        const t1_val = new Rational(1n);

        // Convert initial BigInt P and V to Vec3R for rational arithmetic
        const P1_R = new Vec3R(new Rational(P1.x), new Rational(P1.y), new Rational(P1.z));
        const V1_R = new Vec3R(new Rational(V1.x), new Rational(V1.y), new Rational(V1.z));
        const P2_R = new Vec3R(new Rational(P2.x), new Rational(P2.y), new Rational(P2.z));
        const V2_R = new Vec3R(new Rational(V2.x), new Rational(V2.y), new Rational(V2.z));
        const P3_R = new Vec3R(new Rational(P3.x), new Rational(P3.y), new Rational(P3.z));
        const V3_R = new Vec3R(new Rational(V3.x), new Rational(V3.y), new Rational(V3.z));

        // Define vectors for the cross product (M1-M2) x (M2-M3) = 0
        // M1 - M2 = (P1 + V1*t1) - (P2 + V2*t2) = (P1 + V1*t1 - P2) - V2*t2
        const ConstA = P1_R.add(V1_R.mul(t1_val)).sub(P2_R);
        const CoeffA_t2 = V2_R.mul(new Rational(-1n)); // -V2

        // M2 - M3 = (P2 + V2*t2) - (P3 + V3*t3) = (P2 - P3) + V2*t2 - V3*t3
        const ConstB = P2_R.sub(P3_R);
        const CoeffB_t2 = V2_R;
        const CoeffB_t3 = V3_R.mul(new Rational(-1n)); // -V3

        // Coefficients for the quadratic equations A_c t2 t3 + B_c t2 + C_c t3 + D_c = 0
        // for each component c (x, y, z)
        let A_coeffs = new Vec3R(new Rational(0n), new Rational(0n), new Rational(0n));
        let B_coeffs = new Vec3R(new Rational(0n), new Rational(0n), new Rational(0n));
        let C_coeffs = new Vec3R(new Rational(0n), new Rational(0n), new Rational(0n));
        let D_coeffs = new Vec3R(new Rational(0n), new Rational(0n), new Rational(0n));

        // Use array of component names to iterate through x, y, z
        const components = [
            { c: 'x' as const, o1: 'y' as const, o2: 'z' as const },
            { c: 'y' as const, o1: 'z' as const, o2: 'x' as const },
            { c: 'z' as const, o1: 'x' as const, o2: 'y' as const }
        ];

        for (const comp of components) {
            const c = comp.c;
            const o1 = comp.o1; // other1 component (e.g., y for x-component)
            const o2 = comp.o2; // other2 component (e.g., z for x-component)

            // A_c = (CoeffA_t2[o1] * CoeffB_t3[o2]) - (CoeffA_t2[o2] * CoeffB_t3[o1])
            A_coeffs[c] = CoeffA_t2[o1].mul(CoeffB_t3[o2]).sub(CoeffA_t2[o2].mul(CoeffB_t3[o1]));

            // B_c = (ConstA[o1] * CoeffB_t2[o2]) - (ConstA[o2] * CoeffB_t2[o1])
            //     + (CoeffA_t2[o1] * ConstB[o2]) - (CoeffA_t2[o2] * ConstB[o1])
            B_coeffs[c] = ConstA[o1].mul(CoeffB_t2[o2]).sub(ConstA[o2].mul(CoeffB_t2[o1]))
                          .add(CoeffA_t2[o1].mul(ConstB[o2]).sub(CoeffA_t2[o2].mul(ConstB[o1])));

            // C_c = (ConstA[o1] * CoeffB_t3[o2]) - (ConstA[o2] * CoeffB_t3[o1])
            C_coeffs[c] = ConstA[o1].mul(CoeffB_t3[o2]).sub(ConstA[o2].mul(CoeffB_t3[o1]));

            // D_c = (ConstA[o1] * ConstB[o2]) - (ConstA[o2] * ConstB[o1])
            D_coeffs[c] = ConstA[o1].mul(ConstB[o2]).sub(ConstA[o2].mul(ConstB[o1]));
        }

        // Solve the system of equations. Find two non-degenerate equations to form a linear system.
        // It's guaranteed that at least one component of A_coeffs is non-zero because V2 and V3 might be parallel,
        // but the problem implies a general setup where a solution exists.
        // If V2 || V3, then A_coeffs will be zero. In that case, the equations are linear in t2,t3.
        // The problem states V1, V2, V3 are linearly independent. This ensures that the overall system is solvable.

        let eq1Idx: number | undefined;
        let eq2Idx: number | undefined;

        // Try to pick two equations whose A components are not both zero
        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 3; j++) {
                if (A_coeffs[components[i].c].numerator !== 0n || A_coeffs[components[j].c].numerator !== 0n) {
                    eq1Idx = i;
                    eq2Idx = j;
                    break;
                }
            }
            if (eq1Idx !== undefined) break;
        }

        // Fallback: If all A_coeffs are zero (meaning V2 || V3), then equations are linear already.
        if (eq1Idx === undefined || eq2Idx === undefined) {
            // This means V2 and V3 are collinear, making A_coeffs (V2 x V3) zero for all components.
            // The equations are now linear: B_c t2 + C_c t3 + D_c = 0
            // We need to find two linearly independent equations from this set.
            // Pick two, e.g., x and y components.
            const Bx = B_coeffs.x; const Cx = C_coeffs.x; const Dx = D_coeffs.x;
            const By = B_coeffs.y; const Cy = C_coeffs.y; const Dy = D_coeffs.y;

            const determinant = Bx.mul(Cy).sub(Cx.mul(By));
            if (determinant.numerator === 0n) {
                // This means the linear equations are degenerate.
                // This scenario should not occur based on problem constraints.
                throw new Error("Degenerate linear system (all A_coeffs are zero).");
            }

            const t2_num = Cx.mul(Dy).sub(Cy.mul(Dx)); // Solution for -Dx*Cy - (-Dy*Cx)
            const t3_num = Bx.mul(Dy).sub(By.mul(Dx)).mul(new Rational(-1n)); // Solution for Bx*(-Dy) - By*(-Dx)

            t2 = t2_num.div(determinant);
            t3 = t3_num.div(determinant);
        } else {
            // Normal case: at least one A_coeffs component is non-zero.
            // Create two linear equations from the quadratic ones to solve for t2, t3.
            // From A_c t2 t3 + B_c t2 + C_c t3 + D_c = 0
            // Eliminate t2 t3: (Eq1 * A2) - (Eq2 * A1)
            const Ax = A_coeffs[components[eq1Idx].c];
            const Bx = B_coeffs[components[eq1Idx].c];
            const Cx = C_coeffs[components[eq1Idx].c];
            const Dx = D_coeffs[components[eq1Idx].c];

            const Ay = A_coeffs[components[eq2Idx].c];
            const By = B_coeffs[components[eq2Idx].c];
            const Cy = C_coeffs[components[eq2Idx].c];
            const Dy = D_coeffs[components[eq2Idx].c];

            // Linear equation 1 (from eq1 and eq2): E1 t2 + F1 t3 + G1 = 0
            const E1 = Ay.mul(Bx).sub(Ax.mul(By));
            const F1 = Ay.mul(Cx).sub(Ax.mul(Cy));
            const G1 = Ay.mul(Dx).sub(Ax.mul(Dy));

            // Need a second linear equation. Use eq1 and the remaining third equation (if it exists)
            const eq3Idx = 3 - eq1Idx - eq2Idx;
            const Az = A_coeffs[components[eq3Idx].c];
            const Bz = B_coeffs[components[eq3Idx].c];
            const Cz = C_coeffs[components[eq3Idx].c];
            const Dz = D_coeffs[components[eq3Idx].c];

            // Linear equation 2 (from eq1 and eq3): E2 t2 + F2 t3 + G2 = 0
            const E2 = Az.mul(Bx).sub(Ax.mul(Bz));
            const F2 = Az.mul(Cx).sub(Ax.mul(Cz));
            const G2 = Az.mul(Dx).sub(Ax.mul(Dz));

            // Solve the system of two linear equations:
            // E1 t2 + F1 t3 = -G1
            // E2 t2 + F2 t3 = -G2
            const determinant = E1.mul(F2).sub(F1.mul(E2));

            if (determinant.numerator === 0n) {
                // If the system is singular, it means either:
                // 1. Equations are linearly dependent (inf solutions, should not happen for unique answer)
                // 2. No solution (no answer, should not happen)
                // This implies a degenerate case that the problem statement implicitly rules out.
                throw new Error("Singular linear system for t2, t3. (E1*F2 - F1*E2 == 0)");
            }

            t2 = (F1.mul(G2).sub(F2.mul(G1))).div(determinant);
            t3 = (E2.mul(G1).sub(E1.mul(G2))).div(determinant);
        }
        
        const calculatedT2 = t2;
        const calculatedT3 = t3;

        // Calculate bullet velocity VB
        // VB = ( (P1 - P2) + V1 t1 - V2 t2 ) / (t1 - t2)
        const t1_minus_t2 = t1_val.sub(calculatedT2);
        if (t1_minus_t2.numerator === 0n) {
             // This implies t1 = t2, meaning the bullet hits ducks 1 and 2 at the same time.
             // This is a degenerate case. The solution should still be robust.
             // If t1=t2, then V_B * 0 = (P1-P2) + (V1-V2)*t1. This means P1-P2 = (V2-V1)*t1.
             // This would mean P1-P2 is parallel to V2-V1.
             // If this happens, we would need to pick another pair of ducks to define V_B,
             // or use the original `P_B + V_B t_i = P_i + V_i t_i` form directly.
             // Given problem constraints, this should not lead to an unsolvable state.
             throw new Error("t1 equals t2, degenerate case. Review logic.");
        }

        const term1_VB = P1_R.sub(P2_R);
        const term2_VB = V1_R.mul(t1_val);
        const term3_VB = V2_R.mul(calculatedT2);

        const numerator_VB = term1_VB.add(term2_VB).sub(term3_VB);
        const VB = numerator_VB.div(t1_minus_t2);

        // Calculate bullet position PB
        // PB = P1 + (V1 - VB) t1
        const PB = P1_R.add(V1_R.sub(VB).mul(t1_val));

        console.log(`${PB.x.toString()} ${PB.y.toString()} ${PB.z.toString()} ${VB.x.toString()} ${VB.y.toString()} ${VB.z.toString()}`);
    });
}

solve();