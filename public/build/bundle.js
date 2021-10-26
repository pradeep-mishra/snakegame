
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    class Utils {
        static setGrid(grid) {
            this.grid = grid;
        }
        static addClass(x, y, className) {
            const elm = document.getElementById(`i-${x}-${y}`);
            if (!elm) {
                throw 'ELEMENT NOT FOUND';
            }
            elm.classList.add(className);
            if (this.grid[y][x] !== 2) {
                this.grid[y][x] = className === 'head' ? 3 : className === 'food' ? 2 : className === 'snake' ? 1 : 0;
            }
        }
        static removeClass(x, y, className) {
            const elm = document.getElementById(`i-${x}-${y}`);
            if (!elm) {
                throw 'ELEMENT NOT FOUND';
            }
            elm.classList.remove(className);
            this.grid[y][x] = 0;
        }
        static getElm(selectorId) {
            return document.getElementById(selectorId);
        }
        static hasClass(selectorId, className) {
            return this.getElm(selectorId).classList.contains(className);
        }
    }

    class SnakePoint {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.prevPoint = null;
            this.nextPoint = null;
        }
        prev(point) {
            if (point) {
                this.prevPoint = point;
            }
            return this.prevPoint;
        }
        next(point) {
            if (point) {
                this.nextPoint = point;
                this.nextPoint.prev(this);
            }
            return this.nextPoint;
        }
    }
    class Snake {
        constructor(snakeX, snakeY, board) {
            this.size = -2;
            this.initSize = 2;
            this.direction = "RIGHT";
            this._bufferDirection = "RIGHT";
            this._board = board;
            this.head = new SnakePoint(snakeX, snakeY);
            this.tail = this.head;
            this.stretchBy(this.initSize);
        }
        stretch() {
            let nextPoint;
            let direction;
            let prevDir = this.tail.prev();
            if (prevDir) {
                if (prevDir.x === this.tail.x) {
                    direction = prevDir.y > this.tail.y ? 'DOWN' : 'UP';
                }
                else {
                    direction = prevDir.x > this.tail.x ? 'RIGHT' : 'LEFT';
                }
            }
            else {
                direction = this.direction;
            }
            switch (direction) {
                case 'UP':
                    nextPoint = new SnakePoint(this.tail.x, this.head.y + 1);
                    break;
                case 'RIGHT':
                    nextPoint = new SnakePoint(this.tail.x - 1, this.tail.y);
                    break;
                case 'DOWN':
                    nextPoint = new SnakePoint(this.tail.x, this.head.y - 1);
                    break;
                case 'LEFT':
                    nextPoint = new SnakePoint(this.tail.x + 1, this.tail.y);
                    break;
            }
            this.tail.next(nextPoint);
            this.tail = nextPoint;
            this.size = this.size + 1;
        }
        stretchBy(points = 2) {
            for (let i = 0; i < points; i++) {
                this.stretch();
            }
            return this;
        }
        move() {
            const that = this;
            try {
                let tail;
                switch (this.direction) {
                    case 'UP':
                        Utils.addClass(this.head.x, (this.head.y - 1), "head");
                        tail = this.tail;
                        Utils.removeClass(tail.x, tail.y, "snake");
                        while (tail.prev()) {
                            const prev = tail.prev();
                            tail.x = prev.x;
                            tail.y = prev.y;
                            Utils.removeClass(tail.x, tail.y, "head");
                            Utils.addClass(tail.x, tail.y, "snake");
                            tail = prev;
                        }
                        tail.y = tail.y - 1;
                        if (this._onMove) {
                            this._onMove();
                        }
                        this._bufferDirection = this.direction;
                        break;
                    case 'DOWN':
                        Utils.addClass(this.head.x, this.head.y + 1, "head");
                        tail = this.tail;
                        Utils.removeClass(tail.x, tail.y, "snake");
                        while (tail.prev()) {
                            const prev = tail.prev();
                            tail.x = prev.x;
                            tail.y = prev.y;
                            Utils.removeClass(tail.x, tail.y, "head");
                            Utils.addClass(tail.x, tail.y, "snake");
                            tail = prev;
                        }
                        tail.y = tail.y + 1;
                        if (this._onMove) {
                            this._onMove();
                        }
                        this._bufferDirection = this.direction;
                        break;
                    case 'RIGHT':
                        Utils.addClass(this.head.x + 1, this.head.y, "head");
                        tail = this.tail;
                        Utils.removeClass(tail.x, tail.y, "snake");
                        while (tail.prev()) {
                            const prev = tail.prev();
                            tail.x = prev.x;
                            tail.y = prev.y;
                            Utils.removeClass(tail.x, tail.y, "head");
                            Utils.addClass(tail.x, tail.y, "snake");
                            tail = prev;
                        }
                        tail.x = tail.x + 1;
                        if (this._onMove) {
                            this._onMove();
                        }
                        this._bufferDirection = this.direction;
                        break;
                    case 'LEFT':
                        Utils.addClass(this.head.x - 1, this.head.y, "head");
                        tail = this.tail;
                        Utils.removeClass(tail.x, tail.y, "snake");
                        while (tail.prev()) {
                            const prev = tail.prev();
                            tail.x = prev.x;
                            tail.y = prev.y;
                            Utils.addClass(tail.x, tail.y, "snake");
                            Utils.removeClass(tail.x, tail.y, "head");
                            tail = prev;
                        }
                        tail.x = tail.x - 1;
                        if (this._onMove) {
                            this._onMove();
                        }
                        this._bufferDirection = this.direction;
                        break;
                }
                if (Utils.getElm(`i-${this.head.x}-${this.head.y}`).classList.contains('snake')) {
                    return that._onGameOver();
                }
                this._board._checkHeadForFood(this.head.x, this.head.y);
            }
            catch (e) {
                if (e === "ELEMENT NOT FOUND") {
                    that._onGameOver();
                    return true;
                }
                else {
                    throw e;
                }
            }
            return this;
        }
        setDirection(direction) {
            if (direction === "RIGHT" && this.direction === "LEFT") {
                return true;
            }
            if (direction === "LEFT" && this.direction === 'RIGHT') {
                return true;
            }
            if (direction === "UP" && this.direction === "DOWN") {
                return true;
            }
            if (direction === "DOWN" && this.direction === "UP") {
                return true;
            }
            if (this.direction !== this._bufferDirection) {
                return true;
            }
            switch (direction) {
                case "UP":
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
        onMove(func) {
            this._onMove = func;
        }
        onGameOver(func) {
            this._onGameOver = func;
        }
    }

    class Board {
        constructor(dimension = 25, sound = true) {
            this._dimension = dimension;
            this._sound = sound;
            this._eatSound = new Audio('/eat.wav');
            this._tickSound = new Audio('/tick.wav');
            this._blastSound = new Audio('/blast.wav');
            this.snake = new Snake(2, 0, this);
            this.snake.onGameOver(() => {
                if (this._sound) {
                    this._blastSound.play();
                }
                if (this._onGameOver) {
                    this._onGameOver();
                }
            });
            this._grid = new Array(dimension).fill(0).map(() => {
                return new Array(dimension).fill(0).map(() => 0);
            });
            Utils.setGrid(this._grid);
            this._dropSnakeOnBoard();
            this._dropFoodOnBoard();
        }
        getGrid() {
            return this._grid;
        }
        onScore(func) {
            this._onScore = () => {
                func();
            };
        }
        onGameOver(func) {
            this._onGameOver = () => {
                func();
            };
        }
        _dropSnakeOnBoard() {
            let snakeHead = this.snake.head;
            this._grid[snakeHead.y][snakeHead.x] = 3;
            while (snakeHead.next()) {
                snakeHead = snakeHead.next();
                if (this._grid[snakeHead.y] !== undefined && this._grid[snakeHead.y][snakeHead.x] !== undefined) {
                    this._grid[snakeHead.y][snakeHead.x] = 1;
                }
            }
        }
        _dropFoodOnBoard() {
            for (let i = 0; i < 8; i++) {
                this._addNewFood();
            }
        }
        _randomIntBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        _checkHeadForFood(xAxis, yAxis) {
            if (this._grid[yAxis][xAxis] === 2 || Utils.hasClass(`i-${xAxis}-${yAxis}`, 'food')) {
                if (this._sound) {
                    this._eatSound.play();
                }
                this._grid[yAxis][xAxis] = 0;
                Utils.removeClass(xAxis, yAxis, 'food');
                this._onScore();
                this.snake.stretch();
                this._addNewFood(true);
            }
        }
        _addNewFood(withClass = false) {
            const y = this._randomIntBetween(3, (this._dimension - 2));
            const x = this._randomIntBetween(3, (this._dimension - 2));
            if (withClass) {
                Utils.addClass(x, y, 'food');
            }
            else {
                this._grid[y][x] = 2;
            }
        }
    }

    /* src/App.svelte generated by Svelte v3.43.1 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	child_ctx[11] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (106:6) {#each row as cell, bIndex}
    function create_each_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", 'i-' + /*bIndex*/ ctx[14] + '-' + /*tIndex*/ ctx[11]);
    			attr_dev(div, "class", "cell " + (/*cell*/ ctx[12] === 1 ? 'snake' : '') + " " + (/*cell*/ ctx[12] === 2 ? 'food' : '') + " " + (/*cell*/ ctx[12] === 3 ? 'head' : ''));
    			add_location(div, file, 106, 8, 2407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(106:6) {#each row as cell, bIndex}",
    		ctx
    	});

    	return block;
    }

    // (105:4) {#each grid as row, tIndex}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*row*/ ctx[9];
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
    			if (dirty & /*grid*/ 4) {
    				each_value_1 = /*row*/ ctx[9];
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
    		source: "(105:4) {#each grid as row, tIndex}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
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
    	let t7;
    	let div4;
    	let t8;
    	let div6;
    	let div5;
    	let span2;
    	let t10;
    	let span3;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t11;
    	let span4;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let span5;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div9;
    	let div7;
    	let t15;
    	let div8;
    	let each_value = /*grid*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Snake Game";
    			t1 = space();
    			div1 = element("div");
    			h40 = element("h4");
    			t2 = text("Status: \n        ");
    			span0 = element("span");
    			t3 = text(/*gameStatus*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			h41 = element("h4");
    			t5 = text("Score : \n        ");
    			span1 = element("span");
    			t6 = text(/*score*/ ctx[0]);
    			t7 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t8 = space();
    			div6 = element("div");
    			div5 = element("div");
    			span2 = element("span");
    			span2.textContent = "Pradeep Mishra";
    			t10 = space();
    			span3 = element("span");
    			a0 = element("a");
    			img0 = element("img");
    			t11 = space();
    			span4 = element("span");
    			a1 = element("a");
    			img1 = element("img");
    			t12 = space();
    			span5 = element("span");
    			a2 = element("a");
    			img2 = element("img");
    			t13 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "Press cmd/ctrl + R to reload the game";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "Press Space to start/pause the game";
    			attr_dev(h1, "class", "svelte-bwp65y");
    			add_location(h1, file, 85, 6, 1875);
    			attr_dev(div0, "class", "header-item title svelte-bwp65y");
    			add_location(div0, file, 84, 4, 1837);
    			attr_dev(span0, "class", "status-span svelte-bwp65y");
    			add_location(span0, file, 89, 8, 1970);
    			attr_dev(h40, "class", "svelte-bwp65y");
    			add_location(h40, file, 88, 6, 1949);
    			attr_dev(div1, "class", "header-item status svelte-bwp65y");
    			add_location(div1, file, 87, 4, 1910);
    			attr_dev(span1, "class", "score-span svelte-bwp65y");
    			add_location(span1, file, 94, 8, 2103);
    			attr_dev(h41, "class", "svelte-bwp65y");
    			add_location(h41, file, 93, 6, 2082);
    			attr_dev(div2, "class", "header-item score svelte-bwp65y");
    			add_location(div2, file, 92, 4, 2044);
    			attr_dev(div3, "class", "header svelte-bwp65y");
    			add_location(div3, file, 83, 2, 1812);
    			attr_dev(div4, "class", "grid svelte-bwp65y");
    			set_style(div4, "grid-template-rows", "repeat(" + dimension + "," + width + ")");
    			set_style(div4, "grid-template-columns", "repeat(" + dimension + "," + width + ")");
    			add_location(div4, file, 100, 2, 2195);
    			attr_dev(span2, "class", "creator svelte-bwp65y");
    			add_location(span2, file, 113, 6, 2628);
    			if (!src_url_equal(img0.src, img0_src_value = "/github.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github");
    			add_location(img0, file, 116, 8, 2762);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://github.com/pradeep-mishra");
    			add_location(a0, file, 115, 8, 2693);
    			add_location(span3, file, 114, 6, 2678);
    			if (!src_url_equal(img1.src, img1_src_value = "/linkedin.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "linkedin");
    			add_location(img1, file, 121, 8, 2928);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://www.linkedin.com/in/ipradeepmishra/");
    			add_location(a1, file, 120, 8, 2849);
    			add_location(span4, file, 119, 6, 2834);
    			if (!src_url_equal(img2.src, img2_src_value = "/twitter.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "twitter");
    			add_location(img2, file, 126, 8, 3089);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://twitter.com/ipradeepmishra");
    			add_location(a2, file, 125, 8, 3019);
    			add_location(span5, file, 124, 6, 3004);
    			add_location(div5, file, 112, 4, 2615);
    			attr_dev(div6, "class", "footer-left svelte-bwp65y");
    			add_location(div6, file, 111, 2, 2585);
    			add_location(div7, file, 133, 4, 3210);
    			add_location(div8, file, 134, 4, 3266);
    			attr_dev(div9, "class", "footer-right svelte-bwp65y");
    			add_location(div9, file, 132, 2, 3179);
    			attr_dev(main, "class", "svelte-bwp65y");
    			add_location(main, file, 80, 0, 1784);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
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
    			append_dev(main, t7);
    			append_dev(main, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(main, t8);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			append_dev(div5, span2);
    			append_dev(div5, t10);
    			append_dev(div5, span3);
    			append_dev(span3, a0);
    			append_dev(a0, img0);
    			append_dev(div5, t11);
    			append_dev(div5, span4);
    			append_dev(span4, a1);
    			append_dev(a1, img1);
    			append_dev(div5, t12);
    			append_dev(div5, span5);
    			append_dev(span5, a2);
    			append_dev(a2, img2);
    			append_dev(main, t13);
    			append_dev(main, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gameStatus*/ 2) set_data_dev(t3, /*gameStatus*/ ctx[1]);
    			if (dirty & /*score*/ 1) set_data_dev(t6, /*score*/ ctx[0]);

    			if (dirty & /*grid*/ 4) {
    				each_value = /*grid*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
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

    const dimension = 25;
    const width = '28px';
    const sound = true;

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let interval = 500;
    	let intervalKey;
    	let score = 0;
    	let started = false;
    	let gameStatus = "Not Started";
    	const board = new Board(dimension, sound);
    	const grid = board.getGrid();

    	board.onScore(() => {
    		$$invalidate(0, score += 1);
    		clearInterval(intervalKey);
    		interval = 500 - score * 20;
    		interval = interval < 80 ? 80 : interval;
    		intervalKey = start();
    	});

    	board.onGameOver(() => {
    		clearInterval(intervalKey);
    		$$invalidate(1, gameStatus = "Game Over");
    	});

    	const start = () => {
    		return setInterval(board.snake.move.bind(board.snake), interval);
    	};

    	const keyHandler = evt => {
    		if ([32, 38, 39, 40, 37].includes(evt.keyCode)) {
    			evt.preventDefault();
    		}

    		switch (evt.keyCode) {
    			case 32:
    				// space
    				if (!started) {
    					started = true;
    					intervalKey = start();
    					$$invalidate(1, gameStatus = "Playing");
    				} else if (gameStatus !== "Game Over") {
    					clearInterval(intervalKey);
    					$$invalidate(1, gameStatus = "Paused");
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
    				//console.log('set direction left')
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

    	$$self.$capture_state = () => ({
    		Board,
    		dimension,
    		width,
    		sound,
    		interval,
    		intervalKey,
    		score,
    		started,
    		gameStatus,
    		board,
    		grid,
    		start,
    		keyHandler
    	});

    	$$self.$inject_state = $$props => {
    		if ('interval' in $$props) interval = $$props.interval;
    		if ('intervalKey' in $$props) intervalKey = $$props.intervalKey;
    		if ('score' in $$props) $$invalidate(0, score = $$props.score);
    		if ('started' in $$props) started = $$props.started;
    		if ('gameStatus' in $$props) $$invalidate(1, gameStatus = $$props.gameStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [score, gameStatus, grid];
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
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
