The puzzle requires calculating the score for a Bridge deal based on a set of complex rules. The input provides details about the deal: vulnerability, the contract bid (level, suit/NT, and whether it was doubled or redoubled), and the number of tricks won.

I'll break down the solution into the following steps:
1.  **Input Parsing**: Read each line of input to extract vulnerability, contract details (level, suit, doubled/redoubled status), and tricks won.
2.  **Contract Interpretation**: Determine the required number of tricks to make the contract.
3.  **Scoring Logic - Contract Made**:
    *   Calculate base points for the contracted tricks based on suit (minor, major, NT) and doubling/redoubling.
    *   Apply Game Bonus (if base points >= 100) or Part-Score Bonus (50 points).
    *   Add Slam Bonuses if applicable (Small Slam for 6-level, Grand Slam for 7-level).
    *   Add Making Bonus if doubled or redoubled.
    *   Calculate points for overtricks, varying based on doubling/redoubling and vulnerability.
4.  **Scoring Logic - Contract Lost**:
    *   Calculate undertricks.
    *   Apply penalties per undertrick, which vary significantly based on vulnerability and whether the contract was doubled or redoubled. The penalties are tiered for doubled/redoubled contracts.

**Detailed Logic Breakdown:**

*   **Vulnerability**: 'V' for vulnerable, 'NV' for non-vulnerable. This impacts bonus amounts and penalties.
*   **Contract Parsing**:
    *   If "Pass", the score is 0.
    *   Otherwise, the contract string like "4S", "3NTX", "2CDXX" needs to be parsed.
    *   Check for "XX" (redoubled) first, then "X" (doubled) from the end of the string.
    *   The first digit is the contract level (1-7), the rest is the suit ('C', 'D', 'H', 'S', 'NT').
*   **Tricks Required**: A contract level `N` means aiming for `N + 6` tricks. (e.g., 2S means 2 over 6 = 8 tricks).
*   **Base Contract Points (if Made)**:
    *   Minor suits (C, D): 20 points per contracted trick (over 6).
    *   Major suits (H, S): 30 points per contracted trick (over 6).
    *   No Trump (NT): 40 points for the first contracted trick (over 6), then 30 points for each subsequent contracted trick.
    *   These base points are multiplied by 2 if doubled, or by 4 if redoubled.
*   **Game/Part-Score Bonus**: If the `baseContractPoints` are 100 or more, a game bonus is awarded (300 NV, 500 V). Otherwise, a 50-point part-score bonus is awarded.
*   **Slam Bonuses**:
    *   Small Slam (6-level contract): 500 NV, 750 V.
    *   Grand Slam (7-level contract): 1000 NV, 1500 V.
*   **Making Bonus (if Doubled/Redoubled)**: 50 points if doubled, 100 points if redoubled.
*   **Overtrick Points**:
    *   Normal (undoubled): Same value as a trick in the contracted suit (20/30/30).
    *   Doubled: 100 NV, 200 V per overtrick.
    *   Redoubled: 200 NV, 400 V per overtrick.
*   **Undertrick Penalties (if Lost)**:
    *   Normal (undoubled): 50 NV, 100 V per undertrick.
    *   Doubled (NV): 1st: 100, 2nd & 3rd: 200 each, 4th+: 300 each.
    *   Doubled (V): 1st: 200, 2nd+: 300 each.
    *   Redoubled: All doubled penalties are themselves doubled. (e.g., 1st NV Redoubled: 200, 2nd&3rd: 400, 4th+: 600; 1st V Redoubled: 400, 2nd+: 600).

The `calculateScore` function encapsulates this logic. The main program loop reads test cases and calls this function.