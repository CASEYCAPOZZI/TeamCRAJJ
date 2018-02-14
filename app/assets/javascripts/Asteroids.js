/* global Phaser */

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', {
    preload: preload, create: create, update: update, render: render
});

function preload() {
    //Load sprites and images
    
}

function create(){
    //Game varaibles set up
    
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



