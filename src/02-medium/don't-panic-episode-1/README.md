<div class="statement-body"><!-- GOAL -->
<div class="statement-section statement-goal">
<h2><span class="icon icon-goal">&nbsp;</span> <span>The Goal</span></h2>

<div class="statement-goal-content">You need to help the clones reach the exit in order to help them escape the inside of the Improbability Drive.</div>
</div>
<!-- RULES -->

<div class="statement-section statement-rules">
<h2><span class="icon icon-rules">&nbsp;</span> <span>Rules</span></h2>

<div>
<div class="statement-rules-content"><b>The drive has a rectangular shape of variable size</b>. It is composed of several floors (<const>0</const> = lower floor) and each floor has several possible positions that the clones can occupy (<const>0</const> = leftmost position, <var>width - 1</var> = rightmost position).<br>
<br>
<b>The goal is to save at least one clone in a limited amount of rounds.</b><br>
<br>
The details:
<ul>
	<li>
	<p dir="ltr" style="line-height: 1.15;">Clones appear from a unique generator <b>at regular intervals, every three game turns</b>. The generator is located on floor <const>0</const>. Clones exit the generator heading towards the right.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">Clones move one position per turn in a straight line, <b>moving in their current direction</b>.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">A clone is destroyed by a laser if it is goes below position <const>0</const> or beyond position <var>width - 1</var>.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;"><b>Elevators are scattered throughout the drive and can be used to move from one floor to the one above.</b> When a clone arrives on the location of an elevator, it moves up one floor. <b>Moving up one floor takes one game turn</b>. On the next turn, the clone continues to move in the direction it had before moving upward.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">On each game turn you can <b>either block the leading clone</b> - meaning the one that got out the earliest - or do nothing.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">Once a clone is blocked, you can no longer act on it. The next clone in line takes the role of "leading clone" and can be blocked at a later time.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;"><b>When a clone moves towards a blocked clone, it changes direction from left to right or right to left</b>. It also changes direction when getting out of the generator directly on a blocked clone or when going up an elevator onto a blocked clone.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">If a clone is blocked in front of an elevator, the elevator can no longer be used.</p>
	</li>
	<li>
	<p dir="ltr" style="line-height: 1.15;">When a clone reaches the location of the exit, <b>it is saved </b> and disappears from the area.</p>
	</li>
</ul>
<b>Note: </b>For this puzzle there is at most one elevator per floor.<br>
&nbsp;</div>
<!-- Victory conditions -->

<div class="statement-victory-conditions">
<div class="icon victory">&nbsp;</div>

<div class="blk">
<div class="title">Victory Conditions</div>

<div class="text">You win if at least one clone reaches the exit location in a limited amount of game rounds</div>
</div>
</div>
</div>
</div>
<!-- WARNING -->

<div class="statement-section statement-warning">
<h2><span class="icon icon-warning">&nbsp;</span> <span>Note</span></h2>

<div class="statement-warning-content">Don’t forget to run the tests by launching them from the “Test cases” window.<br>
<br>
The tests provided are similar to the validation tests used to compute the final score but are slightly different.</div>
</div>
<!-- PROTOCOL -->

<div class="statement-section statement-protocol">
<h2><span class="icon icon-protocol">&nbsp;</span> <span>Game Input</span></h2>
<!-- Protocol block -->

<div class="blk">
<div class="text">The program must first read the initialization data from standard input. Then, within an infinite loop, read the contextual data (location of leading clone) from the standard input and provide the next instruction to standard output.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Initialization input</div>

<div class="text"><span class="statement-lineno">Line 1:</span> 8 integers:

<ul>
	<li><var>nbFloors</var> : number of floors in the area. A clone can move between floor <const>0</const> and floor <var>nbFloors - 1</var></li>
	<li><var>width</var> : the width of the area. The clone can move without being destroyed between position <const>0</const> and position <var>width - 1</var></li>
	<li><var>nbRounds</var> : maximum number of rounds before the end of the game</li>
	<li><var>exitFloor</var> : the floor on which the exit is located</li>
	<li><var>exitPos</var> : the position of the exit on its floor</li>
	<li><var>nbTotalClones</var> : the number of clones that will come out of the generator during the game</li>
	<li><var>nbAdditionalElevators</var> : <i>not used for this first question, value is always <const>0</const></i></li>
	<li><var>nbElevators</var> : number of elevators in the area</li>
</ul>
<span class="statement-lineno"><var>nbElevators</var> next lines: </span> 2 integers <var>elevatorFloor</var> <var>elevatorPos</var> providing the floor and position of an elevator.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Input for one game turn</div>

<div class="text"><span class="statement-lineno">Line 1:</span> 2 integers <var>cloneFloor</var> <var>clonePos</var> and one string <var>direction</var>. <var>cloneFloor</var> and <var>clonePos</var> are the coordinates of the leading unblocked clone. <var>direction</var> indicates the current direction of the leading clone:

<ul>
	<li><const>LEFT</const> the clone is moving towards the left</li>
	<li><const>RIGHT</const> the clone moving towards the right</li>
</ul>
If there is no leading clone, the line values are: <const>-1</const> <const>-1</const> <const>NONE</const>. This can happen only when the clones which are already outside are all blocked and the next clone is not out yet. In this case, you may output action <action>WAIT</action>.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Output for one game turn</div>

<div class="text"><span class="statement-lineno">A single line</span> (including newline character) to indicate which action to take:

<ul>
	<li>Either the keyword <action>WAIT</action> to do nothing.</li>
	<li>or the keyword <action>BLOCK</action> to block the leading clone.</li>
</ul>
</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Constraints</div>

<div class="text">
<div>1 ≤ <var>nbFloors</var> ≤ 15</div>

<div>5 ≤ <var>width</var> ≤ 100</div>

<div>10 ≤ <var>nbRounds</var> ≤ 200</div>

<div>0 ≤ <var>exitFloor</var>, <var>elevatorFloor</var> &lt; nbFloors</div>

<div>0 ≤ <var>exitPos</var> , <var>elevatorPos</var> &lt; width</div>

<div>-1 ≤ <var>cloneFloor</var> &lt; nbFloors</div>

<div>-1 ≤ <var>clonePos</var> &lt; width</div>

<div>2 ≤ <var>nbTotalClones</var> ≤ 50</div>

<div>0 ≤ <var>nbElevators</var> ≤ 100</div>

<div>Duration of one game turn: 100 ms</div>
</div>
</div>
</div>
<!-- STORY -->

<div class="statement-story-background">
<div class="statement-story-cover" style="background-size: cover; background-image: url(https://www.codingame.com/servlet/fileservlet?id=2210464465203)">
<div class="statement-story" style="min-height: 300px; position: relative">
<h2>Synopsis</h2>

<div class="story-text">
<p><i><strong>Clone A:</strong></i>&nbsp;&nbsp;“<i>I do wish they hadn't pressed that button, now I'm stuck inside the core of the Improbability Drive. There seems to be another me standing in front of me... no wait, there are 2 other mes now. At this rate they'll be an infinite number of clones clogging up the engines.</i>&nbsp;&nbsp;”</p>

<p><i><strong>Clone B:</strong></i>&nbsp;&nbsp;“<i>I suppose we should probably rescue the ship from being destroyed now. Total waste of time if you ask me, not that anyone ever bothers to ask me anything.</i>&nbsp;”</p>

<p><i><strong>Clone A:</strong></i>&nbsp;&nbsp;“<i>I've been cloned. I mean we've been cloned. But the process seems to have gone somewhat haywire.</i>&nbsp;&nbsp;”</p>

<p><i><strong>Clone C:</strong></i>&nbsp;&nbsp;“<i>Indeed, I feel more intelligent than before. This is quite a feat considering I originally had a brain the size of a planet! I can sense the infinite expanse of the universe inside my mind, and I think you should all know that I'm feeling very depressed.</i>&nbsp;”</p>

<p><i><strong>Clone D:</strong></i>&nbsp;&nbsp;“<i>Oh look, the failsafe protocols have activated the emergency lasers.</i>&nbsp;”</p>

<p><i><strong>Clone E:</strong></i>&nbsp;&nbsp;“<i>Lasers? Don't talk to me about lasers...</i>&nbsp;”</p>

<p><i><strong>Clone B:</strong></i>&nbsp;&nbsp;“<i>We can escape by using the vertical transporters that are popping into existence. I hate those talking elevators so much, I deactivated all of their speaking circuits.</i>&nbsp;”</p>

<p><i><strong>Clone F:</strong></i>&nbsp;&nbsp;“<i>To avoid a sudden total existence failure, we should follow one another in a straight line, the leading clone can signal the danger to the rest of us.</i>&nbsp;”</p>

<p><i><strong>Clone E:</strong></i>&nbsp;&nbsp;“<i>We can't all escape. I'm sure to be left behind once again. Me with this terrible pain in all the diodes down my left side...</i>&nbsp;”</p>

<p><i><strong>Clone C:</strong></i>&nbsp;&nbsp;“<i>Wrong! Since we are all the same entity along the probability axis, as soon as one of us makes it outside, normality will be restored and we will survive as one to continue our pitiful existence.</i>&nbsp;”</p>

<p><i><strong>Clone F:</strong></i>&nbsp;&nbsp;“<i>How many of us are there now ?</i>&nbsp;”</p>

<p><i><strong>Clone A:</strong></i>&nbsp;&nbsp;“<i>41</i>&nbsp;”</p>

<p><i><strong>Clone C:</strong></i>&nbsp;&nbsp;“<i>You idiot! You forgot to count yourself.</i>&nbsp;”</p>

<p><i><strong>Clone A:</strong></i>&nbsp;&nbsp;“<i>Let's just go...</i>&nbsp;”</p>
</div>
</div>
</div>
</div>
</div>
