/*globals Phaser */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

var spaceShip;
var asteroids = [];
var bullets = [];
var powerups = [];
var bullet;
var bulletTime = 0;
var score = 0;
var lives = 3; 





function preload() {
    //Load sprites and images
    var spaceShipImagePath = "/assets/player-2b769c18603d84592d2fb06ba6ae8ed0ddee574356e5a152717f541234278fde.png";
    game.load.image("spaceShip", spaceShipImagePath);
    
    var bulletImagePath = "assets/bullet.png";
    game.load.image("bullet", bulletImagePath);

    var apowerupPath = "assets/powerups/ammoPowerup.png";
    game.load.image("ammoPower", apowerupPath);
    var bulletPowerupPath = "assets/powerups/bulletPowerup.png";
    game.load.image("bulletPower", bulletPowerupPath);
    var bulletSpeedPath = "assets/powerups/bulletSpeed.png";
    game.load.image("bulletSpeedPower", bulletSpeedPath);
    var healthPowerupPath = "assets/powerups/healthPowerup.png";
    game.load.image("healthPower", healthPowerupPath);
    var speedPowerupPath = "assets/powerups/speedUp.png";
    game.load.image("shipSpeedPower", speedPowerupPath);
   
}

//This function creates an Asteroid object. To create one you must specify a few things:
//
//xLoc and yLoc: the center point of the asteroid.
//minDistance: the smallest number of pixels you want an edge of the asteroid to get to the center point
//maxDistance: the largest number of pixels you want an edge of the asteroid to get from the center point
//numSides: the number of sides you want the asteroid to have. MUST be a minimum of 3
function Asteroid(xLoc, yLoc, minDistance, maxDistance, numSides, velocity, playerLocationX, playerLocationY) {
    
    var vectorX = playerLocationX - xLoc;
    
    this.xVecSign = 1;
    if(vectorX < 0){
        this.xVecSign = -1;   
    }
    
    var vectorY = playerLocationY - yLoc;
    
    this.yVecSign = 1;
    if(vectorY < 0){
        this.yVecSign = -1;
    }
    this.vector = vectorY / vectorX;
    
    if(this.vector < 0){
        this.vector *= -1;
    }
    
    this.velocity = velocity;
    this.velocityX = (this.velocity * Math.cos(this.vector) * this.xVecSign)/2.5;
    this.velocityY = (this.velocity * Math.sin(this.vector) * this.yVecSign)/2.5;
    
    //Creates some properties of the Asteroid Object
    //
    //The Center point, obviously.
    this.centerPoint = new Point(xLoc, yLoc);
    
    //An array that stores all of the verticies of the asteroid (end points of line segments)
    this.points = [];
    
    //min and max distance.
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
    
    //An array that stores the Phaser "line" objects inside it for drawing and logic purposes.
    this.lines = [];
    
    //Determine what the angle between each point (relative to the center point) must be based on the number of sides.
    var anglePerPoint = (2 * Math.PI) / numSides;
    
    //Some clever math to create randomized points that are within the constraints we gave. 
    for(var i = 0; i < numSides; i++){
        //The starting angle for the point is determined by which point it is.
        var currentAngle = i * anglePerPoint;
        //Create a random vector (a point in space with a length) using our min/max distances.
        var randomVector = Math.floor(Math.random() * (maxDistance - minDistance)) + minDistance; 
        
        //Extract the vector we created into x and y shifts using a little trig.
        var xLocation = this.centerPoint.x + (randomVector * Math.cos(currentAngle));
        var yLocation = this.centerPoint.y + (randomVector * Math.sin(currentAngle));
        
        //Add a new point to the points array using the locations we just generated.
        this.points[i] = new Point(xLocation, yLocation);
    }
    
    
    //Use the points to create line segments to fill up the line array.
    for(i = 0; i < this.points.length; i++){
        //Because the every point must be used twice (once as the beginning of a line segment, and once as the end)
        //We have to make sure we don't an array out of bounds error when looping around to use the first point twice.
        if(i < this.points.length - 1){
            //Create a line with the given points.
            this.lines[i] = new Phaser.Line(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
        } else {
            //Create a line with the given points.
            this.lines[i] = new Phaser.Line(this.points[i].x, this.points[i].y, this.points[0].x, this.points[0].y);
        }
    }
    
}

function moveAsteroids(){
    for(var i = 0; i < asteroids.length; i++){
        moveAsteroid(i, asteroids[i].velocityX * game.time.physicsElapsed, asteroids[i].velocityY * game.time.physicsElapsed);
        if(asteroids[i].centerPoint.x > game.width){
            moveAsteroid(i, -game.width, 0);
        }
        if(asteroids[i].centerPoint.x < 0){
            moveAsteroid(i, game.width, 0);
        }
        if(asteroids[i].centerPoint.y > game.height){
            moveAsteroid(i, 0, -game.height);
        }
        if(asteroids[i].centerPoint.y < 0){
            moveAsteroid(i, 0, game.height);
        }
    }
}

function movePowerups(){
    for(var i = 0; i < powerups.length; i++){
        game.physics.arcade.accelerationFromRotation(powerups[i].sprite.rotation, 75, powerups[i].sprite.body.acceleration);
    }
}

function moveAsteroid(asteroidIndex, xMove, yMove){
    asteroids[asteroidIndex].centerPoint.x += xMove;
    asteroids[asteroidIndex].centerPoint.y += yMove;
    
    for(var i = 0; i < asteroids[asteroidIndex].points.length; i++){
        asteroids[asteroidIndex].points[i].x += xMove;
        asteroids[asteroidIndex].points[i].y += yMove;
    }
    
    for(i = 0; i < asteroids[asteroidIndex].points.length; i++){
        if(i < asteroids[asteroidIndex].points.length - 1){
            asteroids[asteroidIndex].lines[i] = new Phaser.Line(asteroids[asteroidIndex].points[i].x, asteroids[asteroidIndex].points[i].y, asteroids[asteroidIndex].points[i+1].x, asteroids[asteroidIndex].points[i+1].y);
        } else {
            asteroids[asteroidIndex].lines[i] = new Phaser.Line(asteroids[asteroidIndex].points[i].x, asteroids[asteroidIndex].points[i].y, asteroids[asteroidIndex].points[0].x, asteroids[asteroidIndex].points[0].y);
        }
    }
}

function initPhysics() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(40, 'bullet'); // original   bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    
    
    //  Enable Arcade Physics for the sprite
    game.physics.enable(spaceShip, Phaser.Physics.ARCADE);
    
    //Makes it so the sprint doesn't go really fast and slows down
    spaceShip.body.drag.set(70);
    spaceShip.body.maxVelocity.set(200);
}

function initKeyboard() {
    //Creates a property that allows for arrowKey movement.
    this.cursors = game.input.keyboard.createCursorKeys();
    
    //Creates a property to allow for WASD movement along with arrow keys.
    this.wasd = {
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    };
    
    //Creates a property that watches the space bar.
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //Creates a property that watches the escape key.
    this.escapeKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    
    //Sets the "togglePause" method to be called when the escape key is pressed.
    this.escapeKey.onDown.add(togglePause, this);
    
    //Set the "fireBullet" method to be called when the space bar is pressed.
    this.spaceKey.onDown.add(fireBullet, this); 
}

function initGraphics() {
    //Adds the sprite(spaceShip)
    spaceShip = game.add.sprite(400, 300, 'spaceShip');
    spaceShip.anchor.setTo(0.5, 0.5);
    spaceShip.name = 'spaceShip';
}

function create(){
    
    initGraphics();
    initPhysics();
    initKeyboard();
    
}


//An object that allows us to store points in one variable.
function Point(x, y){
    this.x = x;
    this.y = y;
}

function togglePause() {
    game.physics.arcade.isPaused = !game.physics.arcade.isPaused;
   
}

function fireBullet() {
    
    if (game.time.now > bulletTime) {
        
        bullet = bullets.getFirstExists(false);
        
        if (bullet) {
            bullet.reset(spaceShip.x, spaceShip.y);
            bullet.lifespan = 2000;
            bullet.rotation = spaceShip.rotation - (Math.PI / 2.0);
            game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI / 2.0), 400, bullet.body.velocity);
            bulletTime = game.time.now + 100;
            
            console.log(bullet.lifespan);
 
        }
    }
     updateBullets();
      console.log(bullet.lifespan + "2");
      if(bullet.lifespan == 0){
           bullets.remove();

      }

     
}

function spawnPowerup(){
    var index = powerups.length;
    powerups[index] = new powerUp(Math.floor(Math.random() * 5));
}

function powerUp(type){
    this.locX = 0;
    this.locY = 0;
    this.name = "ammoPower";
    this.type = type;
    
    switch (this.type) {
        case 0:
            this.name = "ammoPower";
            break;
        case 1:
            this.name = "bulletPower";
            break;
        case 2:
            this.name = "bulletSpeedPower";
            break;
        case 3:
            this.name = "healthPower";
            break;
        case 4:
            this.name = "shipSpeedPower";
            break;
    }
    
    
    var side = Math.floor(Math.random() * 4);
    if(side === 0){ //Left
        this.locX = 0;
        this.locY = Math.floor(Math.random() * game.height);
    } else if (side === 1){ //Top
        this.locY = 0;
        this.locX = Math.floor(Math.random() * game.width);
    } else if (side === 2) { //Right
        this.locX = game.width;
        this.locY = Math.floor(Math.random() * game.height);
    } else { //Bottom
        this.locY = game.height;
        this.locX = Math.floor(Math.random() * game.width);
    }
    
    this.sprite = game.add.sprite(this.locX, this.locY, this.name);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.rotation = Math.random() * (Math.PI * 2);
    this.sprite.name = this.name;
    this.sprite.lifespan = 3000;
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.drag.set(70);
    this.sprite.body.maxVelocity.set(500);
}

function spawnAsteroid(){
    var side = Math.floor(Math.random() * 4);
    var index = asteroids.length;
    var xLoc = 0;
    var yLoc = 0;
    if(side === 0){ //Left
        xLoc = 0;
        yLoc = Math.floor(Math.random() * game.height);
    } else if (side === 1){ //Top
        yLoc = 0;
        xLoc = Math.floor(Math.random() * game.width);
    } else if (side === 2) { //Right
        xLoc = game.width;
        yLoc = Math.floor(Math.random() * game.height);
    } else { //Bottom
        yLoc = game.height;
        xLoc = Math.floor(Math.random() * game.width);
    }
    
    asteroids[index] = new Asteroid(xLoc, yLoc, 10, 50, 12, Math.floor(Math.random() * (500 - 100)) + 100, spaceShip.x, spaceShip.y);
}

function update(){
    game.world.wrap(spaceShip, 0);
    
    bullets.forEach(function(item) {
        game.world.wrap(item, 0);
    });
    
    powerups.forEach(function(item){
        game.world.wrap(item.sprite, 0);
    });
    
    checkPlayerInput();
    
    var rollPerc = Math.floor((Math.random() * 999) + 1);
    
    if(rollPerc > 990){
        spawnAsteroid();
    }
    
//HEAD
   
        moveAsteroids();
       

    if(rollPerc > 600 && rollPerc < 620){
        spawnPowerup();
    }
    movePowerups();
    moveAsteroids();
    checkCollisions();

    

   
}

function checkPlayerInput() {
        //Pressing UpArrow or W
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
        game.physics.arcade.accelerationFromRotation(spaceShip.rotation - (Math.PI / 2.0), 300, spaceShip.body.acceleration);
    } else {
        spaceShip.body.acceleration.set(0);
    }

    //Pressing LeftArrow or A
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
        spaceShip.body.angularVelocity = -300;
        
    //Pressing RightArrow or D
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        spaceShip.body.angularVelocity = 300;
    } else {
        spaceShip.body.angularVelocity = 0;
    }

    game.world.wrap(spaceShip, 16);
    game.world.wrap(bullets, 16); // Trying to get the bullets to wrap around..
}

function checkCollisions(){
    checkPlayerColls();
    checkBulletColls();
}

//A function that checks to see if a bullet collides with an asteroid.
function checkBulletColls() {
    bullets.forEach(function(item) {
        if(checkBulletCollideAsteroid(item)){
            //Bullet collided with an asteroid
            bullets.remove(item);
        }
        
    });
}

function checkBulletCollideAsteroid(bullet){
        for(var i = 0; i < this.asteroids.length; i++){
        if(doesBulletCollideWithAsteroid(bullet, this.asteroids[i])){
            //Bullet collided with asteroid at [i]
            //Add to score
            asteroids.splice(i, 1);
            updateScore();
            return true;
        }
    }    
    return false;
}


//A function that checks to see if the player collides with asteroids or powerups.
function checkPlayerColls(){
    if(checkPlayerCollideAsteroid()){
        //Player collided with an asteroid
        updateLife();

    }
    
    if(checkPlayerCollidePowerup()){
        //Player collided with powerup
        //starfruit
    }
}

function checkPlayerCollideAsteroid(){
    for(var i = 0; i < this.asteroids.length; i++){
        if(doesPlayerCollideWithAsteroid(this.asteroids[i])){
            //Player collided with asteroid at [i]
            //console.log(i);
            asteroids.splice(i, 1);
            return true;
        }
    }    
    return false;
}

function doesBulletCollideWithAsteroid(bull, aster){
    var bullPts = [new Point(bull.x, bull.y), new Point(bull.x + bull.width, bull.y), new Point(bull.x + bull.width, bull.y + bull.height), new Point(bull.x, bull.y + bull.height)];
    return polygonIntersectsPolygon(aster.points, bullPts);
}

function doesPlayerCollideWithAsteroid(aster){
    var playerPoints = [new Point(this.spaceShip.x, this.spaceShip.y), new Point(this.spaceShip.x + this.spaceShip.width, this.spaceShip.y), new Point(this.spaceShip.x + this.spaceShip.width, this.spaceShip.y + this.spaceShip.height), new Point(this.spaceShip.x, this.spaceShip.y + this.spaceShip.height)];
    return polygonIntersectsPolygon(aster.points, playerPoints);
}

function polygonIntersectsPolygon(poly1, poly2) {
    for(var i = 0; i < poly1.length; i++){
        if(polyContainsPoint(poly1[i], poly2)){
            return true;
        }
    }
    return false;
}

function polyContainsPoint(point, poly){
    var maxAndMinPoints = getMaxAndMinPolygon(poly);
    
    if (!polyContainsQuickCheck(point, maxAndMinPoints)) {
			return false;
	}
	
	var ray = getPolyRay(maxAndMinPoints[0].x, maxAndMinPoints[1].x, point.x, point.y);
	var polySides = getSidesOfPolygon(poly);
	
	return colDetectUsingRaycasting(ray, polySides);
}

function colDetectUsingRaycasting(ray, sides){
    var intersections = 0;
		for (var i = 0; i < sides.length; i++) {
			if (doLinesIntersect(ray, sides[i])) {
				intersections++;
			}
		}
		if ((intersections & 1) === 1) {
			return true; // Point is inside polygon
		}
		return false;	 // Point is outside polygon
}

function doLinesIntersect(ray, side){
    var det, gamma, lambda;
    det = (ray.point2.x - ray.point1.x) * (side.point2.y - side.point1.y) - (side.point2.x - side.point1.x) * (ray.point2.y - ray.point1.y);
    if (det === 0) {
        return false;
    }
    lambda = ((side.point2.y - side.point1.y) * (side.point2.x - ray.point1.x) + (side.point1.x - side.point2.x) * (side.point2.y - ray.point1.y)) / det;
    gamma = ((ray.point1.y - ray.point2.y) * (side.point2.x - ray.point1.x) + (ray.point2.x - ray.point1.x) * (side.point2.y - ray.point1.y)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}

function getSidesOfPolygon(poly){
	var sides = [];
	
	for (var i = 0; i < poly.length; i++) {
		if (i !== poly.length - 1) {
			sides[i] = new CollLine(new Point(poly[i].x, poly[i].y), new Point(poly[i + 1].x, poly[i + 1].y));
		} else {
			sides[i] = new CollLine(new Point(poly[i].x, poly[i].y), new Point(poly[0].x, poly[0].y));
		}
	}
	
	return sides;
}

function getPolyRay(maxX, minX, pointX, pointY){
    var epsilon = (maxX - minX) / 100;
	return new CollLine(new Point(minX - epsilon, pointY), new Point(pointX, pointY));
}

function CollLine(point1, point2){
    this.point1 = point1;
    this.point2 = point2;
}

function polyContainsQuickCheck(point, maxAndMins){
    if (point.x > maxAndMins[0].x || point.x < maxAndMins[1].x || point.y > maxAndMins[0].y || point.y < maxAndMins[1].y) {
		return false;
	}
	return true;
}

function getMaxAndMinPolygon(poly){
    
    var maxAndMins = [];
    
	maxAndMins[0] = poly[0].x; // maxX
	maxAndMins[1] = poly[0].x; // minX
	maxAndMins[2] = poly[0].y; // maxY
	maxAndMins[3] = poly[0].y; // minY
	
	var iterator = 0;
	
	for (var i = 1; i < poly.length; i++) {
		iterator = poly[i].x;
		if (maxAndMins[0] < iterator) {
			maxAndMins[0] = iterator;
		}
		
		if (maxAndMins[1] > iterator) {
			maxAndMins[1] = iterator;
		}
	}
	for (i = 1; i < poly.length; i++) {
		iterator = poly[i].y;
		if (maxAndMins[2] < iterator) {
			maxAndMins[2] = iterator;
		}
		if (maxAndMins[3] > iterator) {
			maxAndMins[3] = iterator;
		}
	}
	
	
	//Max X and Y are stored in point [0], Min X and Y are stored in point [1]
	return [new Point(maxAndMins[0], maxAndMins[2]), new Point(maxAndMins[1], maxAndMins[3])];
}


function checkPlayerCollidePowerup(){
    // starfruit
    return false;
}

function render() {
    //Painting the example asteroid.
    paintAsteroids();
}

//A function that takes in an Asteroid object and paints all of the lines within it.
function paintAsteroids(){
    for(var j = 0; j < asteroids.length; j++){
        for(var i = 0; i < asteroids[j].lines.length; i++){
            game.debug.geom(asteroids[j].lines[i], 'rgba(255,255,255,1)');
        }
    }
}

function updateScore(){
    score += 10;
    var stringScore = score.toString();
    $('#gameScore').html("Your Score: " + stringScore);
}

function updateLife(){
    lives -= 1;
    var stringLives = lives.toString();
    if(lives === 0){
        // to end the game because you ran out of lives call method or add that code here.
    }
    $('#gameLives').html("You have " + stringLives + " lives." );
}

function updateBullets(){
bulletsLeft = bullets.length;
var stringBullets = bulletsLeft.toString();
 $('#bulletsLeft').html("You have " + stringBullets + " left." );

}

function bulletDeath(){

bullets.forEach(function(item) {
        if(bullets.lifespan(item) == 0){
            //Bullet collided with an asteroid
            bullets.remove(item);
        }
        
    });


}

