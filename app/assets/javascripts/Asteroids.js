/*globals Phaser */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

var spaceShip;

function preload() {
    //Load sprites and images
    var spaceShipImagePath = "/assets/player-2b769c18603d84592d2fb06ba6ae8ed0ddee574356e5a152717f541234278fde.png";
    game.load.image("spaceShip", spaceShipImagePath);
   

}
//This function creates an Asteroid object. To create one you must specify a few things:
//
//xLoc and yLoc: the center point of the asteroid.
//minDistance: the smallest number of pixels you want an edge of the asteroid to get to the center point
//maxDistance: the largest number of pixels you want an edge of the asteroid to get from the center point
//numSides: the number of sides you want the asteroid to have. MUST be a minimum of 3
function Asteroid(xLoc, yLoc, minDistance, maxDistance, numSides) {
    
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


function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);

    
    //Adds the sprint(spaceShip)
    spaceShip = game.add.sprite(400, 300, 'spaceShip');
    spaceShip.anchor.setTo(0.5, 0.5);
    spaceShip.name = 'spaceShip';

     //  Enable Arcade Physics for the sprite
    game.physics.enable(spaceShip, Phaser.Physics.ARCADE);

    //Makes it so the sprint doesn't go really fast and slows down
    
        console.log('body stuff');
        spaceShip.body.drag.set(70);
        spaceShip.body.maxVelocity.set(200);
   

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
    
    
    
    
    //This is just temporary. Once everyone undertands what it's doing, we'll
    //actually create an array of astroids and fill it as we go along.
    //In this example, though. I'm creating an asteroid centered at the point 300, 200.
    //It's got a minimum vertex height of 10px and a max vertex height of 100.
    //I also made it have 10 sides.
    //You can see the generator in action by refreshing the page a few times
    //after you load the game. On each refresh, the asteroid will be generated differently.
    this.asteroid = new Asteroid(300, 200, 10, 100, 10);
    
    

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
    
}

function update(){
    
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
  
}

function render() {
    //Painting the example asteroid.
    paintAsteroid(this.asteroid);
}

//A function that takes in an Asteroid object and paints all of the lines within it.
function paintAsteroid(asteroid){
    for(var i = 0; i < asteroid.lines.length; i++){
        game.debug.geom(asteroid.lines[i], 'rgba(255,255,255,1)');
    }
}

