var userVolume;

var state = {
  isDragging: false,
  isEnded: false
};

var VideoJS = function(id, addOptions, ready){
  var tag; // Element of ID

  // Allow for element or ID to be passed in
  // String ID
  if (typeof id == "string") {

    // Adjust for jQuery ID syntax
    if (id.indexOf("#") === 0) {
      id = id.slice(1);
    }

    // If a player instance has already been created for this ID return it.
    if (_V_.players[id]) {
      return _V_.players[id];

    // Otherwise get element for ID
    } else {
      tag = _V_.el(id)
    }

  // ID is a media element
  } else {
    tag = id;
  }

  // Check for a useable element
  if (!tag || !tag.nodeName) { // re: nodeName, could be a box div also
    throw new TypeError("The element or ID supplied is not valid. (VideoJS)"); // Returns
  }

  // Element may have a player attr referring to an already created player instance.
  // If not, set up a new player and return the instance.
  return tag.player || new _V_.Player(tag, addOptions, ready);
},

// Shortcut
_V_ = VideoJS;

VideoJS.players = {};

VideoJS.options = {

  // Default order of fallback technology
  techOrder: ["html5","flash"],

  html5: {},
  flash: { swf: "/flash/VideoJS.swf" },

  // Default of web browser is 300x150. Should rely on source width/height.
  width: 300,
  height: 150,

  // defaultVolume: 0.85,
  defaultVolume: 0.00, // The freakin seaguls are driving me crazy!

  // Included control sets
  components: {
    "posterImage": {},
    "clickLayer" : {},
    "loadingSpinner": {},
    "upperRightLogo": {},
    "bigPlayButton": {},
    "bigPlayToggle": {},
    "postroll": {},
    "controlBar": {}
  }
};
