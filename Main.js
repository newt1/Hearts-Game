$(document).ready(function () {

    var name = "Player";//prompt("Enter a player name:");
    if(!name){
        name = "Player";
    }
    var north = new SmartAI("North");
    var east = new SmartAI("East");
    var south = new Player(name);
    var west = new SmartAI("West");

    var match = new HeartsMatch(north, east, south, west);

    match.run();
    
   // var count;



   //$("#startButton").on('click', startButtonAction);
    
    
    //$(".player_card").on('click', event_handler);
});





























var startButtonAction = function() {
	alert("clicked");
}

var event_handler = function() {
	// Create a random color using "rgb()" notation
	
	var random_color_spec = "rgb(" + Math.floor(Math.random() * 256) +
	    ", " + Math.floor(Math.random() * 256) +
	    ", " + Math.floor(Math.random() * 256) + ")";
	
	// Set background color of element where event occurs to new random color
	
	$(this).css('background-color', random_color_spec);	
	
	count++;

	$("#bottom-card").html(count);
};