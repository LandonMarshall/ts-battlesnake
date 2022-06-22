import { initializeBoard, statusAfterMove } from "./boardHelpers";
import { GameState } from "./types";

const moveMappings: any = { left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1] };
const MAX_DEPTH = 2;

export class BoardTree {
  gameState: GameState;
  descendants: BoardTree[];
  leftChild?: BoardTree;
  rightChild?: BoardTree;
  upChild?: BoardTree;
  downChild?: BoardTree;
  move?: string;
  myHead: { x: number, y: number }
  depth: number;
  status: string;

  constructor(gameState: GameState, moveSelf?: string, moveOthers: number[] = [0, 0], depth: number = 0) {
    this.gameState = JSON.parse(JSON.stringify(gameState));
    this.myHead = gameState.you.head;
    this.descendants = [];
    this.move = moveSelf;
    this.depth = depth;
    this.status = "alive";
    this.moveMySnake(); // make snake move to new position
    // this.createChildren();
    // console.log(this.depth, this.move, this.status, this.myHead);
  }
  moveMySnake() {
    if (!this.move) {
      return;
    }
    const move = moveMappings[this.move];
    const modifiedGameState = JSON.parse(JSON.stringify(this.gameState));
    modifiedGameState.you.head = {
      "x": modifiedGameState.you.head.x + move[0],
      "y": modifiedGameState.you.head.y + move[1],
    }
    modifiedGameState.you.body.unshift(modifiedGameState.you.head);
    modifiedGameState.you.body.pop();
    this.status = statusAfterMove(this.gameState, move);
    if (this.status === "dead") {
      this.myHead = { x: -1, y: -1 };
    }
    else {
      this.gameState = modifiedGameState;
      this.myHead = modifiedGameState.you.head;
    }
  }

  addChild(gameState: GameState, moveSelf: string, moveOthers: number[] = [0, 0], depth: number = 0) {
    var child = new BoardTree(gameState, moveSelf, moveOthers, depth);
    if (child.status === "alive") {
      this.descendants.push(child);
    }
    return child;
  }

  floodFill() {
    this.printBoard();
  }

  createChildren() {
    if (this.depth >= MAX_DEPTH) {
      return;
    }
    const moves = ['left', 'right', 'up', 'down'];
    moves.forEach(move => {
      let child = this.addChild(this.gameState, move, undefined, this.depth + 1);
      if (this.status === 'alive') {
        child.createChildren();
      }
    });
  }
  printTree() {
    if (this.descendants.length === 0) {
      return;
    }
    this.descendants.forEach((descendant, i) => {
      console.log(i, descendant.depth, descendant.move, descendant.status, descendant.myHead);
    });
    this.descendants.forEach(descendant => {
      descendant.printTree();
    });
  }

  printBoard() {
    const board = initializeBoard(this.gameState);
    const rows = board.length
    const cols = board[0].length

    // Transpose grid so we can actually see the board
    let grid: string[][] = []
    for (let col = 0; col < cols; col++) {
      grid[col] = []
    }
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        grid[cols - col - 1][row] = board[row][col]
      }
    }
    console.table(grid);
  }
  checkDescendants() {
    console.log(this.descendants);
    if (this.descendants.length === 0) {
      console.log(this.status);
    }
    else {
      this.descendants.forEach(descendant => {
        descendant.checkDescendants();
      });
    }
  }
}