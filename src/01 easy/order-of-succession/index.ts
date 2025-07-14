// In the CodinGame environment, readline() is available for input
// and console.log() is used for output.

interface Person {
    name: string;
    parentName: string; // Used during initial parsing to link to parent
    birthYear: number;
    deathYear: number | null; // null if alive
    religion: string;
    gender: 'M' | 'F';
    children: Person[]; // Array of actual Person objects who are children
}

// Read the number of people
const n: number = parseInt(readline());

// Use a Map to store all people, allowing easy lookup by name
const peopleMap = new Map<string, Person>();
let rootPerson: Person | null = null; // To store the person with no parent (the monarch)

// Parse N lines of input
for (let i = 0; i < n; i++) {
    const line: string[] = readline().split(' ');
    const name: string = line[0];
    const parentName: string = line[1];
    const birthYear: number = parseInt(line[2]);
    const deathYearStr: string = line[3];
    const religion: string = line[4];
    const gender: 'M' | 'F' = line[5] as 'M' | 'F'; // Type assertion for gender

    const person: Person = {
        name,
        parentName,
        birthYear,
        deathYear: deathYearStr === '-' ? null : parseInt(deathYearStr),
        religion,
        gender,
        children: [] // Initialize children as an empty array
    };

    peopleMap.set(name, person);

    // Identify the root person (the one with no parent)
    if (parentName === '-') {
        rootPerson = person;
    }
}

// The problem constraints guarantee exactly one root person, so rootPerson will not be null here.

// Build the family tree by assigning children to their parents
for (const person of peopleMap.values()) {
    if (person.parentName !== '-') {
        const parent = peopleMap.get(person.parentName);
        if (parent) {
            parent.children.push(person);
        }
    }
}

/**
 * Recursively sorts the children of a given person based on succession rules.
 * Rules: (b) gender (Male before Female), (c) age (older first).
 * This function modifies the `children` array in place.
 * @param person The person whose children need to be sorted.
 */
function sortAllChildren(person: Person) {
    // Sort children based on the defined rules
    person.children.sort((a, b) => {
        // Rule (b): Male descendants before female descendants
        if (a.gender === 'M' && b.gender === 'F') {
            return -1; // a comes before b
        }
        if (a.gender === 'F' && b.gender === 'M') {
            return 1; // b comes before a
        }

        // Rule (c): Older (lower birth year) first for same gender
        return a.birthYear - b.birthYear;
    });

    // Recursively sort children for all descendants
    for (const child of person.children) {
        sortAllChildren(child);
    }
}

// Start sorting from the root person to ensure all descendants' children are sorted
if (rootPerson) { // Check for rootPerson just in case, though guaranteed by constraints
    sortAllChildren(rootPerson);
}

const successionList: string[] = []; // This will store the names in succession order

/**
 * Performs a depth-first traversal of the family tree to determine the succession order.
 * Applies exclusion rules: (a) exclude dead people, (b) exclude Catholic people.
 * @param person The current person in the traversal.
 */
function getSuccessionOrder(person: Person) {
    // Apply output rules: include only alive and non-Catholic people
    if (person.deathYear === null && person.religion !== 'Catholic') {
        successionList.push(person.name);
    }

    // Recursively traverse through the sorted children
    for (const child of person.children) {
        getSuccessionOrder(child);
    }
}

// Start the succession order traversal from the root person
if (rootPerson) { // Check for rootPerson just in case
    getSuccessionOrder(rootPerson);
}

// Output the names in the determined succession order
for (const name of successionList) {
    console.log(name);
}