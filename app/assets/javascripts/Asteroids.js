/*globals Phaser */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

function preload() {
    //Load sprites and images
    spaceShipImagePath = "/assets/player-2b769c18603d84592d2fb06ba6ae8ed0ddee574356e5a152717f541234278fde.png";
    game.load.image("spaceShip", spaceShipImagePath);
   

    var spaceShip;
}



function create(){
    //Game variables set up
/*    var player = Player();
   
 
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]); */

    cursors = game.input.keyboard.createCursorKeys();
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
   
    


   

    //Allows keyboard controls so you can move and pause the game( arrow keys and space bar.)
    cursors = game.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(togglePause, this);
}

function togglePause() {
    game.physics.arcade.isPaused = (game.physics.arcade.isPaused) ? false : true;
}

function update(){
    //Below is the logic for the keys to turn and what not.
    if (cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(spaceShip.rotation, 300, spaceShip.body.acceleration);
    }
    else
    {
        spaceShip.body.acceleration.set(0);
    }

    if (cursors.left.isDown)
    {
        spaceShip.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        spaceShip.body.angularVelocity = 300;
    }
    else
    {
        spaceShip.body.angularVelocity = 0;
    }

    game.world.wrap(spaceShip, 16);
  
}

function render() {
  
}


/// Objects

/*
function Player() {
    this.player = game.add.sprite(this.game.world.centerX, this.game.world.centerY, "player");
    this.player.anchor.set(0.5);
    this.player.scale.y = 1;
}

function Asteroid(xLocation, yLocation){
    this.asteroid = game.add.sprite(xLocation, yLocation, "asteroid");
    this.asteroid.anchor.set(0.5);
    this.asteroid.scale.y = 1;
}

function Bullet(xLocation, yLocation){
    this.asteroid = game.add.sprite(xLocation, yLocation, "bullet");
    this.asteroid.anchor.set(0.5);
    this.asteroid.scale.y = 1;
}

*/

