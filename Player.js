var Player = function (name) {

  var cardEnteringTime = 500;
  var cardExitingTime = 500;

  var name = name;

  var match = null;
  var position = null;
  var currentGame = null;
  var playerKey = null;
  var resetBoard = false;

  var waitingForUserToStartNextGame = false;
  var cardsPlayed = 0;

  var westDeckPositionX = '30px';
  var eastDeckPositionX = '870px';
  var northDeckPositionY = '30px';
  var southDeckPositionY = '470px'
  var centerPositionX = '460px';
  var centerPositionY = '250px';

  var cardsToPassOnGameStart = [];

  //return user action the game is waiting on one of
  //"pass 3 cards", "play card"
  var userActionWaitingOn;

  var playerDiv = "#player-hand";
  var northDiv = "#north-hand";
  var eastDiv = "#east-hand";
  var southDiv = "#south-hand";
  var westDiv = "#west-hand";
  var northScoreSpan = $("#north-pos > span");
  var eastScoreSpan = $("#east-pos > span");
  var southScoreSpan = $("#south-pos > span");
  var westScoreSpan = $("#west-pos > span");

  var northScore = 0;
  var eastScore = 0;
  var southScore = 0;
  var westScore = 0;
  
  var trickWinner = null;

  $(southScoreSpan).text(name + ": " + 0 + " pts");

  //equivalent to $(.player_card).click(selectCard);
  $(playerDiv).on('click', '*', selectCard);

  this.getName = function () {
    return name;
  }

  this.setupMatch = function (matchObject, pos) {
    match = matchObject;
    position = pos;
  }

  this.setupNextGame = function (gameOfHearts, pkey) {
    currentGame = gameOfHearts;
    playerKey = pkey;

    //register events
    currentGame.registerEventHandler(Hearts.GAME_OVER_EVENT, GameOverEvent);
    currentGame.registerEventHandler(Hearts.GAME_STARTED_EVENT, GameStartedEvent);
    currentGame.registerEventHandler(Hearts.TRICK_START_EVENT, TrickStartEvent);
    currentGame.registerEventHandler(Hearts.TRICK_CONTINUE_EVENT, TrickContinueEvent);
    currentGame.registerEventHandler(Hearts.TRICK_COMPLETE_EVENT, TrickCompleteEvent);
    currentGame.registerEventHandler(Hearts.CARD_PLAYED_EVENT, CardPlayedEvent);
    currentGame.registerEventHandler(Hearts.PASSING_COMPLETE_EVENT, PassingCompletedEvent);

  }

  function selectCard(e) {
    var allCardDivs = $(".player_card");
    var currentDiv = $(this);

    if (userActionWaitingOn === "pass 3 cards") {
      var index = findCardIndexClicked(allCardDivs, currentDiv);
      var dealtCards = sortCards(currentGame.getHand(playerKey).getDealtCards(playerKey));

      if (cardsToPassOnGameStart.length < 3 && cardsToPassOnGameStart.length >= 0) {
        var duplicatePasses = false;

        for (var i = 0; i < cardsToPassOnGameStart.length; i++) {
          if (dealtCards[index] === cardsToPassOnGameStart[i]) {
            $(this).animate({ bottom: '0px' }, 300);
            cardsToPassOnGameStart.splice(i, 1);
            i--;
            duplicatePasses = true;
          }
        }
        if (duplicatePasses === false) {
          $(this).animate({ bottom: '40px' }, 300);
          cardsToPassOnGameStart.push(dealtCards[index]);
        }
      }

      //after 3 cards are added pass the cards
      if (cardsToPassOnGameStart.length === 3) {

        setTimeout(function () {
          currentGame.passCards(cardsToPassOnGameStart, playerKey);
          cardsToPassOnGameStart = [];
        }, 600);
      }
    }
    else if (userActionWaitingOn === "play card") {
      var playableCards = currentGame.getHand(playerKey).getPlayableCards(playerKey);

      var unplayedCards = sortCards(currentGame.getHand(playerKey).getUnplayedCards(playerKey));
      
      var index = findCardIndexClicked(allCardDivs, currentDiv);
      var cardAttemptedToPlay = unplayedCards[index];
      var isValid = cardEqualsAnyOfCardArray(cardAttemptedToPlay, playableCards);

      if (isValid) {
        currentGame.playCard(unplayedCards[index], playerKey);
      }
      else {
        alert("unplayable card");
      }
    }
  }

  var findCardIndexClicked = function (allCardDivs, currentDiv) {
    for (var i = 0; i < allCardDivs.length; i++) {
      //if this is true then i is the index of the selected card
      if ($(allCardDivs[i]).attr('id') === $(currentDiv).attr('id')) {
        return i;
      }
    }

  }

  var sortCards = function(cards) {
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

    return hearts.concat(spades).concat(diamonds).concat(clubs);
  }

  var GameOverEvent = function (e) {
    northScore += currentGame.getScore(Hearts.NORTH);
    eastScore += currentGame.getScore(Hearts.EAST);
    southScore += currentGame.getScore(Hearts.SOUTH);
    westScore += currentGame.getScore(Hearts.WEST);

    $(northScoreSpan).text("North: " + northScore + " pts");
    $(eastScoreSpan).text("East: " + eastScore + " pts");
    $(southScoreSpan).text(name + ": " + southScore + " pts");
    $(westScoreSpan).text("West: " + westScore + " pts");
  }

  var GameStartedEvent = function (e) {
    var sourceName;
    userActionWaitingOn = "pass 3 cards";
    if (e.getPassType() === Hearts.PASS_LEFT) {
      setTimeout(function () {
        alert("pass 3 cards to your left");
      }, cardExitingTime);
    }
    if (e.getPassType() === Hearts.PASS_RIGHT) {
      setTimeout(function () {
        alert("pass 3 cards to your right");
      }, cardExitingTime);
    }
    if (e.getPassType() === Hearts.PASS_ACROSS) {
      setTimeout(function () {
        alert("pass 3 cards across");
      }, cardExitingTime);
    }
    if (e.getPassType() === Hearts.PASS_NONE) {
      userActionWaitingOn = "play card";
    }
    $('#pass-img').attr('src', sourceName);

    clearBoard();

    var dealtCards = currentGame.getHand(playerKey).getDealtCards(playerKey);
    var playableCards = currentGame.getHand(playerKey).getPlayableCards(playerKey);
    updateHandView(dealtCards, playableCards);
    
  }

  var mapToFileName = function (card) {
    var rank = card.getRank();
    var suitCode = card.getSuit();
    var suitChar;

    if (suitCode === Card.Suit.HEART) {
      suitChar = 'h';
    }
    if (suitCode === Card.Suit.SPADE) {
      suitChar = 's';
    }
    if (suitCode === Card.Suit.DIAMOND) {
      suitChar = 'd';
    }
    if (suitCode === Card.Suit.CLUB) {
      suitChar = 'c';
    }

    return 'svg/' + suitChar + rank + '.svg';
  }


  var updateHandView = function (unplayedCards, playableCards) {
    $(playerDiv).empty();

    //sorted cards
    unplayedCards = sortCards(unplayedCards);

    for (var i = 0; i < unplayedCards.length; i++) {
      var card = $("<img>");
      var sourceName = mapToFileName(unplayedCards[i]);
      $(card).attr('src', sourceName);
      $(card).attr('alt', unplayedCards[i])
      $(card).attr('id', 'card' + i);
      $(card).addClass('player_card');

      if (cardEqualsAnyOfCardArray(unplayedCards[i], playableCards)) {
        $(card).css('box-shadow', '0 0 30px rgb(0,0,0)');
      }
      else {
        $(card).css('box-shadow', '0px 0px');
      }

      $(playerDiv).append(card);
    }
  }

  var cardEqualsAnyOfCardArray = function (card, cardArray) {
    for (var i = 0; i < cardArray.length; i++) {
      if (card.equals(cardArray[i])) {
        return true;
      }
    }
    return false;
  }

  var TrickStartEvent = function (e) {
    var position = e.getStartPos();

    if (position === Hearts.SOUTH) {
      userActionWaitingOn = "play card";
      var unplayedCards = currentGame.getHand(playerKey).getUnplayedCards(playerKey);
      var playableCards = currentGame.getHand(playerKey).getPlayableCards(playerKey);
      
      updateHandView(unplayedCards, playableCards);
    }
  }

  var TrickContinueEvent = function (e) {
    var position = e.getNextPos();

    if (position === Hearts.SOUTH) {
      userActionWaitingOn = "play card";
      var unplayedCards = currentGame.getHand(playerKey).getUnplayedCards(playerKey);
      var playableCards = currentGame.getHand(playerKey).getPlayableCards(playerKey);
      updateHandView(unplayedCards, playableCards);
    }
  }

  var TrickCompleteEvent = function (e) {
    resetBoard = true;
    trickWinner = e.getTrick().getWinner();
    moveBoard(trickWinner);
  }

  var moveBoard = function (direction) {
    var northClone = $(northDiv).clone();
    var eastClone = $(eastDiv).clone();
    var southClone = $(southDiv).clone();
    var westClone = $(westDiv).clone();

    $('.container').append(northClone);
    $('.container').append(eastClone);
    $('.container').append(southClone);
    $('.container').append(westClone);

    $(northClone).animate({ top: '200px' }, cardEnteringTime);
    $(eastClone).animate({ left: '510px' }, cardEnteringTime);
    $(southClone).animate({ top: '290px' }, cardEnteringTime);
    $(westClone).animate({ left: '410px' }, cardEnteringTime);

    var newTop;
    var newLeft;

    if (direction === Hearts.NORTH) {
      newTop = northDeckPositionY;
      newLeft = centerPositionX;
    }
    if (direction === Hearts.EAST) {
      newTop = centerPositionY;
      newLeft = eastDeckPositionX;
    }
    if (direction === Hearts.SOUTH) {
      newTop = southDeckPositionY;
      newLeft = centerPositionX;
    }
    if (direction === Hearts.WEST) {
      newTop = centerPositionY;
      newLeft = westDeckPositionX;
    }

    $(northClone).animate({ top: newTop, left: newLeft }, cardExitingTime);
    $(eastClone).animate({ top: newTop, left: newLeft }, cardExitingTime);
    $(southClone).animate({ top: newTop, left: newLeft }, cardExitingTime);
    $(westClone).animate({ top: newTop, left: newLeft }, cardExitingTime);

    setTimeout(function () {
      $(northClone).remove();
      $(eastClone).remove();
      $(southClone).remove();
      $(westClone).remove();
    }, (cardEnteringTime + cardExitingTime));

    clearBoard();
  }

  var clearBoard = function () {
    $(northDiv).empty();
    $(northDiv).css('top', northDeckPositionY);
    $(eastDiv).empty();
    $(eastDiv).css('left', eastDeckPositionX);
    $(southDiv).empty();
    $(southDiv).css('top', southDeckPositionY);
    $(westDiv).empty();
    $(westDiv).css('left', westDeckPositionX);
  }

  var CardPlayedEvent = function (e) {
    cardsPlayed++;
    var position = e.getPosition();
    var cardPlayed = e.getCard();

    console.log(position + " played " + cardPlayed);
    if (resetBoard) {
      clearBoard();
      resetBoard = false;
    }

    var unplayedCards = currentGame.getHand(playerKey).getUnplayedCards(playerKey);
    updateHandView(unplayedCards, []);
    updateBoardView(position, cardPlayed);
  }

  var updateBoardView = function (position, cardPlayed) {
    var card = $("<img>");
    var sourceName = mapToFileName(cardPlayed);

    $(card).attr('src', sourceName);
    $(card).attr('alt', cardPlayed)
    if (position === Hearts.NORTH) {
      $(northDiv).empty();
      $(northDiv).append(card);
      $(northDiv).animate({ top: '200px' }, cardEnteringTime);
    }
    if (position === Hearts.EAST) {
      $(eastDiv).empty();
      $(eastDiv).append(card);
      $(eastDiv).animate({ left: '510px' }, cardEnteringTime);
    }
    if (position === Hearts.SOUTH) {
      $(southDiv).empty();
      $(southDiv).append(card);
      $(southDiv).animate({ top: '290px' }, cardEnteringTime);
    }
    if (position === Hearts.WEST) {
      $(westDiv).empty();
      $(westDiv).append(card);
      $(westDiv).animate({ left: '410px' }, cardEnteringTime);
    }
  }

  var PassingCompletedEvent = function (e) {
    var dealtCards = currentGame.getHand(playerKey).getDealtCards(playerKey);
    var unplayedCards = currentGame.getHand(playerKey).getUnplayedCards(playerKey);
    var playableCards = currentGame.getHand(playerKey).getPlayableCards(playerKey);
    updateHandView(unplayedCards, playableCards);
  }

}

