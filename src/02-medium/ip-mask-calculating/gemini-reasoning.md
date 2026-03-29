To solve this puzzle, we need to perform bitwise operations on IP addresses. IP addresses are typically represented as four 8-bit numbers (octets) separated by dots, but for calculation, it's easier to convert them into a single 32-bit integer. The CIDR mask (e.g., `/24`) indicates how many leading bits of the 32-bit address constitute the network part, and the remaining bits constitute the host part.

Here's the step-by-step approach:

1.  **Parse the input**: The input is a string like "192.168.0.5/24". We need to separate the IP address string and the mask bits.
2.  **Convert IP to 32-bit integer**: Split the IP address string by `.` into its four octets. Convert each octet to an integer. Then, combine them into a single 32-bit integer using bit shifts. For example, `(octet1 << 24) | (octet2 << 16) | (octet3 << 8) | octet4`.
    *   A more concise way for conversion is using `reduce`: `ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0)`.
3.  **Create the Subnet Mask**: The subnet mask is a 32-bit integer with `maskBits` leading '1's and `(32 - maskBits)` trailing '0's. In JavaScript (and many languages), `~0` represents a 32-bit integer with all bits set to '1' (which is -1 in two's complement). Shifting this value left by `(32 - maskBits)` will correctly form the subnet mask. For example, for a /24 mask, `(32 - 24) = 8`, so `(~0) << 8` creates `11111111.11111111.11111111.00000000`.
4.  **Calculate the Network Address**: The network address is obtained by performing a bitwise `AND` operation between the IP address (as a 32-bit integer) and the subnet mask. This effectively sets all host part bits to '0'.
    `networkAddressLong = ipAddressLong & subnetMaskLong`.
5.  **Calculate the Broadcast Address**: The broadcast address is obtained by setting all host part bits of the network address to '1'. This can be achieved by performing a bitwise `OR` operation between the network address and the *wildcard mask*. The wildcard mask is the bitwise `NOT` of the subnet mask (`~subnetMaskLong`). This `NOT` operation flips all bits: '1's become '0's (in the network part) and '0's become '1's (in the host part).
    `broadcastAddressLong = networkAddressLong | (~subnetMaskLong)`.
6.  **Convert 32-bit integers back to IP string format**: To convert a 32-bit integer back to a dotted decimal IP address, we extract each 8-bit octet using unsigned right shifts (`>>>`) and a bitwise `AND` with `0xFF` (which is `11111111` in binary) to isolate the lower 8 bits.
    `[(longIp >>> 24) & 0xFF, (longIp >>> 16) & 0xFF, (longIp >>> 8) & 0xFF, longIp & 0xFF].join('.')`.

**JavaScript/TypeScript Specifics:**
*   JavaScript's bitwise operators work on 32-bit signed integers. This means numbers are internally converted to 32-bit representations before the operation.
*   The unsigned right shift operator `>>>` is crucial when converting back to dotted decimal, as it treats the number as an unsigned 32-bit integer, preventing issues with the sign bit if the highest bit is set.

Let's illustrate with `192.168.0.5/24`:
*   `ipAddressLong`: `11000000 10101000 00000000 00000101` (binary representation of 3232235525)
*   `maskBits`: `24`
*   `subnetMaskLong = (~0) << (32 - 24)` which is `(~0) << 8`. This results in `11111111 11111111 11111111 00000000`.
*   `networkAddressLong = ipAddressLong & subnetMaskLong`:
    `11000000 10101000 00000000 00000101` (IP)
    `&`
    `11111111 11111111 11111111 00000000` (Mask)
    `------------------------------------`
    `11000000 10101000 00000000 00000000` (Network Address, `192.168.0.0`)
*   `wildcardMaskLong = ~subnetMaskLong`: `00000000 00000000 00000000 11111111`
*   `broadcastAddressLong = networkAddressLong | wildcardMaskLong`:
    `11000000 10101000 00000000 00000000` (Network Address)
    `|`
    `00000000 00000000 00000000 11111111` (Wildcard Mask)
    `------------------------------------`
    `11000000 10101000 00000000 11111111` (Broadcast Address, `192.168.0.255`)