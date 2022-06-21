import { InfoResponse, GameState, MoveResponse } from "./types"
import { BoardTree } from "./BoardTree";
import { initializeBoard } from "./boardHelpers";

const directions = ["left", "right", "up", "down"];


export function info(): InfoResponse {
	console.log("INFO")
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
	console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
	console.log(`${gameState.game.id} END\n`)
}



// ---------------------------------- Start of move ----------------------------------

// TODO: Sweep search for closest food? This works okay though
// TODO: Flood fill for avoiding dead ends
// TODO: Check if another snake head is in a square adjacent to the one I want to go to, if so eat/avoid it based on it's length

export function move(gameState: GameState): MoveResponse {
	console.log('------------------------------------------------------')
	const boardWidth = gameState.board.width;
	const boardHeight = gameState.board.height;
	const myHead = gameState.you.head;


	const rootBoard = new BoardTree(gameState, undefined, undefined, 0);
	// rootBoard.printBoard();
	// console.log(rootBoard.descendants);
	let leftSnake = rootBoard.addChild(rootBoard.gameState, "left", undefined, 1);
	let rightSnake = rootBoard.addChild(rootBoard.gameState, "right", undefined, 1);
	let upSnake = rootBoard.addChild(rootBoard.gameState, "up", undefined, 1);
	let downSnake = rootBoard.addChild(rootBoard.gameState, "down", undefined, 1);
	// leftSnake.checkDescendants();
	// console.log("left: ", leftSnake.status);
	// console.log("right: ", rightSnake.status);
	// console.log("up: ", upSnake.status);
	// console.log("down: ", downSnake.status);


	let possibleMoves: { [key: string]: number } = {
		up: 0,
		down: 0,
		left: 0,
		right: 0
	}

	// Avoid collisions
	if (leftSnake.status === 'dead') {
		possibleMoves.left = -99999999999999;
	}
	if (rightSnake.status === 'dead') {
		possibleMoves.right = -99999999999999;
	}
	if (upSnake.status === 'dead') {
		possibleMoves.up = -99999999999999;
	}
	if (downSnake.status === 'dead') {
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
	// food is either right or left, if it is same x value we don't want to prioritize these values
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
