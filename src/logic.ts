import { InfoResponse, GameState, MoveResponse, Game, Coord } from "./types"

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

export function move(gameState: GameState): MoveResponse {
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
	const myNeck = gameState.you.body[1]

	if (myNeck.x < myHead.x || (ruleset === "wrapped" && myNeck.x === 0 && (myHead.x === boardWidth - 1))) {
		possibleMoves.left = -99999999999999;
	} else if (myNeck.x > myHead.x || (ruleset === "wrapped" && (myNeck.x === boardWidth - 1) && myHead.x === 0)) {
		possibleMoves.right = -99999999999999;
	} else if (myNeck.y < myHead.y || (ruleset === "wrapped" && myNeck.y === 0 && (myHead.y === boardHeight - 1))) {
		possibleMoves.down = -99999999999999;
	} else if (myNeck.y > myHead.y ||	(ruleset === "wrapped" && (myNeck.y === boardHeight - 1) && myHead.y === 0) ) {
		possibleMoves.up = -99999999999999;
	}


  // Avoid walls if game mode isn't wrapped
	if (ruleset !== "wrapped") {
		if (myHead.x === 0) {
			possibleMoves.left = -99999999999999;
		}
		if (myHead.x === boardWidth - 1) {
			possibleMoves.right = -99999999999999;
		}
		if (myHead.y === 0) {
			possibleMoves.down = -99999999999999;
		}
		if (myHead.y === boardHeight - 1) {
			possibleMoves.up = -99999999999999;
		}
	}

	// Use information in gameState to prevent your Battlesnake from colliding with itself and others
	const hazards: Coord[] = [];
	gameState.board.snakes.forEach(snake => {
		snake.body.forEach(bodyPiece => hazards.push(bodyPiece))
	});

	if (gameState.board.hazards) {
		Array.prototype.push.apply(hazards, gameState.board.hazards);
	}
	const upDanger = hazards.some(hazard => {
		return (hazard.x === myHead.x && hazard.y === myHead.y + 1)
	})
	if (upDanger) {
		possibleMoves.up = -99999999999999;;
	}
	const downDanger = hazards.some(hazard => {
		return (hazard.x === myHead.x && hazard.y === myHead.y - 1)
	})
	if (downDanger) {
		possibleMoves.down = -99999999999999;;
	}
	const leftDanger = hazards.some(hazard => {
		return (hazard.x === myHead.x - 1 && hazard.y === myHead.y)
	})
	if (leftDanger) {
		possibleMoves.left = -99999999999999;;
	}
	const rightDanger = hazards.some(hazard => {
		return (hazard.x === myHead.x + 1 && hazard.y === myHead.y)
	})
	if (rightDanger) {
		possibleMoves.right = -99999999999999;;
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
	} else {
		possibleMoves.left += Math.abs(boardWidth - Math.abs(xDistance));
	}
	if (yDistance > 0) {
		possibleMoves.up += Math.abs(boardHeight - Math.abs(yDistance));
	} else {
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
