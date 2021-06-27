const CANVAS_ID = "app-canvas";

var currX, currY;

var missileFired;
var missiles;

var targetsEasy;
var easyTargetHits;

var targetsHard;
var hardTargetHits;

var points;
var isGameOver;

var showingHelp;

function Run() {
	window.addEventListener("keydown", keyListener);
	initGame();
	window.requestAnimationFrame(gameLoop);
}

function keyListener (event) {
	switch (event.key) {
	case " ":
		missileFired = true;
		let startX = currX+10; // start from center of the spaceship
		let startY = currY+10;
		missiles.push([startX, startY]);
		return;
	case "ArrowLeft":
		currX = currX - 10;
		return;
	case "ArrowRight":
		currX = currX + 10;
		return;
	case "ArrowUp":
		currY = currY - 10;
		return;
	case "ArrowDown":
		currY = currY + 10;
		return
	case "r":
		initGame();
		return;
	case "h":
		showingHelp = true;
		return;
	case "Escape":
		showingHelp = false;
		return;
	default:
		return;
	}
}

function gameLoop() {
	let canvas = document.getElementById(CANVAS_ID);
	let ctx = canvas.getContext("2d");

	ctx.clearRect(0,0,canvas.width,canvas.height);

	// fill background
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0,canvas.width,canvas.height); // resolution of the game

	let pointString = `Points: ${points}`;
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.font = "18px Courier";
	ctx.fillText(pointString, 905, 30);

	showhelp: {
		if (!showingHelp) {
			break showhelp;
		}

		showHelp(ctx);
	}

	gameover: {
		if (!isGameOver) {
			break gameover;
		}

		showGameOver(ctx);
	}


	level1: {
		if (isGameOver) {
			break level1;
		}

		// check for space ship colliding with any targets
		let isSpaceShipColliding = false;
		for(let i = 0; i < targetsEasy.length; i++) {
			if (targetsEasy[i] === easyTargetHits) {
				continue;
			}

			let x1 = 150*(i+1);
			let x2 = x1 + 20;
			let isXMatching = x1 < currX && currX < x2;

			let y1 = 500;
			let y2 = 500+20;
			let isYMatching = y1 < currY && currY < y2;
			if (isXMatching && isYMatching) {
				isSpaceShipColliding = true;
				break;
			}
		}

		for(let i = 0; i < targetsHard.length; i++) {
			if (targetsHard[i] === hardTargetHits) {
				continue;
			}

			let x1 = 150*(i+1);
			let x2 = x1 + 20;
			let isXMatching = x1 < currX && currX < x2;

			let y1 = 700;
			let y2 = 700+20;
			let isYMatching = y1 < currY && currY < y2;
			if (isXMatching && isYMatching) {
				isSpaceShipColliding = true;
				break;
			}
		}

		if (!isSpaceShipColliding) { // render spaceship it has not collided
			ctx.beginPath();
			ctx.moveTo(currX, currY);
			ctx.lineTo(currX+20,currY+0);
			ctx.lineTo(currX+10,currY+20);
			ctx.lineTo(currX+0,currY+0);
			ctx.closePath();
			ctx.fillStyle = "rgb(255,255,255)";
			ctx.fill();
		} else {
			isGameOver = true;
		}

		// check missile and target collision
		let remainingMissiles = [];
		for (let i = 0; i < missiles.length; i++) {
			let missileX = missiles[i][0];
			let missileY = missiles[i][1];

			let isMissileOutOfView = missileY > canvas.height;  // has gone beyond the screen y-axis
			if (isMissileOutOfView) {
				continue; // we do not need this anymore
			}

			let hasMissileHitTarget = false;
			for (let j = 0; j < targetsEasy.length; j++) {
				if (targetsEasy[j] === easyTargetHits) {
					continue; // if target is not rendered then it should not hit it, no check necessary
				}

				let rx1 = 150*(j+1); // left x coord of rectangle
				let rx2 = rx1+20; // left x coord + width

				let isMissileInRange = rx1 < missileX && missileX < rx2; // missile is within x-axis bounds of target
				if (!isMissileInRange) {
					continue;
				}

				let hasMissileCollided = missileY > 500;  // has collided with a target
				if (!hasMissileCollided) {
					continue;
				}

				targetsEasy[j] = targetsEasy[j] + 1;
				hasMissileHitTarget = true;
				break;
			}

			for (let j = 0; j < targetsHard.length; j++) {
				if (targetsHard[j] === hardTargetHits) {
					continue; // if target is not going to be rendered then hit check not needed
				}

				let rx1 = 150*(j+1); // left x coord of rectangle
				let rx2 = rx1+20; // left x coord + width

				let isMissileInRange = rx1 < missileX && missileX < rx2; // missile is within x-axis bounds of target
				if (!isMissileInRange) {
					continue;
				}

				let hasMissileCollided = missileY > 700;  // has collided with a target
				if (!hasMissileCollided) {
					continue;
				}

				targetsHard[j] = targetsHard[j] + 1;
				hasMissileHitTarget = true;
				break;
			}

			if (hasMissileHitTarget) {
				points = points + 1;
				continue;
			}

			remainingMissiles.push([missileX, missileY+5]); // keep missile
		}

		// draw remaining missiles
		missiles = remainingMissiles;
		for (let i = 0; i < missiles.length; i++) {
			let missileX = missiles[i][0];
			let missileY = missiles[i][1];

			ctx.strokeStyle = "rgb(255,30,0)";
			let p = new Path2D();
			p.moveTo(missileX, missileY);
			p.lineTo(missileX, missileY+20);
			ctx.stroke(p);
		}

		// draw remaining targets
		for (let i = 0; i < targetsEasy.length; i++) {
			if (targetsEasy[i] === easyTargetHits) {
				continue;
			}

			ctx.fillStyle = "rgb(0, 0, 255)";
			let p = new Path2D();
			p.rect(150*(i+1), 500, 20, 20);
			ctx.fill(p);
		}

		for (let i = 0; i < targetsHard.length; i++) {
			if (targetsHard[i] === hardTargetHits) {
				continue;
			}

			ctx.fillStyle = "rgb(255, 0, 0)";
			let p = new Path2D();
			p.rect(150*(i+1), 700, 20, 20);
			ctx.fill(p);
		}
	}

	window.requestAnimationFrame(gameLoop);
}

function initGame() {
	currX = 502;
	currY = 10;

	missileFired = false;
	missiles = [];

	targetsEasy = [0,0,0,0,0];
	easyTargetHits = 1;

	targetsHard = [0,0,0,0,0];
	hardTargetHits = 2;

	points = 0;
	isGameOver = false;
}

function showHelp(ctx) {
	ctx.fillStyle = "rgb(0,0,255)";
	ctx.fillRect(400,230,250,200);
	ctx.strokeStyle = "rgb(255,255,255)";
	ctx.strokeRect(400, 230, 250, 200);

	ctx.fillStyle = "rgb(255,255,255)";
	ctx.font = "bold 18px Courier";
	ctx.fillText("Controls", 480, 250);

	ctx.font = "18px Courier";
	ctx.fillText("UP    : Up Arrow", 425, 290);
	ctx.fillText("DOWN  : Down Arrow", 425, 315);
	ctx.fillText("LEFT  : Left Arrow", 425, 340);
	ctx.fillText("RIGHT : Right Arrow", 425, 365);
	ctx.fillText("SHOOT : Spacebar", 425, 390);
}

function showGameOver(ctx) {
	// show game over screen and option to restart
	ctx.fillStyle = "rgb(255,0,0)";
	ctx.font = "bold 30px Courier";
	ctx.fillText("Game Over!", 450, 360);

	ctx.fillStyle = "rgb(0, 255, 0)";
	ctx.font = "18px Courier"
	ctx.fillText("(Press 'R' to restart)", 455, 380);
}

Run();
