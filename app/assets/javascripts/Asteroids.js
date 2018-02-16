/*globals Phaser */
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

function preload() {
    //Load sprites and images
    game.load.image("player", "/assets/images/player.png");
}

var cursors;

function create(){
    //Game variables set up
    var player = Player();
    
    // Center the canvas
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    // Enable arcade physics for system and player.
    game.physics.startSystem(Phaser.Physics.ARCADE);    
    game.physics.enable(player, Phaser.Physics.ARCADE)
    
    // Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
}

function update(){
    //Updates 60 times a second
}

function render() {
    //For rendering
}


/// Objects


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



