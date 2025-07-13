import * as readline from 'readline';

// --- Vector Utility Functions ---
type Vector = { x: number; y: number };

function add(v1: Vector, v2: Vector): Vector {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

function sub(v1: Vector, v2: Vector): Vector {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

function mul(v: Vector, scalar: number): Vector {
    return { x: v.x * scalar, y: v.y * scalar };
}

function div(v: Vector, scalar: number): Vector {
    return { x: v.x / scalar, y: v.y / scalar };
}

function dot(v1: Vector, v2: Vector): number {
    return v1.x * v2.x + v1.y * v2.y;
}

function magnitude(v: Vector): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function normalize(v: Vector): Vector {
    const mag = magnitude(v);
    if (mag < EPSILON) { // Handle zero magnitude to avoid division by zero
        return { x: 0, y: 0 };
    }
    return div(v, mag);
}

// --- Constants ---
const BALL_RADIUS = 0.03075; // 30.75mm in meters
const TWO_BALL_RADIUS = 2 * BALL_RADIUS;
const FRICTION_CONSTANT = 0.8; // a_d(t) = -0.8*v(t)
const K = 1 / FRICTION_CONSTANT; // Factor for total distance traveled (v0 / 0.8)
const EPSILON = 1e-9; // A small value for floating-point comparisons

// --- Input Reading ---
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines: string[] = [];
rl.on('line', (line) => {
    lines.push(line);
});

rl.on('close', () => {
    const [x0_str, y0_str] = lines[0].split(' ');
    const [x1_str, y1_str] = lines[1].split(' ');
    const [vx_str, vy_str] = lines[2].split(' ');

    const P0_start: Vector = { x: parseFloat(x0_str), y: parseFloat(y0_str) };
    const P1_start: Vector = { x: parseFloat(x1_str), y: parseFloat(y1_str) };
    const V0_start: Vector = { x: parseFloat(vx_str), y: parseFloat(vy_str) };

    let P0_final: Vector;
    let P1_final: Vector;

    // --- Main Logic ---

    // Case 1: Initial velocity of the moving ball is zero
    if (magnitude(V0_start) < EPSILON) {
        P0_final = P0_start;
        P1_final = P1_start;
    } else {
        // Case 2: Initial velocity is non-zero

        // Calculate the hypothetical final position of ball 0 if no collision occurs
        const P0_final_no_collision = add(P0_start, mul(V0_start, K));
        // Total distance ball 0 would travel if no collision
        const total_dist_if_no_collision = magnitude(sub(P0_final_no_collision, P0_start));
        // Unit vector in the direction of ball 0's initial velocity
        const V0_start_unit = normalize(V0_start);

        let t_coll_parameter: number = -1; // Parameter along the path segment [0, 1] for collision point
        let actual_time_of_collision: number = -1; // Actual time in seconds when collision occurs

        // Check if balls are already overlapping or touching at t=0
        const dist_initial_sq = dot(sub(P0_start, P1_start), sub(P0_start, P1_start));
        if (dist_initial_sq <= TWO_BALL_RADIUS * TWO_BALL_RADIUS + EPSILON) {
            t_coll_parameter = 0;
            actual_time_of_collision = 0;
        } else {
            // Perform line-segment-circle intersection check
            // Line segment: P0_start (A) to P0_final_no_collision (B)
            // Circle: center P1_start (C), radius TWO_BALL_RADIUS (r)
            const A = P0_start;
            const B = P0_final_no_collision;
            const C = P1_start;
            const r_sq = TWO_BALL_RADIUS * TWO_BALL_RADIUS;

            const D_vec = sub(B, A); // Vector representing the path segment (B - A)
            const F_vec = sub(A, C); // Vector from circle center to segment start (A - C)

            const a = dot(D_vec, D_vec); // Squared magnitude of D_vec
            const b = 2 * dot(F_vec, D_vec); // 2 * dot product of F_vec and D_vec
            const c = dot(F_vec, F_vec) - r_sq; // Squared magnitude of F_vec - r^2

            const discriminant = b * b - 4 * a * c;

            // If discriminant is slightly negative due to float errors, treat as 0
            if (discriminant >= -EPSILON) { 
                const t_sqrt = Math.sqrt(Math.max(0, discriminant)); // Ensure non-negative sqrt input
                const t1 = (-b - t_sqrt) / (2 * a);
                const t2 = (-b + t_sqrt) / (2 * a);

                let min_t_on_segment = Infinity;

                // Check if t1 is a valid collision point on the segment [0, 1]
                if (t1 >= -EPSILON && t1 <= 1 + EPSILON) {
                    min_t_on_segment = Math.min(min_t_on_segment, t1);
                }
                // Check if t2 is a valid collision point on the segment [0, 1]
                if (t2 >= -EPSILON && t2 <= 1 + EPSILON) {
                    min_t_on_segment = Math.min(min_t_on_segment, t2);
                }

                // If a valid intersection parameter is found
                if (min_t_on_segment <= 1 + EPSILON) { 
                    // Clamp t_coll_parameter between 0 and 1
                    t_coll_parameter = Math.max(0, Math.min(1, min_t_on_segment));
                    
                    if (t_coll_parameter < EPSILON) { // Collision immediately at t=0
                        actual_time_of_collision = 0;
                    } else if (t_coll_parameter > 1 - EPSILON) { 
                        // Collision as ball 0 stops or just after it would stop naturally
                        // This means velocity at collision is effectively zero
                        actual_time_of_collision = Infinity; 
                    } else {
                        // Calculate actual time based on distance traveled and exponential decay
                        actual_time_of_collision = -K * Math.log(1 - t_coll_parameter);
                    }
                }
            }
        }

        // Apply collision physics if a collision was detected
        if (t_coll_parameter !== -1) {
            // Position of ball 0 at the moment of collision
            const P0_at_coll = add(P0_start, mul(V0_start_unit, t_coll_parameter * total_dist_if_no_collision));
            const P1_at_coll = P1_start; // Ball 1's position is static until collision

            let V0_pre_collision: Vector;
            if (actual_time_of_collision === Infinity) { // Ball effectively stopped before or at collision
                V0_pre_collision = { x: 0, y: 0 };
            } else {
                // Velocity of ball 0 just before collision
                V0_pre_collision = mul(V0_start, Math.exp(-FRICTION_CONSTANT * actual_time_of_collision));
            }

            let V0_post: Vector; // Velocity of ball 0 after collision
            let V1_post: Vector; // Velocity of ball 1 after collision

            // Handle special case where centers are coincident (e.g., due to problem input or extreme overlap)
            if (magnitude(sub(P0_at_coll, P1_at_coll)) < EPSILON) {
                // Perfect head-on collision for identical, overlapping balls.
                // Moving ball stops, static ball takes its velocity.
                V0_post = { x: 0, y: 0 };
                V1_post = V0_pre_collision;
            } else {
                // Normal vector at collision point (from P1 to P0)
                const N = normalize(sub(P0_at_coll, P1_at_coll));
                // Component of V0_pre_collision along the normal (dot product)
                const V0_pre_mag_normal = dot(V0_pre_collision, N);

                // For elastic collision of equal masses:
                // Ball 0's post-collision velocity: initial tangential component + Ball 1's initial normal component (0)
                V0_post = sub(V0_pre_collision, mul(N, V0_pre_mag_normal));
                // Ball 1's post-collision velocity: initial normal component of Ball 0
                V1_post = mul(N, V0_pre_mag_normal);
            }

            // Calculate final positions after collision, considering remaining friction
            P0_final = add(P0_at_coll, mul(V0_post, K));
            P1_final = add(P1_at_coll, mul(V1_post, K));

        } else {
            // No collision detected along the path or initially, ball 0 just stops naturally
            P0_final = P0_final_no_collision;
            P1_final = P1_start;
        }
    }

    // --- Output Results ---
    // Round to two decimals as required
    console.log(`${P0_final.x.toFixed(2)} ${P0_final.y.toFixed(2)}`);
    console.log(`${P1_final.x.toFixed(2)} ${P1_final.y.toFixed(2)}`);
});