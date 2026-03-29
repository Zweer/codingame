// Read N and K from input
// Initialize an empty array `possibilities` to store results
// Define the recursive function `findPossibilities(currentSum, currentPath)`:
//   Base cases (currentSum === N or currentSum > N)
//   Loop from 1 to K for nextCandies:
//     If valid, push nextCandies, recurse, then pop nextCandies (backtrack)
// Initial call: findPossibilities(0, [])
// Iterate through `possibilities` and print each path joined by spaces