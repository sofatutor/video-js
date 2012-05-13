/* Control - Base class for all control elements
================================================================================ */
_V_.Control = _V_.Component.extend({

  buildCSSClass: function(){
    return "vjs-control " + this._super();
  }

});

/* Control Bar
================================================================================ */
_V_.ControlBar = _V_.Component.extend({

  useractive: null,
  userInactive: false,

  visible: false,

  visibleTimedComments: false,
  
  userIsActive: false,
  
  locked: false,

  options: {
    loadEvent: "play",
    components: {
      "playToggle": {},
      "fullscreenToggle": {},
      "timeDisplay": {},
      "timedCommentsToggle": {},
      "muteToggle": {},
      "volumeControl": {}
    }
  },

  init: function(player, options){
    this._super(player, options);
    $(this.player.el).parent().bind('mouseenter', this.proxy(this.mouseenter));
    $(this.player.el).parent().bind('mouseleave', this.proxy(this.mouseleave));
    $(this.el).bind('mouseenter', this.proxy(this.enterControls));
    $(this.el).bind('mouseleave', this.proxy(this.leaveControls));
    this.player.on("userActive", this.proxy(this.userActive));
    this.player.on("userInactive", this.proxy(this.userInactive));
    this.player.on('showTimedComment', this.proxy(this.increaseTimedComments));
    this.player.on('hideTimedComment', this.proxy(this.decreaseTimedComments));
    this.player.on('lockControls', this.proxy(this.lockControls));
    this.player.on('unlockControls', this.proxy(this.unlockControls));
  },

  createElement: function(){
    return _V_.createElement("div", {
      className: "vjs-controls"
    });
  },

  increaseTimedComments: function () {
    this.visibleTimedComments = true;//this.visibleTimedComments + 1;
    this.update();
  },

  decreaseTimedComments: function () {
    this.visibleTimedComments = false;//this.visibleTimedComments - 1;
    this.update();
  },
  
  userActive: function () {
    this.userIsActive = true;
    this.update();
  },
  
  userInactive: function () {
    this.userIsActive = false;
    this.update();
  },
  
  update: function () {
    // not visible
    if (!this.visible) {
      // user active -> full
      if (this.userIsActive) {
        this.show('full');
      // user inactive, but timed comments -> half
      } else if (this.visibleTimedComments) {
        this.show('half');
      }
    // half visible
    } else if (this.visible === 'half') {
      // user active -> full
      if (this.userIsActive) {
        this.show('full');
      // user inactive and no timed comments -> hide
      } else if (!this.visibleTimedComments) {
        this.hide();
      }
    // fully visible
    } else {
      if (!this.userIsActive) {
        if (!this.visibleTimedComments) {
          this.hide();
        } else if (this.visibleTimedComments) {
          this.show('half');
        }
      }
    }
    /*
    if (!this.visible && (this.visibleTimedComments > 0 || this.userIsActive)) {
      this.show();
    } else if (this.visible && this.visibleTimedComments === 0 && !this.userIsActive) {
      this.hide();
    }*/
  },
  
  show: function(mode){
    this.player.trigger("controlsvisible");
    if (mode === 'full') {
      if (!this.visible) {
        this.fullUp();
      } else if (this.visible === 'half') {
        this.secondHalfUp();
      }
      this.visible = 'full';
      this.player.trigger('fullControls');
      console.log("full controls");
    } else if (mode === 'half') {
      if (!this.visible) {
        this.firstHalfUp();
        console.log("first half up");
      } else if (this.visible === 'full') {
        this.secondHalfDown();
        console.log("second half up");
      }
      this.visible = 'half';
      this.player.trigger('halfControls');
    }
   /* this.visible = true;
    $(this.el).stop(true,true).animate({ bottom: '0'},500);
    $('.vjs-progress-control').stop(true,true).animate({ bottom: '29px'},500);*/
    // $('.comment-time').delay(400).fadeIn();
  },

  hide: function(mode) {
    this.player.trigger("controlshidden");
    if (this.visible === 'half') {
      this.firstHalfDown();
    } else if (this.visible === 'full') {
      this.fullDown();
    }
    this.visible = false;
    this.player.trigger('noControls');
    /*$(this.el).stop(true,true).animate({ bottom: '-40px'},500);
    $('.vjs-progress-control').stop(true,true).animate({ bottom: '-10px'},500);*/
    // $('.comment-time').stop(true, true).hide();
  },

  // animations
  firstHalfUp: function () {
    $('.vjs-progress-control').show().css('opacity', '1');
  },
  
  secondHalfUp: function () {
    $('.vjs-progress-control').clearQueue('progress').queue('progress', function() {
      $(this).stop().show().animate({ bottom: '29px' }, { duration: 500, queue: false }).animate({ opacity: '1' }, { duration: 500, queue: false });
    }).dequeue('progress');

    $(this.el).clearQueue('buttons').queue('buttons', function() {
      $(this).animate({ bottom: '0' }, { duration: 500, queue: false });
    }).dequeue('buttons');

    this.player.trigger('timedCommentUp');
  },
  
  secondHalfDown: function () {
    $('.vjs-progress-control').clearQueue('progress').queue('progress', function() {
      $(this).stop().show().animate({ bottom: '0' }, { duration: 500, queue: false }).animate({ opacity: '1' }, { duration: 500, queue: false });
    }).dequeue('progress');

    $(this.el).clearQueue('buttons').queue('buttons', function() {
      $(this).animate({ bottom: '-29px' }, { duration: 500, queue: false });
    }).dequeue('buttons');

    this.player.trigger('timedCommentDown');
  },
  
  firstHalfDown: function () {
    $('.vjs-progress-control').hide();
  },
  
  fullUp: function () {
    $('.vjs-progress-control').clearQueue('progress').queue('progress', function() {
      $(this).stop().show().animate({ bottom: '29px' }, { duration: 500, queue: false }).animate({ opacity: '1' }, { duration: 500, queue: false });
    }).dequeue('progress');

    $(this.el).clearQueue('buttons').queue('buttons', function() {
      $(this).animate({ bottom: '0' }, { duration: 500, queue: false });
    }).dequeue('buttons');
  },
  
  fullDown: function () {
    $(this.el).clearQueue('buttons').queue('buttons', function() {
      $(this).animate({ bottom: '-29px' }, { duration: 500, queue: false });
    }).dequeue('buttons');

    $('.vjs-progress-control').clearQueue('progress').queue('progress', function() {
      $(this).animate({ bottom: '0' }, { duration: 500, queue: false, complete: function() { $('.vjs-progress-control').dequeue('progress') } } );
    }).queue('progress', function() {
      $(this).animate({ opacity: '0' }, { queue: false });
    }).dequeue('progress');
  },


  mouseenter: function(){
    this.player.trigger("userActive");
    $(this.player.el).parent().bind('mousemove', this.proxy(this.mousemove));
    $(this.player.el).parent().bind('click', this.proxy(this.mousemove));
  },

  mouseleave: function(){
    if (!state.isDragging) {
      this.player.trigger("userInactive");
      clearTimeout(this.useractive);
      $(this.player.el).parent().unbind('mousemove');
      $(this.player.el).parent().unbind('click', this.proxy(this.mousemove));
    }
  },

  
  lockControls: function() {
    this.locked = true;
  },

  unlockControls: function() {
    this.locked = false;
  },

  enterControls: function() {
    this.lockControls();
  },
  
  leaveControls: function() {
    this.unlockControls();
  },
  
  mousemove: function(){
    var self = this;
    if (self.userInactive) {
      self.player.trigger("userActive");
      self.userInactive = false;
    }
    clearTimeout(self.useractive);
    if (!self.locked) {
      self.useractive = setTimeout(function() { self.player.trigger("userInactive"); self.userInactive = true; }, 10000);
    }
  },

  lockShowing: function(){
    this.el.style.opacity = "1";
  }

});

/* Button - Base class for all buttons
================================================================================ */
_V_.Button = _V_.Control.extend({

  init: function(player, options){
    this._super(player, options);

    this.on("click", this.onClick);
    this.on("focus", this.onFocus);
    this.on("blur", this.onBlur);

    $(this.el).hover(function() {
      $(".vjs-control-text", this).fadeToggle();
    });
  },

  createElement: function(type, attrs){
    // Add standard Aria and Tabindex info
    attrs = _V_.merge({
      className: this.buildCSSClass(),
      innerHTML: '<div><span class="vjs-control-text">' + (this.buttonText || "Need Text") + '</span></div>',
      role: "button",
      tabIndex: 0
    }, attrs);

    return this._super(type, attrs);
  },

  // Click - Override with specific functionality for button
  onClick: function(){},

  // Focus - Add keyboard functionality to element
  onFocus: function(){
    _V_.on(document, "keyup", _V_.proxy(this, this.onKeyPress));
  },

  // KeyPress (document level) - Trigger click when keys are pressed
  onKeyPress: function(event){
    // Check for space bar (32) or enter (13) keys
    if (event.which == 32 || event.which == 13) {
      event.preventDefault();
      this.onClick();
    }
  },

  // Blur - Remove keyboard triggers
  onBlur: function(){
    _V_.off(document, "keyup", _V_.proxy(this, this.onKeyPress));
  }

});

/* Play Button
================================================================================ */
_V_.PlayButton = _V_.Button.extend({

  buttonText: "Play",

  buildCSSClass: function(){
    return "vjs-play-button " + this._super();
  },

  onClick: function(){
    this.player.play();
  }

});

/* Pause Button
================================================================================ */
_V_.PauseButton = _V_.Button.extend({

  buttonText: "Pause",

  buildCSSClass: function(){
    return "vjs-pause-button " + this._super();
  },

  onClick: function(){
    this.player.pause();
  }

});

/* Play Toggle - Play or Pause Media
================================================================================ */
_V_.PlayToggle = _V_.Button.extend({
  init: function (player, options) {
    this._super(player, options);
    
    player.on('play',  _V_.proxy(this, this.onPlay));
    player.on('pause', _V_.proxy(this, this.onPause));
    player.on('ended', _V_.proxy(this, this.onEnded));
  },
  
  buttonText: 'Abspielen',
  
  buildCSSClass: function(){
    return "vjs-play-control play " + this._super();
  },

  // OnClick - Toggle between play and pause
  onClick: function(){
    if (this.player.paused()) {
      if ($(this.el).hasClass("replay")) {
        if(this.player.currentTime()) {
          this.player.currentTime(0);
        }
      }
      this.player.play();
      if (!$(this.el).hasClass("vjs-play-control")) {
        this.player.triggerEvent("playclicked");
      }
    } else {
      this.player.pause();
      if (!$(this.el).hasClass("vjs-play-control")) {
        this.player.triggerEvent("pauseclicked");
      }
    }
  },
  
  onPlay: function(){
    state.isEnded = false;
    this.updateButtonText("Pause");
    $(this.el).removeClass("play replay").addClass("pause");
  },
  
  onPause: function(){
    if (!state.isEnded) {
      this.updateButtonText("Abspielen");
      $(this.el).removeClass("pause").addClass("play");
    }
  },
  
  onEnded: function(){
    state.isEnded = true;
    this.updateButtonText("Erneut abspielen");
    $(this.el).removeClass("play pause").addClass("replay");
  }
});

/* Timed Comments
================================================================================ */

_V_.TimedCommentsController = _V_.Class.extend({
  current: null,
  
  init: function (player, options) {
    this.player = player;
    
    player.on('timeupdate', _V_.proxy(this, this.update));

    player.on('timedCommentsOn',  _V_.proxy(this, this.update));
    player.on('timedCommentsOff', _V_.proxy(this, this.update));
  },
  
  update: function () {
    var candidates, winner = -1;
    
    if (this.player.isFullScreen) {
      candidates = this.player.fullScreenTimedComments
    } else {
      candidates = this.player.normalTimedComments;
    }
    
    $.each(candidates, function(index, candidate) {
      if (candidate.requestPrivilegedDisplay) {
        winner = candidate.index;
        return false;
      }
      if (candidate.index > winner && candidate.requestDisplay) {
        winner = candidate.index;
      }
    });
    if (winner !== this.current) {
      // hide current
      if (this.current === 0 || this.current > 0) {
        if (this.player.normalTimedComments[this.current]) {
          $(this.player.normalTimedComments[this.current].el).stop(true, true).fadeOut();
        }
        if (this.player.fullScreenTimedComments[this.current]) {
          $(this.player.fullScreenTimedComments[this.current].el).stop(true, true).fadeOut();
        }
        this.player.trigger('hideTimedComment');
      }
       
      // display winner
      if (winner > -1) {
        this.current = winner;
        $(this.player.normalTimedComments[winner].el).stop(true, true).fadeIn();
        this.player.normalTimedComments[winner].position();
        $(this.player.fullScreenTimedComments[winner].el).stop(true, true).fadeIn();
        this.player.fullScreenTimedComments[winner].position();
        this.player.trigger('showTimedComment');
      } else {
        this.current = null;
      }
    }
  }
});

_V_.TimedComment = _V_.Component.extend({
  index: null,

  overlap: 0,

  init: function (player, options, index) {
    var self = this;
    this._super(player, _V_.merge(options, { el: this.create(player, options) }));
    this.index = index;

    $('.close', this.el).on('click', function() {
      self.close();
    });
    
    player.on('timeupdate',       _V_.proxy(this, this.update));
    player.on('fullscreenchange', _V_.proxy(this, this.update));
    
    player.on('timedCommentsOn',  _V_.proxy(this, this.reset));
    player.on('ended',            _V_.proxy(this, this.reset));
    
    player.on('timedCommentsOn',  _V_.proxy(this, this.activate));
    player.on('timedCommentsOff', _V_.proxy(this, this.deactivate));
    
    player.on('timedCommentUp',   _V_.proxy(this, this.up));
    player.on('timedCommentDown', _V_.proxy(this, this.down));
    
    player.on('halfControls',     _V_.proxy(this, this.configureHalf));
    player.on('fullControls',     _V_.proxy(this, this.configureFull));
    player.on('noControls',        _V_.proxy(this, this.configureHalf));
  },
  
  create: function (player, options) {
    var flag = null, pos = 100 * options.timed_comment.time / player.options.expectedDuration;
    
    if (options.timed_comment.user.producer) {
      flag = 'tutor';
    } else if (options.timed_comment.user.category_manager) {
      flag = 'editorial';
    } else if (options.timed_comment.user.team) {
      flag = 'team';
    }
    
    return $('<div id="timed-comment-' + options.timed_comment.id + '" class="timed-comment" style="display: none; left: ' + pos + '%"> \
                 <div class="content"> \
                   <div class="user"> \
                     <img src="' + options.timed_comment.user.avatar_url + '" width="45" height="45" />' + (options.timed_comment.user.avatar_flag.length > 0 ? '<div class="flag ' + options.timed_comment.user.avatar_flag + '"></div>' : '') + ' \
                     <strong>' + options.timed_comment.user.nick_name + '</strong>' + options.timed_comment.user.degree + ' \
                   </div> \
                   <div class="comment"> \
                     <strong>Kommentar von unserem Tutor:</strong>' + options.timed_comment.text + ' \
                   </div> \
                   <div class="close"></div> \
                 </div> \
                 <div class="tip"></div> \
               </div>').get();
  },
  
  activated: true,
  
  visible: false,
  
  closed: false,
  
  posBottom: 20,
  
  below: false,
  
  requestDisplay: false,
  
  requestPrivilegedDisplay: false,
  
  activate: function () {
    this.activated = true;
    this.update();
  },
  
  deactivate: function () {
    this.activated = false;
    this.update();
  },
  
  configureHalf: function () {
    this.posBottom = this.below ? 10 : 25;
  },
  
  configureFull: function () {
    this.posBottom = this.below ? 30 : 49;
  },
  
  update: function (condition) {
    var delta = this.player.currentTime() - this.options.timed_comment.time;
    
    if (delta >= -1 && delta < 5 && this.activated && condition) {
      if (!this.visible && !this.closed) {
        this.show(false);
      }
    } else if (this.visible) {
      this.hide();
    }
  },
  
  show: function (privileged, overlap) {
    this.overlap = overlap;
    //var posLeft, posRight, posBottom = this.posBottom, contentLeft = -330;
    
    if (privileged) {
      this.requestPrivilegedDisplay = true;
    } else {
      this.requestDisplay = true;
    }
    //$(this.el).stop(true, true).fadeIn();
    /*
    posLeft  = $(this.el).position().left;
    posRight = $(this.el).position().right;
    
    if (posLeft < 320) {
      contentLeft = (posLeft + overlap) * -1
    } else if (posRight < 320) {
      contentLeft = posRight + overlap - 660
    }
    
    $('.content', this.el).css('left', contentLeft + 'px');
    $(this.el).css('bottom', posBottom + 'px');
    */
    //this.player.trigger('showTimedComment');
    this.visible = true;
  },

  position: function () {
    var posLeft, posRight, posBottom = this.posBottom, contentLeft = -330, availableSpaceBelow;
    posLeft  = $(this.el).position().left;
    posRight = $(this.player.el).width() - posLeft;
    
    if (posLeft < 320) {
      contentLeft = (posLeft + this.overlap) * -1
    } else if (posRight < 320) {
      contentLeft = posRight + this.overlap - 660
    }
    
    $('.content', this.el).css('left', contentLeft + 'px');
    $(this.el).css('bottom', posBottom + 'px');
  
    availableSpaceBelow = $(window).scrollTop() + $(window).innerHeight() - $(this.player.el).offset().top - $(this.player.el).height();
    if (availableSpaceBelow > 100 && !this.player.isFullScreen) {
      this.below = true;
      $(this.el).addClass('below');
    } else {
      this.below = false;
      $(this.el).removeClass('below');
    }
  },
  
  hide: function () {
    this.requestDisplay = false;
    this.requestPrivilegedDisplay = false;
    this.player.timedCommentsController.update();
    //$(this.el).fadeOut();
    
    //this.player.trigger('hideTimedComment');
    this.visible = false;
  },
  
  close: function () {
    this.closed = true;
    this.hide();
  },
  
  reset: function () {
    this.closed = false;
  },
  
  up: function () {
    var bottom = this.below ? '30px' : '49px';
    $(this.el).stop(true, true).animate({ bottom: bottom }, 500);
  },
  
  down: function () {
    var bottom = this.below ? '10px' : '25px';
    $(this.el).stop(true, true).animate({ bottom: bottom }, 500);
  }
});

_V_.NormalTimedComment = _V_.TimedComment.extend({
  init: function (player, options, index) {
    this._super(player, options, index);
    $(player.el).parent().append(this.el);
  },
  
  update: function () {
    this._super(!this.player.isFullScreen);
  },
  
  show: function (privileged) {
    this._super(privileged, 10);
  }
});

_V_.FullScreenTimedComment = _V_.TimedComment.extend({
  init: function (player, options, index) {
    this._super(player, options, index);
    $(player.el).append(this.el);
  },
  
  update: function () {
    this._super(this.player.isFullScreen);
  },
  
  show: function (privileged) {
    this._super(privileged, 5);
  }
});

_V_.TimedCommentDot = _V_.Component.extend({
  index: null,
  
  init: function (player, options, index) {
    this._super(player, _V_.merge(options, { el: this.create(player, options) }));
    this.index = index;
    
    player.on('timedCommentsOn',  _V_.proxy(this, this.show));
    player.on('timedCommentsOff', _V_.proxy(this, this.hide));
  },
  
  create: function (player, options) {
    var pos = 100 * options.timed_comment.time / player.options.expectedDuration;
    return $('<div class="timed-comment-dot" style="left: ' + pos + '%"></div>').get();
  },
  
  show: function () {
    $(this.el).show();
  },
  
  hide: function () {
    $(this.el).hide();
  }
});

_V_.NormalTimedCommentDot = _V_.TimedCommentDot.extend({
  init: function (player, options, index) {
    var self = this;
    var delay = null;
    this._super(player, options, index);
    
    $('.vjs-progress-holder', $(player.el).parent()).append(this.el);
    
    $(this.el).hover(function () {
      delay = window.setTimeout(function () {
        player.normalTimedComments[self.index].requestPrivilegedDisplay = true;
        player.timedCommentsController.update();
      }, 1000);
    },
    function () {
      window.clearTimeout(delay);
      player.normalTimedComments[self.index].requestPrivilegedDisplay = false;
      player.timedCommentsController.update();
    });
  }
});

_V_.FullScreenTimedCommentDot = _V_.TimedCommentDot.extend({
  init: function (player, options, index) {
    var self = this;
    var delay = null;
    this._super(player, options, index);
    
    $('.vjs-progress-holder', $(player.el)).append(this.el);
    
    $(this.el).hover(function () {
      delay = window.setTimeout(function () {
        player.fullScreenTimedComments[self.index].requestPrivilegedDisplay = true;
        player.timedCommentsController.update();
      }, 1000);
    },
    function () {
      window.clearTimeout(delay);
      player.fullScreenTimedComments[self.index].requestPrivilegedDisplay = false;
      player.timedCommentsController.update();
    });
  }
});


_V_.TimedCommentsToggle = _V_.Button.extend({
  init: function (player, options) {
    this._super(player, options);
  },
  
  visible: true,
  
  buttonText: 'Kommentare aus',
  
  buildCSSClass: function(){
    return 'vjs-timed-comments-control ' + this._super();
  },
  
  onClick: function(){
    if (this.visible) {
      this.visible = false;
      this.player.trigger('timedCommentsOff');
      this.updateButtonText('Kommentare an');
      $(this.el).addClass('off');
    } else {
      this.visible = true;
      this.player.trigger('timedCommentsOn');
      this.updateButtonText('Kommentare aus');
      $(this.el).removeClass('off');
    }
  }
});

/* Fullscreen Toggle Behaviors
================================================================================ */
_V_.FullscreenToggle = _V_.Button.extend({
  init: function (player, options) {
    this._super(player, options);
    player.on('showPostroll', _V_.proxy(this, this.disable));
    player.on('hidePostroll', _V_.proxy(this, this.enable));
  },

  enabled: true,

  buttonText: "Vollbild",

  buildCSSClass: function(){
    return "vjs-fullscreen-control enabled " + this._super();
  },

  onClick: function(){
    if (this.enabled) {
      if (!this.player.isFullScreen) {
        this.player.requestFullScreen();
        this.updateButtonText("Vollbild verlassen");
      } else {
        this.player.cancelFullScreen();
        this.updateButtonText("Vollbild");
      }
    }
  },

  disable: function(){
    this.enabled = false;
    $(this.el).removeClass('enabled');
  },

  enable: function(){
    this.enabled = true;
    $(this.el).addClass('enabled');
  }

});

_V_.UpperRightLogo = _V_.Button.extend({
  init: function (player, options) {
    this._super(player, options);
    player.on('controlsvisible', _V_.proxy(this, this.show));
    player.on('controlshidden', _V_.proxy(this, this.hide));
  },
  createElement: function () {
    return this._super("div", {
        className: "vjs-upper-right-logo",
        innerHTML: "",
        style: "display: none"
    })
  },
  onClick: function () {
    this.player.triggerEvent("screenclicked");
  },
  show: function () {
    $(this.el).stop(true,true).fadeIn(500);
  },
  hide: function () {
    $(this.el).stop(true,true).fadeOut(500);
  }
});


_V_.BigPlayToggle = _V_.Button.extend({
  init: function (player, options) {
    this._super(player, options);
    player.on("playclicked", _V_.proxy(this, this.onPlayClicked));
    player.addEvent("pauseclicked", _V_.proxy(this, this.onPauseClicked));
    player.addEvent("screenclicked", _V_.proxy(this, this.onClick));
  },
  createElement: function () {
    return _V_.createElement("img", {
      className: "vjs-big-play-toggle",
      style: "display: none"
    })
  },
  onPlayClicked: function () {
    $(this.el).attr('src', '/images/new_images/player/big_play_icon.png');
    this.flash();
  },
  onPauseClicked: function () {
    $(this.el).attr('src', '/images/new_images/player/big_pause_icon.png');
    this.flash();
  },
  onClick: function () {
    if (this.player.paused()) {
      this.player.play();
      this.onPlayClicked();
    } else {
      this.player.pause()
      this.onPauseClicked();
    }
  }
});


/* Big Play Button
================================================================================ */
_V_.BigPlayButton = _V_.Button.extend({
  init: function(player, options){
    this._super(player, options);

    player.on("play", _V_.proxy(this, this.hide));
    player.on("ended", _V_.proxy(this, this.show));
  },

  createElement: function(){
    return _V_.createElement("img", {
      className: "vjs-big-play-button",
      src: "/images/new_images/player/big_play_icon.png"
    })
  },

  onClick: function(){
    // Go back to the beginning if big play button is showing at the end.
    // Have to check for current time otherwise it might throw a 'not ready' error.
    if(this.player.currentTime()) {
      this.player.currentTime(0);
    }
    this.player.play();
    this.player.triggerEvent("posterclicked");
  }
});

/* Loading Spinner
================================================================================ */
_V_.LoadingSpinner = _V_.Component.extend({
  init: function(player, options){
    this._super(player, options);

    player.on("canplay", _V_.proxy(this, this.hide));
    player.on("canplaythrough", _V_.proxy(this, this.hide));
    player.on("playing", _V_.proxy(this, this.hide));

    player.on("seeking", _V_.proxy(this, this.show));
    player.on("error", _V_.proxy(this, this.show));

    // Not showing spinner on stalled any more. Browsers may stall and then not trigger any events that would remove the spinner.
    // Checked in Chrome 16 and Safari 5.1.2. http://help.videojs.com/discussions/problems/883-why-is-the-download-progress-showing
    // player.on("stalled", _V_.proxy(this, this.show));

    player.on("waiting", _V_.proxy(this, this.show));
  },

  createElement: function(){
    return _V_.createElement("img", {
      className: "vjs-loading-spinner",
      src: "/images/new_images/player/spinner.gif",
      style: "display: none"
    })
  }
});

/* Postroll
================================================================================ */
_V_.Postroll = _V_.Component.extend({

  postroll: null,

  init: function(player, options){
    this.postroll = $('.vjs-postroll');
    this._super(player, options);
    if (this.postroll.length > 0) {
      player.on("ended", _V_.proxy(this, this.show));
      player.on("play", _V_.proxy(this, this.hide));
      player.on("seeking", _V_.proxy(this, this.hide));
    }
  },

  createElement: function(){
    return _V_.createElement("div", {
      className: this.postroll.length > 0 ? this.postroll.attr('class') : "",
      innerHTML: this.postroll.length > 0 ? this.postroll.html() : "",
      style: "display: none"
    })
  },

  show: function(){
    if (this.player.isFullScreen)
      this.player.cancelFullScreen();
    $(this.el).show();
    this.player.triggerEvent("showPostroll");
  },

  hide: function(){
    $(this.el).hide();
    this.player.triggerEvent("hidePostroll");
  }
});

/* Time
================================================================================ */
_V_.TimeDisplay = _V_.Component.extend({
  init: function (player, options) {
    this._super(player, options);
    player.addEvent("timeupdate", _V_.proxy(this, this.updateContent))
  },
  createElement: function() {
    var el = this._super("div", {
      className: "vjs-time-controls"
    });

    var divider = _V_.createElement("span", {
      className: "vjs-time-divider",
      innerHTML: "/"
    });

    this.currentTime = _V_.createElement("span", {
      className: "vjs-current-time-display",
      innerHTML: "0:00"
    });

    this.duration = _V_.createElement("span", {
      className: "vjs-duration-display",
      innerHTML: "0:00"
    });

    el.appendChild(_V_.createElement("div").appendChild(this.currentTime));
    el.appendChild(_V_.createElement("div").appendChild(divider));
    el.appendChild(_V_.createElement("div").appendChild(this.duration));
    return el;
  },

  updateContent: function() {
    var time = (this.player.scrubbing) ? this.player.values.currentTime : this.player.currentTime();
    this.currentTime.innerHTML = _V_.formatTime(time, this.player.duration())

    if (this.player.duration()) {
      this.duration.innerHTML = _V_.formatTime(this.player.duration())
    }
  }
});


_V_.CurrentTimeDisplay = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);

    player.on("timeupdate", _V_.proxy(this, this.updateContent));
  },

  createElement: function(){
    var el = this._super("div", {
      className: "vjs-current-time vjs-time-controls vjs-control"
    });

    this.content = _V_.createElement("div", {
      className: "vjs-current-time-display",
      innerHTML: '0:00'
    });

    el.appendChild(_V_.createElement("div").appendChild(this.content));
    return el;
  },

  updateContent: function(){
    // Allows for smooth scrubbing, when player can't keep up.
    var time = (this.player.scrubbing) ? this.player.values.currentTime : this.player.currentTime();
    this.content.innerHTML = _V_.formatTime(time, this.player.duration());
  }

});

_V_.DurationDisplay = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);

    player.on("timeupdate", _V_.proxy(this, this.updateContent));
  },

  createElement: function(){
    var el = this._super("div", {
      className: "vjs-duration vjs-time-controls vjs-control"
    });

    this.content = _V_.createElement("div", {
      className: "vjs-duration-display",
      innerHTML: '0:00'
    });

    el.appendChild(_V_.createElement("div").appendChild(this.content));
    return el;
  },

  updateContent: function(){
    if (this.player.duration()) { this.content.innerHTML = _V_.formatTime(this.player.duration()); }
  }

});

// Time Separator (Not used in main skin, but still available, and could be used as a 'spare element')
_V_.TimeDivider = _V_.Component.extend({

  createElement: function(){
    return this._super("div", {
      className: "vjs-time-divider",
      innerHTML: '<div><span>/</span></div>'
    });
  }

});

_V_.RemainingTimeDisplay = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);

    player.on("timeupdate", _V_.proxy(this, this.updateContent));
  },

  createElement: function(){
    var el = this._super("div", {
      className: "vjs-remaining-time vjs-time-controls vjs-control"
    });

    this.content = _V_.createElement("div", {
      className: "vjs-remaining-time-display",
      innerHTML: '-0:00'
    });

    el.appendChild(_V_.createElement("div").appendChild(this.content));
    return el;
  },

  updateContent: function(){
    if (this.player.duration()) { this.content.innerHTML = "-"+_V_.formatTime(this.player.remainingTime()); }

    // Allows for smooth scrubbing, when player can't keep up.
    // var time = (this.player.scrubbing) ? this.player.values.currentTime : this.player.currentTime();
    // this.content.innerHTML = _V_.formatTime(time, this.player.duration());
  }

});

/* Slider - Parent for seek bar and volume slider
================================================================================ */
_V_.Slider = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);

    player.on(this.playerEvent, _V_.proxy(this, this.update));

    this.on("mousedown", this.onMouseDown);
    this.on("focus", this.onFocus);
    this.on("blur", this.onBlur);

    this.player.on("controlsvisible", this.proxy(this.update));

    // This is actually to fix the volume handle position. http://twitter.com/#!/gerritvanaaken/status/159046254519787520
    // this.player.one("timeupdate", this.proxy(this.update));

    this.update();
  },

  createElement: function(type, attrs) {
    attrs = _V_.merge({
      role: "slider",
      "aria-valuenow": 0,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      tabIndex: 0
    }, attrs);

    return this._super(type, attrs);
  },

  onMouseDown: function(event){
    event.preventDefault();
    _V_.blockTextSelection();

    _V_.on(document, "mousemove", _V_.proxy(this, this.onMouseMove));
    _V_.on(document, "mouseup", _V_.proxy(this, this.onMouseUp));

    this.onMouseMove(event);
    _V_.addClass(this.el.parentElement, "dragging");
    state.isDragging = true;
  },

  onMouseUp: function(event) {
    _V_.unblockTextSelection();
    _V_.off(document, "mousemove", this.onMouseMove, false);
    _V_.off(document, "mouseup", this.onMouseUp, false);

    this.update();
    _V_.removeClass(this.el.parentElement, "dragging");
    state.isDragging = false;
  },

  update: function(){
    // If scrubbing, we could use a cached value to make the handle keep up with the user's mouse.
    // On HTML5 browsers scrubbing is really smooth, but some flash players are slow, so we might want to utilize this later.
    // var progress =  (this.player.scrubbing) ? this.player.values.currentTime / this.player.duration() : this.player.currentTime() / this.player.duration();

    var barProgress,
        progress = this.getPercent();
        handle = this.handle,
        bar = this.bar;

    // Protect against no duration and other division issues
    if (isNaN(progress)) { progress = 0; }

    barProgress = progress;

    // If there is a handle, we need to account for the handle in our calculation for progress bar
    // so that it doesn't fall short of or extend past the handle.
    if (handle) {

      var box = this.el,
          boxWidth = box.offsetWidth,

          handleWidth = handle.el.offsetWidth,

          // The width of the handle in percent of the containing box
          // In IE, widths may not be ready yet causing NaN
          handlePercent = (handleWidth) ? handleWidth / boxWidth : 0,

          // Get the adjusted size of the box, considering that the handle's center never touches the left or right side.
          // There is a margin of half the handle's width on both sides.
          //boxAdjustedPercent = 1 - handlePercent;
          boxAdjustedPercent = 1; //- handlePercent;

          // Adjust the progress that we'll use to set widths to the new adjusted box width
          adjustedProgress = progress * boxAdjustedPercent,

          // The bar does reach the left side, so we need to account for this in the bar's width
          //barProgress = adjustedProgress + (handlePercent / 2);
          barProgress = adjustedProgress;// + (handlePercent / 2);

      // Move the handle from the left based on the adjected progress
      handle.el.style.left = _V_.round(adjustedProgress * 100, 2) + "%";
    }

    // Set the new bar width
    bar.el.style.width = _V_.round(barProgress * 100, 2) + "%";
  },

  calculateDistance: function(event){
    var box = this.el,
        boxX = _V_.findPosX(box),
        boxW = box.offsetWidth,
        handle = this.handle;

    if (handle) {
      var handleW = handle.el.offsetWidth;

      // Adjusted X and Width, so handle doesn't go outside the bar
      boxX = boxX + (handleW / 2);
      boxW = boxW - handleW;
    }

    // Percent that the click is through the adjusted area
    return Math.max(0, Math.min(1, (event.pageX - boxX) / boxW));
  },

  onFocus: function(event){
    _V_.on(document, "keyup", _V_.proxy(this, this.onKeyPress));
  },

  onKeyPress: function(event){
    if (event.which == 37) { // Left Arrow
      event.preventDefault();
      this.stepBack();
    } else if (event.which == 39) { // Right Arrow
      event.preventDefault();
      this.stepForward();
    }
  },

  onBlur: function(event){
    _V_.off(document, "keyup", _V_.proxy(this, this.onKeyPress));
  }
});


/* Progress
================================================================================ */

// Progress Control: Seek, Load Progress, and Play Progress
_V_.ProgressControl = _V_.Component.extend({
  init: function(player, options){
    this.player = player;
    this.el = $('<div class="vjs-progress-control vjs-control"></div>').get();
    if (options && options === 'fullScreen') {
      $(player.el).append(this.el);
    } else {
      $(player.el).parent().append(this.el);
    }
    $(this.el).bind('mouseenter', this.proxy(this.enterProgressControls));
    $(this.el).bind('mouseleave', this.proxy(this.leaveProgressControls));
  },

  options: {
    //components: {
      //"seekBar": {}
    //}
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-progress-control vjs-control"
    });
  },
  enterProgressControls: function() {
    this.player.trigger('lockControls');
  },
  
  leaveProgressControls: function() {
    this.player.trigger('unlockControls');
  }

});

// Seek Bar and holder for the progress bars
_V_.SeekBar = _V_.Slider.extend({

  options: {
    components: {
      "loadProgressBar": {},

      // Set property names to bar and handle to match with the parent Slider class is looking for
      "bar": { componentClass: "PlayProgressBar" },
      "handle": { componentClass: "SeekHandle" }
    }
  },

  playerEvent: "timeupdate",

  init: function(player, options){
    this._super(player, options);
    if (options && options === 'fullScreen') {
      $('.vjs-progress-control', player.el).append(this.el);
    } else {
      $('.vjs-progress-control', $(player.el).parent()).eq(0).append(this.el);
    }
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-progress-holder"
    });
  },

  getPercent: function(){
    return this.player.currentTime() / this.player.duration();
  },

  onMouseDown: function(event){
    this._super(event);

    this.player.scrubbing = true;

    this.videoWasPlaying = !this.player.paused();
    this.player.pause();
  },

  onMouseMove: function(event){
    var newTime = this.calculateDistance(event) * this.player.duration();

    // Don't let video end while scrubbing.
    if (newTime == this.player.duration()) { newTime = newTime - 0.1; }

    // Set new time (tell player to seek to new time)
    this.player.currentTime(newTime);
  },

  onMouseUp: function(event){
    this._super(event);

    this.player.scrubbing = false;
    if (this.videoWasPlaying) {
      this.player.play();
    }
  },

  stepForward: function(){
    this.player.currentTime(this.player.currentTime() + 1);
  },

  stepBack: function(){
    this.player.currentTime(this.player.currentTime() - 1);
  }

});

// Load Progress Bar
_V_.LoadProgressBar = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);
    player.on("progress", _V_.proxy(this, this.update));
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-load-progress",
      innerHTML: '<span class="vjs-control-text">Loaded: 0%</span>'
    });
  },

  update: function(){
    if (this.el.style) { this.el.style.width = _V_.round(this.player.bufferedPercent() * 100, 2) + "%"; }
  }

});

// Play Progress Bar
_V_.PlayProgressBar = _V_.Component.extend({

  createElement: function(){
    return this._super("div", {
      className: "vjs-play-progress",
      innerHTML: '<span class="vjs-control-text">Progress: 0%</span>'
    });
  }

});

// Seek Handle
// SeekBar Behavior includes play progress bar, and seek handle
// Needed so it can determine seek position based on handle position/size
_V_.SeekHandle = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);
    player.on('timeupdate', _V_.proxy(this, this.update));
    $(this.el).hover(function() {
      $(".vjs-control-text", this).fadeToggle();
    });
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-seek-handle",
      innerHTML: '<span class="vjs-control-text">00:00</span>'
    });
  },

  update: function(){
    var time = parseInt(this.player.currentTime());
    var minutes = parseInt(time / 60);
    var seconds = time % 60;
    var timeString = (minutes > 9 ? minutes.toString() : '0' + minutes.toString()) + ':' + (seconds > 9 ? seconds.toString() : '0' + seconds.toString());
    this.updateButtonText(timeString);
  }

});

/* Volume Scrubber
================================================================================ */
// Progress Control: Seek, Load Progress, and Play Progress
_V_.VolumeControl = _V_.Component.extend({

  options: {
    components: {
      "volumeBar": {}
    }
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-volume-control vjs-control"
    });
  }

});

_V_.VolumeBar = _V_.Slider.extend({

  options: {
    components: {
      "bar": { componentClass: "VolumeLevel" },
      "handle": { componentClass: "VolumeHandle" }
    }
  },

  playerEvent: "volumechange",

  createElement: function(){
    return this._super("div", {
      className: "vjs-volume-bar"
    });
  },

  onMouseMove: function(event) {
    this.player.volume(this.calculateDistance(event));
  },

  getPercent: function(){
   return this.player.volume();
  },

  stepForward: function(){
    this.player.volume(this.player.volume() + 0.1);
  },

  stepBack: function(){
    this.player.volume(this.player.volume() - 0.1);
  }
});

_V_.VolumeLevel = _V_.Component.extend({

  createElement: function(){
    return this._super("div", {
      className: "vjs-volume-level",
      innerHTML: '<span class="vjs-control-text"></span>'
    });
  }

});

_V_.VolumeHandle = _V_.Component.extend({

  createElement: function(){
    return this._super("div", {
      className: "vjs-volume-handle",
      innerHTML: '<span class="vjs-control-text"></span>'
      // tabindex: 0,
      // role: "slider", "aria-valuenow": 0, "aria-valuemin": 0, "aria-valuemax": 100
    });
  }

});

_V_.MuteToggle = _V_.Button.extend({

  init: function(player, options){
    this._super(player, options);

    player.on("volumechange", _V_.proxy(this, this.update));
  },

  createElement: function(){
    return this._super("div", {
      className: "vjs-mute-control vjs-control",
      innerHTML: '<div><span class="vjs-control-text">Mute</span></div>'
    });
  },

  onClick: function(event){
    if (this.player.muted()) {
      this.updateButtonText("Mute");
      this.player.muted(false);
      this.player.volume(userVolume);
    } else {
      this.updateButtonText("Unmute");
      userVolume = this.player.volume();
      this.player.muted(true);
      this.player.volume(0);
    }
  },

  update: function(event){
    var vol = this.player.volume(),
        level = 3;

    if (vol == 0 || this.player.muted()) {
      level = 0;
    } else if (vol < 0.33) {
      level = 1;
    } else if (vol < 0.67) {
      level = 2;
    }

    /* TODO improve muted icon classes */
    _V_.each.call(this, [0,1,2,3], function(i){
      _V_.removeClass(this.el, "vjs-vol-"+i);
    });
    _V_.addClass(this.el, "vjs-vol-"+level);
  }

});


/* Poster Image
================================================================================ */
_V_.PosterImage = _V_.Button.extend({
  init: function(player, options){
    this._super(player, options);

    if (!this.player.options.poster) {
      this.hide();
    }

    player.on("play", _V_.proxy(this, this.hide));
  },

  createElement: function(){
    return _V_.createElement("img", {
      className: "vjs-poster",
      src: this.player.options.poster,

      // Don't want poster to be tabbable.
      tabIndex: -1
    });
  },

  onClick: function(){
    this.player.triggerEvent("posterclicked");
    this.player.play();
  }
});

/* Menu
================================================================================ */
// The base for text track and settings menu buttons.
_V_.Menu = _V_.Component.extend({

  init: function(player, options){
    this._super(player, options);
  },

  addItem: function(component){
    this.addComponent(component);
    component.on("click", this.proxy(function(){
      this.unlockShowing();
    }));
  },

  createElement: function(){
    return this._super("ul", {
      className: "vjs-menu"
    });
  }

});

_V_.MenuItem = _V_.Button.extend({

  init: function(player, options){
    this._super(player, options);

    if (options.selected) {
      this.addClass("vjs-selected");
    }
  },

  createElement: function(type, attrs){
    return this._super("li", _V_.merge({
      className: "vjs-menu-item",
      innerHTML: this.options.label
    }, attrs));
  },

  onClick: function(){
    this.selected(true);
  },

  selected: function(selected){
    if (selected) {
      this.addClass("vjs-selected");
    } else {
      this.removeClass("vjs-selected")
    }
  }

});
