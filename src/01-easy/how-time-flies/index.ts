/**
 * Parses a date string in "dd.mm.yyyy" format into a JavaScript Date object.
 * @param dateString The date string to parse.
 * @returns A Date object representing the parsed date.
 */
function parseDateString(dateString: string): Date {
    const [day, month, year] = dateString.split('.').map(Number);
    // Month is 0-indexed in Date constructor (January is 0, December is 11)
    return new Date(year, month - 1, day);
}

// Read the input dates from stdin
const beginDateStr: string = readline();
const endDateStr: string = readline();

// Parse the date strings into Date objects
const beginDate: Date = parseDateString(beginDateStr);
const endDate: Date = parseDateString(endDateStr);

// Calculate the total number of days between the two dates
// msPerDay represents the number of milliseconds in a full day (24 hours)
const msPerDay: number = 1000 * 60 * 60 * 24;
// Calculate the difference in milliseconds and convert to days.
// Math.round is used to handle any potential floating point precision issues,
// ensuring a whole number for total days.
const totalDays: number = Math.round((endDate.getTime() - beginDate.getTime()) / msPerDay);

// Initialize counters for full years and months
let years: number = 0;
let months: number = 0;

// Create a mutable copy of the beginDate. This date will be advanced
// to count full years and months without modifying the original beginDate.
const effectiveStartDate = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate());

// Calculate full years:
// Increment the effectiveStartDate year by year as long as it does not exceed the endDate.
while (true) {
    // Create a temporary Date object representing the effectiveStartDate plus one year.
    // The Date constructor handles day overflows (e.g., Feb 29 to Mar 1 in a non-leap year)
    // which is the desired behavior for counting full years/months.
    const potentialNextYearDate = new Date(
        effectiveStartDate.getFullYear() + 1,
        effectiveStartDate.getMonth(),
        effectiveStartDate.getDate()
    );

    // If adding another year does not exceed the endDate, count it as a full year
    // and advance the effectiveStartDate.
    if (potentialNextYearDate <= endDate) {
        effectiveStartDate.setFullYear(effectiveStartDate.getFullYear() + 1);
        years++;
    } else {
        // If adding another year would exceed endDate, stop counting years.
        break;
    }
}

// Calculate full months from the current effectiveStartDate (which has already accounted for full years).
// Increment the effectiveStartDate month by month as long as it does not exceed the endDate.
while (true) {
    // Create a temporary Date object representing the effectiveStartDate plus one month.
    // The Date constructor handles day overflows (e.g., Jan 31 to Mar 2 if Feb has fewer days).
    const potentialNextMonthDate = new Date(
        effectiveStartDate.getFullYear(),
        effectiveStartDate.getMonth() + 1,
        effectiveStartDate.getDate()
    );

    // If adding another month does not exceed the endDate, count it as a full month
    // and advance the effectiveStartDate.
    if (potentialNextMonthDate <= endDate) {
        effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
        months++;
    } else {
        // If adding another month would exceed endDate, stop counting months.
        break;
    }
}

// Format the output string based on the calculated years, months, and totalDays.
let outputParts: string[] = [];

// Add years part if years > 0, with proper pluralization
if (years > 0) {
    outputParts.push(`${years} year${years === 1 ? '' : 's'}`);
}

// Add months part if months > 0, with proper pluralization
if (months > 0) {
    outputParts.push(`${months} month${months === 1 ? '' : 's'}`);
}

// Join the years and months parts with a comma and space
let resultString = outputParts.join(', ');

// Append the total days part, prepending a comma if there were previous parts.
if (resultString.length > 0) {
    resultString += ', ';
}
resultString += `total ${totalDays} days`;

// Print the final formatted string to stdout
console.log(resultString);