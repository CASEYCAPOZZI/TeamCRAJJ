var menuState = {
  
    create: function() {
        var titleLabel = game.add.text(220, 80, "Asteroid Shooter", {font: "50px Arial", fill: "#fff"});
        
        var startLabel = game.add.text(250, 300, "Press the space bar to start!", {font: "25px Arial", fill: "#fff"});
        
        var spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        spaceBar.onDown.addOnce(this.startTheGame, this);
    },
    
    startTheGame: function() {
       console.log("Space was hit");
    }
  
};