/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

declare function readline(): string; // Assuming a readline function is available

class Node {
  g = 0; // The total cost of getting to that node
  h = 0; // The estimated time to reach the finish from the current node
  f = 0; // Simply g(x) + h(x). The lower the f(x), the better

  cost = 1;
  visited = false;
  closed = false;
  parent?: Node;
}

class Astar {
  grid
  init(): void {}
}

class Game {
  static MAP_WIDTH = 19;
  static MAP_HEIGHT = 10;
}
