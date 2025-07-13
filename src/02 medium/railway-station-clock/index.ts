// Standard input reading for CodinGame
const readline = () => {
    return require('fs').readFileSync(0, 'utf-8').trim();
};

const inputTimeStr = readline();

// --- Constants ---
const RESET_HOUR = 8;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const RESET_SECONDS_MIDNIGHT = RESET_HOUR * SECONDS_IN_HOUR;

// --- Parse Input ---
// Example input: "8:03:59 AM"
const parts = inputTimeStr.split(' '); // ["8:03:59", "AM"]
const timeParts = parts[0].split(':'); // ["8", "03", "59"]
const ampm = parts[1]; // "AM" or "PM"

let observedHH = parseInt(timeParts[0]);
const observedMM = parseInt(timeParts[1]);
const observedSS = parseInt(timeParts[2]);

// --- Convert 12-hour observed time to 24-hour format and total seconds since midnight ---
let observedHH24: number;
if (ampm === "PM") {
    // 12 PM is 12:xx:xx in 24-hour (noon)
    // 1 PM to 11 PM are 13:xx:xx to 23:xx:xx
    if (observedHH === 12) {
        observedHH24 = 12;
    } else {
        observedHH24 = observedHH + 12;
    }
} else { // AM
    // 12 AM is 00:xx:xx in 24-hour (midnight)
    // 1 AM to 11 AM are 01:xx:xx to 11:xx:xx
    if (observedHH === 12) {
        observedHH24 = 0;
    } else {
        observedHH24 = observedHH;
    }
}

const totalObservedSecondsSinceMidnight = observedHH24 * SECONDS_IN_HOUR + observedMM * SECONDS_IN_MINUTE + observedSS;

// --- Calculate observed duration since the last 8 AM reset ---
// This correctly handles times before 8 AM by referencing the previous day's 8 AM reset.
// Adding SECONDS_IN_DAY before modulo ensures the result is always non-negative.
const observedDurationSince8AM = (totalObservedSecondsSinceMidnight - RESET_SECONDS_MIDNIGHT + SECONDS_IN_DAY) % SECONDS_IN_DAY;

// --- Calculate true duration based on the clock's delay rate ---
// The clock loses 1 second for every 4 minutes of true time.
// This means for every 240 true seconds, the clock shows 239 seconds.
// So, True_Elapsed_Time = Observed_Elapsed_Time * (240 / 239)
const trueDurationSince8AM = observedDurationSince8AM * (240 / 239);

// --- Calculate the true total seconds since midnight ---
// Add the true elapsed duration back to the 8 AM reset point.
// Modulo SECONDS_IN_DAY handles cases where the true time crosses midnight.
const trueTotalSecondsSinceMidnight = (RESET_SECONDS_MIDNIGHT + trueDurationSince8AM) % SECONDS_IN_DAY;

// --- Convert true total seconds back to HH:MM:SS 12-hour format ---
const trueHH24 = Math.floor(trueTotalSecondsSinceMidnight / SECONDS_IN_HOUR);
const remainingSeconds = trueTotalSecondsSinceMidnight % SECONDS_IN_HOUR;
const trueMM = Math.floor(remainingSeconds / SECONDS_IN_MINUTE);
const trueSS = remainingSeconds % SECONDS_IN_MINUTE;

let trueHH_12hr: number;
let trueAMPM: string;

if (trueHH24 === 0) { // 00:xx:xx (midnight) in 24-hour is 12:xx:xx AM in 12-hour
    trueHH_12hr = 12;
    trueAMPM = "AM";
} else if (trueHH24 === 12) { // 12:xx:xx (noon) in 24-hour is 12:xx:xx PM in 12-hour
    trueHH_12hr = 12;
    trueAMPM = "PM";
} else if (trueHH24 < 12) { // 01:xx:xx to 11:xx:xx are AM
    trueHH_12hr = trueHH24;
    trueAMPM = "AM";
} else { // 13:xx:xx to 23:xx:xx are PM
    trueHH_12hr = trueHH24 - 12;
    trueAMPM = "PM";
}

// --- Format Output ---
// Hour has no leading zero if < 10
// Minutes and seconds always have a leading zero if < 10 (e.g., 03, 00)
const formattedMM = trueMM.toString().padStart(2, '0');
const formattedSS = trueSS.toString().padStart(2, '0');

console.log(`${trueHH_12hr}:${formattedMM}:${formattedSS} ${trueAMPM}`);