function readline(): string {
  return 'foo';
}

interface Node {
  isGateway: boolean;
  links: Set<number>;
  links2gateway: Set<number>;
}

class Game {
  graph: Node[] = [];

  constructor() {
    const [nodeCount, linkCount, exitCount] = readline()
      .split(' ')
      .map((input) => parseInt(input, 10));
    console.error('nodeCount:', nodeCount);
    console.error('linkCount:', linkCount);
    console.error('exitCount:', exitCount);

    this.graph = [...Array(nodeCount)].map((_) => ({
      isGateway: false,
      links: new Set(),
      links2gateway: new Set(),
    }));

    for (let i = 0; i < linkCount; i += 1) {
      const [nodeId1, nodeId2] = readline()
        .split(' ')
        .map((input) => parseInt(input, 10));
      this.graph[nodeId1].links.add(nodeId2);
      this.graph[nodeId2].links.add(nodeId1);
      console.error('link:', `${nodeId1} - ${nodeId2}`);
    }

    for (let i = 0; i < exitCount; i += 1) {
      const nodeId = parseInt(readline(), 10);
      this.graph[nodeId].isGateway = true;
      this.graph[nodeId].links.forEach((linkId) => {
        this.graph[linkId].links2gateway.add(nodeId);
      });
      console.error('exit:', `--> ${nodeId}`);
    }
  }

  turn() {
    const nodeId = parseInt(readline(), 10);
    console.error('agent:', nodeId);

    const [nodeId1, nodeId2] = this.bfs(nodeId);
    console.log(`${nodeId1} ${nodeId2}`);

    console.error('before delete', this.graph[nodeId1]);
    this.graph[nodeId1].links2gateway.delete(nodeId2);
    this.graph[nodeId1].links.delete(nodeId2);
    console.error('after delete', this.graph[nodeId1]);
    this.graph[nodeId2].links.delete(nodeId1);
  }

  bfs(startNodeId: number): [number, number] {
    const queue = [startNodeId];
    const visited = [...Array(this.graph.length)].map((_) => false);

    let selectedNode = -1;

    while (queue.length > 0) {
      // console.error('queue', queue);
      const currentNodeId = queue.shift()!;
      const currentNode = this.graph[currentNodeId];
      // console.error('current id', currentNodeId);
      // console.error('current node', currentNode);
      visited[currentNodeId] = true;

      if (currentNode.links2gateway.size > 1) {
        selectedNode = currentNodeId;
        break;
      } else if (currentNode.links2gateway.size === 1) {
        if (selectedNode === -1) {
          selectedNode = currentNodeId;
          if (currentNodeId === startNodeId) {
            break;
          }
        }
        queue.push(...[...currentNode.links].filter((linkId) => !visited[linkId]));
      } else if (selectedNode === -1) {
        queue.push(...[...currentNode.links].filter((linkId) => !visited[linkId]));
      }
    }

    return [selectedNode, [...this.graph[selectedNode].links2gateway][0]];
  }
}

const game = new Game();
while (true) {
  game.turn();
}
