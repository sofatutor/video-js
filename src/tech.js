/* Playback Technology - Base class for playback technologies
================================================================================ */
_V_.PlaybackTech = _V_.Component.extend({});

/* // UNCOMMENT IN DEVELOPMENT (if you like)
// Create placeholder methods for each that warn when a method isn't supported by the current playback technology
_V_.apiMethods = "play,pause,paused,currentTime,setCurrentTime,duration,buffered,volume,setVolume,muted,setMuted,width,height,supportsFullScreen,enterFullScreen,src,load,currentSrc,preload,setPreload,autoplay,setAutoplay,loop,setLoop,error,networkState,readyState,seeking,initialTime,startOffsetTime,played,seekable,ended,videoTracks,audioTracks,videoWidth,videoHeight,textTracks,defaultPlaybackRate,playbackRate,mediaGroup,controller,controls,defaultMuted".split(",");

_V_.each(_V_.apiMethods, function(methodName){
  _V_.PlaybackTech.prototype[methodName] = function(){
    throw new Error("The '"+methodName+"' method is not available on the playback technology's API");
  }
});
*/

////////////////////////////////////////////////////////////////////////////
// HTML5 TECH //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
_V_.html5 = _V_.PlaybackTech.extend({
  init: function (player, options) {
    var el,
        html5Events = 'error,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,timeupdate,progress,play,pause,volumechange'.split(',')
    
    this.player = player;
    
    if (player.tag)
      $(player.tag).remove();
    
    el = this.el = $('<video>').attr({
      id:       player.el.id + '_html5_api',
      'class':  'vjs-tech',
      src:      options.source && options.source.src,
      autoplay: options.autoplay,
      preload:  options.preload,
      loop:     options.loop,
      muted:    options.muted,
      poster:   options.poster
    }).appendTo(player.el).get(0);
    
    $.each(html5Events, function(index, event) {
      $(el).on(event, function () {
        $(player.el).trigger(event);
      });
    });
    
    // Chrome and Safari both have issues with autoplay.
    // In Safari (5.1.1), when we move the video element into the container div, autoplay doesn't work.
    // In Chrome (15), if you have autoplay + a poster + no controls, the video gets hidden (but audio plays)
    // This fixes both issues. Need to wait for API, so it updates displays correctly
    player.ready(function(){
      if (this.options.autoplay && this.paused()) {
        this.tag.poster = null; // Chrome Fix. Fixed in Chrome v16.
        this.play();
      }
    });
    
    this.triggerReady();
  },
  
  destroy: function () {
    this.player.tag = false;
    $(this.el).remove();
  },
  
  // Mappings
  
  play: function () {
    this.el.play();
  },
  
  pause: function () {
    this.el.pause();
  },
  
  load: function () {
    this.el.load();
  },
  
  src: function (src) {
    this.el.src = src;
  },
  
  poster: function () {
    return this.el.poster;
  },
  
  buffered: function () {
    return this.el.buffered;
  },
  
  supportsFullScreen: function () {
    if (typeof this.el.webkitEnterFullScreen == 'function') {
      // Seems to be broken in Chromium/Chrome && Safari in Leopard
      if (!navigator.userAgent.match("Chrome") && !navigator.userAgent.match("Mac OS X 10.5")) {
        return true;
      }
    }
    return false;
  },
  
  enterFullScreen: function () {
    try {
      this.el.webkitEnterFullScreen();
    } catch (e) {
      if (e.code == 11) {
        _V_.log("VideoJS: Video not ready.")
      }
    }
  },
  
  exitFullScreen: function () {
    try {
      this.el.webkitExitFullScreen();
    } catch (e) {
      if (e.code == 11) {
        _V_.log("VideoJS: Video not ready.")
      }
    }
  },
  
  setPreload: function (value) {
    this.el.preload = value;
  },
  
  preload: function () {
    return this.el.preload;
  },
  
  setCurrentTime: function (value) {
    try {
      this.el.currentTime = value;
      } catch(e) {
        _V_.log(e, "Video isn't ready. (VideoJS)");
    }
  },
  
  currentTime: function () {
    return this.el.currentTime;
  },
  
  setAutoplay: function (value) {
    this.el.autoplay = value;
  },
  
  autoplay: function () {
    return this.el.autoplay;
  },
  
  setLoop: function (value) {
    this.el.loop = value;
  },
  
  loop: function () {
    return this.el.loop;
  },
  
  setVolume: function (value) {
    this.el.volume = value;
  },
  
  volume: function () {
    return this.el.volume;
  },
  
  setMuted: function (value) {
    this.el.muted = value;
  },
  
  muted: function () {
    return this.el.muted;
  },
  
  error: function () {
    return this.el.error;
  },
  
  currentSrc: function () {
    return this.el.currentSrc;
  },
  
  duration: function () {
    return this.el.duration || 0;
  },
  
  paused: function () {
    return this.el.paused;
  },
  
  ended: function () {
    return this.el.ended;
  }
});

/* HTML5 Support Testing -------------------------------------------------------- */

_V_.html5.isSupported = function () {
  return !!document.createElement("video").canPlayType;
};

_V_.html5.canPlaySource = function (srcObj) {
  return !!document.createElement("video").canPlayType(srcObj.type);
};

/* HTML5 Device Fixes ---------------------------------------------------------- */

_V_.html5.prototype.support = {
  // Support for tech specific full screen. (webkitEnterFullScreen, not requestFullscreen)
  // http://developer.apple.com/library/safari/#documentation/AudioVideo/Reference/HTMLVideoElementClassReference/HTMLVideoElement/HTMLVideoElement.html
  // Seems to be broken in Chromium/Chrome && Safari in Leopard
  fullscreen: (typeof _V_.testVid.webkitEnterFullScreen !== undefined) ? (!_V_.ua.match("Chrome") && !_V_.ua.match("Mac OS X 10.5") ? true : false) : false
};

// Android
if (_V_.isAndroid()) {
  // Override Android 2.2 and less canPlayType method which is broken
  if (_V_.androidVersion() < 3) {
    document.createElement("video").constructor.prototype.canPlayType = function(type){
      return (type && type.toLowerCase().indexOf("video/mp4") != -1) ? "maybe" : "";
    };
  }
}

////////////////////////////////////////////////////////////////////////////
// FLASH TECH //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
_V_.flash = _V_.PlaybackTech.extend({
  init: function (player, options) {
    this.player = player;

    var source = options.source,

        // Which element to embed in
        parentEl = options.parentEl,

        // Create a temporary element to be replaced by swf object
        placeHolder = this.el = _V_.createElement("div", { id: parentEl.id + "_temp_flash" }),

        // Generate ID for swf object
        objId = player.el.id+"_flash_api",

        // Store player options in local var for optimization
        playerOptions = player.options,

        // Merge default flashvars with ones passed in to init
        flashVars = _V_.merge({

          // SWF Callback Functions
          readyFunction: "_V_.flash.onReady",
          eventProxyFunction: "_V_.flash.onEvent",
          errorEventProxyFunction: "_V_.flash.onError",

          // Player Settings
          autoplay: playerOptions.autoplay,
          preload: playerOptions.preload,
          loop: playerOptions.loop,
          muted: playerOptions.muted

        }, options.flashVars),

        // Merge default parames with ones passed in
        params = _V_.merge({
          wmode: "opaque", // Opaque is needed to overlay controls, but can affect playback performance
          bgcolor: "#000000" // Using bgcolor prevents a white flash when the object is loading
        }, options.params),

        // Merge default attributes with ones passed in
        attributes = _V_.merge({
          id: objId,
          name: objId, // Both ID and Name needed or swf to identifty itself
          'class': 'vjs-tech'
        }, options.attributes)
    ;

    // If source was supplied pass as a flash var.
    if (source) {
      flashVars.src = encodeURIComponent(_V_.getAbsoluteURL(source.src));
    }

    // Add placeholder to player div
    _V_.insertFirst(placeHolder, parentEl);

    // Having issues with Flash reloading on certain page actions (hide/resize/fullscreen) in certain browsers
    // This allows resetting the playhead when we catch the reload
    if (options.startTime) {
      this.ready(function(){
        this.load();
        this.play();
        this.currentTime(options.startTime);
      });
    }

    _V_.flash.embed(options.swf, placeHolder, flashVars, params, attributes);
  },
  
  destroy: function(){
    $(this.el).remove();
  },
  
  // Mappings
  
  play: function () {
    return this.el.vjs_play();
  },
  
  pause: function () {
    return this.el.vjs_pause();
  },
  
  load: function () {
    return this.el.vjs_load();
  },
  
  src: function (src) {
    // Make sure source URL is absolute.
    src = _V_.getAbsoluteURL(src);
    
    this.el.vjs_src(src);
    
    // Currently the SWF doesn't autoplay if you load a source later.
    // e.g. Load player w/ no source, wait 2s, set src.
    if (this.player.autoplay()) {
      var tech = this;
      setTimeout(function(){ tech.play(); }, 0);
    }
  },
  
  poster: function () {
    this.el.vjs_getProperty('poster');
  },
  
  buffered: function () {
    return _V_.createTimeRange(0, this.el.vjs_getProperty('buffered'));
  },
  
  supportsFullScreen: function () {
    return false; // Flash does not allow fullscreen through javascript
  },
  
  enterFullScreen: function(){
    return false;
  },
  
  // no exitFullScreen method
  
  setPreload: function (value) {
    return this.el.vjs_setProperty('preload', value);
  },
  
  preload: function () {
    return this.el.vjs_getProperty('preload');
  },
  
  setCurrentTime: function (value) {
    return this.el.vjs_setProperty('currentTime', value);
  },
  
  currentTime: function () {
    return this.el.vjs_getProperty('currentTime');
  },
  
  setAutoplay: function (value) {
    return this.el.vjs_setProperty('autoplay', value);
  },
  
  autoplay: function () {
    return this.el.vjs_getProperty('autoplay');
  },
  
  setLoop: function (value) {
    return this.el.vjs_setProperty('loop', value);
  },
  
  loop: function () {
    return this.el.vjs_getProperty('loop');
  },
  
  setVolume: function (value) {
    return this.el.vjs_setProperty('volume', value);
  },
  
  volume: function () {
    return this.el.vjs_getProperty('volume');
  },
  
  setMuted: function (value) {
    return this.el.vjs_setProperty('muted', value);
  },
  
  muted: function () {
    return this.el.vjs_getProperty('muted');
  },
  
  error: function () {
    return this.el.vjs_getProperty('error');
  },
  
  currentSrc: function () {
    return this.el.vjs_getProperty('currentSrc');
  },
  
  duration: function () {
    return this.el.vjs_getProperty('duration');
  },
  
  paused: function () {
    return this.el.vjs_getProperty('paused');
  },
  
  ended: function () {
    return this.el.vjs_getProperty('ended');
  }
});

////////////////////////////////////////////////////////////////////////////
// Flash requirements //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// Check for flash plugin version >= 10
_V_.flash.isSupported = function () {
  var version = function () {
    var v = '0,0,0';
    // IE
    try {
      v = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
    // other browsers
    } catch(e) {
      try {
        if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
          v = (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
        }
      } catch(e) {}
    }
    return v.split(",");
  }
  
  return version()[0] >= 10;
};

// Check, if SWF can play video type
_V_.flash.canPlaySource = function(srcObj) {
  if (srcObj.type in _V_.flash.prototype.support.formats) { return "maybe"; }
};

_V_.flash.prototype.support = {
  formats: {
    "video/flv": "FLV",
    "video/x-flv": "FLV",
    "video/mp4": "MP4",
    "video/m4v": "MP4"
  },

  // Optional events that we can manually mimic with timers
  progressEvent: false,
  timeupdateEvent: false,

  // Resizing plugins using request fullscreen reloads the plugin
  fullscreenResize: ($.browser.mozilla && parseInt($.browser.version) >= 13)
};

////////////////////////////////////////////////////////////////////////////
// Flash callback functions ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// Callback function, that is called by the SWF to indicate, that it's ready
_V_.flash.onReady = function (currSwf) {
  // The SWF isn't alwasy ready when it says it is. Sometimes the API functions still need to be added to the object.
  // If it's not ready, we set a timeout to check again shortly.
  var checkReady = function () {
    // Check if API property exists
    if (tech.el.vjs_getProperty) {
      
      // If so, tell tech it's ready
      tech.triggerReady();
      
    // Otherwise wait longer.
    } else {
      
      setTimeout(function(){
        checkReady();
      }, 50);
      
    }
  }
  
  var el = _V_.el(currSwf);
  
  // Get player from box
  // On firefox reloads, el might already have a player
  var player = el.player || el.parentNode.player,
      tech = player.tech;
  
  // Reference player on tech element
  el.player = player;
  
  // Update reference to playback technology element
  tech.el = el;
  
  checkReady();
};


// Callback function for non-error events
_V_.flash.onEvent = function (swfID, eventName) {
  var player = _V_.el(swfID).player;
  
  // commented events are possibly sent by the SWF, but not used in the player
  switch (eventName) {
    //case 'onsrcchange':
    //  player.trigger('onsrcchange');
    //  break;
    //case 'loadstart':
    //  player.trigger('loadstart');
    //  break;
    case 'playing':
      player.trigger('playing');
      break;
    case 'pause':
      player.trigger('pause');
      break;
    case 'play':
      player.trigger('play');
      break;
    case 'seeking':
      player.trigger('seeking');
      break;
    case 'seeked':
      player.trigger('seeked');
      break;
    //case 'loadeddata':
    //  player.trigger('loadeddata');
    //  break;
    case 'waiting':
      player.trigger('waiting');
      break;
    //case 'emptied':
    //  player.trigger('emptied');
    //  break;
    case 'ended':
      player.trigger('ended');
      break;
    //case 'loadedmetadata':
    //  player.trigger('loadedmetadata');
    //  break;
    //case 'durationchange':
    //  player.trigger('durationchange');
    //  break;
    case 'canplay':
      player.trigger('canplay');
      break;
    case 'canplaythrough':
      player.trigger('canplaythrough');
      break;
    case 'volumechange':
      player.trigger('volumechange');
      break;
    //case 'rtmpconnected':
    //  player.trigger('rtmpconnected');
    //  break;
    //case 'rtmpretry':
    //  player.trigger('rtmpretry');
    //  break;
    default:
      //player.trigger(eventName);
  }
};

// Callback function for error events
_V_.flash.onError = function (swfID, eventName) {
  var player = _V_.el(swfID).player;
  
  // possible events:
  //switch (eventName) {
  //  case 'srcnotset':
  //    player.trigger('srcnotset');
  //    break;
  //  case 'srcnotfound':
  //    player.trigger('srcnotfound');
  //    break;
  //  case 'rtmpconnectfailure':
  //    player.trigger('rtmpconnectfailure');
  //    break;
  //  case 'propertynotfound':
  //    player.trigger('propertynotfound');
  //    break;
  //  case 'posterioerror':
  //    player.trigger('posterioerror');
  //    break;
  //  case 'postersecurityerror':
  //    player.trigger('postersecurityerror');
  //    break;
  //  case 'unsupportedmode':
  //    player.trigger('unsupportedmode');
  //    break;
  //  default:
  //    player.trigger(eventName);
  //}
  
  // but we don't care about specific errors
  player.trigger('severeError');
  
  _V_.log('Flash Error', eventName, swfID);
};

////////////////////////////////////////////////////////////////////////////
// Flash embedding /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// Flash embedding method. Only used in non-iframe mode
_V_.flash.embed = function(swf, placeHolder, flashVars, params, attributes){
  var getEmbedCode = function (swf, flashVars, params, attributes) {
    var objTag = '<object type="application/x-shockwave-flash"',
        flashVarsString = '',
        paramsString = ''
        attrsString = '';

    // Convert flash vars to string
    if (flashVars) {
      _V_.eachProp(flashVars, function(key, val){
        flashVarsString += (key + "=" + val + "&amp;");
      });
    }

    // Add swf, flashVars, and other default params
    params = _V_.merge({
      movie: swf,
      flashvars: flashVarsString,
      allowScriptAccess: "always", // Required to talk to swf
      allowNetworking: "all" // All should be default, but having security issues.
    }, params);

    // Create param tags string
    _V_.eachProp(params, function(key, val){
      paramsString += '<param name="'+key+'" value="'+val+'" />';
    });

    attributes = _V_.merge({
      // Add swf to attributes (need both for IE and Others to work)
      data: swf,

      // Default to 100% width/height
      width: "100%",
      height: "100%"

    }, attributes);

    // Create Attributes string
    _V_.eachProp(attributes, function(key, val){
      attrsString += (key + '="' + val + '" ');
    });

    return objTag + attrsString + '>' + paramsString + '</object>';
  }

  var code = getEmbedCode(swf, flashVars, params, attributes),

      // Get element by embedding code and retrieving created element
      obj = _V_.createElement("div", { innerHTML: code }).childNodes[0],

      par = placeHolder.parentNode
  ;

  placeHolder.parentNode.replaceChild(obj, placeHolder);

  return obj;
};
