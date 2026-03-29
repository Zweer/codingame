# Self Checkout Machine

[:link: Puzzle on CodinGame](https://www.codingame.com/training/medium/self-checkout-machine)

**Level:** medium
**Topics:** Loops, Arrays, Modular calculus, String manipulation

## Goal 

You are tasked with creating a solution for how much change is required from a self-checkout machine based on the customer bill, the cash they put in and the available cash in that machine.  
  
**CHANGE**  
**Notes:** 50, 20, 10, 5  
**Coins:** 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01  
  
**NOTATION**  
All cash in machine and output change to customer must be formatted in notation  
1X20+2X10+5X1 = 1 of 20 note, 2 of 10 note and 5 of 1 coins. Total is 45.  
  
You must always **output** the highest denomination of any notes & coins that is available.  
  
**EXAMPLE**  
Customer change = 50  
Output will be: 2X20+1X10 (when available)  
  
**NOTES**  
Customers will always enter more than or equal cash for their bill.  
Print ERROR: OUT OF MONEY if the machine cannot output the complete change required.  
If you have a J in place of the count of note/coin, this means the machine will jam (but only when that note/coin is dispensed). In this case output ERROR: JAM  
If there is an error of any kind, all other customers are **NOT** processed.  
If no change is due output: 0 

Input

**Line 1:** An string cash for the machines starting cash reserves.  
**Line 2:** An integer n for the number of customers.  
**Next n lines:** Space separated float customer\_bill cash\_given

Output

**n lines of customers:** Cash returned in notation or some ERROR

Constraints

1 ≤ n ≤ 10

Example

Input

1X20+5X10+2X5+20X1+20X0.50+20X0.20+20X0.10+20X0.05+20X0.02+20X0.01
1
22.10 1X20+1X5

Output

2X1+1X0.50+2X0.20
