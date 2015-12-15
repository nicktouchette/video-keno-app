$(document).ready(function() {

  var board = [],
    selectedCount = 0,
    drawSpeed = 100,
    betAmount = 1,
    credits = 100,
    hitCount = 0,
    mouseDown = false,
    currentWinAmount = 0;
    idleState = true;

  var payouts = {
    4: [2,5,15],
    5: [1,3,12,50],
    6: [3,4,18,50],
    7: [3,15,40,75],
    8: [7,18,75,500],
    9: [4,12,35,60,750],
    10: [4,11,33,50,500,900]
  };

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
    if (selectedCount >= 4) {
      var randomNumbers = generateNumbers();
      var count = 0;
      curentWinAmount = 0;

      idleState = false;
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
      idleState = true;
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
    populatePayoutTable();
    changeStat("totalMarked", selectedCount);
    changeStat("coins-hit", 0);
    changeStat("multiplier", 0);
    changeStat("currentBet", betAmount);
    changeStat("currentWinAmount", currentWinAmount);
    changeStat("creditTotal", credits);
    changeStat("totalHits", hitCount);
  }

  function populatePayoutTable() {
    clearRows();
    var payoutTable = payouts[(selectedCount < 4?4:selectedCount)];
    var lowestHitGoal = (selectedCount < 4?4:selectedCount) - payoutTable.length + 1;

    for (var i = 0; i < payoutTable.length; i++) {
      createRow(lowestHitGoal + i, payoutTable[i]);
    }
    function clearRows(){
      $('tr').remove("[hitGoal]");
    }
    function createRow(hitGoal, payoutPays){
      $('.payouts > table').append(`<tr hitGoal=${hitGoal}></tr>`);
      $(`tr[hitGoal="${hitGoal}"]`).append(`<td>${hitGoal}</td><td>${payoutPays * betAmount}</td><td>payoutMulti</td>`);
    }
  }

  function calculatePayout() {
    var payoutTable = payouts[selectedCount];
    var lowestHitGoal = selectedCount - payoutTable.length + 1;

    if (hitCount >= lowestHitGoal) {
      currentWinAmount = payoutTable[hitCount - lowestHitGoal] * betAmount;
      credits += currentWinAmount;
      refreshStats();
    }
  }

  init();

  // Button Events
  $('li button').on({
    mousedown: function() {
      board[$(this).attr("btn-id")].select();
      mouseDown = true;
    },
    mouseover: function() {
      if (mouseDown)
        board[$(this).attr("btn-id")].select();
    }
  });

  $('.board').on("mouseup", function() {
      mouseDown = false;
  });

  $('#start').on("click", function() {
    if (idleState) {
      startRound();
    }
  });

  $('#speed').on("click", function() {
    drawSpeed = (drawSpeed === 400) ? 300 : (drawSpeed === 300) ? 200 : (drawSpeed === 200) ? 100 : 400;
  });

  $('#betMax').on("click", function() {
    if (idleState) {
      betAmount = 40;
    }
  });

  $('#betUp').on("click", function() {
    if (idleState && betAmount < 40) {
      betAmount++;
    }
  });

  $('#betDown').on("click", function() {
    if (idleState && betAmount > 1) {
      betAmount--;
    }
  });

  $('#erase').on("click", function() {
    if (idleState) {
      eraseSelection();
    }
  });

  $('button, input[type=button]').on("click", refreshStats);
});
