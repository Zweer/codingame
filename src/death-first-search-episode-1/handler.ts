declare function readline(): string; // Assuming a readline function is available

class Node {
  isGateway = false;
  hasAgent = false;
  neighbors: Record<number, Node> = {};

  constructor(public readonly id: number) {}
}

class Graph {
  nodes: Node[];

  constructor(nodeCount: number) {
    this.nodes = [...Array(nodeCount)].map((_, index) => new Node(index));
  }

  addLink(nodeId1: number, nodeId2: number): void {
    this.nodes[nodeId1].neighbors[nodeId2] = this.nodes[nodeId2];
    this.nodes[nodeId2].neighbors[nodeId1] = this.nodes[nodeId1];
  }

  removeLink(nodeId1: number, nodeId2: number): void {
    delete this.nodes[nodeId1].neighbors[nodeId2];
    delete this.nodes[nodeId2].neighbors[nodeId1];
  }

  addGateway(nodeId: number): void {
    this.nodes[nodeId].isGateway = true;
  }

  resetAgent(): void {
    this.nodes.forEach((node) => {
      node.hasAgent = false;
    });
  }

  moveAgent(nodeId: number): void {
    this.resetAgent();
    this.nodes[nodeId].hasAgent = true;
  }
}

class Game {
  readonly graph: Graph;

  constructor() {
    const [nodeCount, linkCount, exitCount] = readline()
      .split(' ')
      .map((input) => parseInt(input, 10));
    console.error('nodeCount:', nodeCount);
    console.error('linkCount:', linkCount);
    console.error('exitCount:', exitCount);

    this.graph = new Graph(nodeCount);
    for (let i = 0; i < linkCount; i += 1) {
      const [nodeId1, nodeId2] = readline()
        .split(' ')
        .map((input) => parseInt(input, 10));
      this.graph.addLink(nodeId1, nodeId2);
      console.error('link:', `${nodeId1} <-> ${nodeId2}`);
    }

    for (let i = 0; i < exitCount; i += 1) {
      const nodeId = parseInt(readline(), 10);
      this.graph.addGateway(nodeId);
      console.error('exit:', `--> ${nodeId}`);
    }
  }

  turn() {
    console.error('turn');

    const nodeId = parseInt(readline(), 10);
    console.error('agent:', nodeId);

    this.graph.moveAgent(nodeId);
    const path = this.bfs(nodeId);
    console.error('path:', path.map((node) => node.id).join(' -> '));

    this.graph.removeLink(path[0].id, path[1].id);
    console.log(`${path[0].id} ${path[1].id}`);
  }

  bfs(startNodeId: number): Node[] {
    const startNode = this.graph.nodes[startNodeId];
    const queue: [Node, Node[]][] = [[startNode, []]];
    const visited: Set<Node> = new Set();

    while (queue.length > 0) {
      const [node, [...path]] = queue.shift() as [Node, Node[]];
      path.push(node);

      if (node.isGateway) {
        return path;
      }

      const neighbors = Object.values(node.neighbors);
      if (!visited.has(node) && neighbors.length > 0) {
        queue.push(...neighbors.map((neighbor) => [neighbor, path] as [Node, Node[]]));
      }

      visited.add(node);
    }

    return [];
  }
}

const game = new Game();
while (true) {
  game.turn();
}
