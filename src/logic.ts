import { InfoResponse, GameState, MoveResponse, Game, Coord } from "./types"

// Avoid Hazards, and snakes for now
const AVOID_LETTERS = ["H", "S"];

export function info(): InfoResponse {
	console.log("INFO")
	const response: InfoResponse = {
		apiversion: "1",
		author: "",
		color: "#326da8",
		head: "default",
		tail: "default"
	}
	return response
}

export function start(gameState: GameState): void {
	console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
	console.log(`${gameState.game.id} END\n`)
}

export function printBoard(board: string[][]): void {
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

export function isDeathLeft(board: string[][], myHead: Coord, ruleset: string): boolean {
	const boardWidth = board[0].length;
	const leftBad = AVOID_LETTERS.includes(board?.[myHead.x - 1]?.[myHead.y]);
	const wrappedLeftBad = ruleset === 'wrapped'
		&& myHead.x === 0
		&& AVOID_LETTERS.includes(board?.[boardWidth - 1]?.[myHead.y]);
	const atLeftWall = myHead.x === 0 && ruleset !== 'wrapped';
	return leftBad || wrappedLeftBad || atLeftWall;
}

export function isDeathRight(board: string[][], myHead: Coord, ruleset: string): boolean {
	const boardWidth = board[0].length;
	const rightBad = AVOID_LETTERS.includes(board?.[myHead.x + 1]?.[myHead.y]);
	const wrappedRightBad = ruleset === 'wrapped'
		&& myHead.x === boardWidth - 1
		&& AVOID_LETTERS.includes(board?.[0]?.[myHead.y]);
	const atRightWall = myHead.x === boardWidth - 1 && ruleset !== 'wrapped';
	return rightBad || wrappedRightBad || atRightWall;
}

export function isDeathUp(board: string[][], myHead: Coord, ruleset: string): boolean {
	const boardHeight = board.length;
	const upBad = AVOID_LETTERS.includes(board?.[myHead.x]?.[myHead.y + 1]);
	const wrappedUpBad = ruleset === 'wrapped'
		&& myHead.y === boardHeight - 1
		&& AVOID_LETTERS.includes(board?.[myHead.x]?.[0]);
	const atTopWall = myHead.y === boardHeight - 1 && ruleset !== 'wrapped';
	return upBad || wrappedUpBad || atTopWall;
}

export function isDeathDown(board: string[][], myHead: Coord, ruleset: string): boolean {
	const boardHeight = board.length;
	const downBad = AVOID_LETTERS.includes(board?.[myHead.x]?.[myHead.y - 1]);
	const wrappedDownBad = ruleset === 'wrapped'
		&& myHead.y === 0
		&& AVOID_LETTERS.includes(board?.[myHead.x]?.[boardHeight - 1]);
	const atBottomWall = myHead.y === 0 && ruleset !== 'wrapped';
	return downBad || wrappedDownBad || atBottomWall;
}

export function populateBoard(gameState: GameState, board: string[][]): string[][] {
	let boardCopy = board;
	// Add snakes
	gameState.board.snakes.forEach(snake => {
		snake.body.forEach(bodyPiece => {
			boardCopy[bodyPiece.x][bodyPiece.y] = 'S';
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



export function move(gameState: GameState): MoveResponse {
	let gameBoard: string[][] = initializeBoard(gameState);
	let possibleMoves: { [key: string]: number } = {
		up: 0,
		down: 0,
		left: 0,
		right: 0
	}
	const boardWidth = gameState.board.width;
	const boardHeight = gameState.board.height;
	const ruleset = gameState.game.ruleset.name;

	// Avoid self collisions
	const myHead = gameState.you.head
	// const myNeck = gameState.you.body[1]
	// printBoard(gameBoard);
	if (isDeathLeft(gameBoard, myHead, ruleset)) {
		possibleMoves.left = -99999999999999;
	}
	if (isDeathRight(gameBoard, myHead, ruleset)) {
		possibleMoves.right = -99999999999999;
	}
	if (isDeathUp(gameBoard, myHead, ruleset)) {
		possibleMoves.up = -99999999999999;
	}
	if (isDeathDown(gameBoard, myHead, ruleset)) {
		possibleMoves.down = -99999999999999;
	}

	// Find food
	let closestFoodDistance = 99999999999999;
	let xDistance = 0;
	let yDistance = 0;
	const foodList = gameState.board.food;
	foodList.forEach(food => {
		const foodDistance = Math.abs(food.x - myHead.x) + Math.abs(food.y - myHead.y);
		// find distance to food 
		if (foodDistance < closestFoodDistance) {
			closestFoodDistance = foodDistance;
			xDistance = food.x - myHead.x;
			yDistance = food.y - myHead.y;
		}
	});
	if (xDistance > 0) {
		possibleMoves.right += Math.abs(boardWidth - Math.abs(xDistance));
	} else if (xDistance < 0) {
		possibleMoves.left += Math.abs(boardWidth - Math.abs(xDistance));
	}
	if (yDistance > 0) {
		possibleMoves.up += Math.abs(boardHeight - Math.abs(yDistance));
	} else if (yDistance < 0) {
		possibleMoves.down += Math.abs(boardHeight - Math.abs(yDistance));
	}

	// Choose the move with the highest weight
	const bestMove = Object.keys(possibleMoves).reduce((a, b) => possibleMoves[a] > possibleMoves[b] ? a : b);
	const response: MoveResponse = {
		move: bestMove,
	}

	console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
	return response
}
