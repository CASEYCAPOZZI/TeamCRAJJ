$(function() {
   var time = 0;
  
   var $bullets2 = $('#titleDiv > #bullet2');
   asteroidFun();
  $('.imageTitle').css({
    right: -700,
    top: 20,
    transform: 'rotate(-90deg)',
    opacity: 1
  }).animate({
    right: 250
  },5500, function() {
   
       var $bullets = $('#titleDiv > #bullet');
       $bullets.show();  // show in the for each function with a delay so the bullets are spread out when they appear.

   $bullets.each(function() {
      var $thisBullet = $(this);
      asteroidFun();
      
      setTimeout(function() { // code for spacing out bullets
      $thisBullet.css({ // shows a bullet 1 by 1
      opacity: 1
    }).animate({
      
      left: 200
    }).fadeOut({
      opacity: 0
    });//end of css property.
   
    }, time); // End of setTimeOut function.
      time += 200;
     // console.log(time)
      
   }); // End of the second function.\
   

  }).delay(800).animate({
    right: 250
  },function(){
    // Rotates the animate to go the other way.
    $('.imageTitle').css({
       transform: 'rotate(90deg)'
     });
     
    }).animate({
      // moves the animate to the right by 100
    right: 150
  },function() {
 ///// *********************** Don't delete more than this ^^^

var $bullets2 = $('#titleDiv > #bullet2');
       $bullets2.show();  // show in the for each function with a delay so the bullets are spread out when they appear.

   $bullets2.each(function() {
    var $thisBullet = $(this);
      
      setTimeout(function() { // code for spacing out bullets
      $thisBullet.css({ // shows a bullet 1 by 1
      opacity: 1
    }).animate({
      left: 800
    }).fadeOut({
      opacity: 0
    });//end of css property.
   
    }, time); // End of setTimeOut function.
      time += 200;
    
      
   }); // End of the second function.\

  }); // End of the 2nd main function


function asteroidFun(){
  console.log("my asteroid function.")
  $('.imageAsteroid').show();
  
   imageAst = $('#titleDiv > .imageAsteroid').css({
     opactity: 1
   });

   imageAst.animate({
      left: 200
   },6000);
   
}// end of asteroidFun


   
});// end of main function.
/*





*/