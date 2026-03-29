The problem requires calculating the difference between two dates in terms of full years, full months, and total days. The input dates are in `dd.mm.yyyy` format.

Here's a breakdown of the solution approach:

1.  **Date Parsing**: The input dates are strings in `dd.mm.yyyy` format. JavaScript's `Date` constructor is flexible but doesn't natively parse this specific format directly without ambiguity (e.g., `mm/dd/yyyy` vs `dd/mm/yyyy`). To ensure correctness, we'll manually parse the day, month, and year parts and then create a `Date` object using `new Date(year, month - 1, day)`. Note that the month is 0-indexed in the `Date` constructor (January is 0, December is 11), so we subtract 1 from the parsed month.

2.  **Total Days Calculation**: This is the most straightforward part. `Date` objects have a `getTime()` method which returns the number of milliseconds since the Unix Epoch (January 1, 1970, 00:00:00 UTC). Subtracting the `getTime()` values of the `BEGIN` and `END` dates gives the total duration in milliseconds. Dividing this by the number of milliseconds in a day (`1000 * 60 * 60 * 24`) yields the total number of days. `Math.round` is used to handle any potential floating-point inaccuracies, though for full day differences, it usually results in an integer.

3.  **Full Years and Months Calculation**: This is the trickiest part as "full" units imply passing a specific calendar point (e.g., reaching the same day/month again). We use an iterative approach:
    *   Create a mutable `effectiveStartDate` copy of the `beginDate`.
    *   **Calculate Years**: In a loop, attempt to add one year to the `effectiveStartDate` (conceptually, by creating a new `Date` object for the potential next year). If this `potentialNextYearDate` is still less than or equal to the `endDate`, it means a full year has passed. In this case, increment the `years` counter and advance `effectiveStartDate` by one year using `setFullYear()`. The `Date` object's `setFullYear()` method automatically handles day rollovers (e.g., from Feb 29 to Mar 1 in a non-leap year). This loop continues until adding another year would exceed the `endDate`.
    *   **Calculate Months**: After calculating all full years, `effectiveStartDate` now points to the same calendar day/month as `beginDate` but `years` years later. From this point, a similar loop is used for months. Attempt to add one month to `effectiveStartDate` (again, conceptually via a new `Date` object). If this `potentialNextMonthDate` is less than or equal to the `endDate`, increment the `months` counter and advance `effectiveStartDate` by one month using `setMonth()`. The `Date` object's `setMonth()` method also handles day rollovers (e.g., from Jan 31 to Mar 2 when trying to set Feb 31). This loop continues until adding another month would exceed the `endDate`.

4.  **Output Formatting**: Construct the final string based on the calculated `years`, `months`, and `totalDays`.
    *   If `years > 0`, include the years part with proper pluralization ("year" vs "years").
    *   If `months > 0`, include the months part with proper pluralization ("month" vs "months").
    *   Join the years and months parts with ", " if both are present.
    *   Finally, append ", total NN days" to the string. This ensures the correct format regardless of whether years or months parts were included.

The `readline()` function is assumed to be provided by the CodinGame environment for input.

Example walk-through for `15.12.2014` to `14.02.2016`:
*   `beginDate = Date(2014, 11, 15)`, `endDate = Date(2016, 1, 14)`
*   `totalDays` calculated as 426.
*   `effectiveStartDate` initially `Date(2014, 11, 15)`.
*   **Years loop**:
    *   `Date(2015, 11, 15)` (`Dec 15, 2015`) `<= Date(2016, 1, 14)`? Yes. `effectiveStartDate` becomes `Date(2015, 11, 15)`. `years = 1`.
    *   `Date(2016, 11, 15)` (`Dec 15, 2016`) `<= Date(2016, 1, 14)`? No. Loop ends.
*   Current `years = 1`. `effectiveStartDate` is now `Date(2015, 11, 15)`.
*   **Months loop**:
    *   `Date(2015, 11 + 1, 15)` (i.e., `Date(2016, 0, 15)` which is `Jan 15, 2016`) `<= Date(2016, 1, 14)`? Yes. `effectiveStartDate` becomes `Date(2016, 0, 15)`. `months = 1`.
    *   `Date(2016, 0 + 1, 15)` (i.e., `Date(2016, 1, 15)` which is `Feb 15, 2016`) `<= Date(2016, 1, 14)`? No. Loop ends.
*   Current `months = 1`.
*   Output: `1 year, 1 month, total 426 days`.