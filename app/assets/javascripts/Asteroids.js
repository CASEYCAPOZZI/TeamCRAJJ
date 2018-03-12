/*globals Phaser */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});


var state = 0;
var stateJustSwitched = true;

var spaceShip;
var lives;
var gameOverText;
var asteroids = [];
var powerups = [];
var bullets = [];
var bullet;
var bulletTime = 0;
var titleLabel;
var startLabel;
var score = 0;
var gameGoing = true;
var bulletsLeft = 40;

var collidedPowerup;
var bulletFireAmount = 1;
var bulletLifespan = 2000;
var bulletSpeed = 400;
var shipSpeed = 300;

/*
 * Difficulty Levels are
 * 0 = Easy
 * 1 = Medium
 * 2 = Hard
 * 3 = Very Hard
 * 4 = Insane
 */
var difficulty = 0; 

var spawnRateForAsteroids = [990, 980, 960, 900, 700]; 
/*
 * Asteroid spawn rate averages:
 * 
 * Easy: 1% chance per frame (AKA average of 0.6 per second or 36 per minute)
 * Medium: 2% chance per frame (AKA average of 1.2 per second or 72 per minute)
 * Hard: 4% chance per frame (AKA average of 2.4 per second or 144 per minute)
 * Very Hard: 10% chance per frame (AKA average of 6 per second or 360 per minute)
 * Insane: 30% chance per frame (AKA average of 18 per second or 1080 per minute)
 */


var spawnRateForPowerups = [950, 970, 990, 995, 999];
/*
 * Powerup spawn rate averages:
 * 
 * Easy: 5% chance per frame (AKA average of 3 per second or 180 per minute)
 * Medium: 3% chance per frame (AKA average of 1.8 per second or 108 per minute)
 * Hard: 1% chance per frame (AKA average of 0.6 per second or 36 per minute)
 * Very Hard: 0.5% chance per frame (AKA average of 0.3 per second or 18 per minute)
 * Insane: 0.1% chance per frame (AKA average of 0.06 per second or 3.6 per minute)
 */


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
    if(state === 1){
        initGraphics();
        initPhysics();
        initPlayerLives();
    }

    initKeyboard();
    gameOverText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '60px Arial', fill: '#9999ff' });
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.visible = false;
}

function initPlayerLives() {
    // Add lives
    lives = game.add.group();
    game.add.text(game.world.width - 115, 10, 'Lives : ', { font: '34px Arial', fill: '#990000' });
    
    for (var i = 0; i < 3; i++) {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'spaceShip');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 0;
    }
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
    if(state === 0){
        //remove stuff
        titleLabel.destroy();
        startLabel.destroy();
        stateJustSwitched = true;
        state = 1;
    } else {
        if(!game.physics.arcade.isPaused){
          if(bulletsLeft > 0){
            updateBullets(-1);
            if (game.time.now > bulletTime) {
                
                bullet = bullets.getFirstExists(false);
                
                
                if (bullet) {
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation - (Math.PI / 2.0);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI / 2.0), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
                bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 1 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation - (Math.PI / 4.0);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI / 4.0), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
                bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 2 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation - (Math.PI * 0.75);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI * 0.75), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
               bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 3 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation;
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation, bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
                bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 4 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation - Math.PI;
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - Math.PI, bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
               bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 5 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation + (Math.PI / 4);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation + (Math.PI / 4), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
                bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 6 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation - (Math.PI * 1.25);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI * 1.25), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
                
                bullet = bullets.getFirstExists(false);
                
                if(bulletFireAmount > 7 && bullet){
                    bullet.reset(spaceShip.x, spaceShip.y);
                    bullet.lifespan = bulletLifespan;
                    bullet.rotation = spaceShip.rotation + (Math.PI * 0.5);
                    game.physics.arcade.velocityFromRotation(spaceShip.rotation - (Math.PI * 0.5), bulletSpeed, bullet.body.velocity);
                    bulletTime = game.time.now + 100;
                }
            }
          }
        }
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
    this.sprite.lifespan = 6000;
    this.sprite.scale.setTo(2.0, 2.0);
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
    if(state === 0){
        //Menu State
        if(stateJustSwitched){
            stateJustSwitched = false;
            titleLabel = game.add.text(220, 80, "Asteroid Shooter", {font: "50px Arial", fill: "#fff"});
            startLabel = game.add.text(250, 300, "Press the space bar to start!", {font: "25px Arial", fill: "#fff"});
        }
    } else if(state === 1 && gameGoing){
        //Game State
        
        if(stateJustSwitched){
            stateJustSwitched = false;
            create();
        }
        
        
         game.world.wrap(spaceShip, 0);
    
        powerups.forEach(function(item){
            game.world.wrap(item.sprite, 0);
        });
    
        bullets.forEach(function(item) {
            game.world.wrap(item, 0);
        });
        
         checkPlayerInput();
        
          if(!game.physics.arcade.isPaused){



              if(getNumberFrom1to1000() > spawnRateForAsteroids[difficulty]){
                  spawnAsteroid();
              }

              if(getNumberFrom1to1000() > spawnRateForPowerups[difficulty]){
                  spawnPowerup();
              }   
              
              movePowerups();
              moveAsteroids();
              checkCollisions();
          }

        
        }
}

function getNumberFrom1to1000() {
    return Math.floor((Math.random() * 999) + 1);
}

function checkPlayerInput() {
        //Pressing UpArrow or W
    if(state === 1){

      if (this.cursors.up.isDown || this.wasd.up.isDown) {
          game.physics.arcade.accelerationFromRotation(spaceShip.rotation - (Math.PI / 2.0), shipSpeed, spaceShip.body.acceleration);
      } else {
          spaceShip.body.acceleration.set(0);
      }

      //Pressing LeftArrow or A
      if (this.cursors.left.isDown || this.wasd.left.isDown) {
          spaceShip.body.angularVelocity = -300;

      } else {
          if (this.cursors.up.isDown || this.wasd.up.isDown) {
              game.physics.arcade.accelerationFromRotation(spaceShip.rotation - (Math.PI / 2.0), shipSpeed, spaceShip.body.acceleration);
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
    }
}

function checkCollisions(){
    checkPlayerColls();
    checkBulletColls();
}

//A function that checks to see if a bullet collides with an asteroid.
function checkBulletColls() {
    if(bullets.countLiving() > 0){
        bullets.forEach(function(item) {
            console.log(bullets.countLiving());
            if(checkBulletCollideAsteroid(item)){
                //Bullet collided with an asteroid
                bullets.remove(item);
                updateScore();
            }
            if(item.lifetime <= 0){
                bullets.remove(item);
            }
        });
    }

}

function checkBulletCollideAsteroid(bullet){
        for(var i = 0; i < this.asteroids.length; i++){
        if(doesBulletCollideWithAsteroid(bullet, this.asteroids[i])){
            //Bullet collided with asteroid at [i]
            //Add to score
            asteroids.splice(i, 1);
            return true;
        }
    }    
    return false;
}


//A function that checks to see if the player collides with asteroids or powerups.
function checkPlayerColls(){
    if(checkPlayerCollideAsteroid()){
        //Player collided with an asteroid
        
        var live = lives.getFirstAlive();
        
        if (live) {
            live.kill();
            spaceShip.reset(400, 300);
        }
        
        if (lives.countLiving() < 1) {
            spaceShip.kill();
            gameGoing = false;
            resetPowerupsAndAsteroids();
            gameOverText.text="   Game Over! \n Click to restart";
            gameOverText.visible = true;
            
            //the "click to restart" handler
            game.input.onTap.addOnce(restartGame,this);
        }
    }
    
    if(checkPlayerCollidePowerup()){
        if(this.collidedPowerup !== null){
            var power = this.collidedPowerup.name;
            if(power === "ammoPower"){
                updateBullets(20);
            } else if(power === "bulletPower"){
                bulletFireAmount += 1;
            } else if(power === "bulletSpeedPower"){
                bulletSpeed += 100;
            } else if(power === "healthPower"){
                lives.callAll('revive');
            } else if(power === "shipSpeedPower"){
                shipSpeed += 500;
            }


        }
    }
}

function resetPowerupsAndAsteroids(){
    bulletFireAmount = 1;
    bulletLifespan = 2000;
    bulletSpeed = 400;
    shipSpeed = 300;
    asteroids = [];
    powerups = [];
}

function restartGame () {   
    lives.callAll('revive');
    spaceShip.revive();
    gameOverText.visible = false;
    gameGoing = true;
    newGameInfo(); 
}

function checkPlayerCollideAsteroid(){
    for(var i = 0; i < this.asteroids.length; i++){
        if(doesPlayerCollideWithAsteroid(this.asteroids[i])){
            asteroids.splice(i, 1);
            return true;
        }
    }    
    return false;
}

function doesPlayerCollideWithPowerup(powerup) {
    var powerPoints = [new Point(powerup.x, powerup.y), new Point(powerup.x + powerup.width, powerup.y), new Point(powerup.x + powerup.width, powerup.y + powerup.height), new Point(powerup.x, powerup.y + powerup.height)];
    var playerPoints = [new Point(this.spaceShip.x, this.spaceShip.y), new Point(this.spaceShip.x + this.spaceShip.width, this.spaceShip.y), new Point(this.spaceShip.x + this.spaceShip.width, this.spaceShip.y + this.spaceShip.height), new Point(this.spaceShip.x, this.spaceShip.y + this.spaceShip.height)];
    return polygonIntersectsPolygon(powerPoints, playerPoints);
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
    for(var i = 0; i < this.powerups.length; i++){
        if(doesPlayerCollideWithPowerup(this.powerups[i].sprite)){
            collidedPowerup = powerups[i];
            powerups.splice(i, 1);
            return true;
        }
    }    
    return false;
}

//DO we neeed this function?
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
    //This function updates the score by 10 everytime there is a collision between a bullet
    // and an asteroid.
    score += 10;
    var stringScore = score.toString();
    $('#gameScore').html("Your Score: " + stringScore);
}

function updateBullets(numToUpdate){
    //This shows how many bullets you have left on the HTML side of things.
    bulletsLeft += numToUpdate;// removes one bullet everytime this function is called.
    
    if(bulletsLeft > -1){
        var stringBulletsLeft = bulletsLeft.toString();
        $('#bulletsLeft').html('You Have: ' + stringBulletsLeft + ' left.' );
    }
    
  
}

function newGameInfo(){
    //Updates the HTML side of the game info so it "resets" when the reset is pressed at the end of the game.
    score = 0;
    $('#gameScore').html("Your Score: " + score);

}
