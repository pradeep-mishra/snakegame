
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // thanks to David A

    var prefixes = ["webkit", "moz", "ms", ""];
    function prefixedEvent(element, type, callback) {
      for (var p = 0; p < prefixes.length; p++) {
        if (!prefixes[p]) type = type.toLowerCase();
        element.addEventListener(prefixes[p]+type, callback, false);
      }
    }

    function transform ($e, x, y, scale, rotation, percent) {
      x = x || 0; y = y || 0; scale = scale || 1;
      var unit = percent ? '%' : 'px';
      rotation = rotation || 0;
      
      var transfromString = 'translate('+ x + unit + ', '+ y + unit + ') ' 
                      + 'scale(' + scale + ') '
                      + 'rotate(' + rotation + 'deg)';
      
      $e.style.webkitTransform = transfromString;
      $e.style.MozTransform = transfromString;
      $e.style.transform = transfromString;
    }

    function createParticle(x, y, scale) {
      var $particle = document.createElement('i');
      var $sparcle = document.createElement('i');
      
      $particle.className = 'particle';
      $sparcle.className = 'sparcle';
      
      transform($particle, x, y, scale);
      $particle.appendChild( $sparcle );
      
      return $particle;
    }

    function explode ($container) {
      var particles = [];
      
      particles.push( createParticle(0,0,1) );
      particles.push( createParticle(50,-15,0.4) );
      particles.push( createParticle(50,-105,0.2) );
      particles.push( createParticle(-10,-60,0.8) );
      particles.push( createParticle(-10,60,0.4) );
      particles.push( createParticle(-50,-60,0.2) );
      particles.push( createParticle(-50,-15,0.75) );
      particles.push( createParticle(-100,-15,0.4) );
      particles.push( createParticle(-100,-15,0.2) );
      particles.push( createParticle(-100,-115,0.2) );
      particles.push( createParticle(80,-15,0.1) );

      particles.forEach(function(particle){
        $container.appendChild( particle );
        prefixedEvent(particle, "AnimationEnd", function(){
          var self = this;
          setTimeout(function(){
            requestAnimationFrame(function(){
              $container.removeChild(self);
            });
          },100);
        });
      });
      
    }

    function exolpodeGroup (x, y, trans) {
      var $container = document.createElement('div');
      
      $container.className = 'container';
      $container.style.top = y + 'px';
      $container.style.left = x + 'px';
      
      transform( $container, trans.x, trans.y, trans.scale, trans.r, true );
      
      explode( $container );
      return $container;
    }

    function sparcle(event) {
      var explosions = [];
      
      explosions.push( exolpodeGroup(event.pageX, event.pageY, {scale: 1, x: -50, y: -50, r: 0}) );
      explosions.push( exolpodeGroup(event.pageX, event.pageY, {scale: .5, x: -30, y: -50, r: 180}) );
      explosions.push( exolpodeGroup(event.pageX, event.pageY, {scale: .5, x: -50, y: -20, r: -90}) );
      
      requestAnimationFrame(function(){
        explosions.forEach(function(boum, i){
          setTimeout(function(){
            document.body.appendChild( boum );
          }, i * 100);
        });
      });
    }

    class Utils{
      static grid;

      static setGrid(grid){
        this.grid = grid;
      }
      static addClass(x,y, className){
        const elm =document.getElementById(`i-${x}-${y}`);
        if(!elm){
          throw 'ELEMENT NOT FOUND';
        }
        elm.classList.add(className);
        if(this.grid[y][x] !== 2){
          this.grid[y][x] = className === 'head' ? 3 : className === 'food' ? 2 : className === 'snake' ? 1 : 0;
        }
      }

      static removeClass(x,y, className){
        const elm =document.getElementById(`i-${x}-${y}`);
        if(!elm){
          throw 'ELEMENT NOT FOUND';
        }
        elm.classList.remove(className);
        this.grid[y][x] = 0;
        
      }

      static getElm(selectorId){
        return document.getElementById(selectorId)
      }

      static hasClass(selectorId, className){
        return this.getElm(selectorId).classList.contains(className);
      }
    }

    class SnakePoint{
      x;
      y;
      prevPoint;
      nextPoint;
      constructor(x,y){
        this.x = x;
        this.y=y;
        this.prevPoint = null;
        this.nextPoint = null;
      }
      prev(point){
        if(point){
          this.prevPoint = point;
        }
        return this.prevPoint;
      }

      next(point){
        if(point){
          this.nextPoint = point;
          this.nextPoint.prev(this);
        }
        return this.nextPoint;
      }

    }

    class Snake{
      size=-2;
      initSize = 2;
      head;
      tail;
      direction="RIGHT";
      _board;
      _onMove;
      _onGameOver
      _bufferDirection="RIGHT";
      constructor(snakeX, snakeY, board){
        this._board = board;
        this.head = new SnakePoint(snakeX, snakeY);
        this.tail = this.head;
        this.stretchBy(this.initSize);
      }

      stretch(){
        let nextPoint;
        let direction;
        let prevDir = this.tail.prev();
        if(prevDir){
          if(prevDir.x === this.tail.x){
            direction = prevDir.y > this.tail.y ? 'DOWN' : 'UP';
          }else {
            direction = prevDir.x > this.tail.x ? 'RIGHT' : 'LEFT';
          }
        }else {
          direction = this.direction;
        }
        switch (direction) {
          case 'UP': 
            nextPoint = new SnakePoint(this.tail.x, this.head.y+1);
            break
          case 'RIGHT':
            nextPoint = new SnakePoint(this.tail.x-1, this.tail.y);
            break
          case 'DOWN':
            nextPoint = new SnakePoint(this.tail.x, this.head.y-1);
            break
          case 'LEFT':
            nextPoint = new SnakePoint(this.tail.x + 1, this.tail.y);
            break
        }
        this.tail.next(nextPoint);
        this.tail = nextPoint;
        this.size = this.size+1;
      }

      stretchBy(points=2){
        for(let i = 0; i < points; i++){
          this.stretch();
        }
        return this;
      }

      move(){
        const that =this;
        try{
          let tail;
          switch(this.direction){
            case 'UP':
              Utils.addClass(this.head.x,(this.head.y-1), "head");
              tail = this.tail;
              Utils.removeClass(tail.x,tail.y,"snake");
              while(tail.prev()){
                const prev = tail.prev();
                tail.x = prev.x;
                tail.y = prev.y;
                Utils.removeClass(tail.x,tail.y,"head");
                Utils.addClass(tail.x,tail.y, "snake");
                tail = prev;
              }
              tail.y = tail.y-1;
              if(this._onMove){
                this._onMove();
              }
              this._bufferDirection = this.direction;
              break;
            case 'DOWN':
              Utils.addClass(this.head.x,this.head.y+1, "head");
              tail = this.tail;
              Utils.removeClass(tail.x,tail.y, "snake");
              while(tail.prev()){
                const prev = tail.prev();
                tail.x = prev.x;
                tail.y = prev.y;
                Utils.removeClass(tail.x,tail.y, "head");
                Utils.addClass(tail.x,tail.y, "snake");
                tail = prev;
              }
              tail.y = tail.y+1;
              if(this._onMove){
                this._onMove();
              }
              this._bufferDirection = this.direction;
              break;
            case 'RIGHT':    
              Utils.addClass(this.head.x + 1,this.head.y, "head");
              tail = this.tail;
              Utils.removeClass(tail.x,tail.y, "snake");
              while(tail.prev()){
                const prev = tail.prev();
                tail.x = prev.x;
                tail.y = prev.y;
                Utils.removeClass(tail.x,tail.y, "head");
                Utils.addClass(tail.x,tail.y, "snake");
                tail = prev;
              }
              tail.x = tail.x+1;
              if(this._onMove){
                this._onMove();
              }
              this._bufferDirection = this.direction;
              break;
            case 'LEFT':
              Utils.addClass(this.head.x-1,this.head.y, "head");
              tail = this.tail;
              Utils.removeClass(tail.x,tail.y, "snake");
              while(tail.prev()){
                const prev = tail.prev();
                tail.x = prev.x;
                tail.y = prev.y;
                Utils.addClass(tail.x,tail.y, "snake");
                Utils.removeClass(tail.x,tail.y, "head");
                tail = prev;
              }
              tail.x = tail.x-1;
              if(this._onMove){
                this._onMove();
              }
              this._bufferDirection = this.direction;
              break;
          }
          if(Utils.getElm(`i-${this.head.x}-${this.head.y}`).classList.contains('snake')){
            return that._onGameOver();
          }
          this._board._checkHeadForFood(this.head.x, this.head.y);
        }catch(e){
          if(e === "ELEMENT NOT FOUND"){
            that._onGameOver();
            return true;
          }else {
            throw e;
          }
        }
        return this;
      }
      setDirection(direction){
        if(direction === "RIGHT" && this.direction === "LEFT"){
          return true;
        }
        if(direction === "LEFT" && this.direction === 'RIGHT'){
          return true;
        }
        if(direction === "UP" && this.direction === "DOWN"){
          return true;
        }
        if(direction === "DOWN" && this.direction === "UP"){
          return true;
        }
        if(this.direction !== this._bufferDirection){
          return true;
        }
        switch(direction){
          case "UP" : 
            this.direction = direction;
            break;
          case "DOWN":
            this.direction = direction;
            break;
          case "LEFT":
            this.direction = direction;
            break;
          case "RIGHT":
            this.direction = direction;
        }
        return this;
      }
      onMove(func){
        this._onMove = func;
      }
      onGameOver(func){
        this._onGameOver =func;
      }
    }

    class Board{
      snake;

      _eatSound;
      _tickSound;
      _blastSound;
      _grid;
      _onScore = ()=>{};
      _onGameOver;
      _dimension;
      _sound;
      _maxFood;
      constructor(dimension=25,maxFood=8, sound=true){ 
        this._dimension = dimension;
        this._maxFood = maxFood;
        this._sound =sound;
        this._eatSound = new Audio('/eat.wav');
        this._tickSound = new Audio('/tick.wav');
        this._blastSound = new Audio('/blast.wav');
        this.snake = new Snake(2,0, this);
        this.snake.onGameOver(()=>{
          if(this._sound){
            this._blastSound.play();
          }
          if(this._onGameOver){
            this._onGameOver();
          }
        });
        this._grid =  new Array(dimension).fill(0).map(() => { 
          return new Array(dimension).fill(0).map(() => 0)
        });
        Utils.setGrid(this._grid);
        this._dropSnakeOnBoard();
        this._dropFoodOnBoard();  
      }

      getGrid(){
        return this._grid;
      }
     
      onScore(func){
        this._onScore = ()=>{
          func();
        };
      }

      onGameOver(func){
        this._onGameOver = ()=>{
          func();
        };
      }

      _dropSnakeOnBoard(){
        let snakeHead = this.snake.head;
        this._grid[snakeHead.y][snakeHead.x] = 3;
        while (snakeHead.next()) {
          snakeHead = snakeHead.next();
          if (this._grid[snakeHead.y] !== undefined && this._grid[snakeHead.y][snakeHead.x] !== undefined) {
            this._grid[snakeHead.y][snakeHead.x] = 1;
          }
        }
      }
      _dropFoodOnBoard(){
        for(let i = 0 ; i < this._maxFood ; i++){
          this._addNewFood();
        }
      }
      _randomIntBetween(min, max) {  
        return Math.floor(Math.random() * (max - min + 1) + min)
      }
      _checkHeadForFood(xAxis,yAxis){
        if(this._grid[yAxis][xAxis] === 2 || Utils.hasClass(`i-${xAxis}-${yAxis}`, 'food')){
          //console.log('snake ate food')
          if(this._sound){
            this._eatSound.play();
          }
          this._grid[yAxis][xAxis] = 0;
          Utils.removeClass(xAxis,yAxis,'food');
          this._onScore();
          this.snake.stretch();
          this._addNewFood(true);
        }
      }
      _addNewFood(withClass=false){
        const y = this._randomIntBetween(3,(this._dimension-2));
        const x = this._randomIntBetween(3,(this._dimension-2));
        if(withClass){
          Utils.addClass(x,y,'food');
        }else {
          this._grid[y][x] = 2;
        }
      }
    }

    /* src/MediaQuery.svelte generated by Svelte v3.43.1 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, matches*/ 9)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MediaQuery', slots, ['default']);
    	let { query } = $$props;
    	let mql;
    	let mqlListener;
    	let wasMounted = false;
    	let matches = false;

    	onMount(() => {
    		$$invalidate(2, wasMounted = true);

    		return () => {
    			removeActiveListener();
    		};
    	});

    	function addNewListener(query) {
    		mql = window.matchMedia(query);
    		mqlListener = v => $$invalidate(0, matches = v.matches);
    		mql.addListener(mqlListener);
    		$$invalidate(0, matches = mql.matches);
    	}

    	function removeActiveListener() {
    		if (mql && mqlListener) {
    			mql.removeListener(mqlListener);
    		}
    	}

    	const writable_props = ['query'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		query,
    		mql,
    		mqlListener,
    		wasMounted,
    		matches,
    		addNewListener,
    		removeActiveListener
    	});

    	$$self.$inject_state = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('mql' in $$props) mql = $$props.mql;
    		if ('mqlListener' in $$props) mqlListener = $$props.mqlListener;
    		if ('wasMounted' in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
    		if ('matches' in $$props) $$invalidate(0, matches = $$props.matches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
    			{
    				if (wasMounted) {
    					removeActiveListener();
    					addNewListener(query);
    				}
    			}
    		}
    	};

    	return [matches, query, wasMounted, $$scope, slots];
    }

    class MediaQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*query*/ ctx[1] === undefined && !('query' in props)) {
    			console.warn("<MediaQuery> was created without expected prop 'query'");
    		}
    	}

    	get query() {
    		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (133:4) {#if matches}
    function create_if_block_5(ctx) {
    	let div3;
    	let div0;
    	let h1;
    	let t1;
    	let div1;
    	let h40;
    	let t2;
    	let span0;
    	let t3;
    	let t4;
    	let div2;
    	let h41;
    	let t5;
    	let span1;
    	let t6;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Snake Game";
    			t1 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			t2 = text("Status: \n            ");
    			span0 = element("span");
    			t3 = text(/*gameStatus*/ ctx[2]);
    			t4 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			t5 = text("Score : \n            ");
    			span1 = element("span");
    			t6 = text(/*score*/ ctx[1]);
    			attr_dev(h1, "class", "svelte-1dq6dpi");
    			add_location(h1, file, 135, 10, 3257);
    			attr_dev(div0, "class", "header-item title svelte-1dq6dpi");
    			add_location(div0, file, 134, 8, 3215);
    			attr_dev(span0, "class", "status-span svelte-1dq6dpi");
    			add_location(span0, file, 139, 12, 3368);
    			attr_dev(h40, "class", "svelte-1dq6dpi");
    			add_location(h40, file, 138, 10, 3343);
    			attr_dev(div1, "class", "header-item status svelte-1dq6dpi");
    			add_location(div1, file, 137, 8, 3300);
    			attr_dev(span1, "class", "score-span svelte-1dq6dpi");
    			add_location(span1, file, 144, 12, 3521);
    			attr_dev(h41, "class", "svelte-1dq6dpi");
    			add_location(h41, file, 143, 10, 3496);
    			attr_dev(div2, "class", "header-item score svelte-1dq6dpi");
    			add_location(div2, file, 142, 8, 3454);
    			attr_dev(div3, "class", "header svelte-1dq6dpi");
    			add_location(div3, file, 133, 6, 3186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, h40);
    			append_dev(h40, t2);
    			append_dev(h40, span0);
    			append_dev(span0, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, h41);
    			append_dev(h41, t5);
    			append_dev(h41, span1);
    			append_dev(span1, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameStatus*/ 4) set_data_dev(t3, /*gameStatus*/ ctx[2]);
    			if (dirty & /*score*/ 2) set_data_dev(t6, /*score*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(133:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (132:2) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot_5(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(132:2) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (153:4) {#if matches}
    function create_if_block_4(ctx) {
    	let div3;
    	let div0;
    	let h3;
    	let t1;
    	let div1;
    	let h40;
    	let t2;
    	let span0;
    	let t3;
    	let t4;
    	let div2;
    	let h41;
    	let t5;
    	let span1;
    	let t6;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Snake Game";
    			t1 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			t2 = text("Status: \n          ");
    			span0 = element("span");
    			t3 = text(/*gameStatus*/ ctx[2]);
    			t4 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			t5 = text("Score : \n          ");
    			span1 = element("span");
    			t6 = text(/*score*/ ctx[1]);
    			add_location(h3, file, 155, 8, 3785);
    			attr_dev(div0, "class", "header-item title svelte-1dq6dpi");
    			add_location(div0, file, 154, 6, 3745);
    			attr_dev(span0, "class", "status-span svelte-1dq6dpi");
    			add_location(span0, file, 159, 10, 3888);
    			attr_dev(h40, "class", "svelte-1dq6dpi");
    			add_location(h40, file, 158, 8, 3865);
    			attr_dev(div1, "class", "header-item status svelte-1dq6dpi");
    			add_location(div1, file, 157, 6, 3824);
    			attr_dev(span1, "class", "score-span svelte-1dq6dpi");
    			add_location(span1, file, 164, 10, 4031);
    			attr_dev(h41, "class", "svelte-1dq6dpi");
    			add_location(h41, file, 163, 8, 4008);
    			attr_dev(div2, "class", "header-item score svelte-1dq6dpi");
    			add_location(div2, file, 162, 6, 3968);
    			attr_dev(div3, "class", "header-bottom svelte-1dq6dpi");
    			add_location(div3, file, 153, 6, 3711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h3);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, h40);
    			append_dev(h40, t2);
    			append_dev(h40, span0);
    			append_dev(span0, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, h41);
    			append_dev(h41, t5);
    			append_dev(h41, span1);
    			append_dev(span1, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*gameStatus*/ 4) set_data_dev(t3, /*gameStatus*/ ctx[2]);
    			if (dirty & /*score*/ 2) set_data_dev(t6, /*score*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(153:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (152:2) <MediaQuery query="(max-width: 480px)" let:matches>
    function create_default_slot_4(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(152:2) <MediaQuery query=\\\"(max-width: 480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (176:6) {#if matches}
    function create_if_block_3(ctx) {
    	let div;
    	let each_value_2 = /*grid*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "grid svelte-1dq6dpi");
    			set_style(div, "grid-template-rows", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			set_style(div, "grid-template-columns", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			add_location(div, file, 176, 8, 4239);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8) {
    				each_value_2 = /*grid*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*dimension*/ 1) {
    				set_style(div, "grid-template-rows", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			}

    			if (dirty & /*dimension*/ 1) {
    				set_style(div, "grid-template-columns", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(176:6) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (181:12) {#each row as cell, bIndex}
    function create_each_block_3(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", 'i-' + /*bIndex*/ ctx[26] + '-' + /*tIndex*/ ctx[23]);
    			attr_dev(div, "class", div_class_value = "cell " + (/*cell*/ ctx[24] === 1 ? 'snake' : '') + " " + (/*cell*/ ctx[24] === 2 ? 'food' : '') + " " + (/*cell*/ ctx[24] === 3 ? 'head' : ''));
    			add_location(div, file, 181, 14, 4474);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8 && div_class_value !== (div_class_value = "cell " + (/*cell*/ ctx[24] === 1 ? 'snake' : '') + " " + (/*cell*/ ctx[24] === 2 ? 'food' : '') + " " + (/*cell*/ ctx[24] === 3 ? 'head' : ''))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(181:12) {#each row as cell, bIndex}",
    		ctx
    	});

    	return block;
    }

    // (180:10) {#each grid as row, tIndex}
    function create_each_block_2(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*row*/ ctx[21];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8) {
    				each_value_3 = /*row*/ ctx[21];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(180:10) {#each grid as row, tIndex}",
    		ctx
    	});

    	return block;
    }

    // (175:4) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot_3(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(175:4) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (190:6) {#if matches}
    function create_if_block_2(ctx) {
    	let t0_value = /*changeView*/ ctx[4]('mobile') + "";
    	let t0;
    	let t1;
    	let div;
    	let each_value = /*grid*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "grid svelte-1dq6dpi");
    			set_style(div, "grid-template-rows", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			set_style(div, "grid-template-columns", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			add_location(div, file, 191, 8, 4813);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8) {
    				each_value = /*grid*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*dimension*/ 1) {
    				set_style(div, "grid-template-rows", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			}

    			if (dirty & /*dimension*/ 1) {
    				set_style(div, "grid-template-columns", "repeat(" + /*dimension*/ ctx[0] + "," + width + ")");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(190:6) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (196:12) {#each row as cell, bIndex}
    function create_each_block_1(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", 'i-' + /*bIndex*/ ctx[26] + '-' + /*tIndex*/ ctx[23]);
    			attr_dev(div, "class", div_class_value = "cell " + (/*cell*/ ctx[24] === 1 ? 'snake' : '') + " " + (/*cell*/ ctx[24] === 2 ? 'food' : '') + " " + (/*cell*/ ctx[24] === 3 ? 'head' : ''));
    			add_location(div, file, 196, 14, 5048);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8 && div_class_value !== (div_class_value = "cell " + (/*cell*/ ctx[24] === 1 ? 'snake' : '') + " " + (/*cell*/ ctx[24] === 2 ? 'food' : '') + " " + (/*cell*/ ctx[24] === 3 ? 'head' : ''))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(196:12) {#each row as cell, bIndex}",
    		ctx
    	});

    	return block;
    }

    // (195:10) {#each grid as row, tIndex}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*row*/ ctx[21];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*grid*/ 8) {
    				each_value_1 = /*row*/ ctx[21];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(195:10) {#each grid as row, tIndex}",
    		ctx
    	});

    	return block;
    }

    // (189:4) <MediaQuery query="(max-width: 480px)" let:matches>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(189:4) <MediaQuery query=\\\"(max-width: 480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (206:4) {#if matches}
    function create_if_block_1(ctx) {
    	let div3;
    	let div0;
    	let span0;
    	let t1;
    	let div1;
    	let span1;
    	let t3;
    	let span2;
    	let t5;
    	let span3;
    	let t7;
    	let div2;
    	let span4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "^";
    			t1 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span1.textContent = "<";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "0";
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = ">";
    			t7 = space();
    			div2 = element("div");
    			span4 = element("span");
    			span4.textContent = "^";
    			attr_dev(span0, "class", "control-node control-up svelte-1dq6dpi");
    			add_location(span0, file, 208, 10, 5467);
    			attr_dev(div0, "class", "control-group control-group-1 svelte-1dq6dpi");
    			add_location(div0, file, 207, 8, 5413);
    			attr_dev(span1, "class", "control-node control-left svelte-1dq6dpi");
    			add_location(span1, file, 211, 10, 5645);
    			attr_dev(span2, "class", "control-node control-start svelte-1dq6dpi");
    			add_location(span2, file, 212, 10, 5763);
    			attr_dev(span3, "class", "control-node control-right svelte-1dq6dpi");
    			add_location(span3, file, 213, 10, 5879);
    			attr_dev(div1, "class", "control-group control-group-2 svelte-1dq6dpi");
    			add_location(div1, file, 210, 8, 5591);
    			attr_dev(span4, "class", "control-node control-down  svelte-1dq6dpi");
    			add_location(span4, file, 216, 10, 6074);
    			attr_dev(div2, "class", "control-group control-group-3 rotated svelte-1dq6dpi");
    			add_location(div2, file, 215, 8, 6012);
    			attr_dev(div3, "class", "mobile-control svelte-1dq6dpi");
    			add_location(div3, file, 206, 6, 5376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, span1);
    			append_dev(div1, t3);
    			append_dev(div1, span2);
    			append_dev(div1, t5);
    			append_dev(div1, span3);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, span4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", /*click_handler*/ ctx[6], false, false, false),
    					listen_dev(span1, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(span2, "click", /*click_handler_2*/ ctx[8], false, false, false),
    					listen_dev(span3, "click", /*click_handler_3*/ ctx[9], false, false, false),
    					listen_dev(span4, "click", /*click_handler_4*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(206:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (205:2) <MediaQuery query="(max-width: 480px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(205:2) <MediaQuery query=\\\"(max-width: 480px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (248:4) {#if matches}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Press cmd/ctrl + R to reload the game";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Press Space to start/pause the game";
    			add_location(div0, file, 249, 8, 6962);
    			add_location(div1, file, 250, 8, 7022);
    			attr_dev(div2, "class", "footer-right svelte-1dq6dpi");
    			add_location(div2, file, 248, 6, 6927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(248:4) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (247:2) <MediaQuery query="(min-width: 481px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let if_block = /*matches*/ ctx[20] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[20]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(247:2) <MediaQuery query=\\\"(min-width: 481px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let mediaquery0;
    	let t0;
    	let mediaquery1;
    	let t1;
    	let mediaquery2;
    	let t2;
    	let mediaquery3;
    	let t3;
    	let mediaquery4;
    	let t4;
    	let div1;
    	let div0;
    	let span0;
    	let t6;
    	let span1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t7;
    	let span2;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let span3;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let mediaquery5;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot_5,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(max-width: 480px)",
    				$$slots: {
    					default: [
    						create_default_slot_4,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery2 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot_3,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery3 = new MediaQuery({
    			props: {
    				query: "(max-width: 480px)",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery4 = new MediaQuery({
    			props: {
    				query: "(max-width: 480px)",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery5 = new MediaQuery({
    			props: {
    				query: "(min-width: 481px)",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ matches }) => ({ 20: matches }),
    						({ matches }) => matches ? 1048576 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(mediaquery0.$$.fragment);
    			t0 = space();
    			create_component(mediaquery1.$$.fragment);
    			t1 = space();
    			create_component(mediaquery2.$$.fragment);
    			t2 = space();
    			create_component(mediaquery3.$$.fragment);
    			t3 = space();
    			create_component(mediaquery4.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "Pradeep Mishra";
    			t6 = space();
    			span1 = element("span");
    			a0 = element("a");
    			img0 = element("img");
    			t7 = space();
    			span2 = element("span");
    			a1 = element("a");
    			img1 = element("img");
    			t8 = space();
    			span3 = element("span");
    			a2 = element("a");
    			img2 = element("img");
    			t9 = space();
    			create_component(mediaquery5.$$.fragment);
    			attr_dev(span0, "class", "creator svelte-1dq6dpi");
    			add_location(span0, file, 227, 6, 6300);
    			if (!src_url_equal(img0.src, img0_src_value = "/github.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github");
    			add_location(img0, file, 230, 8, 6434);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://github.com/pradeep-mishra");
    			add_location(a0, file, 229, 8, 6365);
    			add_location(span1, file, 228, 6, 6350);
    			if (!src_url_equal(img1.src, img1_src_value = "/linkedin.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "linkedin");
    			add_location(img1, file, 235, 8, 6600);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://www.linkedin.com/in/ipradeepmishra/");
    			add_location(a1, file, 234, 8, 6521);
    			add_location(span2, file, 233, 6, 6506);
    			if (!src_url_equal(img2.src, img2_src_value = "/twitter.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "twitter");
    			add_location(img2, file, 240, 8, 6761);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://twitter.com/ipradeepmishra");
    			add_location(a2, file, 239, 8, 6691);
    			add_location(span3, file, 238, 6, 6676);
    			add_location(div0, file, 226, 4, 6287);
    			attr_dev(div1, "class", "footer-left svelte-1dq6dpi");
    			add_location(div1, file, 225, 2, 6257);
    			attr_dev(main, "class", "svelte-1dq6dpi");
    			add_location(main, file, 128, 0, 3082);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(mediaquery0, main, null);
    			append_dev(main, t0);
    			mount_component(mediaquery1, main, null);
    			append_dev(main, t1);
    			mount_component(mediaquery2, main, null);
    			append_dev(main, t2);
    			mount_component(mediaquery3, main, null);
    			append_dev(main, t3);
    			mount_component(mediaquery4, main, null);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t6);
    			append_dev(div0, span1);
    			append_dev(span1, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t7);
    			append_dev(div0, span2);
    			append_dev(span2, a1);
    			append_dev(a1, img1);
    			append_dev(div0, t8);
    			append_dev(div0, span3);
    			append_dev(span3, a2);
    			append_dev(a2, img2);
    			append_dev(main, t9);
    			mount_component(mediaquery5, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, score, gameStatus, matches*/ 537919494) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, score, gameStatus, matches*/ 537919494) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    			const mediaquery2_changes = {};

    			if (dirty & /*$$scope, dimension, grid, matches*/ 537919497) {
    				mediaquery2_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery2.$set(mediaquery2_changes);
    			const mediaquery3_changes = {};

    			if (dirty & /*$$scope, dimension, grid, matches*/ 537919497) {
    				mediaquery3_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery3.$set(mediaquery3_changes);
    			const mediaquery4_changes = {};

    			if (dirty & /*$$scope, matches*/ 537919488) {
    				mediaquery4_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery4.$set(mediaquery4_changes);
    			const mediaquery5_changes = {};

    			if (dirty & /*$$scope, matches*/ 537919488) {
    				mediaquery5_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery5.$set(mediaquery5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			transition_in(mediaquery2.$$.fragment, local);
    			transition_in(mediaquery3.$$.fragment, local);
    			transition_in(mediaquery4.$$.fragment, local);
    			transition_in(mediaquery5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			transition_out(mediaquery2.$$.fragment, local);
    			transition_out(mediaquery3.$$.fragment, local);
    			transition_out(mediaquery4.$$.fragment, local);
    			transition_out(mediaquery5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(mediaquery0);
    			destroy_component(mediaquery1);
    			destroy_component(mediaquery2);
    			destroy_component(mediaquery3);
    			destroy_component(mediaquery4);
    			destroy_component(mediaquery5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const width = '28px';
    const sound = true;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let dimension = 25;
    	let maxFood = 8;
    	let smallestInterval = 80;
    	let interval = 500;
    	let intervalKey;
    	let score = 0;
    	let started = false;
    	let gameStatus = "Not Started";
    	let board = new Board(dimension, maxFood, sound);
    	let grid = board.getGrid();

    	const changeView = view => {
    		if (view === "mobile") {
    			$$invalidate(0, dimension = 14);
    			maxFood = 5;
    			smallestInterval = 120;
    		}

    		board = new Board(dimension, maxFood, sound);
    		$$invalidate(3, grid = board.getGrid());

    		board.onScore(() => {
    			$$invalidate(1, score += 1);
    			clearInterval(intervalKey);
    			interval = 500 - score * 20;

    			interval = interval < smallestInterval
    			? smallestInterval
    			: interval;

    			intervalKey = start();
    		});

    		board.onGameOver(() => {
    			clearInterval(intervalKey);
    			$$invalidate(2, gameStatus = "Game Over");
    			let elem = document.getElementsByClassName("head");

    			if (elem.length) {
    				var rect = elem[0].getBoundingClientRect();

    				sparcle({
    					pageX: Number.parseInt(rect.x),
    					pageY: Number.parseInt(rect.y)
    				});
    			}
    		});

    		return "";
    	};

    	changeView("desktop");

    	const handleMobileButtonClick = (evt, direction) => {
    		animateButton(evt);

    		switch (direction) {
    			case 'SPACE':
    				return keyHandler({ keyCode: 32 });
    			case 'UP':
    				return keyHandler({ keyCode: 38 });
    			case 'RIGHT':
    				return keyHandler({ keyCode: 39 });
    			case 'DOWN':
    				return keyHandler({ keyCode: 40 });
    			case 'LEFT':
    				return keyHandler({ keyCode: 37 });
    		}
    	};

    	const animateButton = evt => {
    		evt.target.animate(
    			[
    				{ backgroundColor: 'transparent' },
    				{ backgroundColor: 'yellow' },
    				{ backgroundColor: 'transparent' }
    			],
    			{ duration: 300 }
    		);
    	};

    	const start = () => {
    		return setInterval(board.snake.move.bind(board.snake), interval);
    	};

    	const keyHandler = evt => {
    		if ([32, 38, 39, 40, 37].includes(evt.keyCode)) {
    			evt && evt.preventDefault ? evt.preventDefault() : '';
    		}

    		switch (evt.keyCode) {
    			case 32:
    				// space
    				if (!started) {
    					started = true;
    					intervalKey = start();
    					$$invalidate(2, gameStatus = "Playing");
    				} else if (gameStatus !== "Game Over") {
    					clearInterval(intervalKey);
    					$$invalidate(2, gameStatus = "Paused");
    					started = false;
    				}
    				break;
    			case 38:
    				// up
    				if (gameStatus === "Playing") {
    					board.snake.setDirection('UP');
    				}
    				break;
    			case 39:
    				// right
    				if (gameStatus === "Playing") {
    					board.snake.setDirection('RIGHT');
    				}
    				break;
    			case 40:
    				// down
    				if (gameStatus === "Playing") {
    					board.snake.setDirection('DOWN');
    				}
    				break;
    			case 37:
    				// left
    				if (gameStatus === "Playing") {
    					board.snake.setDirection('LEFT');
    				}
    				break;
    		}
    	};

    	document.addEventListener("keydown", keyHandler);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = evt => handleMobileButtonClick(evt, 'UP');
    	const click_handler_1 = evt => handleMobileButtonClick(evt, 'LEFT');
    	const click_handler_2 = evt => handleMobileButtonClick(evt, 'SPACE');
    	const click_handler_3 = evt => handleMobileButtonClick(evt, 'RIGHT');
    	const click_handler_4 = evt => handleMobileButtonClick(evt, 'DOWN');

    	$$self.$capture_state = () => ({
    		blast: sparcle,
    		Board,
    		MediaQuery,
    		dimension,
    		maxFood,
    		smallestInterval,
    		width,
    		sound,
    		interval,
    		intervalKey,
    		score,
    		started,
    		gameStatus,
    		board,
    		grid,
    		changeView,
    		handleMobileButtonClick,
    		animateButton,
    		start,
    		keyHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('dimension' in $$props) $$invalidate(0, dimension = $$props.dimension);
    		if ('maxFood' in $$props) maxFood = $$props.maxFood;
    		if ('smallestInterval' in $$props) smallestInterval = $$props.smallestInterval;
    		if ('interval' in $$props) interval = $$props.interval;
    		if ('intervalKey' in $$props) intervalKey = $$props.intervalKey;
    		if ('score' in $$props) $$invalidate(1, score = $$props.score);
    		if ('started' in $$props) started = $$props.started;
    		if ('gameStatus' in $$props) $$invalidate(2, gameStatus = $$props.gameStatus);
    		if ('board' in $$props) board = $$props.board;
    		if ('grid' in $$props) $$invalidate(3, grid = $$props.grid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		dimension,
    		score,
    		gameStatus,
    		grid,
    		changeView,
    		handleMobileButtonClick,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {

    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
