The problem asks us to determine the day of the week for a target date, given a start date with a known weekday, both within the same year. We are also told whether the year is a leap year.

**Reasoning:**

1.  **Representing Days and Months:**
    *   We need a consistent way to map weekday names (Monday, Tuesday, etc.) to numerical indices (e.g., Monday = 0, Sunday = 6). An array `weekdays` is suitable for this.
    *   Similarly, month names (Jan, Feb, etc.) need to be mapped to numerical indices (e.g., Jan = 0, Dec = 11). A `Map` is a good choice for this.
    *   We need to know the number of days in each month. This is standard, but February's length depends on whether it's a leap year (29 days) or not (28 days). We'll store the base number of days for each month and adjust February if the year is a leap year.

2.  **Calculate Day of Year:**
    *   To find the difference in days between any two dates in the same year, the most straightforward approach is to convert both dates into their "day of year" number. For example, January 1st is day 1, February 1st (in a non-leap year) is day 32, and so on.
    *   A function `calculateDayOfYear(month, day, isLeap)` can achieve this. It sums the days in all full months preceding the given month and then adds the `day` within the given month.

3.  **Calculate Day Difference:**
    *   Once we have the `startDayOfYear` and `targetDayOfYear`, the `dayDifference` is simply `targetDayOfYear - startDayOfYear`. This difference can be positive (target date is after start date) or negative (target date is before start date).

4.  **Determine Target Weekday:**
    *   We find the numerical index of the `startDayOfWeek` using our `weekdays` array (e.g., if "Monday" is 0, its index is 0).
    *   The `targetDayOfWeekIndex` can then be calculated as `(startDayOfWeekIndex + dayDifference) % 7`.
    *   A critical point here is handling negative results from the modulo operator (`%`) in JavaScript. If `dayDifference` is negative, `dayDifference % 7` can also be negative. To ensure the final index is always positive and within the 0-6 range, we use the formula `(value % N + N) % N`. So, `(startDayOfWeekIndex + (dayDifference % 7) + 7) % 7` will correctly map the difference to the new weekday index.

5.  **Output:**
    *   Finally, we use the `targetDayOfWeekIndex` to look up the corresponding weekday name from our `weekdays` array and print it.

**Example Walkthrough (Input from problem):**
Input:
0 (Not a leap year)
Monday Jan 1
Jan 2

*   `isLeap = false`
*   `startDayOfWeekStr = "Monday"`, `startMonthStr = "Jan"`, `startDayNum = 1`
*   `targetMonthStr = "Jan"`, `targetDayNum = 2`

1.  `startDayOfWeekIndex = weekdays.indexOf("Monday") = 0`
2.  `calculateDayOfYear("Jan", 1, false)`: `monthMap.get("Jan") = 0`. No preceding months. `dayOfYear = 1`. So, `startDayOfYear = 1`.
3.  `calculateDayOfYear("Jan", 2, false)`: `monthMap.get("Jan") = 0`. No preceding months. `dayOfYear = 2`. So, `targetDayOfYear = 2`.
4.  `dayDifference = targetDayOfYear - startDayOfYear = 2 - 1 = 1`
5.  `targetDayOfWeekIndex = (startDayOfWeekIndex + (dayDifference % 7) + 7) % 7`
    `targetDayOfWeekIndex = (0 + (1 % 7) + 7) % 7`
    `targetDayOfWeekIndex = (0 + 1 + 7) % 7`
    `targetDayOfWeekIndex = 8 % 7 = 1`
6.  `weekdays[1]` is "Tuesday". Output: "Tuesday". This matches the example.

**Code Structure:**

*   Define constants for weekdays, month mappings, and base days in months.
*   Implement `calculateDayOfYear` function.
*   Read input lines using `readline()`.
*   Parse input strings into their components.
*   Apply the logic described above to calculate the `targetDayOfWeekIndex`.
*   Print the result using `print()`.