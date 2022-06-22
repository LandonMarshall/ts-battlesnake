import { Coord, GameState } from "./types";

/**
 * Gets a list of letters to avoid - hazards, snakes, and ids that represent enemy snake heads
 * @param gameState Game state to get list of letters to avoid
 * @returns List of letters to avoid
 */
export function getAvoidLetters(gameState: GameState): string[] {
	const hazards = ["H", "S"]; // hazard, snake, snake head
	gameState.board.snakes.forEach(snake => {
		if (snake.id !== gameState.you.id) {
			hazards.push(snake.id);
		}
	});
	return hazards;
}

/**
 * Initializes a board with all snakes including mine, all hazards and food 
 * @param gameState Game state to initialize board with
 * @param board Board to initialize
 * @returns Board with all snakes, hazards, and food
 */
function populateBoard(gameState: GameState, board: string[][]): string[][] {
	let boardCopy = board;
	const myLength = gameState.you.length;
	const myId = gameState.you.id;
	// Add snakes
	gameState.board.snakes.forEach(snake => {
		snake.body.forEach((bodyPiece, i) => {
			if (i === 0 && snake.id !== myId) { // snake head
				boardCopy[bodyPiece.x][bodyPiece.y] = snake.id;
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
	let headX = gameState.you.head.x;
	let headY = gameState.you.head.y;
	if (gameState.game.ruleset.name === 'wrapped') {
		const width = gameState.board.width;
		const height = gameState.board.height;
		headX = headX >= width ? 0 : headX;
		headY = headY >= height ? 0 : headY;
	}
	boardCopy[headX][headY] = 'O';

	// If I just ate food, my tail is not going to move so I should be scared of it
	if (!justAteFood(gameState.you.body)) {
		const myTail = gameState.you.body[myLength - 1];
		boardCopy[myTail.x][myTail.y] = 'T';
	}
	return board;
}

/**
 * Initializes a board with all snakes including mine, all hazards and food
 * @param gameState The game state to build the board from
 * @returns A 2D array of strings representing the board
 */
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

/**
 * Checks if the coordinates are within range of the board
 * @param board Board to check coordinates against
 * @param coord Coordinates to check
 * @returns True if coordinates are within range of board, false otherwise
 */
export function validCoordinates(board: string[][], coord: number[]): boolean {
	return coord[0] >= 0 && coord[0] < board.length && coord[1] >= 0 && coord[1] < board[0].length;
}

// If there is a duplicate in body, it means we just ate food on the last turn.
// this is important because our tail won't move if we just ate
/**
 * Checks if we just ate food
 * @param body Snake body to check
 * @returns True if we just ate food, false otherwise
 */
export function justAteFood(body: Coord[]): boolean {
	const removedDuplicates = [...body.reduce((map, { x, y }) => {
		return (map.set(`${x}-${y}`, { x, y }));
	}, new Map()).values()];
	if (removedDuplicates.length !== body.length) {
		return true;
	}
	return false;
}

/**
 * Checks if the move being made results in death
 * @param gameState Game state to check if death occurs
 * @param move Move to move snake [x,y]
 * @returns "danger" if another snake is close, "death" if move results in death, "alive" otherwise
 */
export function statusAfterMove(gameState: GameState, move: number[]): string {
	let status = "alive";
	const board: string[][] = initializeBoard(gameState);
	const avoidLetters = getAvoidLetters(gameState);
	const myHead = gameState.you.head;
	const ruleset = gameState.game.ruleset.name;
	const boardWidth = board.length;
	const boardHeight = board[0].length;
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
	const snakesToAvoid = avoidLetters.filter(letter => !["H", "S"].includes(letter));
	aroundNewHead.forEach(square => {
		if (!square) return;
		if (snakesToAvoid.includes(square)) {
			const snakeInQuestion = gameState.board.snakes.find(snake => snake.id === square);
			if (snakeInQuestion && snakeInQuestion.length >= gameState.you.length) {
				biggerSnakeIsClose = true;
			}
		}
	})

	const badMove = avoidLetters.includes(board?.[headAfterMove.x]?.[headAfterMove.y]);
	let wrappedBadMove = false;
	if (ruleset === 'wrapped') {
		if (move[0] === 1) { // right
			wrappedBadMove = myHead.x === boardWidth - 1 && avoidLetters.includes(board?.[0]?.[myHead.y]);
		}
		if (move[0] === -1) { // left
			wrappedBadMove = myHead.x === 0 && avoidLetters.includes(board?.[boardWidth - 1]?.[myHead.y]);
		}
		if (move[1] === 1) { // up
			wrappedBadMove = myHead.y === boardHeight - 1
				&& avoidLetters.includes(board?.[myHead.x]?.[0]);
		}
		if (move[1] === -1) { // down
			wrappedBadMove = myHead.y === 0
				&& avoidLetters.includes(board?.[myHead.x]?.[boardHeight - 1]);
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
