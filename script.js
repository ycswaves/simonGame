$(function(){
  var simon = new Simon();

  $('.tile').click(function() {
    if (simon.playOrderTimer) return;
    simon.check($(this).data('index'));
  });

  var powerSwitch = $('#knob');
  $('#toggle').click(function() {
    powerSwitch.toggleClass('off');
    var ctrVal = powerSwitch.hasClass('off')? '' : '0';
    $('#counter').val(ctrVal);
    clearInterval(simon.playOrderTimer);
    simon = new Simon();
  });

  var strictIndicator = $('#strict-indicator');
  $('#strict').click(function() {
    if (powerSwitch.hasClass('off')) return false;
    strictIndicator.toggleClass('on');
    simon.strict = strictIndicator.hasClass('on');
  })

  $('#start').click(function() {
    if (powerSwitch.hasClass('off')) return false;
    simon.start();
  });
  


});

function Simon() {
  this.counter = 0;
  this.rightOrder = [];
  this.userOrder = [];
  this.playOrderTimer = null;
  this.FLASH_ELAPSE = 1000;
  this.strict = false;
  this.sounds = [
    new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
    new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
    new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
    new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3')
  ]
}

Simon.prototype.getNext = function() {
  $('#counter').val(this.counter);
  var nextTileIndex = Math.floor(Math.random() * 4) + 1;
  this.rightOrder.push(nextTileIndex);
  this.playOrder();
};

Simon.prototype.flash = function(index) {
  var tileDom = $('#tile'+index);
  tileDom.addClass('bright');
  this.playSound(index);
  setTimeout(function() {
    tileDom.removeClass('bright');
  }, this.FLASH_ELAPSE);
}

Simon.prototype.playSound = function(index) {
  var sound = this.sounds[index];
  if (!sound && index != undefined) {
    sound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound'+index+'.mp3');
    this.sounds[index] = sound;
  }
  sound.play();
}

Simon.prototype.check = function(index) {
  this.userOrder.push(index);
  this.flash(index);
  if (this.rightOrder[this.userOrder.length-1] != index) {//if user got it wrong
    this.userOrder = [];
    $('#counter').val('!!');
    if (this.strict) {
      setTimeout(function() {
        $('#counter').val(this.counter);
        this.start();
      }.bind(this), 1500); //strict mode: re-start the game
    } else {
      setTimeout(function() {
        $('#counter').val(this.counter);
        this.playOrder();
      }.bind(this), 1500); //re-play the right order
    }    
    return false; 
  }  

  //console.log(this.counter, this.userOrder, this.rightOrder);

  if (this.userOrder.length == this.rightOrder.length) {
    this.userOrder = []; //clear previous order and ready to recollect
    this.counter++;
    if (this.counter > 20) {
      $('#counter').val('**');
    } else {
      if (this.counter > 5) {
        this.FLASH_ELAPSE = 500;
      }
      this.getNext();
    } 
  }

}

Simon.prototype.start = function() {
  this.rightOrder = [];
  this.userOrder = [];
  this.counter = 1;
  this.getNext();
}

Simon.prototype.playOrder = function() {
  var order = this.rightOrder.slice(0);
  this.playOrderTimer = setInterval(function() {
      this.flash(order.shift());
      if (order.length < 1) {
        clearInterval(this.playOrderTimer);
        this.playOrderTimer = null;
      };

    }.bind(this), this.FLASH_ELAPSE * 2);
}