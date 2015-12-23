$(document).ready(function() {

  var board = [],
    drawSpeed = 200,
    mouseDown = false,
    maxBet = 8,
    idleState = true,
    animationState = false;

  // set of variables will refresh UI when changed
  var selfRefresh = {
    sCount: 0,
    bAmount: 0,
    cr: 0,
    hCount: 0,
    cWinAmount: 0,
    cHit: 0,
    multi: 0,

    set selectedCount(x) {
      this.sCount = x;
      // populate payout table with new selected amount
      populatePayoutTable();
      displayStat("#totalMarked", x);
    },
    get selectedCount() {
      return this.sCount;
    },

    set betAmount(x) {
      this.bAmount = x;
      populatePayoutTable();
      displayStat("#currentBet", x);
    },
    get betAmount() {
      return this.bAmount;
    },

    set credits(x) {
      this.cr = x;
      localStorage.setItem('creditsOwned', x);
      displayStat("#creditTotal", x);
    },
    get credits() {
      return this.cr;
    },

    set hitCount(x) {
      this.hCount = x;
      displayStat("#totalHits", x);
    },
    get hitCount() {
      return this.hCount;
    },

    set currentWinAmount(x) {
      this.cWinAmount = x;
      displayStat("#currentWinAmount", x);
    },
    get currentWinAmount() {
      return this.cWinAmount;
    },

    set coinsHit(x) {
      this.cHit = x;
      displayStat("#coinsHit", x);
    },
    get coinsHit() {
      return this.cHit;
    },
    set multiplier(x) {
      this.multi = x;
      displayStat("#multiplier", x);
    },
    get multiplier() {
      return this.multi;
    }
  };

  var payouts = {
    4: [1, 8, 84],
    5: [3, 20, 500],
    6: [2, 7, 70, 1000],
    7: [1, 4, 30, 150, 2000],
    8: [1, 12, 100, 1500, 8000],
    9: [1, 3, 50, 300, 4000, 9000],
    10: [1, 3, 25, 130, 1000, 5000, 10000]
  };

  init();

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
      // clone audio boop so multiple can be played
      var boop = document.getElementById("boop").cloneNode(true);
      boop.volume = .3;
      if (this.isSelected) {
        this.hit();
        boop.volume = 1;
      }
      boop.play();
    };

    // mark square as hit if selected is true
    // increment hits variable and enable hit flag
    this.hit = function() {
      $(this.element).text("HIT");
      this.isHit = true;
      selfRefresh.hitCount++;
    };

    // Select isSelected and iterate selfRefresh.selectedCount, style accordingly
    this.select = function() {
      if (this.isSelected) {
        this.isSelected = false;
        selfRefresh.selectedCount--;
        $(this.element).css("border-color", "inherit");
      } else if (selfRefresh.selectedCount < 10) {
        this.isSelected = true;
        selfRefresh.selectedCount++;
        $(this.element).css("border-color", "yellow");
      }
    };

    // resets the isHit flag to false, deducts selfRefresh.hitCount, and resets color/text
    this.reset = function() {
      if (this.isHit === true) {
        selfRefresh.hitCount--;
        this.isHit = false;
      }
      $(this.element).css("color", "initial");
      $(this.element).text(this.index + 1);
    };
  }

  // Create button objects and display board
  function init() {
    // set default variables
    selfRefresh.selectedCount = 0;
    selfRefresh.betAmount = 1;
    selfRefresh.currentWinAmount = 0;
    selfRefresh.credits = localStorage.creditsOwned || 80;
    selfRefresh.hitCount = 0;
    selfRefresh.coinsHit = 0;
    selfRefresh.multiplier = 1;
    populatePayoutTable();

    $('#speed').text(`Speed ${ 400 / drawSpeed }X`);

    for (var i = 0; i < 80; i++) {
      // create Square object with values 1 to 80 and push to board
      board.push(new Square(i));
    }
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
  }

  function startRound() {
    if (selfRefresh.selectedCount >= 4) {
      if (bet()) {
        idleState = false;

        var randomNumbers = generateNumbers();
        var count = 0;
        selfRefresh.currentWinAmount = 0;

        resetBoard();
        setTimeout(highlight, drawSpeed);
      }

      function highlight() {
        board[randomNumbers[count]].highlight();
        if (count === randomNumbers.length - 1) {
          calculatePayout();
          idleState = true;
        } else {
          count++;
          setTimeout(highlight, drawSpeed);
        }
      }
    }
  }

  // test if player has enough money and then subtract bet from credits
  function bet() {
    if (selfRefresh.credits >= selfRefresh.betAmount) {
      selfRefresh.credits -= selfRefresh.betAmount;
      return true;
    } else {
      return false;
    }
  }

  // change a stat on the UI
  function displayStat(name, value) {
    $(`${name}`).text(value);
  }

  function populatePayoutTable() {
    clearRows();
    var payoutTable = payouts[(selfRefresh.selectedCount < 4 ? 4 : selfRefresh.selectedCount)];
    var lowestHitGoal = (selfRefresh.selectedCount < 4 ? 4 : selfRefresh.selectedCount) - payoutTable.length + 1;

    for (var i = 0; i < payoutTable.length; i++) {
      createRow(lowestHitGoal + i, payoutTable[i]);
    }

    function clearRows() {
      $('tr').remove("[hitGoal]");
    }

    function createRow(hitGoal, payoutPays) {
      $('.payouts > table').append(`<tr hitGoal=${hitGoal}></tr>`);
      $(`tr[hitGoal="${hitGoal}"]`).append(`<td>${hitGoal}</td><td>${payoutPays * selfRefresh.betAmount}</td><td>${payoutPays * selfRefresh.multiplier}</td>`);
    }
  }

  function calculatePayout() {
    var payoutTable = payouts[selfRefresh.selectedCount];
    var lowestHitGoal = selfRefresh.selectedCount - payoutTable.length + 1;

    if (selfRefresh.hitCount >= lowestHitGoal) {
      if (!animationState) {
        animationState = true;
        var animations = [
          ['./img/beaver_smoke_1.png', 1000],
          ['./img/beaver_smoke_2.png', 250],
          ['./img/beaver_smoke_3.png', 250],
          ['./img/beaver_smoke_4.png', 500],
          ['./img/beaver_smoke_5.png', 400],
          ['./img/beaver_smoke_2.png', 400],
          ['./img/beaver_smoke_1.png', 1000],
          ['./img/beaver.gif', 250]
        ];
        var iterationVar = 0;
        setTimeout(animateSequence, animations[iterationVar][1]);
      }

      function animateSequence() {
        $('.header img').attr("src", animations[iterationVar][0]);
        iterationVar++;
        if (iterationVar < animations.length) {
          setTimeout(animateSequence, animations[iterationVar][1]);
        } else {
          animationState = false;
        }
      }

      selfRefresh.currentWinAmount = (payoutTable[selfRefresh.hitCount - lowestHitGoal] * selfRefresh.betAmount) * selfRefresh.multiplier;
      selfRefresh.credits += selfRefresh.currentWinAmount;
    }
  }

  // Button Events
  $('.board li button').on({
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
    drawSpeed = (drawSpeed === 400) ? 200 : (drawSpeed === 200) ? 100 : (drawSpeed === 100) ? 50 : (drawSpeed === 50) ? 10 : 400;

    $(this).text(`Speed ${ 400 / drawSpeed }X`);
  });

  $('#betMax').on("click", function() {
    if (idleState) {
      selfRefresh.betAmount = maxBet;
    }
  });

  $('#betUp').on("click", function() {
    if (idleState && selfRefresh.betAmount < maxBet) {
      selfRefresh.betAmount++;
    }
  });

  $('#betDown').on("click", function() {
    if (idleState && selfRefresh.betAmount > 1) {
      selfRefresh.betAmount--;
    }
  });

  $('#erase').on("click", function() {
    if (idleState) {
      eraseSelection();
    }
  });
});
