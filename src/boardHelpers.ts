import { Coord, GameState } from "./types";
const AVOID_LETTERS = ["H", "S", "SH"];

function populateBoard(gameState: GameState, board: string[][]): string[][] {
	let boardCopy = board;
	const myLength = gameState.you.length;
	// Add snakes
	gameState.board.snakes.forEach(snake => {
		snake.body.forEach((bodyPiece, i) => {
			if (i === 0) { // snake head
				boardCopy[bodyPiece.x][bodyPiece.y] = `SH${snake.length}`
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

  // If I just ate food, my tail is not going to move so I should be scared of it
	if (!justAteFood(gameState.you.body)) {
		const myTail = gameState.you.body[myLength - 1];
		boardCopy[myTail.x][myTail.y] = 'T';
	}
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
// If there is a duplicate in body, it means we just ate food on the last turn.
// this is important because our tail won't move if we just ate
export function justAteFood(body: Coord[]): boolean {
	const removedDuplicates = [...body.reduce((map, { x, y }) => {
		return (map.set(`${x}-${y}`, { x, y }));
	}, new Map()).values()];
	if (removedDuplicates.length !== body.length) {
		return true;
	}
	return false;
}

// Checks if the move being made results in death
export function statusAfterMove(gameState: GameState, move: number[]): string {
	let status = "alive";
	const board: string[][] = initializeBoard(gameState);
	const myHead = gameState.you.head;
	const ruleset = gameState.game.ruleset.name;
	const boardWidth = board[0].length;
	const boardHeight = board.length;
	const headAfterMove = {
		x: myHead.x + move[0],
		y: myHead.y + move[1],
	}
	const aroundNewHead = [
		board?.[headAfterMove.x]?.[headAfterMove.y + 1],
		board?.[headAfterMove.x]?.[headAfterMove.y - 1],
		board?.[headAfterMove.x + 1]?.[headAfterMove.y],
		board?.[headAfterMove.x - 1]?.[headAfterMove.y],
	];
	let biggerSnakeIsClose = false;
	aroundNewHead.forEach(square => {
		if (!square) return;
		if (square.includes('SH') && Number(square.split("SH")[1]) >= gameState.you.length) {
			biggerSnakeIsClose = true;
		}
	})

	const badMove = AVOID_LETTERS.includes(board?.[headAfterMove.x]?.[headAfterMove.y]);
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

	if (movedIntoWall || wrappedBadMove || badMove) {
		status = "dead";
	}
	if (biggerSnakeIsClose) {
		status = "danger";
	}
	return status;
}

export function getClosestFood() {
	// TODO
}
