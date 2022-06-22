import { getAvoidLetters, initializeBoard, justAteFood, statusAfterMove, validCoordinates } from "./boardHelpers";
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
  openArea: number;

  constructor(gameState: GameState, moveSelf?: string, moveOthers: number[] = [0, 0], depth: number = 0) {
    this.gameState = JSON.parse(JSON.stringify(gameState));
    this.myHead = gameState.you.head;
    this.descendants = [];
    this.move = moveSelf;
    this.depth = depth;
    this.status = "alive";
    this.openArea = 0;
    this.moveMySnake(); // make snake move to new position 
    // this.createChildren();
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
    if(!justAteFood(modifiedGameState.you.body)) {
      modifiedGameState.you.body.pop();
    } // tail stays when you just ate food
    this.status = statusAfterMove(this.gameState, move);
    if (this.status === "dead") {
      this.myHead = { x: -1, y: -1 };
    }
    else {
      this.gameState = modifiedGameState;
      this.myHead = modifiedGameState.you.head;
      this.openArea = this.floodFill(); // if we are dead we don't want to even look for open area
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
    const boardCopy = initializeBoard(this.gameState);
    const avoidLetters = getAvoidLetters(this.gameState);
    const width = this.gameState.board.width;
    const height = this.gameState.board.height;
    const head = this.myHead;
    let fillStack: any = [];
    fillStack.push([head.x, head.y]);
    let openArea = 0;
    while(fillStack.length > 0)
    {
        var [row, col] = fillStack.pop();
        if (!validCoordinates(boardCopy, [row, col]))
            continue;
            
        if (avoidLetters.includes(boardCopy[row][col]) || boardCopy[row][col] === '#')
            continue;
        boardCopy[row][col] = "#";
        openArea+= 2;
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
      let child = this.addChild(this.gameState, move, undefined, this.depth + 1);
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