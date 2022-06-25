import { InfoResponse, GameState, MoveResponse } from "./types"
import { BoardTree } from "./BoardTree";

const DEBUG = false;
const HUNGRINESS = 30;

export function info(): InfoResponse {
	if (DEBUG) {
		console.log("INFO")
	}
	const response: InfoResponse = {
		apiversion: "1",
		author: "",
		color: "#8591ff",
		head: "silly",
		tail: "skinny"
	}
	return response
}

export function start(gameState: GameState): void {
	if (DEBUG) {
		console.log(`${gameState.game.id} START`)
	}
}

export function end(gameState: GameState): void {
	if (DEBUG) {
		console.log(`${gameState.game.id} END\n`)
	}
}



// ---------------------------------- Start of move ----------------------------------
// TODO: Tweak flood fill to take food into account
// TODO: Add DEBUG to env var and set on heroku
// TODO: Look into tree searching?

export function move(gameState: GameState): MoveResponse {
	if (DEBUG) {
		console.log('------------------------------------------------------')
	}
	const boardWidth = gameState.board.width;
	const boardHeight = gameState.board.height;
	const myHead = gameState.you.head;


	const rootBoard = new BoardTree(gameState, undefined, 0);
	rootBoard.floodFill();
	let leftSnake = rootBoard.addChild(rootBoard.gameState, "left", 1);
	let rightSnake = rootBoard.addChild(rootBoard.gameState, "right", 1);
	let upSnake = rootBoard.addChild(rootBoard.gameState, "up", 1);
	let downSnake = rootBoard.addChild(rootBoard.gameState, "down", 1);
	if (DEBUG) {
		rootBoard.printBoard();
		console.log("left: ", leftSnake.status);
		console.log("right: ", rightSnake.status);
		console.log("up: ", upSnake.status);
		console.log("down: ", downSnake.status);
		console.log("left: ", leftSnake.openArea);
		console.log("right: ", rightSnake.openArea);
		console.log("up: ", upSnake.openArea);
		console.log("down: ", downSnake.openArea);
	}

	let possibleMoves: { [key: string]: number } = {
		up: upSnake.openArea,
		down: downSnake.openArea,
		left: leftSnake.openArea,
		right: rightSnake.openArea
	}

	// Avoid collisions
	if (leftSnake.status === 'dead') {
		possibleMoves.left = -99999999999999;
	}
	else if (leftSnake.status === 'danger') {
		possibleMoves.left = -100000;
	}
	if (rightSnake.status === 'dead') {
		possibleMoves.right = -99999999999999;
	}
	else if (rightSnake.status === 'danger') {
		possibleMoves.right = -100000;
	}
	if (upSnake.status === 'dead') {
		possibleMoves.up = -99999999999999;
	}
	else if (upSnake.status === 'danger') {
		possibleMoves.up = -100000;
	}
	if (downSnake.status === 'dead') {
		possibleMoves.down = -99999999999999;
	}
	else if (downSnake.status === 'danger') {
		possibleMoves.down = -100000;
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
	// food is either right or left, if it is same x value we don't want to prioritize these values
	if (xDistance > 0) {
		// if food is 1 away but we are in danger, go other way
		if (!(xDistance === 1 && yDistance === 0 && rightSnake.status === 'danger')) {
			if (gameState.you.health <= HUNGRINESS) {
				possibleMoves.right += Math.abs(boardWidth - Math.abs(xDistance));
			}
		}
	} else if (xDistance < 0) {
		if (!(xDistance === -1 && yDistance === 0 && leftSnake.status === 'danger')) {
			if (gameState.you.health <= HUNGRINESS) {
				possibleMoves.left += Math.abs(boardWidth - Math.abs(xDistance));
			}
		}
	}
	if (yDistance > 0) {
		if (!(yDistance === 1 && xDistance === 0 && upSnake.status === 'danger')) {
			if (gameState.you.health <= HUNGRINESS) {
				possibleMoves.up += Math.abs(boardHeight - Math.abs(yDistance));
			}
		}
	} else if (yDistance < 0) {
		if (!(yDistance === -1 && xDistance === 0 && downSnake.status === 'danger')) {
			if (gameState.you.health <= HUNGRINESS) {
				possibleMoves.down += Math.abs(boardHeight - Math.abs(yDistance));
			}
		}
	}

	// Choose the move with the highest weight
	const bestMove = Object.keys(possibleMoves).reduce((a, b) => possibleMoves[a] > possibleMoves[b] ? a : b);
	const response: MoveResponse = {
		move: bestMove,
	}
	if (DEBUG) {
		console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
	}
	return response
}
