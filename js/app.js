$(document).ready(function() {

  var board = [],
    selectedCount = 0,
    drawSpeed = 100,
    betAmount = 1,
    credits = 100,
    hitCount = 0;
    mouseDown = false;

  function Square(index) {
    this.index = index;
    this.isSelected = false;
    this.element = `.board ul li:nth-child(${this.index + 1}) button`;
    this.isHit = false;

    // create button in DOM using jquery
    $(".board ul").append(`<li><button btn-id="${this.index}">${this.index + 1}</button></li>`);

    // highlight a square and detect if square is selected
    this.highlight = function() {
      $(this.element).css("color", "rgb(255,255,255)");
      var boop = document.getElementById("boop").cloneNode(true);
      boop.volume = .3;
      if (this.isSelected) {
        this.hit();
        boop.volume = 1;
      }
      boop.play();
    };

    // mark a square as hit if selected is true
    // increment hits variable and enable hit flag
    this.hit = function() {
      $(this.element).text("HIT");
      this.isHit = true;
      hitCount++;
      refreshStats();
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

    this.reset = function() {
      if (this.isHit === true) {
        hitCount--;
        this.isHit = false;
      }
      $(this.element).css("color", "initial");
      $(this.element).text(this.index + 1);
    };
  }

  function changeStat(name, value) {
    $(`#${name}`).text(value);
  }

  // Create button objects and display board
  function init() {
    for (var i = 0; i < 80; i++) {
      // create Square object with values 1 to 80 and push to board
      board.push(new Square(i));
    }
    refreshStats();
  }

  // Randomly generate 20 unique numbers and return the array
  function generateNumbers() {
    var randomNumberArray = [],
      availableNumbers = [];

    for (var i = 1; i <= 80; i++) {
      availableNumbers.push(i);
    }

    for (var i = 0; i < 20; i++) {
      var randomNumber = Math.floor(Math.random() * (availableNumbers.length - 1));
      randomNumberArray.push(Number(availableNumbers.splice(randomNumber, 1)));
    }
    return randomNumberArray;
  }

  function resetBoard() {
    board.forEach(function(square) {
      square.reset();
    });
  }

  function eraseSelection() {
    board.forEach(function(square) {
      square.reset();
      if (square.isSelected) {
        square.select();
      }
    });
    refreshStats();
  }

  function startRound() {
    var randomNumbers = generateNumbers();
    var count = 0;
    function callback() {
      board[randomNumbers[count]].highlight();
      if (count === randomNumbers.length - 1) {
        calculatePayout();
      } else {
        count++;
        setTimeout(callback, drawSpeed)
      }
    }

    resetBoard();

    if (bet()) {
      setTimeout(callback, drawSpeed);
    }
  }

  function bet() {
    if (credits >= betAmount) {
      credits -= betAmount;
      return true;
    } else {
      return false;
    }
  }

  function refreshStats() {
    changeStat("totalMarked", selectedCount);
    changeStat("coins-hit", 0);
    changeStat("multiplier", 0);
    changeStat("currentBet", betAmount);
    changeStat("currentWinAmount", 0);
    changeStat("creditTotal", credits);
    changeStat("totalHits", hitCount);
  }

  function calculatePayout() {

  }

  init();

  // Button Events
  $('li button').on({
    mousedown: function() {
      board[$(this).attr("btn-id")].select();
      mouseDown = true;
    },
    mouseup: function() {
      mouseDown = false;
    },
    mouseover: function() {
      if (mouseDown)
        board[$(this).attr("btn-id")].select();
    }
  });

  $('#start').on("click", startRound);

  $('#speed').on("click", function() {
    drawSpeed = (drawSpeed === 400) ? 300 : (drawSpeed === 300) ? 200 : (drawSpeed === 200) ? 100 : 400;
  });

  $('#betMax').on("click", function() {
    betAmount = 40;
  });

  $('#betUp').on("click", function() {
    if (betAmount < 40) {
      betAmount++;
    }
  });

  $('#betDown').on("click", function() {
    if (betAmount > 1) {
      betAmount--;
    }
  });

  $('#erase').on("click", function() {
    eraseSelection();
  });

  $('button, input[type=button]').on("click", refreshStats);
});
