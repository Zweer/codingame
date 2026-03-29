// Declare readline and print functions for the CodinGame environment
declare function readline(): string;
declare function print(message: any): void;

// --- Data Structures ---

// Array to map weekday indices to names (Monday=0, Sunday=6)
const weekdays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Map to convert abbreviated month names to 0-indexed month numbers (Jan=0, Feb=1, etc.)
const monthMap: Map<string, number> = new Map([
    ['Jan', 0], ['Feb', 1], ['Mar', 2], ['Apr', 3], ['May', 4], ['Jun', 5],
    ['Jul', 6], ['Aug', 7], ['Sep', 8], ['Oct', 9], ['Nov', 10], ['Dec', 11]
]);

// Base number of days in each month (February is 28 days for non-leap years)
const daysInMonthBase: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// --- Helper Function ---

/**
 * Calculates the day number of the year for a given date.
 * Jan 1 is day 1, Jan 31 is day 31, Feb 1 is day 32 (non-leap year), etc.
 * @param monthAbbr Abbreviated month name (e.g., 'Jan').
 * @param dayInMonth Day of the month (e.g., 1 to 31).
 * @param isLeap True if it's a leap year (February has 29 days), false otherwise.
 * @returns The day number within the year (1-365 or 1-366).
 */
function calculateDayOfYear(monthAbbr: string, dayInMonth: number, isLeap: boolean): number {
    const monthIndex = monthMap.get(monthAbbr);
    if (monthIndex === undefined) {
        // This case should not happen based on problem constraints ("Both dates are valid")
        throw new Error(`Invalid month abbreviation: ${monthAbbr}`);
    }

    // Create a mutable copy of daysInMonthBase to adjust February if needed
    const currentDaysInMonth = [...daysInMonthBase]; 
    if (isLeap) {
        currentDaysInMonth[1] = 29; // Adjust February for leap year
    }

    let dayOfYear = 0;
    // Sum days from all preceding months
    for (let i = 0; i < monthIndex; i++) {
        dayOfYear += currentDaysInMonth[i];
    }
    // Add the days in the current month
    dayOfYear += dayInMonth;

    return dayOfYear;
}

// --- Main Program Logic ---

// 1. Read input: Leap year status
const isLeapYearInput: number = parseInt(readline());
const isLeap: boolean = isLeapYearInput === 1;

// 2. Read input: Initial date (e.g., "Monday Jan 1")
const startDateParts: string[] = readline().split(' ');
const startDayOfWeekStr: string = startDateParts[0];
const startMonthStr: string = startDateParts[1];
const startDayNum: number = parseInt(startDateParts[2]);

// 3. Read input: Target date (e.g., "Jan 2")
const targetDateParts: string[] = readline().split(' ');
const targetMonthStr: string = targetDateParts[0];
const targetDayNum: number = parseInt(targetDateParts[1]);

// 4. Get the numerical index of the start day of the week (e.g., Monday is 0)
const startDayOfWeekIndex: number = weekdays.indexOf(startDayOfWeekStr);
if (startDayOfWeekIndex === -1) {
    // This case should not happen based on problem constraints
    throw new Error(`Invalid start day of week: ${startDayOfWeekStr}`);
}

// 5. Calculate the day number of the year for both the start and target dates
const startDayOfYear: number = calculateDayOfYear(startMonthStr, startDayNum, isLeap);
const targetDayOfYear: number = calculateDayOfYear(targetMonthStr, targetDayNum, isLeap);

// 6. Calculate the difference in days between the target date and the start date
const dayDifference: number = targetDayOfYear - startDayOfYear;

// 7. Calculate the target day of the week index
// The modulo operator (%) in JavaScript can return a negative result if the dividend is negative.
// Adding `+ 7` and then taking `% 7` again ensures the result is always positive and within 0-6.
const targetDayOfWeekIndex: number = (startDayOfWeekIndex + (dayDifference % 7) + 7) % 7;

// 8. Output the result: the day of the week for the target date
print(weekdays[targetDayOfWeekIndex]);