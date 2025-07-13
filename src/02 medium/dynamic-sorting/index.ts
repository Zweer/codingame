// Define readline and print for CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

// Interface for a single sorting criterion
interface SortingCriterion {
    property: string;
    order: 'asc' | 'desc';
}

// Interface for an item/object, ensuring 'id' is a number and allowing other properties
interface Item {
    id: number;
    [key: string]: string | number; // Allow other properties with string or number values
}

// 1. Read and parse the sorting expression
const sortingExpression: string = readline();
const sortingCriteria: SortingCriterion[] = [];
// Regular expression to find all occurrences of "+propName" or "-propName"
const regex = /([+-])([a-zA-Z0-9_]+)/g;
let match: RegExpExecArray | null;
while ((match = regex.exec(sortingExpression)) !== null) {
    const orderChar = match[1]; // Capture '+' or '-'
    const property = match[2];  // Capture the property name
    sortingCriteria.push({
        property: property,
        order: orderChar === '+' ? 'asc' : 'desc'
    });
}

// 2. Read and parse the associated types
const typesLine: string = readline();
const types: string[] = typesLine.split(',');
// Map to store the declared type for each property used in sorting
const propNameToTypeMap: Record<string, 'int' | 'string'> = {};

// Populate the type map based on the order of properties in sortingCriteria
for (let i = 0; i < sortingCriteria.length; i++) {
    const propName = sortingCriteria[i].property;
    const type = types[i];
    propNameToTypeMap[propName] = type as 'int' | 'string'; // Cast to known types
}

// 3. Read and parse N objects
const N: number = parseInt(readline());
const items: Item[] = [];

for (let i = 0; i < N; i++) {
    const line: string = readline(); // e.g., "id:1,name:maria,age:30"
    const item: Item = { id: 0 }; // Initialize item with a dummy ID, will be overwritten
    const pairs: string[] = line.split(',');

    for (const pair of pairs) {
        const [prop, valueStr] = pair.split(':');
        
        if (prop === 'id') {
            item.id = parseInt(valueStr); // 'id' is always an integer
        } else if (propNameToTypeMap[prop]) {
            // Property is part of the sorting criteria, parse based on its defined type
            if (propNameToTypeMap[prop] === 'int') {
                item[prop] = parseInt(valueStr);
            } else { // 'string'
                item[prop] = valueStr;
            }
        } else {
            // For other properties not relevant to sorting (and not 'id'),
            // treat them as strings. They won't be used for comparison anyway.
            item[prop] = valueStr;
        }
    }
    items.push(item);
}

// 4. Sort the objects using a custom comparator
items.sort((a: Item, b: Item): number => {
    // Iterate through each sorting criterion
    for (const criterion of sortingCriteria) {
        const prop = criterion.property;
        const order = criterion.order;

        const valA = a[prop];
        const valB = b[prop];

        let comparisonResult = 0;

        // Perform comparison based on the actual JavaScript types of the values
        if (typeof valA === 'string' && typeof valB === 'string') {
            comparisonResult = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
            comparisonResult = valA - valB;
        } else {
            // Fallback for unexpected mixed types or missing properties.
            // This case should ideally not be hit if parsing is robust and all relevant properties exist.
            comparisonResult = String(valA).localeCompare(String(valB));
        }

        // Apply descending order if specified
        if (order === 'desc') {
            comparisonResult *= -1; // Invert the result for descending order
        }

        // If a difference is found based on the current criterion, return it immediately
        if (comparisonResult !== 0) {
            return comparisonResult;
        }
    }

    // If all specified sorting criteria values are identical for 'a' and 'b',
    // use 'id' as a final tie-breaker, sorting in ascending order.
    return a.id - b.id;
});

// 5. Print the sorted object IDs
for (const item of items) {
    print(item.id);
}