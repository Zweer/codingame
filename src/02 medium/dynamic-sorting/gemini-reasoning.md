The problem requires us to sort a list of objects based on a dynamic sorting expression. The sorting expression specifies properties to sort by, along with their order (ascending or descending). If multiple properties are given, they serve as primary, secondary, and tertiary sorting keys. A crucial detail is that if all specified sorting properties have identical values for two items, the tie must be broken by sorting on the `id` property in ascending order.

Here's a breakdown of the solution steps:

1.  **Parse the Sorting Expression:**
    The first line of input is the sorting expression (e.g., `+prop1-prop2+prop3`). We need to extract each property name and its associated sorting order (`+` for ascending, `-` for descending). A regular expression `([+-])([a-zA-Z0-9_]+)` can be used to capture the sign and the property name. We store these as an array of objects, where each object contains `property` (string) and `order` (`'asc'` or `'desc'`).

2.  **Parse Property Types:**
    The second line provides a comma-separated list of types (e.g., `string,int,string`). The problem statement implies these types correspond to the properties *in the order they appear in the sorting expression*. We create a map (`propNameToTypeMap`) to store the declared type for each property mentioned in the sorting expression. This map will be used when parsing the actual item data to ensure values are correctly cast (e.g., to `number` for `int` type, or kept as `string`).

3.  **Parse N Objects:**
    The third line gives `N`, the number of subsequent data lines. Each data line represents an object, formatted as `prop1:value1,prop2:value2,...`. We iterate `N` times, parsing each line into a JavaScript object.
    *   For each `prop:value` pair in a line:
        *   The `id` property is explicitly stated to always be an integer, so we parse its value using `parseInt()`.
        *   If a property is found in our `propNameToTypeMap`, we parse its value according to the type specified in the map (using `parseInt()` for `int`, otherwise keeping it as a string).
        *   Any other properties not mentioned in the sorting expression (and not `id`) are stored as strings. This is generally safe as they won't be used for comparison based on the puzzle's requirements.

4.  **Sort the Objects:**
    We use JavaScript's built-in `Array.prototype.sort()` method, providing a custom comparison function.
    *   The comparison function iterates through our `sortingCriteria` array (from step 1).
    *   For each criterion, it retrieves the corresponding values from the two objects being compared (`valA` and `valB`).
    *   It performs a type-aware comparison:
        *   For strings, `localeCompare()` is used for correct lexicographical ordering.
        *   For numbers, simple subtraction (`valA - valB`) works.
    *   The `comparisonResult` is then adjusted based on the `order` (`descending` order inverts the result).
    *   If a `comparisonResult` is non-zero (meaning a difference is found), that result is returned immediately, as it determines the order.
    *   If the loop completes (meaning all properties in the sorting criteria have identical values for `a` and `b`), then the tie-breaking rule applies: sort by `id` ascending (`a.id - b.id`).

5.  **Print Output:**
    Finally, iterate through the sorted array of objects and print the `id` of each object on a new line.

**Example Walkthrough for Input:**
```
+name
string
3
id:1,name:maria
id:2,name:jason
id:3,name:robert
```

1.  **Sorting Expression:** `+name` is parsed into `[{ property: 'name', order: 'asc' }]`.
2.  **Types:** `string` is parsed, and `propNameToTypeMap` becomes `{ 'name': 'string' }`.
3.  **Objects:**
    *   `id:1,name:maria` -> `{ id: 1, name: 'maria' }`
    *   `id:2,name:jason` -> `{ id: 2, name: 'jason' }`
    *   `id:3,name:robert` -> `{ id: 3, name: 'robert' }`
    The list of items is `[{id:1,name:'maria'}, {id:2,name:'jason'}, {id:3,name:'robert'}]`.
4.  **Sorting:** The items are sorted by `name` ascending.
    *   'jason' comes before 'maria'
    *   'maria' comes before 'robert'
    The sorted order of items is `[{id:2,name:'jason'}, {id:1,name:'maria'}, {id:3,name:'robert'}]`.
5.  **Output:** The IDs `2`, `1`, `3` are printed on separate lines.