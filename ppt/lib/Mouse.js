/* mouse.js
 *
 * Provides a `Mouse` class, which in most cases there should only be a single of.
 * `mouse` is automatically instantiated on the window and tracks the mouse state independent of specific elements
 * This file also shims in missing behavior such as `buttons`
 */

void function(){
  // figure out what we're checking for scroll offsets
  var scroll = 'pageXOffset' in window
    ? { x: 'pageXOffset', y: 'pageYOffset' }
    : { x: 'scrollX', y: 'scrollY' };

  // strip 'mouse' from mouse events to avoid redundency
  var translate = {
    down: 'down',
    up: 'up',
    move: 'move',
    over: 'over',
    out: 'out',
    grab: 'grab',
    drag: 'drag',
    drop: 'drop',

    click: 'click',
    wheel: 'wheel',
    contextmenu: 'click',
    dblclick: 'dblclick',
    mousedown: 'down',
    mouseup: 'up',
    mousemove: 'move',
    mouseover: 'over',
    mouseout: 'out',
    mousewheel: 'wheel' //, < IE 7 hate this..
  };

//fix For ie
Object.create = Object.create || function(P,c) {
	 function F() {
	 }
	 F.prototype = P;
	 var o = new F();
	 o.constructor = c;
	 return o;
};

  var states = [], keybinds = Object.create(null);
  void function(i, name){
    while (i--) {
      states[i] = {
        left:   (i & 1) > 0,
        middle: (i & 2) > 0,
        right:  (i & 4) > 0
      }	//Object.freeze();
      name = [];
      states[i].left && name.push('left');
      states[i].middle && name.push('middle');
      states[i].right && name.push('right');
      keybinds[name.join('+')] = i;
    }
  }(8);

  function interpret(input){
    if (input == null) return 0;
    switch (typeof input) {
      case 'number': return input < 8 ? input : 0;
      case 'string': return input in keybinds ? keybinds[input] : 0;
      case 'boolean': return +input;
      case 'function':
      case 'object': return (input.left ? 1 : 0) | (input.middle ? 2 : 0) | (input.right ? 4 : 0);
    }
  }

  var allMouse = 'move over out down up wheel click dblclick grab drag drop';

  function listen(view, handlers){
    for (var k in handlers) {
		if(view.addEventListener) {
			  view.addEventListener(k, handlers[k], true);
		} else {
			  view.attachEvent(k, handlers[k]);
		}
	}
  }


  function Mouse(view){
    if (!(this instanceof Mouse))
      return new Mouse(view);

    var self = this;
    var update = function(){self.update.apply(self)};//this.update.bind(this);
    var count = 0;

    this.view = view;
    this.x = 0;
    this.y = 0;
    this.buttons = 0;
    this.buttonStates = states[0];
    this.active = false;
    this.listeners = Object.create(null);
    this.lastActivity = Date.now();
    this.dragging = false;

    function dispatch(e){
      self.update(e);
      self.emit(e);
    }

    var events = {
      mousewheel: dispatch,
      dblclick: dispatch,
      mouseup: dispatch,
      click: function click(e){
        self.update(e);
        if (self.dragging) {
          self.lastType = 'drop';
          self.emit(e);
          self.lastType = 'click';
          self.dragging = false;
        }
        self.emit(e);
        // remove button's bit from mask
        self.buttons &= ~(1 << e.button);
        self.buttonStates = states[self.buttons % 8];
      },
      mouseover: function over(e){
        if (e.relatedTarget === null) {
          self.update(e);
          self.emit(e);
        }
      },
      mouseout: function out(e){
        if (e.relatedTarget === null) {
          self.update(e);
          if (self.dragging) {
            self.lastType = 'drop';
            self.emit(e);
          }
          self.update(e);
          self.emit(e);
        }
      },
      mousedown: function down(e){
        // add button's bit to mask
        self.buttons |= 1 << e.button;
        self.buttonStates = states[self.buttons % 8];
        self.update(e);
        self.emit(e);
      },
      contextmenu: function rightclick(e){
        if (self.buttons !== 4 || self.dragging)
          e.preventDefault();
        events.click(e);
      },
      mousemove: function move(e){
        if (self.dragging) {
          self.update(e);
          self.lastType = 'drag';
          self.emit(e);
        } else if (self.buttons && self.lastType === 'down') {
          self.update(self.last);
          self.dragging = true;
          self.lastType = 'grab';
          self.emit(self.last);
        }
        self.update(e);
        self.emit(e);
      }
    };

    listen(view, events);
  }

  function findHandler(buttons, handler){
    if (!handler && typeof buttons === 'function')
      handler = buttons, buttons = 'buttons' in handler ? handler.buttons : 0;
    else
      buttons = interpret(buttons);
    handler.buttons = buttons;
    return handler;
  }

  // Mouse re-implements the event handlers because it isn't a DOM element nor an EventTarget nor any tangible object
  Mouse.prototype = {
    constructor: Mouse,
    emit: function emit(event){
      var listeners = this.listeners[this.lastType];
      if (listeners)
        for (var i=0; i < listeners.length; i++)
          if (!listeners[i].buttons || listeners[i].buttons === this.buttons)
            listeners[i].call(this, event);
    },
    on: function on(types, buttons, handler){
      types === '*' && (types = allMouse);
      handler = findHandler(buttons, handler);
	  /*
      types.split(/\s+/).forEach(function(type){
        type = translate[type];
        this[type] || (this[type] = []);
        this[type].push(handler);
      }, this.listeners);
	  */
      var typeList = types.split(/\s+/);
	  for(var type,i=0,len=typeList.length; i<len; i++) {
		type = typeList[i];
        type = translate[type];
        this.listeners[type] || (this.listeners[type] = []);
        this.listeners[type].push(handler);
	  }
    },
    once: function once(types, buttons, handler){
      handler = findHandler(buttons, handler);
      this.on(types, handler.buttons, function single(e){
        handler.call(this, e);
        this.off(types, single);
      });
    },
    off: function off(types, handler){
      types === '*' && (types = allMouse);
      types.split(/\s+/).forEach(function(type){
        var listeners = this[translate[type]];
        if (listeners) {
          var index = listeners.indexOf(handler);
          if (~index)
            listeners.splice(index, 1);
        }
      }, this.listeners);
    },
    update: function update(e){
      e.name = this.lastType = translate[e.type];
      e.buttons = this.buttons;
      e.buttonStates = this.buttonStates;
      this.x = e.clientX;
      this.y = e.clientY;
      this.lastActivity = e.timeStamp;
      this.last = e;
    }
  };
/*
  Object.keys(Mouse.prototype).forEach(function(key){
    Object.defineProperty(Mouse.prototype, key, { enumerable: false });
  });*/

  if (typeof Window !== 'undefined')
    Window.prototype.Mouse = Mouse;

  window.mouse = new Mouse(window);
}();
