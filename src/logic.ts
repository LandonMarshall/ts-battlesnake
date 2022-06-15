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

export function isImmediateDangerUp(gameState: GameState): boolean {
	const snakes = gameState.board.snakes;
	const myHead = gameState.you.head;
	return snakes.some(snake => {
		return snake.body.some(bodyPiece => {
			return (bodyPiece.x === myHead.x && bodyPiece.x + 1 === myHead.x)
		}),
	}),
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

	// TODO: Step 1 - Don't hit walls.
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

	// TODO: Step 2 - Don't hit yourself.
	// Use information in gameState to prevent your Battlesnake from colliding with itself.
	const mybody = gameState.you.body
	for (let i = 0; i < mybody.length; i++) {
		if ((mybody[i].x === (myHead.x - 1)) && (mybody[i].y === myHead.y)) {
			possibleMoves.left = false;
		};
		if ((mybody[i].x === (myHead.x + 1)) && (mybody[i].y === myHead.y)) {
			possibleMoves.right = false;
		}
		if ((mybody[i].y === (myHead.y - 1)) && (mybody[i].x === myHead.x)) {
			possibleMoves.down = false;
		}
		if (isImmediateDangerUp(gameState)) {
			possibleMoves.up = false;
		}
	}

	// TODO: Step 3 - Don't collide with others.
	// Use information in gameState to prevent your Battlesnake from colliding with others.

	// TODO: Step 4 - Find food.
	// Use information in gameState to seek out and find food.

	// Finally, choose a move from the available safe moves.
	// TODO: Step 5 - Select a move to make based on strategy, rather than random.
	const safeMoves = Object.keys(possibleMoves).filter(key => possibleMoves[key])
	const response: MoveResponse = {
		move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
	}

	console.log(`${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
	return response
}
