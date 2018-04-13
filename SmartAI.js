var SmartAI = function (name) {
	
		var match = null;
		var position = null;
		var current_game = null;
		var player_key = null;

		var thinkingTime = 750;

		var currentTrick=[];

		//passing strategies
	//simple
		//pass 3 highest cards

	//if have Ace, King, Q


	//ducking strategy
	//simple
	//get board cards
		//if matching suits
			//play highest possible card lower than 
		//if void suit
			//play queen of spades or highest card

	
		this.setupMatch = function (hearts_match, pos) {
		match = hearts_match;
		position = pos;
		}
	
		this.getName = function () {
		return name;
		}
	
		this.setupNextGame = function (game_of_hearts, pkey) {
		current_game = game_of_hearts;
		player_key = pkey;
		
		current_game.registerEventHandler(Hearts.GAME_STARTED_EVENT, GameStartedEvent);
		current_game.registerEventHandler(Hearts.TRICK_START_EVENT, TrickStartEvent);
		current_game.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, TrickContinueEvent);

		
    //currentGame.registerEventHandler(Hearts.GAME_OVER_EVENT, GameOverEvent);;
    //currentGame.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, TrickCompleteEvent);
    current_game.registerEventHandler(Hearts.CARD_PLAYED_EVENT, CardPlayedEvent);
    //currentGame.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, PassingCompletedEvent);
		
		}
		
		var CardPlayedEvent = function(e){
			if(currentTrick.length === 4){
				currentTrick = [];
			}
			currentTrick.push(e.getCard());
		}
	
		var GameStartedEvent = function(e){
		  if (e.getPassType() != Hearts.PASS_NONE) {
			//alert(name + " deciding which cards to pass");
			var cards = current_game.getHand(player_key).getDealtCards(player_key);
			
			current_game.passCards(getMax(cards, 3), player_key);
			
			}
		  
		}
	
		var TrickStartEvent = function(e){
		  if (e.getStartPos() == position) {

			var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);
			//alert(name + ": I will lead with " + playable_cards[0]);
				
			var sortedBoard = sortCards(currentTrick);	


			setTimeout(function() {			
				current_game.playCard(getMin(playable_cards), player_key);
			}, thinkingTime);

			//current_game.playCard(playable_cards[0], player_key);
			}

	
		}
	
		var TrickContinueEvent = function(e){
		  if (e.getNextPos() == position) {
			var playable_cards = current_game.getHand(player_key).getPlayableCards(player_key);


			setTimeout(function() {			
				current_game.playCard(useDuckingStrategy(playable_cards, getMax(currentTrick)), player_key);
			}, thinkingTime);
			//alert(name + ": I will continue play with " + playable_cards[0]);
			//current_game.playCard(playable_cards[0], player_key);
			}
	
		}

		//returns the maximum card lower than maxCard
		//if all cards are greater than maxCard then it return the minimum card
		//if it is the last card to play and can't duck it will play its highest card
		var useDuckingStrategy = function(cards, maxCard){
			var sortedCards = sortCards(cards);

			var maxUnderCard = sortedCards[0];
			if(currentTrick.length === 4){
				maxUnderCard = sortedCards[sortCards.length-1];
			}

			for(var i = 0; i < sortedCards.length; i++){
				if(sortedCards[i].getRank() < maxCard.getRank()){
					maxUnderCard = sortedCards[i];
				}
			}

			return(maxUnderCard);
		}

		var getMax = function(cards, numCards){
			var sortedCards = sortCards(cards);

			if(!numCards){
				return(sortedCards[sortedCards.length-1]);
			}

			return(sortedCards.slice(sortedCards.length-numCards, sortedCards.length));
		}

		var getMin = function(cards, numCards){
			var sortedCards = sortCards(cards);

			if(!numCards){
				return(sortedCards[0]);
			}

			return(sortedCards.slice(0, numCards));
		}

		


		var sortCards = function(cards, suitType) {
			var sortedCards = cards.slice(0);
			var hearts=[];
			var spades=[];
			var diamonds=[];
			var clubs=[];
	
			//selection sort
			var minimumValue = 0;
			var indexOfMinimum = 0;
			var currentRank;
			for(var j = 0; j<cards.length; j++){
				minimumValue = 15;      
				for(var i = j; i<sortedCards.length; i++){
					currentRank = sortedCards[i].getRank();
					if(currentRank < minimumValue){
						minimumValue = currentRank;
						indexOfMinimum = i;
					}
				}
				var temp = sortedCards[j];
				sortedCards[j] = sortedCards[indexOfMinimum];
				sortedCards[indexOfMinimum] = temp;      
			}
	
			var currentSuit;
			for(var i = 0; i<sortedCards.length; i++){
			 currentSuit = sortedCards[i].getSuit()
			 
				if (currentSuit === Card.Suit.HEART) {
					hearts.push(sortedCards[i]);
				}
				if (currentSuit === Card.Suit.SPADE) {
					spades.push(sortedCards[i]);
				}
				if (currentSuit === Card.Suit.DIAMOND) {
					diamonds.push(sortedCards[i]);
				}
				if (currentSuit === Card.Suit.CLUB) {
					clubs.push(sortedCards[i]);
				}
				
			}
	
			/*if(!suitType){
				return sortedCards;
			}*/
			if(suitType === "hearts"){
				return hearts;
			}
			if(suitType === "spades"){
				return spades;
			}
			if(suitType === "diamonds"){
				return diamonds;
			}
			if(suitType === "clubs"){
				return clubs;
			}
			//return hearts.concat(spades).concat(diamonds).concat(clubs);
			return sortedCards;
		}
	
	}
	
	 
	