$(function() {
 
  $('.imageTitle').css({
    position: "relative",
    right: -700,
    top: 20,
    transform: "rotate(-90deg)",
    opacity: 1
  }).animate({
    right: 250
  },6000).animate({
    transform: "rotate(180deg)"
  });



});




/*

this is the image source file for the player image.
 <img src="/assets/player-2b769c18603d84592d2fb06ba6ae8ed0ddee574356e5a152717f541234278fde.png" class='titleImage' alt="Player">
  <h1 class='imageTitle'>Astroids</h1>

*/