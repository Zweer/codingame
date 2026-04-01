const [n, l, e] = readline().split(' ').map(Number);
const adj: Set<number>[] = Array.from({ length: n }, () => new Set<number>());
for (let i = 0; i < l; i++) {
  const [a, b] = readline().split(' ').map(Number);
  adj[a].add(b);
  adj[b].add(a);
}
const gateways = new Set<number>();
for (let i = 0; i < e; i++) gateways.add(Number(readline()));

// Identify gateway-adjacent nodes
const gwAdj = new Set<number>();
for (const gw of gateways) for (const nb of adj[gw]) if (!gateways.has(nb)) gwAdj.add(nb);

// Find "border links": links from non-gw-adjacent nodes to gw-adjacent nodes
// Cutting these isolates the agent from all gateways (if agent is on non-gw-adj side)
function getBorderLinks(): [number, number][] {
  const links: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    if (gateways.has(i) || gwAdj.has(i)) continue;
    for (const nb of adj[i]) {
      if (gwAdj.has(nb)) links.push([i, nb]);
    }
  }
  return links;
}

// BFS shortest path from start to nearest gateway, returns path
function bfsToGw(start: number): number[] {
  const prev = new Int32Array(n).fill(-1);
  const visited = new Uint8Array(n);
  visited[start] = 1;
  const queue = [start];
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    if (gateways.has(cur)) {
      const path: number[] = [];
      for (let node = cur; node !== -1; node = prev[node]) path.push(node);
      return path.reverse();
    }
    for (const nb of adj[cur]) {
      if (!visited[nb]) { visited[nb] = 1; prev[nb] = cur; queue.push(nb); }
    }
  }
  return [];
}

let linksCut = 0;

while (true) {
  const si = Number(readline());

  let cutA = -1, cutB = -1;

  // Priority 1: agent adjacent to gateway — MUST cut
  for (const gw of gateways) {
    if (adj[si].has(gw)) { cutA = si; cutB = gw; break; }
  }

  if (cutA === -1) {
    // Find the agent's shortest path to any gateway
    const path = bfsToGw(si);
    // path = [agent, ..., gateway]
    // Find the first "border link" on this path (link from non-gwAdj to gwAdj)
    // OR the first gateway link on this path
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1];
      if (gateways.has(b)) {
        // Gateway link — cut it
        cutA = a; cutB = b; break;
      }
      if (!gwAdj.has(a) && gwAdj.has(b)) {
        // Border link — cut it to isolate agent from gateway zone
        cutA = a; cutB = b; break;
      }
    }

    // Fallback: if no border link on path, cut the gateway link at end of path
    if (cutA === -1 && path.length >= 2) {
      cutA = path[path.length - 2];
      cutB = path[path.length - 1];
    }
  }

  adj[cutA].delete(cutB);
  adj[cutB].delete(cutA);
  // Update gwAdj status: if a node lost all gateway connections, it's no longer gwAdj
  if (gwAdj.has(cutA)) {
    let stillGwAdj = false;
    for (const nb of adj[cutA]) if (gateways.has(nb)) { stillGwAdj = true; break; }
    if (!stillGwAdj) gwAdj.delete(cutA);
  }
  if (gwAdj.has(cutB)) {
    let stillGwAdj = false;
    for (const nb of adj[cutB]) if (gateways.has(nb)) { stillGwAdj = true; break; }
    if (!stillGwAdj) gwAdj.delete(cutB);
  }

  linksCut++;
  console.error(`T${linksCut}: agent@${si} cut ${cutA}-${cutB} (${l - linksCut} left) border=${!gwAdj.has(cutA) || !gwAdj.has(cutB)}`);
  console.log(`${cutA} ${cutB}`);
}
