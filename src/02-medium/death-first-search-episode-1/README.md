<div class="statement-body"><!-- GOAL -->
<div class="statement-section statement-goal">
<h2><span class="icon icon-goal">&nbsp;</span> <span>The Goal</span></h2>

<div class="statement-goal-content">Your virus has caused a backdoor to open on the Bobnet network enabling you to send new instructions in real time.<br>
<br>
You decide to take action by <strong>stopping Bobnet from communicating on its own internal network</strong>.<br>
<br>
Bobnet's network is divided into several smaller networks, in each sub-network is a Bobnet agent tasked with transferring information by moving from node to node along links and <strong>accessing gateways leading to other sub-networks.</strong><br>
<br>
Your mission is to reprogram the virus so it will <strong>sever links </strong>in such a way that the Bobnet Agent is unable to access another sub-network thus preventing information concerning the presence of our virus to reach Bobnet's central hub.</div>
</div>
<!-- RULES -->

<div class="statement-section statement-rules">
<h2><span class="icon icon-rules">&nbsp;</span> <span>Rules</span></h2>

<div>
<div class="statement-rules-content">For each test you are given:
<ul>
	<li>A map of the network.</li>
	<li>The position of the exit gateways.</li>
	<li>The starting position of the Bobnet agent.</li>
</ul>
<b>&gt;&gt;&gt; Nodes can only be connected to up to a single gateway. &lt;&lt;&lt;</b><br>
<br>
Each game turn:
<ul>
	<li>First off, you sever one of the given links in the network.</li>
	<li>Then the Bobnet agent moves from one Node to another accessible Node.</li>
</ul>

<table style="border-collapse: collapse; width:100%; text-align: center;">
	<tbody>
		<tr>
			<td><img alt="" src="https://files.codingame.com/codingame/skynet2-game/virus_ide.jpg" style="width: 100%;max-width:200px; max-height:200px;">
			<div><i>Bobnet agent</i></div>
			</td>
			<td><img alt="" src="https://files.codingame.com/codingame/skynet2-game/boom_zone_ide.jpg" style="width: 100%;max-width:200px; max-height:200px;">
			<div><i>Gateway</i></div>
			</td>
		</tr>
	</tbody>
</table>
</div>
<!-- Victory conditions -->

<div class="statement-victory-conditions">
<div class="icon victory">&nbsp;</div>

<div class="blk">
<div class="title">Victory Conditions</div>

<div class="text">The Bobnet agent cannot reach an exit gateway</div>
</div>
</div>
<!-- Lose conditions -->

<div class="statement-lose-conditions">
<div class="icon lose">&nbsp;</div>

<div class="blk">
<div class="title">Lose Conditions</div>

<div class="text">The Bobnet agent has reached a gateway</div>
</div>
</div>
</div>
</div>
<!-- EXAMPLES -->

<div class="statement-section statement-examples">
<h2><span class="icon icon-example">&nbsp;</span> <span>Example</span></h2>

<div class="statement-examples-text">
<div class="statement-example-horizontal">
<div style="color: #20252a;width: 280px;display: table-cell;background-color: transparent;vertical-align: middle;padding: 0;">
<pre style="margin: 0">4 4 1
0 1
0 2
1 3
2 3
3
</pre>
</div>

<div class="legend">
<div class="title">Initialization input</div>
&nbsp;

<div>Text representation of the network used in this example. There are 4 nodes, 4 links and 1 gateway. The next 4 lines describe the links. The last integer is the index of the exit node.</div>
</div>
</div>
</div>

<div class="statement-example-container">
<div class="statement-example"><img src="https://files.codingame.com/codingame/skynet2-game/example1.png">
<div class="legend">
<div class="title">Turn 1</div>

<div class="description">The Bobnet agent starts at node 0 (<var>SI</var> = 0). Our virus cut the link between the nodes 1 and 3.</div>
</div>
</div>

<div class="statement-example"><img src="https://files.codingame.com/codingame/skynet2-game/example2.png">
<div class="legend">
<div class="title">Turn 2</div>

<div class="description">The Bobnet agent moves to node 2 (<var>SI</var> = 2). Our virus cut the link between the nodes 2 and 3.</div>
</div>
</div>

<div class="statement-example"><img src="https://files.codingame.com/codingame/skynet2-game/example3.png">
<div class="legend">
<div class="title">Turn 3</div>

<div class="description">The Bobnet agent has been cut off from the exit, you have won !</div>
</div>
</div>
</div>
</div>
<!-- WARNING -->

<div class="statement-section statement-warning">
<h2><span class="icon icon-warning">&nbsp;</span> <span>Note</span></h2>

<div class="statement-warning-content">The tests provided are similar to the validation tests used to compute the final score but remain different.</div>
</div>
<!-- PROTOCOL -->

<div class="statement-section statement-protocol">
<h2><span class="icon icon-protocol">&nbsp;</span> <span>Game Input</span></h2>
<!-- Protocol block -->

<div class="blk">
<div class="text">The program must first read the initialization data from standard input. Then, <strong>within an infinite loop</strong>, read the data from the standard input related to the current state of the Bobnet agent and provide to the standard output the next instruction.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Initialization input</div>

<div class="text">
<p><span class="statement-lineno">Line 1: </span>3 integers <var>N L E</var><br>
- <var>N</var>, the total number of nodes in the level, including the gateways.<br>
- <var>L</var>, the number of links in the level.<br>
- <var>E</var>, the number of exit gateways in the level.</p>

<p><span class="statement-lineno">Next <var>L</var> lines: </span>2 integers per line (<var>N1</var>, <var>N2</var>), indicating a link between the nodes indexed <var>N1</var> and <var>N2</var> in the network.</p>

<p><span class="statement-lineno">Next <var>E</var> lines: </span>1 integer <var>EI</var> representing the index of a gateway node.</p>
</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Input for one game turn</div>

<div class="text"><span class="statement-lineno">Line 1: </span>1 integer <var>SI</var>, which is the index of the node on which the Bobnet agent is positioned this turn.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Output for one game turn</div>

<div class="text">A <span class="statement-lineno">single line </span>comprised of two integers <var>C1</var> and <var>C2</var> separated by a space. <var>C1</var> and <var>C2</var> are the indices of the nodes you wish to sever the link between.</div>
</div>
<!-- Protocol block -->

<div class="blk">
<div class="title">Constraints</div>

<div class="text">2 ≤ <var>N</var> ≤ 500<br>
1 ≤ <var>L</var> ≤ 1000<br>
1 ≤ <var>E</var> ≤ 20<br>
0 ≤ <var>N1</var>, <var>N2</var> &lt; N<br>
0 ≤ <var>SI</var> &lt; N<br>
0 ≤ <var>C1</var>, <var>C2</var> &lt; N<br>
Response time per turn ≤ 150ms</div>
</div>
</div>
</div>
