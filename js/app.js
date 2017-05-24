$(document).ready(function() {

  var board = [],
    drawSpeed = 200,
    mouseDown = false,
    maxBet = 8,
    idleState = true,
    animationState = false,
    boopNormalArray = [],
    boopHitArray = [],
    numberArray = [],
    boop, boopHit;

  // set of variables will refresh UI when changed
  var vars = {
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
    this.number = index;
    this.isSelected = false;
    this.isHit = false;

    // create button in DOM using jquery

    var square = this;
    this.element = $(`<button class='square noselect' draggable="false">${this.number}</button>`)
                  .appendTo(".board")
                  .on({
                    mousedown: function() {
                      if (idleState) {
                        square.select();
                        mouseDown = true;
                      }
                    },
                    mouseover: function() {
                      if (idleState && mouseDown)
                        square.select();
                    }
                  });

    if (this.number % 10 === 0) {
      $(".board").append(`<br>`)
    }

    // highlight a square and detect if square is selected
    this.highlight = function(count) {
      this.element.addClass("highlight");
      if (this.isSelected) {
        this.hit();
        this.sound = boopHitArray[count];
      } else {
        this.sound = boopNormalArray[count];
      }
      this.sound.play();
    };

    // mark square as hit if selected is true
    // increment hits variable and enable hit flag
    this.hit = function() {
      this.element.text("HIT");
      this.isHit = true;
      vars.hitCount++;
    };

    this.blink = function() {
      if (this.isHit) {
        this.element.addClass("blink");
      }
    };

    // Select isSelected and iterate vars.selectedCount, style accordingly
    this.select = function() {
      if (idleState === true && this.isSelected) {
        this.isSelected = false;
        vars.selectedCount--;
        this.element.removeClass("selected");
      } else if (vars.selectedCount < 10) {
        this.isSelected = true;
        vars.selectedCount++;
        this.element.addClass("selected");
      }
    };

    // resets the isHit flag to false, deducts vars.hitCount, and resets color/text
    this.reset = function() {
      if (this.isHit === true) {
        vars.hitCount--;
        this.isHit = false;
        this.element.removeClass("blink");
      }
      this.element.removeClass("highlight");
      this.element.text(this.number);
    };
  };

  // Create button objects and display board
  function init() {
    // set default variables
    vars.selectedCount = 0;
    vars.betAmount = 1;
    vars.currentWinAmount = 0;
    vars.credits = Number(localStorage.creditsOwned) || 80;
    vars.hitCount = 0;
    vars.coinsHit = 0;
    vars.multiplier = 1;
    populatePayoutTable();

    $('#speed').text(`Speed ${ 400 / drawSpeed }X`);
    boop = document.getElementById("boop");
    boopHit = document.getElementById("boopHit");

    for (var i = 0; i < 20; i++) {
      // clone audio boop so multiple can be played
      boopNormalArray[i] = boop.cloneNode(true);
      boopHitArray[i] = boopHit.cloneNode(true);
    }

    for (var i = 1; i <= 80; i++) {
      // create Square object with values 1 to 80 and push to board
      numberArray.push(i);
      board.push(new Square(i));
    }
  }

  // Randomly generate 20 unique numbers and return the array
  function generateNumbers() {
    var randomNumberArray = [],
        randomNumber,
        availableNumbers = numberArray.slice();

    for (var i = 0; i < 20; i++) {
      randomNumber = Math.floor(Math.random() * (availableNumbers.length));
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

  function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    var intervalID = window.setInterval(function () {
     callback();

     if (++x === repetitions) {
       window.clearInterval(intervalID);
     }
    }, delay);
  }

  function startRound() {
    if (vars.selectedCount >= 4) {
      if (bet()) {
        idleState = false;

        var randomNumbers = generateNumbers();
        var count = 0;
        vars.currentWinAmount = 0;

        resetBoard();
        setIntervalX(highlight, drawSpeed, 20);
      }

      function highlight() {
        board[randomNumbers[count] - 1].highlight(count);
        if (count === randomNumbers.length - 1) {
          calculatePayout();
          idleState = true;
        }
        count++;
      }
    }
  }

  // test if player has enough money and then subtract bet from credits
  function bet() {
    if (vars.credits >= vars.betAmount) {
      vars.credits -= vars.betAmount;
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
    var payoutTable = payouts[(vars.selectedCount < 4 ? 4 : vars.selectedCount)];
    var lowestHitGoal = (vars.selectedCount < 4 ? 4 : vars.selectedCount) - payoutTable.length + 1;

    for (var i = 0; i < payoutTable.length; i++) {
      createRow(lowestHitGoal + i, payoutTable[i]);
    }

    function clearRows() {
      $('tr').remove("[hitGoal]");
    }

    function createRow(hitGoal, payoutPays) {
      $('.payouts > table').append(`<tr hitGoal=${hitGoal}></tr>`);
      $(`tr[hitGoal="${hitGoal}"]`).append(`<td>${hitGoal}</td><td>${payoutPays * vars.betAmount}</td><td>${payoutPays * vars.multiplier}</td>`);
    }
  }

  function blinkHitSquares() {
    for (var i = 0; i < board.length; i++) {
      board[i].blink();
    }
  }

  function calculatePayout() {
    var payoutTable = payouts[vars.selectedCount];
    var lowestHitGoal = vars.selectedCount - payoutTable.length + 1;

    if (vars.hitCount >= lowestHitGoal) {
      blinkHitSquares();
      animateHeader();

      vars.currentWinAmount = (payoutTable[vars.hitCount - lowestHitGoal] * vars.betAmount) * vars.multiplier;
      vars.credits += vars.currentWinAmount;
    }
  }

  function animateHeader() {
    if (!animationState) {
      animationState = true;
      var animation = [
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
      setTimeout(animateSequence, animation[iterationVar][1]);
    }

    function animateSequence() {
      $('.header img').attr("src", animation[iterationVar][0]);
      iterationVar++;
      if (iterationVar < animation.length) {
        setTimeout(animateSequence, animation[iterationVar][1]);
      } else {
        animationState = false;
      }
    }
  }
  // Button Events
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
      vars.betAmount = maxBet;
    }
  });

  $('#betUp').on("click", function() {
    if (idleState && vars.betAmount < maxBet) {
      vars.betAmount++;
    }
  });

  $('#betDown').on("click", function() {
    if (idleState && vars.betAmount > 1) {
      vars.betAmount--;
    }
  });

  $('#erase').on("click", function() {
    if (idleState) {
      eraseSelection();
    }
  });

  var elem = $('.container');
  $(window).smartresize(function(){
    var w = elem.width();

    elem.height(w*.5625);
    elem.show();
  });

  $(window).resize(function() {
    elem.hide();
  }).trigger("resize");
});
