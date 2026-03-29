function getFizzBuzzString(num: number, f: number, b: number): string {
    const isMultipleOfF = (num % f === 0);
    const isMultipleOfB = (num % b === 0);

    if (isMultipleOfF && isMultipleOfB) {
        return "FizzBuzz";
    } else if (isMultipleOfF) {
        return "Fizz";
    } else if (isMultipleOfB) {
        return "Buzz";
    } else {
        return String(num);
    }
}