// Read initial input: lightX, lightY, initialTX, initialTY
const inputs: string[] = readline().split(' ');
const lightX: number = +inputs[0]; // X coordinate of the light of power
const lightY: number = +inputs[1]; // Y coordinate of the light of power
let thorX: number = +inputs[2];    // Thor's current X position
let thorY: number = +inputs[3];    // Thor's current Y position

// Game loop
// This loop continues until Thor reaches the light, at which point the CodinGame environment will terminate the program.
while (true) {
    readline(); // Read 'remainingTurns', but it's not needed for the logic, so we ignore its value.

    let directionY: string = ''; // Stores the vertical component of the direction (N or S)
    let directionX: string = ''; // Stores the horizontal component of the direction (W or E)

    // Determine vertical movement
    if (thorY > lightY) {
        directionY = 'N'; // Thor is below the light, move North
        thorY--;          // Update Thor's Y position
    } else if (thorY < lightY) {
        directionY = 'S'; // Thor is above the light, move South
        thorY++;          // Update Thor's Y position
    }

    // Determine horizontal movement
    if (thorX > lightX) {
        directionX = 'W'; // Thor is to the right of the light, move West
        thorX--;          // Update Thor's X position
    } else if (thorX < lightX) {
        directionX = 'E'; // Thor is to the left of the light, move East
        thorX++;          // Update Thor's X position
    }

    // Output the combined direction (vertical + horizontal).
    // If only vertical or horizontal movement is needed, one of the strings will be empty.
    // Examples: "N", "E", "NW", "SE", "S", "W", "NE", "SW"
    console.log(directionY + directionX);
}