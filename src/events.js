////////////////////////////////////////////////////////////////////////////
// EVENTS //////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
_V_.extend({
  on: function (elem, type, fn) {
    $(elem).on(type, fn);
  },
  
  // alias for 'on' (deprecated)
  addEvent: function () {
    return _V_.on.apply(this, arguments);
  },
  
  off: function (elem, type, fn) {
    $(elem).off(type, fn);
  },
  
  // alias for 'off' (deprecated)
  removeEvent: function () {
    return _V_.off.apply(this, arguments);
  },
  
  one: function(elem, type, fn) {
    $(elem).one(type, fn);
  },
  
  trigger: function (elem, event) {
    $(elem).trigger(event.type || event);
  },
  
  // alias for 'trigger' (deprecated)
  triggerEvent: function () {
    return _V_.trigger.apply(this, arguments);
  }
});
