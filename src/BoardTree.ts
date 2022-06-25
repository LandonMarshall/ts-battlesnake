import {
  getAvoidLetters, initializeBoard,
  statusAfterMove, validCoordinates, moveMySnake,
} from "./boardHelpers";
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
  depth: number;
  status: string;
  openArea: number;

  constructor(gameState: GameState, moveSelf?: string, depth: number = 0) {
    this.gameState = JSON.parse(JSON.stringify(gameState));
    this.descendants = [];
    this.move = moveSelf;
    this.depth = depth;
    this.status = "alive";
    this.openArea = 0;
    this.moveMySnake(); // make snake move to new position 
    // this.createChildren();
  }
  moveMySnake() {
    if (!this.move) { // If there is no move, we are at the root
      return;
    }
    const move = moveMappings[this.move];
    this.status = statusAfterMove(this.gameState, move);
    this.gameState = moveMySnake(this.gameState, move);
    if (this.status !== 'dead') { // if we are dead we don't want to even look for open area
      this.openArea = this.floodFill();
    }
  }
  moveAllOtherSnakes() {
    if (this.status === 'dead') {
      return;
    }
    this.gameState.board.snakes.forEach(snake => {
      if (snake.id !== this.gameState.you.id) {
        if (statusAfterMove(this.gameState, moveMappings["left"]) === 'alive') {
          const newBoard = this.gameState.board.snakes.find(snake => snake.id === snake.id);
        }
      }
    })
  }

  addChild(gameState: GameState, moveSelf: string, depth: number = 0) {
    var child = new BoardTree(gameState, moveSelf, depth);
    if (child.status === "alive") {
      this.descendants.push(child);
    }
    return child;
  }

  floodFill() {
    const boardCopy = initializeBoard(this.gameState);
    const avoidLetters = getAvoidLetters(this.gameState);
    const width = this.gameState.board.width;
    const height = this.gameState.board.height;
    const head = this.gameState.you.head;
    let fillStack: any = [];
    fillStack.push([head.x, head.y]);
    let openArea = 0;
    while (fillStack.length > 0) {
      var [row, col] = fillStack.pop();
      if (!validCoordinates(boardCopy, [row, col]))
        continue;

      if (avoidLetters.includes(boardCopy[row][col]) || boardCopy[row][col] === '#')
        continue;
      boardCopy[row][col] = "#";
      openArea += 2;
      if (this.gameState.game.ruleset.name === 'wrapped') {
        if (row === 0) { // if wrapped, we need to wrap around
          fillStack.push([width - 1, col]);
        }
        else {
          fillStack.push([row - 1, col]);
        }
        if (row === width) {
          fillStack.push([0, col]);
        }
        else {
          fillStack.push([row + 1, col]);
        }
        if (col === 0) {
          fillStack.push([row, height - 1]);
        }
        else {
          fillStack.push([row, col - 1]);
        }
        if (col === height) {
          fillStack.push([row, 0]);
        }
        else {
          fillStack.push([row, col + 1]);
        }
      }
      else {
        fillStack.push([row - 1, col]);
        fillStack.push([row + 1, col]);
        fillStack.push([row, col - 1]);
        fillStack.push([row, col + 1]);
      }
    }
    return openArea;
  }

  // Creates children of the current node for all directions that are alive
  createChildren() {
    if (this.depth >= MAX_DEPTH) {
      return;
    }
    const moves = ['left', 'right', 'up', 'down'];
    moves.forEach(move => {
      let child = this.addChild(this.gameState, move, this.depth + 1);
      if (this.status === 'alive') {
        child.createChildren();
      }
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
}