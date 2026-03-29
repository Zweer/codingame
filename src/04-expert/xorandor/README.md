# Xorandor

[:link: Puzzle on CodinGame](https://www.codingame.com/training/expert/xorandor)

**Level:** expert
**Topics:** Logic

## Goal 

The gaming company **Intergalactical Gaming Corporation** is about to launch a new game based on logic gates called **Xorandor**. The purpose of the game is to light up an LED by powering (or not) inputs and flipping (or not) switches to have the current flow through various logic gates until all inputs of the LED are powered. This has to be done in minimum steps. Each step is either powering/depowering an input or flipping a switch. Before going to retail, the CEO insists on having the game checked, especially the minimum steps required for each level.  
  
Your task is to determine and list for each proposed level the minimum steps to be performed to light the LED. In case several solutions exist, you must list the solution that would come first in top-left bottom-right order.  
  
There are conventions to respect:  
\- Inputs are named I1, I2 ... In, where I1 correspond to the leftmost input and In to the rightmost one.  
\- Switches are named K1, K2 ... Kn, in order of their appearance from top to bottom, left to right.  
  
You are provided a representation of each level using the **Crappy Magnificent Original Standard©®™** (CMOS) format. In this format:  
\- The height and width of the electronic circuit are given first, followed by the circuit itself.  
\- The LED to light is on the first line of the circuit.  
\- The INPUTs are on the last line of the circuit.  
\- Each component (gate, LED, switch) is represented by a special character surrounded by \[ and \]. There may be some spaces surrounding the special character.  
\- Inputs are represented by either a 0 (for unpowered input) or a 1 for powered input and have only an output pin and no input pins.  
\- The LED only has a variable number of input pins and no output pins.  
\- The logic gates have only 1 output, which is always aligned with its special character.  
\- The NOT gate has only 1 input, and the other gates have 2 inputs.  
\- The switches have only 1 input and 2 outputs. Depending on their status they either let the current pass to the right or to the left.  
\- Wires link inputs and outputs.  
\- Wires can fork to link 1 output pin to several input pins.  
\- Wires do not overlap each other nor do they go through/above/under a gate.  
\- Current always flows from bottom to top (i.e. from inputs toward the LED).  
\- Input and output pins are always represented as a | and are always attached to their component.  
  
  
9 11 <-- The height and width of the layout   
    [@] <-- The LED you want to light !   
     |  
   [ & ]  <-- AND gate  
    | |  
  +-+ +-+  <-- wires linking the OR gates to the AND gate  
  |     |  
[ | ] [ | ]  <-- 2 OR GATES *   
 | |   | |  
 0 0   0 0   <-- INPUTS (all set to 0) names from left to right I1, I2, I3 and I4  

  
\* Do not mistake the | for the OR gate with a wire. Gates are surrounded by \[ and \]. This also applies for the XOR gate ( + ) and the NOR gate ( \- ). 

Input

**Line 1**: Two space-separated integers height and width for the height and width of the layout of the electronic circuit.  
**Next height lines**: The layout of the electronic circuit line by line.  
  
Special characters used to identified the components between \[ and \]:  
\- @: LED  
\- \~: NOT  
\- &: AND  
\- |: OR  
\- +: XOR  
\- ^: NAND  
\- \-: NOR  
\- \=: XNOR  
\- <: switch forwarding to its left output pin  
\- \>: switch forwarding to its right output pin  
  
Wires are drawn using the following characters: \-, | and +.

Output

**A number of lines**: The minimum steps (i.e. which switch/input to be toggled from original setting) to be performed from top-left to bottom-right, one step per line.

Constraints

1 ≤ height, width ≤ 50  
0 ≤ number of switches ≤ 9  
1 ≤ number of inputs ≤ 9

Example

Input

9 11
    [@]    
     |     
   [ & ]   
    | |    
  +-+ +-+  
  |     |  
[ | ] [ | ]
 | |   | | 
 0 0   0 0 

Output

I1
I3
