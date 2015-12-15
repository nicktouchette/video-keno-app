$(document).ready(function () {

  var board = [];
  var selectedCount = 0;

  function Square(index) {
    this.index = index;
    this.isSelected = false;
    this.element = `.board ul li:nth-child(${this.index + 1}) button`;

    // create button in DOM using jquery
    $(".board ul").append(`<li><button btn-id="${this.index}">${this.index + 1}</button></li>`);

    this.draw = function() {
      $(this.element).css("color","rgb(255,255,255)");
      if (this.isSelected) {
        this.hit();
      }
    };
    this.hit = function() {
      $(this.element).text("HIT");
    };
    this.select = function() {
      if (this.isSelected) {
        this.isSelected = false;
        selectedCount--;
        $(this.element).css("border-color", "inherit");
      } else if (selectedCount < 10) {
        this.isSelected = true;
        selectedCount++;
        $(this.element).css("border-color", "yellow");
      }
    };
    this.refresh = function() {
      $(this.element).css("color","initial");
      $(this.element).text(this.index+1);
    };
  }

  // Create button objects and display board
  function init () {
    for (var i = 0; i < 80; i ++) {
      // create Square object with values 1 to 80 and push to board
      board.push(new Square(i));
    }
  }

  // Randomly generate 20 unique numbers and return the array
  function generateNumbers() {
    var randomNumberArray = [], availableNumbers = [];

    for (var i = 1; i <= 80; i++) {
      availableNumbers.push(i);
    }

    for (var i = 0; i < 20; i++) {
      var randomNumber = Math.floor(Math.random() * (availableNumbers.length - 1));
      randomNumberArray.push(Number(availableNumbers.splice(randomNumber, 1)));
    }
    return randomNumberArray;
  }

  function clearBoard() {
    board.forEach(function(square) {
      square.refresh();
    });
  }

  function startRound() {
    clearBoard();
    var randomNumbers = generateNumbers();
    var count = 0;

    var display = setInterval(function() {
      board[randomNumbers[count]].draw();
      if (count === randomNumbers.length - 1) {
        clearInterval(display);
        calculatePayout();
      } else {
        count++;
      }
    }, 500);
  }

  function calculatePayout() {

  }

  init();

  $('li button').on("click", function(){
    board[$(this).attr("btn-id")].select();
  });

  $('#start').on("click", startRound);

});
