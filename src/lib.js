_V_.merge = function(obj1, obj2, safe){
  // Make sure second object exists
  if (!obj2) { obj2 = {}; };

  for (var attrname in obj2){
    if (obj2.hasOwnProperty(attrname) && (!safe || !obj1.hasOwnProperty(attrname))) { obj1[attrname]=obj2[attrname]; }
  }
  return obj1;
};
_V_.extend = function(obj){ this.merge(this, obj, true); };

_V_.extend({
  tech: {}, // Holder for playback technology settings
  controlSets: {}, // Holder for control set definitions

  // Device Checks
  isIE: function(){ return !+"\v1"; },
  isFF: function(){ return !!_V_.ua.match("Firefox") },
  isIPad: function(){ return navigator.userAgent.match(/iPad/i) !== null; },
  isIPhone: function(){ return navigator.userAgent.match(/iPhone/i) !== null; },
  isIOS: function(){ return VideoJS.isIPhone() || VideoJS.isIPad(); },
  iOSVersion: function() {
    var match = navigator.userAgent.match(/OS (\d+)_/i);
    if (match && match[1]) { return match[1]; }
  },
  isAndroid: function(){ return navigator.userAgent.match(/Android.*AppleWebKit/i) !== null; },
  androidVersion: function() {
    var match = navigator.userAgent.match(/Android (\d+)\./i);
    if (match && match[1]) { return match[1]; }
  },

  testVid: document.createElement("video"),
  ua: navigator.userAgent,
  support: {},

  each: function(arr, fn){
    if (!arr || arr.length === 0) { return; }
    for (var i=0,j=arr.length; i<j; i++) {
      fn.call(this, arr[i], i);
    }
  },

  eachProp: function(obj, fn){
    if (!obj) { return; }
    for (var name in obj) {
      if (obj.hasOwnProperty(name)) {
        fn.call(this, name, obj[name]);
      }
    }
  },

  el: function(id){ return document.getElementById(id); },
  createElement: function(tagName, attributes){
    var el = document.createElement(tagName),
        attrname;
    for (attrname in attributes){
      if (attributes.hasOwnProperty(attrname)) {
        if (attrname.indexOf("-") !== -1 || attrname === "style") {
          el.setAttribute(attrname, attributes[attrname]);
        } else {
          el[attrname] = attributes[attrname];
        }
      }
    }
    return el;
  },

  insertFirst: function(node, parent){
    if (parent.firstChild) {
      parent.insertBefore(node, parent.firstChild);
    } else {
      parent.appendChild(node);
    }
  },

  addClass: function (element, classToAdd) {
    $(element).addClass(classToAdd);
  },
  
  removeClass: function (element, classToRemove) {
    $(element).removeClass(classToRemove);
  },
  
  // Attempt to block the ability to select text while dragging controls
  blockTextSelection: function(){
    document.body.focus();
    document.onselectstart = function () { return false; };
  },
  // Turn off text selection blocking
  unblockTextSelection: function(){ document.onselectstart = function () { return true; }; },

  // Return seconds as H:MM:SS or M:SS
  // Supplying a guide (in seconds) will include enough leading zeros to cover the length of the guide
  formatTime: function(seconds, guide) {
    guide = guide || seconds; // Default to using seconds as guide
    var s = Math.floor(seconds % 60),
        m = Math.floor(seconds / 60 % 60),
        h = Math.floor(seconds / 3600),
        gm = Math.floor(guide / 60 % 60),
        gh = Math.floor(guide / 3600);

    // Check if we need to show hours
    h = (h > 0 || gh > 0) ? h + ":" : "";

    // If hours are showing, we may need to add a leading zero.
    // Always show at least one digit of minutes.
    m = (((h || gm >= 10) && m < 10) ? "0" + m : m) + ":";

    // Check if leading zero is need for seconds
    s = (s < 10) ? "0" + s : s;

    return h + m + s;
  },

  capitalize: function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  round: function(num, dec) {
    if (!dec) { dec = 0; }
    return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  },

  // Mimic HTML5 TimeRange Spec.
  createTimeRange: function(start, end){
    return {
      length: 1,
      start: function() { return start; },
      end: function() { return end; }
    };
  },

  guid: 1, // Unique ID for the element

  /* Proxy (a.k.a Bind or Context). A simple method for changing the context of a function
     It also stores a unique id on the function so it can be easily removed from events
  ================================================================================ */
  proxy: function(context, fn, uid) {
    // Make sure the function has a unique ID
    if (!fn.guid) { fn.guid = _V_.guid++; }

    // Create the new function that changes the context
    var ret = function() {
      return fn.apply(context, arguments);
    }

    // Allow for the ability to individualize this function
    // Needed in the case where multiple objects might share the same prototype
    // IF both items add an event listener with the same function, then you try to remove just one
    // it will remove both because they both have the same guid.
    // when using this, you need to use the proxy method when you remove the listener as well.
    ret.guid = (uid) ? uid + "_" + fn.guid : fn.guid;

    return ret;
  },

  /* Local Storage
  ================================================================================ */
  setLocalStorage: function(key, value){
    // IE was throwing errors referencing the var anywhere without this
    var localStorage = window.localStorage || false;
    if (!localStorage) { return; }
    try {
      localStorage[key] = value;
    } catch(e) {
      if (e.code == 22 || e.code == 1014) { // Webkit == 22 / Firefox == 1014
        _V_.log("LocalStorage Full (VideoJS)", e);
      } else {
        _V_.log("LocalStorage Error (VideoJS)", e);
      }
    }
  },

  // Get abosolute version of relative URL. Used to tell flash correct URL.
  // http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
  getAbsoluteURL: function(url){

    // Check if absolute URL
    if (!url.match(/^https?:\/\//)) {
      // Convert to absolute URL. Flash hosted off-site needs an absolute URL.
      url = _V_.createElement('div', {
        innerHTML: '<a href="'+url+'">x</a>'
      }).firstChild.href;
    }

    return url;
  },

  showGeneralError: function(msg){
    $('.vjs-progress-control').remove();
    $('.vjs-general-error').show();
  }
});

// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
_V_.log = function(){
  _V_.log.history = _V_.log.history || [];// store logs to an array for reference
  _V_.log.history.push(arguments);
  if(window.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? _V_.log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

// Offset Left
// getBoundingClientRect technique from John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
if ("getBoundingClientRect" in document.documentElement) {
  _V_.findPosX = function(el) {
    var box;

    try {
      box = el.getBoundingClientRect();
    } catch(e) {}

    if (!box) { return 0; }

    var docEl = document.documentElement,
        body = document.body,
        clientLeft = docEl.clientLeft || body.clientLeft || 0,
        scrollLeft = window.pageXOffset || body.scrollLeft,
        left = box.left + scrollLeft - clientLeft;

    return left;
  };
} else {
  _V_.findPosX = function(el) {
    var curleft = el.offsetLeft;
    // _V_.log(obj.className, obj.offsetLeft)
    while(el = obj.offsetParent) {
      if (el.className.indexOf("video-js") == -1) {
        // _V_.log(el.offsetParent, "OFFSETLEFT", el.offsetLeft)
        // _V_.log("-webkit-full-screen", el.webkitMatchesSelector("-webkit-full-screen"));
        // _V_.log("-webkit-full-screen", el.querySelectorAll(".video-js:-webkit-full-screen"));
      } else {
      }
      curleft += el.offsetLeft;
    }
    return curleft;
  };
}
