/**
 * Reads a line from standard input.
 * In a real CodinGame environment, this function is provided.
 * For local testing, you might need to mock it or use Node.js's 'readline' module.
 */
declare function readline(): string;

/**
 * Converts an IP address string (e.g., "192.168.1.10") to its 32-bit integer representation.
 * @param ipAddress The IP address string.
 * @returns The 32-bit integer representation of the IP address.
 */
function ipToLong(ipAddress: string): number {
    // Split the IP address string into its four octets.
    // Use reduce to combine them into a single 32-bit integer.
    // Each octet is shifted left by 8 bits relative to the previous one.
    return ipAddress.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

/**
 * Converts a 32-bit integer representation of an IP address back to its dotted decimal string format.
 * @param longIp The 32-bit integer representation of the IP address.
 * @returns The IP address string (e.g., "192.168.1.10").
 */
function longToIp(longIp: number): string {
    // Use unsigned right shift (>>>) to ensure the number is treated as unsigned
    // before extracting octets, and then mask with 0xFF to get only the last 8 bits.
    return [
        (longIp >>> 24) & 0xFF, // First octet
        (longIp >>> 16) & 0xFF, // Second octet
        (longIp >>> 8) & 0xFF,  // Third octet
        longIp & 0xFF           // Fourth octet
    ].join('.');
}

// Read the input line (e.g., "192.168.0.5/24")
const input: string = readline();

// Split the input into IP address string and mask bits string
const parts = input.split('/');
const ipAddressStr = parts[0];
const maskBits = parseInt(parts[1], 10); // Convert mask bits to integer

// Convert the IP address string to its 32-bit integer form
const ipAddressLong = ipToLong(ipAddressStr);

// Calculate the subnet mask as a 32-bit integer.
// ~0 in JS (32-bit signed) is -1 (all bits set to 1).
// Shifting it left by (32 - maskBits) creates the mask with leading 1s and trailing 0s.
const subnetMaskLong = (~0) << (32 - maskBits);

// Calculate the network address: IP address AND subnet mask.
// This sets all host bits to 0.
const networkAddressLong = ipAddressLong & subnetMaskLong;

// Calculate the wildcard mask: the inverse of the subnet mask.
// This will have 0s in the network part and 1s in the host part.
const wildcardMaskLong = ~subnetMaskLong;

// Calculate the broadcast address: Network address OR wildcard mask.
// This sets all host bits to 1 while keeping the network bits.
const broadcastAddressLong = networkAddressLong | wildcardMaskLong;

// Output the network address and broadcast address in dotted decimal format
console.log(longToIp(networkAddressLong));
console.log(longToIp(broadcastAddressLong));