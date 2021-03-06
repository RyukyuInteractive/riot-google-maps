(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var type = require('jkroso-type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types['bit-array'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

},{"jkroso-type":2}],2:[function(require,module,exports){
var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function // could be any function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function type(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type == 'object') {
    // in case they have been polyfilled
    if (x instanceof Map) return 'map'
    if (x instanceof Set) return 'set'
    return 'object'
  }
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object Set]': 'set',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Map]': 'map',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

},{}],3:[function(require,module,exports){
/**
 * Code refactored from Mozilla Developer Network:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */

'use strict';

function assign(target, firstSource) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  var to = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    var keysArray = Object.keys(Object(nextSource));
    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      var nextKey = keysArray[nextIndex];
      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}

function polyfill() {
  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: assign
    });
  }
}

module.exports = {
  assign: assign,
  polyfill: polyfill
};

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ["directions_changed"];
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ["bounds_changed", "center_changed", "click", "dblclick", "drag", "dragend", "dragstart", "heading_changed", "idle", "maptypeid_changed", "mousemove", "mouseout", "mouseover", "projection_changed", "resize", "rightclick", "tilesloaded", "tilt_changed", "zoom_changed"];
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ["closeclick", "content_changed", "domready", "position_changed", "zindex_changed"];
module.exports = exports["default"];

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ["animation_changed", "click", "clickable_changed", "cursor_changed", "dblclick", "drag", "dragend", "draggable_changed", "dragstart", "flat_changed", "icon_changed", "mousedown", "mouseout", "mouseover", "mouseup", "position_changed", "rightclick", "shape_changed", "title_changed", "visible_changed", "zindex_changed"];
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ["places_changed"];
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _GoogleMapEventsJs = require('./GoogleMapEvents.js');

exports.googleMapEvents = _interopRequire(_GoogleMapEventsJs);

var _MarkerEventsJs = require('./MarkerEvents.js');

exports.markerEvents = _interopRequire(_MarkerEventsJs);

var _SearchBoxEventsJs = require('./SearchBoxEvents.js');

exports.searchBoxEvents = _interopRequire(_SearchBoxEventsJs);

var _DirectionsRendererEventsJs = require('./DirectionsRendererEvents.js');

exports.directionsRendererEvents = _interopRequire(_DirectionsRendererEventsJs);

var _InfoWindowEventsJs = require('./InfoWindowEvents.js');

exports.infoWindowEvents = _interopRequire(_InfoWindowEventsJs);

},{"./DirectionsRendererEvents.js":4,"./GoogleMapEvents.js":5,"./InfoWindowEvents.js":6,"./MarkerEvents.js":7,"./SearchBoxEvents.js":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _mixins = require('./mixins');

riot.mixin('RiotMapsMixin', new _mixins.RiotMapsMixin());
riot.mixin('GoogleMapMixin', new _mixins.GoogleMapMixin());
riot.mixin('MarkerMixin', new _mixins.MarkerMixin());
riot.mixin('SearchBoxMixin', new _mixins.SearchBoxMixin());
riot.mixin('DirectionsRendererMixin', new _mixins.DirectionsRendererMixin());
riot.mixin('InfoWindowMixin', new _mixins.InfoWindowMixin());
riot.mixin('StateMixin', new _mixins.StateMixin());

var _tagsGoogleMapTag = require('./tags/GoogleMap.tag');

exports.GoogleMapTag = _interopRequire(_tagsGoogleMapTag);

var _tagsMarkerTag = require('./tags/Marker.tag');

exports.MarkerTag = _interopRequire(_tagsMarkerTag);

var _tagsSearchBoxTag = require('./tags/SearchBox.tag');

exports.SearchBoxTag = _interopRequire(_tagsSearchBoxTag);

var _tagsInfoWindowTag = require('./tags/InfoWindow.tag');

exports.InfoWindowTag = _interopRequire(_tagsInfoWindowTag);

if (!window.google && !!window.console) {
  console.warn('could not find google maps.');
}

},{"./mixins":18,"./tags/GoogleMap.tag":19,"./tags/InfoWindow.tag":20,"./tags/Marker.tag":21,"./tags/SearchBox.tag":22}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = DirectionsRendererMixin;

var _events = require('../events');

var _utils = require('../utils');

var DIRECTIONS_RENDERER_OPTIONS = ['directions', 'options', 'panel', 'routeindex'];

var directionsRendererUpdaters = {
  directions: function directions(_directions, tag) {
    tag.directionsRenderer.setDirections(_directions);
  },
  options: function options(_options, tag) {
    tag.directionsRenderer.setOptions(_options);
  },
  panel: function panel(_panel, tag) {
    tag.directionsRenderer.setPanel(_panel);
  },
  routeindex: function routeindex(routeIndex, tag) {
    tag.directionsRenderer.setRouteIndex(routeIndex);
  }
};

exports.directionsRendererUpdaters = directionsRendererUpdaters;

function DirectionsRendererMixin() {

  this.init = function () {
    this.on('mount', this.onMount);
    this.on('unmount', this.onUnmount);
    this.on('update', this.onUpdate);
  };

  this.onMount = function () {
    var mapref = this.parent.map;
    var options = (0, _utils.composeOptions)(DIRECTIONS_RENDERER_OPTIONS, this.opts);
    this.directionsRenderer = this.createDirectionsRenderer(options, mapref);
    this.registeredEvents = (0, _utils.registerEvents)(_events.directionsRendererEvents, this.opts, this.directionsRenderer);
  };

  this.onUnmount = function () {
    (0, _utils.unregisterEvents)(this.registeredEvents);
    this.directionsRenderer.setMap(null);
    this.registeredEvents = undefined;
  };

  this.onUpdate = function () {
    if (!this.directionsRenderer) return;
    (0, _utils.applyUpdaters)(this.opts, this.prevOpts, directionsRendererUpdaters, this);
  };

  this.createDirectionsRenderer = function (options, mapInstance) {
    var renderer = new google.maps.DirectionsRenderer(options);
    renderer.setMap(mapInstance);
    return renderer;
  };
}

},{"../events":9,"../utils":25}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = GoogleMapMixin;

var _events = require('../events');

var _utils = require('../utils');

var MAP_OPTIONS = ['center', 'heading', 'maptypeid', 'options', 'streetview', 'tilt', 'zoom'];

var googleMapUpdaters = {
  center: function center(_center, tag) {
    tag.map.setCenter(_center);
  },
  heading: function heading(_heading, tag) {
    tag.map.setHeading(_heading);
  },
  maptypeid: function maptypeid(mapTypeId, tag) {
    tag.map.setMapTypeId(mapTypeId);
  },
  options: function options(_options, tag) {
    tag.map.setOptions(_options);
  },
  streetview: function streetview(streetView, tag) {
    tag.map.setStreetView(streetView);
  },
  tilt: function tilt(_tilt, tag) {
    tag.map.setTilt(_tilt);
  },
  zoom: function zoom(_zoom, tag) {
    tag.map.setZoom(_zoom);
  }
};

exports.googleMapUpdaters = googleMapUpdaters;

function GoogleMapMixin() {

  this.init = function () {
    this.on('mount', this.onMount);
    this.on('unmount', this.onUnmount);
    this.on('update', this.onUpdate);
  };

  this.onMount = function () {
    var mapOptions = (0, _utils.composeOptions)(MAP_OPTIONS, this.opts);
    this.map = this.createMap(this.mapelem, mapOptions);
    this.registeredEvents = (0, _utils.registerEvents)(_events.googleMapEvents, this.opts, this.map);
  };

  this.onUnmount = function () {
    (0, _utils.unregisterEvents)(this.registeredEvents);
    this.registeredEvents = undefined;
  };

  this.onUpdate = function () {
    if (!this.map) return;
    (0, _utils.applyUpdaters)(this.opts, this.prevOpts, googleMapUpdaters, this);
  };

  this.createMap = function (elem, options) {
    return new google.maps.Map(elem, options);
  };

  this.getMapId = function () {
    return this.opts.mapId;
  };
}

},{"../events":9,"../utils":25}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = InfoWindowMixin;

var _events = require('../events');

var _utils = require('../utils');

var INFO_WINDOW_OPTIONS = ['content', 'options', 'position', 'zIndex'];

var infoWindowUpdaters = {
  //children(children, tag) { setContentForOptionalReactElement(children, component.getInfoWindow()); },
  content: function content(_content, tag) {
    tag.infoWindow.setContent(_content);
  },
  options: function options(_options, tag) {
    tag.infoWindow.setOptions(_options);
  },
  position: function position(_position, tag) {
    tag.infoWindow.setPosition(_position);
  },
  zIndex: function zIndex(_zIndex, tag) {
    tag.infoWindow.setZIndex(_zIndex);
  }
};

exports.infoWindowUpdaters = infoWindowUpdaters;
function setChildrenAsContent(children, infoWindow) {
  var domEl = children[0].cloneNode(true);
  infoWindow.setContent(domEl);
}

function isVisible(opts) {
  return opts['if'] === true || opts.show === true || opts.hide === false;
}

function showInfoWindow(infoWindow, mapInstance, anchorInstance) {
  if (anchorInstance) {
    infoWindow.open(mapInstance, anchorInstance);
  } else {
    infoWindow.setMap(mapInstance);
  }
}

function InfoWindowMixin() {

  this.init = function () {
    this.on('mount', this.onMount);
    this.on('unmount', this.onUnmount);
    this.on('update', this.onUpdate);
  };

  this.onMount = function () {
    var mapref = this.parent.getMap();
    var anchorref = this.parent.anchorRef;
    var infoWindowOptions = (0, _utils.composeOptions)(INFO_WINDOW_OPTIONS, this.opts);
    this.infoWindow = this.createInfoWindow(infoWindowOptions);
    this.registeredEvents = (0, _utils.registerEvents)(_events.infoWindowEvents, this.opts, this.infoWindow);
    showInfoWindow(this.infoWindow, mapref, anchorref);
  };

  this.onUnmount = function () {
    this.infoWindow.setMap(null);
    (0, _utils.unregisterEvents)(this.registeredEvents);
    this.registeredEvents = undefined;
  };

  this.onUpdate = function () {
    if (!this.infoWindow) {
      return;
    }
    var mapref = this.parent.getMap();
    var anchorref = this.parent.anchorRef;

    (0, _utils.applyUpdaters)(this.opts, this.prevOpts, infoWindowUpdaters, this);
    setChildrenAsContent(this.root.children, this.infoWindow);

    if (isVisible(this.opts)) {
      showInfoWindow(this.infoWindow, mapref, anchorref);
    }
  };

  this.createInfoWindow = function (options) {
    var infoWindow = new google.maps.InfoWindow(options);

    if (this.root.children.length > 0) {
      setChildrenAsContent(this.root.children, infoWindow);
    }

    return infoWindow;
  };
}

},{"../events":9,"../utils":25}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = MarkerMixin;

var _events = require('../events');

var _utils = require('../utils');

var MARKER_OPTIONS = ['animation', 'attribution', 'clickable', 'cursor', 'draggable', 'icon', 'label', 'opacity', 'options', 'place', 'position', 'shape', 'title', 'visible', 'zindex'];

var markerUpdaters = {
  animation: function animation(_animation, tag) {
    tag.marker.setAnimation(_animation);
  },
  attribution: function attribution(_attribution, tag) {
    tag.marker.setAttribution(_attribution);
  },
  clickable: function clickable(_clickable, tag) {
    tag.marker.setClickable(_clickable);
  },
  cursor: function cursor(_cursor, tag) {
    tag.marker.setCursor(_cursor);
  },
  draggable: function draggable(_draggable, tag) {
    tag.marker.setDraggable(_draggable);
  },
  icon: function icon(_icon, tag) {
    tag.marker.setIcon(_icon);
  },
  label: function label(_label, tag) {
    tag.marker.setLabel(_label);
  },
  opacity: function opacity(_opacity, tag) {
    tag.marker.setOpacity(_opacity);
  },
  options: function options(_options, tag) {
    tag.marker.setOptions(_options);
  },
  place: function place(_place, tag) {
    tag.marker.setPlace(_place);
  },
  position: function position(_position, tag) {
    tag.marker.setPosition(_position);
  },
  shape: function shape(_shape, tag) {
    tag.marker.setShape(_shape);
  },
  title: function title(_title, tag) {
    tag.marker.setTitle(_title);
  },
  visible: function visible(_visible, tag) {
    tag.marker.setVisible(_visible);
  },
  zindex: function zindex(zIndex, tag) {
    tag.marker.setZIndex(zIndex);
  }
};

exports.markerUpdaters = markerUpdaters;

function MarkerMixin() {

  this.init = function () {
    this.on('mount', this.onMount);
    this.on('unmount', this.onUnmount);
    this.on('update', this.onUpdate);
  };

  this.onMount = function () {
    var mapref = this.parent.map;
    var markerOptions = (0, _utils.composeOptions)(MARKER_OPTIONS, this.opts);
    this.marker = this.createMarker(mapref, markerOptions);
    this.anchorRef = this.marker;
    this.registeredEvents = (0, _utils.registerEvents)(_events.markerEvents, this.opts, this.marker);
  };

  this.onUnmount = function () {
    this.marker.setMap(null);
    (0, _utils.unregisterEvents)(this.registeredEvents);
    this.registeredEvents = undefined;
  };

  this.onUpdate = function () {
    if (!this.marker) return;
    (0, _utils.applyUpdaters)(this.opts, this.prevOpts, markerUpdaters, this);
  };

  this.createMarker = function (mapInstance, options) {
    var marker = new google.maps.Marker(options);
    marker.setMap(mapInstance);
    return marker;
  };

  this.getMap = function () {
    return this.parent.map;
  };
}

},{"../events":9,"../utils":25}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = RiotMapsMixin;

var MapInstances = [];

function googleMapParser(tag) {
  if (tag instanceof Array) {
    tag.forEach(function (instance) {
      return MapInstances.push(instance);
    });
  } else {
    MapInstances.push(tag);
  }
}

function RiotMapsMixin() {

  this.init = function () {
    googleMapParser(this.tags['google-map']);
  };

  this.getMap = function (mapId) {
    var matchingTags = MapInstances.filter(function (tag) {
      return tag.getMapId() === mapId;
    });
    return matchingTags[0].map;
  };

  this.getSearchBox = function (mapId) {
    var matchingTags = MapInstances.filter(function (tag) {
      return tag.getMapId() === mapId;
    });
    var searchTag = matchingTags[0].tags['search-box'];
    return searchTag ? searchTag.searchBox : undefined;
  };
}

module.exports = exports['default'];

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = SearchBoxMixin;

var _events = require('../events');

var _utils = require('../utils');

var SEARCH_BOX_OPTIONS = ['bounds'];

var searchBoxUpdaters = {
  bounds: function bounds(_bounds, tag) {
    tag.searchBox.setBounds(_bounds);
  }
};

exports.searchBoxUpdaters = searchBoxUpdaters;

function SearchBoxMixin() {

  this.init = function () {
    this.on('mount', this.onMount);
    this.on('unmount', this.onUnmount);
    this.on('update', this.onUpdate);
  };

  this.onMount = function () {
    var controlposition = this.opts.controlposition;

    var mapref = this.parent.map;
    var searchBoxOptions = (0, _utils.composeOptions)(SEARCH_BOX_OPTIONS, this.opts);
    this.searchBox = this.createSearchBox(this.search, searchBoxOptions);
    this.registeredEvents = (0, _utils.registerEvents)(_events.searchBoxEvents, this.opts, this.searchBox);
    this.addToMap(this.search, controlposition, mapref);
  };

  this.onUnmount = function () {
    var _opts = this.opts;
    var mapref = _opts.mapref;
    var controlPosition = _opts.controlPosition;

    this.removeFromMap(this.search, controlPosition, mapref);
    (0, _utils.unregisterEvents)(this.registeredEvents);
    this.registeredEvents = undefined;
  };

  this.onUpdate = function () {
    if (!this.searchBox) return;
    (0, _utils.applyUpdaters)(this.opts, this.prevOpts, searchBoxUpdaters, this);
  };

  this.createSearchBox = function (searchInput, options) {
    return new google.maps.places.SearchBox(searchInput, options);
  };

  this.addToMap = function (searchInput, controlPosition, mapInstance) {
    mapInstance.controls[controlPosition].push(searchInput);
  };

  this.removeFromMap = function (searchInput, controlPosition, mapInstance) {
    var index = mapInstance.controls[controlPosition].getArray().indexOf(searchInput);
    mapInstance.controls[controlPosition].removeAt(index);
  };
}

},{"../events":9,"../utils":25}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = StateMixin;

var _es6ObjectAssign = require('es6-object-assign');

function StateMixin() {

  function storeState() {
    this.prevOpts = (0, _es6ObjectAssign.assign)({}, this.opts);
  }

  this.init = function () {
    this.prevOpts = {};
    this.on('updated', storeState.bind(this));
  };
}

module.exports = exports['default'];

},{"es6-object-assign":3}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _RiotMapsMixin = require('./RiotMapsMixin');

exports.RiotMapsMixin = _interopRequire(_RiotMapsMixin);

var _GoogleMapMixin = require('./GoogleMapMixin');

exports.GoogleMapMixin = _interopRequire(_GoogleMapMixin);

var _MarkerMixin = require('./MarkerMixin');

exports.MarkerMixin = _interopRequire(_MarkerMixin);

var _SearchBoxMixin = require('./SearchBoxMixin');

exports.SearchBoxMixin = _interopRequire(_SearchBoxMixin);

var _DirectionsRendererMixin = require('./DirectionsRendererMixin');

exports.DirectionsRendererMixin = _interopRequire(_DirectionsRendererMixin);

var _InfoWindowMixin = require('./InfoWindowMixin');

exports.InfoWindowMixin = _interopRequire(_InfoWindowMixin);

var _StateMixin = require('./StateMixin');

exports.StateMixin = _interopRequire(_StateMixin);

},{"./DirectionsRendererMixin":11,"./GoogleMapMixin":12,"./InfoWindowMixin":13,"./MarkerMixin":14,"./RiotMapsMixin":15,"./SearchBoxMixin":16,"./StateMixin":17}],19:[function(require,module,exports){
(function (global){
var riot = (typeof window !== "undefined" ? window['riot'] : typeof global !== "undefined" ? global['riot'] : null);
module.exports = riot.tag2('google-map', '<div name="mapelem"></div> <yield></yield>', '', 'style="overflow: hidden;"', function(opts) {
    this.mixin('GoogleMapMixin', 'StateMixin');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
(function (global){
var riot = (typeof window !== "undefined" ? window['riot'] : typeof global !== "undefined" ? global['riot'] : null);
module.exports = riot.tag2('info-window', '<yield></yield>', '', '', function(opts) {
    this.mixin('InfoWindowMixin', 'StateMixin');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
(function (global){
var riot = (typeof window !== "undefined" ? window['riot'] : typeof global !== "undefined" ? global['riot'] : null);
module.exports = riot.tag2('marker', '<yield></yield>', '', '', function(opts) {
    this.mixin('MarkerMixin', 'StateMixin');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
(function (global){
var riot = (typeof window !== "undefined" ? window['riot'] : typeof global !== "undefined" ? global['riot'] : null);
module.exports = riot.tag2('search-box', '<input class="search-box-input" type="text" name="search" placeholder="{opts.placeholder}">', '', '', function(opts) {
    this.mixin('SearchBoxMixin', 'StateMixin');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = applyUpdaters;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _equals = require('equals');

var _equals2 = _interopRequireDefault(_equals);

function applyUpdaters(opts, prevOpts, updaters, tag) {
  Object.keys(updaters).forEach(function (updaterName) {
    var opt = opts[updaterName];
    var prevOpt = prevOpts[updaterName];
    var updater = updaters[updaterName];

    if (!(0, _equals2['default'])(opt, prevOpt)) {
      updater(opt, tag);
    }
  });
}

module.exports = exports['default'];

},{"equals":1}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports["default"] = composeOptions;

function composeOptions(optionNames, opts) {
  var options = opts.options;

  var composition = optionNames.reduce(function (acc, name) {
    if (name === 'options') {
      return acc;
    }

    var value = opts[name];
    if (typeof value !== "undefined") {
      acc[name] = value;
    }

    return acc;
  }, {});

  return _extends({}, composition, options);
}

module.exports = exports["default"];

},{}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _registerEvents = require('./registerEvents');

exports.registerEvents = _interopRequire(_registerEvents);

var _unregisterEvents = require('./unregisterEvents');

exports.unregisterEvents = _interopRequire(_unregisterEvents);

var _composeOptions = require('./composeOptions');

exports.composeOptions = _interopRequire(_composeOptions);

var _applyUpdaters = require('./applyUpdaters');

exports.applyUpdaters = _interopRequire(_applyUpdaters);

},{"./applyUpdaters":23,"./composeOptions":24,"./registerEvents":26,"./unregisterEvents":27}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = registerEvents;

var hasOwnProperty = function hasOwnProperty(obj, prop) {
  try {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  } catch (e) {
    return prop in obj;
  }
},
    addListener = function addListener() {};
if (!!window.google) {
  addListener = google.maps.event.addListener;
};

function registerEvents(eventList, handlers, instance) {
  var registeredEvents = eventList.reduce(function (acc, eventName) {
    var onEventName = "on" + eventName;

    if (hasOwnProperty(handlers, onEventName)) {
      acc.push(addListener(instance, eventName, handlers[onEventName]));
    }

    return acc;
  }, []);

  return registeredEvents;
}

module.exports = exports["default"];

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = unregisterEvents;
var removeListener = function removeListener() {};
if (!!window.google) {
  removeListener = google.maps.event.removeListener;
};

function unregisterEvents(registeredEvents) {
  registeredEvents.forEach(function (registeredEvent) {
    return removeListener(registeredEvent);
  });
}

module.exports = exports["default"];

},{}]},{},[10]);
