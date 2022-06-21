import { Coord, GameState } from "./types";
const AVOID_LETTERS = ["H", "S", "SH"];

function populateBoard(gameState: GameState, board: string[][]): string[][] {
	let boardCopy = board;
	const myLength = gameState.you.length;
	// TODO: Create snakes list with snake ids with lengths, avoid squares where another snake is 1 
	// square away from it with a bigger tail and seek squares when smaller 
	
	// Add snakes
	gameState.board.snakes.forEach(snake => {
		snake.body.forEach((bodyPiece, i) => {
			if (i === 0) { // snake head
				boardCopy[bodyPiece.x][bodyPiece.y] = 'SH'
			} else {
				boardCopy[bodyPiece.x][bodyPiece.y] = 'S';
			}
		});
	});

	// Add hazards
	if (gameState.board.hazards) {
		gameState.board.hazards.forEach(hazard => {
			boardCopy[hazard.x][hazard.y] = 'H';
		});
	}
	// Add food
	gameState.board.food.forEach(food => {
		boardCopy[food.x][food.y] = 'F';
	});

	// Add my head
	boardCopy[gameState.you.head.x][gameState.you.head.y] = 'O';
	return board;
}

export function initializeBoard(gameState: GameState): string[][] {
	let board: string[][] = [];
	for (let i = 0; i < gameState.board.width; i++) {
		board[i] = [];
		for (let j = 0; j < gameState.board.height; j++) {
			board[i][j] = '';
		}
	}
	let filledBoard = populateBoard(gameState, board);
	return filledBoard;
}

// Checks if the move being made results in death
export function moveIsDeath(board: string[][], myHead: Coord, ruleset: string, move: number[]): boolean {
  const boardWidth = board[0].length;
  const boardHeight = board.length;
  const headAfterMove = {
    x: myHead.x + move[0],
    y: myHead.y + move[1],
  }
  const badMove =  AVOID_LETTERS.includes(board?.[headAfterMove.x]?.[headAfterMove.y]);
  let wrappedBadMove = false;
  if (ruleset === 'wrapped') {
    if (move[0] === 1) { // right
      wrappedBadMove = myHead.x === boardWidth - 1 && AVOID_LETTERS.includes(board?.[0]?.[myHead.y]);
    }
    if (move[0] === -1) { // left
      wrappedBadMove = myHead.x === 0 && AVOID_LETTERS.includes(board?.[boardWidth - 1]?.[myHead.y]);
    }
    if (move[1] === 1) { // up
      wrappedBadMove = myHead.y === boardHeight - 1
      && AVOID_LETTERS.includes(board?.[myHead.x]?.[0]);
    }
    if (move[1] === -1) { // down
      wrappedBadMove = myHead.y === 0
      && AVOID_LETTERS.includes(board?.[myHead.x]?.[boardHeight - 1]);
    }
  }
  const movedIntoWall = ruleset !== 'wrapped' &&
    (headAfterMove.x < 0 
  || headAfterMove.y < 0 
  || headAfterMove.x >= boardWidth 
  || headAfterMove.y >= boardHeight);

  return badMove || wrappedBadMove || movedIntoWall;
}

export function getClosestFood() {
  // TODO
}
