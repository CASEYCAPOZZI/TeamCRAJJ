/* global Phaser */

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

function preload() {
    //Load sprites and images
    this.load.image("player", "../images/player.png");
}

function create(){
    //Game varaibles set up
    this.Player();
}

function update(){
    //Updates 60 times a second
    
}

function render() {
    //For rendering
}


/// Objects


function Player() {
    this.player = game.add.sprite(this.world.centerX, this.world.centerY, "player");
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



