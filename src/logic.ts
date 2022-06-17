import { InfoResponse, GameState, MoveResponse, Game } from "./types"

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
	let possibleMoves: { [key: string]: boolean } = {
		up: true,
		down: true,
		left: true,
		right: true
	}

	// Step 0: Don't let your Battlesnake move back on it's own neck
	const myHead = gameState.you.head
	const myNeck = gameState.you.body[1]
	if (myNeck.x < myHead.x) {
		possibleMoves.left = false
	} else if (myNeck.x > myHead.x) {
		possibleMoves.right = false
	} else if (myNeck.y < myHead.y) {
		possibleMoves.down = false
	} else if (myNeck.y > myHead.y) {
		possibleMoves.up = false
	}

	// Use information in gameState to prevent your Battlesnake from moving beyond the boundaries of the board.
	const boardWidth = gameState.board.width
	const boardHeight = gameState.board.height
	if (myHead.x === 0) {
		possibleMoves.left = false
	}
	if (myHead.x === boardWidth - 1) {
		possibleMoves.right = false
	}
	if (myHead.y === 0) {
		possibleMoves.down = false
	}
	if (myHead.y === boardHeight - 1) {
		possibleMoves.up = false
	}

	// Use information in gameState to prevent your Battlesnake from colliding with itself and others
	const snakes = gameState.board.snakes.map(snake => snake.body);
	const hazards = snakes;
	if (gameState.board.hazards) {
		Array.prototype.push.apply(hazards, gameState.board.hazards); 
	}

	const upDanger = hazards.some(hazard => {
		return hazard.some(item => {
			return (item.x === myHead.x && item.y === myHead.y + 1)
		})
	})
	if (upDanger) {
		possibleMoves.up = false;
	}
	const downDanger = hazards.some(hazard => {
		return hazard.some(item => {
			return (item.x === myHead.x && item.y === myHead.y - 1)
		})
	})
	if (downDanger) {
		possibleMoves.down = false;
	}
	const leftDanger = hazards.some(hazard => {
		return hazard.some(item => {
			return (item.x === myHead.x - 1 && item.y === myHead.y)
		})
	})
	if (leftDanger) {
		possibleMoves.left = false;
	}
	const rightDanger = hazards.some(hazard => {
		return hazard.some(item => {
			return (item.x === myHead.x + 1 && item.y === myHead.y)
		})
	})
	if (rightDanger) {
		possibleMoves.right = false;
	}

	// Use information in gameState to prevent your Battlesnake from colliding with others.

	// TODO: Step 4 - Find food.
	const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
  const foodList = gameState.board.food;
	let closestFoodDistance = 999999999999;
	let closestFoodIndex = -1;

	// Finally, choose a move from the available safe moves.
	// TODO: Step 5 - Select a move to make based on strategy, rather than random.
	const response: MoveResponse = {
		move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
	}

	console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
	return response
}
