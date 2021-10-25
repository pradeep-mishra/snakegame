var app=function(){"use strict";function t(){}function e(t){return t()}function s(){return Object.create(null)}function i(t){t.forEach(e)}function n(t){return"function"==typeof t}function r(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(t,e){t.appendChild(e)}function o(t,e,s){t.insertBefore(e,s||null)}function h(t){t.parentNode.removeChild(t)}function c(t,e){for(let s=0;s<t.length;s+=1)t[s]&&t[s].d(e)}function d(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function u(){return l(" ")}function f(t,e,s){null==s?t.removeAttribute(e):t.getAttribute(e)!==s&&t.setAttribute(e,s)}function m(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function p(t,e,s,i){t.style.setProperty(e,s,i?"important":"")}let v;function g(t){v=t}const y=[],_=[],x=[],k=[],$=Promise.resolve();let b=!1;function w(t){x.push(t)}let O=!1;const E=new Set;function C(){if(!O){O=!0;do{for(let t=0;t<y.length;t+=1){const e=y[t];g(e),T(e.$$)}for(g(null),y.length=0;_.length;)_.pop()();for(let t=0;t<x.length;t+=1){const e=x[t];E.has(e)||(E.add(e),e())}x.length=0}while(y.length);for(;k.length;)k.pop()();b=!1,O=!1,E.clear()}}function T(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(w)}}const G=new Set;function P(t,e){-1===t.$$.dirty[0]&&(y.push(t),b||(b=!0,$.then(C)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function N(r,a,o,c,d,l,u,f=[-1]){const m=v;g(r);const p=r.$$={fragment:null,ctx:null,props:l,update:t,not_equal:d,bound:s(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(a.context||(m?m.$$.context:[])),callbacks:s(),dirty:f,skip_bound:!1,root:a.target||m.$$.root};u&&u(p.root);let y=!1;if(p.ctx=o?o(r,a.props||{},((t,e,...s)=>{const i=s.length?s[0]:e;return p.ctx&&d(p.ctx[t],p.ctx[t]=i)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](i),y&&P(r,t)),e})):[],p.update(),y=!0,i(p.before_update),p.fragment=!!c&&c(p.ctx),a.target){if(a.hydrate){const t=function(t){return Array.from(t.childNodes)}(a.target);p.fragment&&p.fragment.l(t),t.forEach(h)}else p.fragment&&p.fragment.c();a.intro&&((_=r.$$.fragment)&&_.i&&(G.delete(_),_.i(x))),function(t,s,r,a){const{fragment:o,on_mount:h,on_destroy:c,after_update:d}=t.$$;o&&o.m(s,r),a||w((()=>{const s=h.map(e).filter(n);c?c.push(...s):i(s),t.$$.on_mount=[]})),d.forEach(w)}(r,a.target,a.anchor,a.customElement),C()}var _,x;g(m)}class D{static setGrid(t){this.grid=t}static addClass(t,e,s){const i=document.getElementById(`i-${t}-${e}`);if(!i)throw"ELEMENT NOT FOUND";i.classList.add(s),2!==this.grid[e][t]&&(this.grid[e][t]="head"===s?3:"food"===s?2:"snake"===s?1:0)}static removeClass(t,e,s){const i=document.getElementById(`i-${t}-${e}`);if(!i)throw"ELEMENT NOT FOUND";i.classList.remove(s),this.grid[e][t]=0}static getElm(t){return document.getElementById(t)}static hasClass(t,e){return this.getElm(t).classList.contains(e)}}class M{constructor(t,e){this.x=t,this.y=e,this.prevPoint=null,this.nextPoint=null}prev(t){return t&&(this.prevPoint=t),this.prevPoint}next(t){return t&&(this.nextPoint=t,this.nextPoint.prev(this)),this.nextPoint}}class S{constructor(t,e,s){this.size=-2,this.initSize=2,this.direction="RIGHT",this._bufferDirection="RIGHT",this._board=s,this.head=new M(t,e),this.tail=this.head,this.stretchBy(this.initSize)}stretch(){let t,e,s=this.tail.prev();switch(e=s?s.x===this.tail.x?s.y>this.tail.y?"DOWN":"UP":s.x>this.tail.x?"RIGHT":"LEFT":this.direction,e){case"UP":t=new M(this.tail.x,this.head.y+1);break;case"RIGHT":t=new M(this.tail.x-1,this.tail.y);break;case"DOWN":t=new M(this.tail.x,this.head.y-1);break;case"LEFT":t=new M(this.tail.x+1,this.tail.y)}this.tail.next(t),this.tail=t,this.size=this.size+1}stretchBy(t=2){for(let e=0;e<t;e++)this.stretch();return this}move(){const t=this;try{let e;switch(this.direction){case"UP":for(D.addClass(this.head.x,this.head.y-1,"head"),e=this.tail,D.removeClass(e.x,e.y,"snake");e.prev();){const t=e.prev();e.x=t.x,e.y=t.y,D.removeClass(e.x,e.y,"head"),D.addClass(e.x,e.y,"snake"),e=t}e.y=e.y-1,this._onMove&&this._onMove(),this._bufferDirection=this.direction;break;case"DOWN":for(D.addClass(this.head.x,this.head.y+1,"head"),e=this.tail,D.removeClass(e.x,e.y,"snake");e.prev();){const t=e.prev();e.x=t.x,e.y=t.y,D.removeClass(e.x,e.y,"head"),D.addClass(e.x,e.y,"snake"),e=t}e.y=e.y+1,this._onMove&&this._onMove(),this._bufferDirection=this.direction;break;case"RIGHT":for(D.addClass(this.head.x+1,this.head.y,"head"),e=this.tail,D.removeClass(e.x,e.y,"snake");e.prev();){const t=e.prev();e.x=t.x,e.y=t.y,D.removeClass(e.x,e.y,"head"),D.addClass(e.x,e.y,"snake"),e=t}e.x=e.x+1,this._onMove&&this._onMove(),this._bufferDirection=this.direction;break;case"LEFT":for(D.addClass(this.head.x-1,this.head.y,"head"),e=this.tail,D.removeClass(e.x,e.y,"snake");e.prev();){const t=e.prev();e.x=t.x,e.y=t.y,D.addClass(e.x,e.y,"snake"),D.removeClass(e.x,e.y,"head"),e=t}e.x=e.x-1,this._onMove&&this._onMove(),this._bufferDirection=this.direction}if(D.getElm(`i-${this.head.x}-${this.head.y}`).classList.contains("snake"))return t._onGameOver();this._board._checkHeadForFood(this.head.x,this.head.y)}catch(e){if("ELEMENT NOT FOUND"===e)return t._onGameOver(),!0;throw e}return this}setDirection(t){if("RIGHT"===t&&"LEFT"===this.direction)return!0;if("LEFT"===t&&"RIGHT"===this.direction)return!0;if("UP"===t&&"DOWN"===this.direction)return!0;if("DOWN"===t&&"UP"===this.direction)return!0;if(this.direction!==this._bufferDirection)return!0;switch(t){case"UP":case"DOWN":case"LEFT":case"RIGHT":this.direction=t}return this}onMove(t){this._onMove=t}onGameOver(t){this._onGameOver=t}}class F{constructor(t=25,e=!0){this._dimension=t,this._sound=e,this._eatSound=new Audio("/eat.wav"),this._tickSound=new Audio("/tick.wav"),this._blastSound=new Audio("/blast.wav"),this.snake=new S(2,0,this),this.snake.onGameOver((()=>{this._sound&&this._blastSound.play(),this._onGameOver&&this._onGameOver()})),this._grid=new Array(t).fill(0).map((()=>new Array(t).fill(0).map((()=>0)))),D.setGrid(this._grid),this._dropSnakeOnBoard(),this._dropFoodOnBoard()}getGrid(){return this._grid}onScore(t){this._onScore=()=>{t()}}onGameOver(t){this._onGameOver=()=>{t()}}_dropSnakeOnBoard(){let t=this.snake.head;for(this._grid[t.y][t.x]=3;t.next();)t=t.next(),void 0!==this._grid[t.y]&&void 0!==this._grid[t.y][t.x]&&(this._grid[t.y][t.x]=1)}_dropFoodOnBoard(){for(let t=0;t<8;t++)this._addNewFood()}_randomIntBetween(t,e){return Math.floor(Math.random()*(e-t+1)+t)}_checkHeadForFood(t,e){(2===this._grid[e][t]||D.hasClass(`i-${t}-${e}`,"food"))&&(this._sound&&this._eatSound.play(),this._grid[e][t]=0,D.removeClass(t,e,"food"),this._onScore(),this.snake.stretch(),this._addNewFood(!0))}_addNewFood(t=!1){const e=this._randomIntBetween(3,this._dimension-2),s=this._randomIntBetween(3,this._dimension-2);t?D.addClass(s,e,"food"):this._grid[e][s]=2}}function I(t,e,s){const i=t.slice();return i[9]=e[s],i[11]=s,i}function z(t,e,s){const i=t.slice();return i[12]=e[s],i[14]=s,i}function L(e){let s;return{c(){s=d("div"),f(s,"id","i-"+e[14]+"-"+e[11]),f(s,"class","cell "+(1===e[12]?"snake":"")+" "+(2===e[12]?"food":"")+" "+(3===e[12]?"head":""))},m(t,e){o(t,s,e)},p:t,d(t){t&&h(s)}}}function q(t){let e,s=t[9],i=[];for(let e=0;e<s.length;e+=1)i[e]=L(z(t,s,e));return{c(){for(let t=0;t<i.length;t+=1)i[t].c();e=l("")},m(t,s){for(let e=0;e<i.length;e+=1)i[e].m(t,s);o(t,e,s)},p(t,n){if(4&n){let r;for(s=t[9],r=0;r<s.length;r+=1){const a=z(t,s,r);i[r]?i[r].p(a,n):(i[r]=L(a),i[r].c(),i[r].m(e.parentNode,e))}for(;r<i.length;r+=1)i[r].d(1);i.length=s.length}},d(t){c(i,t),t&&h(e)}}}function H(e){let s,i,n,r,v,g,y,_,x,k,$,b,w,O,E,C,T,G,P,N,D,M=e[2],S=[];for(let t=0;t<M.length;t+=1)S[t]=q(I(e,M,t));return{c(){s=d("main"),i=d("div"),n=d("div"),n.innerHTML='<h1 class="svelte-i8azq5">Snake Game</h1>',r=u(),v=d("div"),g=d("h4"),y=l("Status: \n        "),_=d("span"),x=l(e[1]),k=u(),$=d("div"),b=d("h4"),w=l("Score : \n        "),O=d("span"),E=l(e[0]),C=u(),T=d("div");for(let t=0;t<S.length;t+=1)S[t].c();G=u(),P=d("div"),P.innerHTML='<div>Creator : Pradeep Mishra\n      <span><a href="https://www.linkedin.com/in/ipradeepmishra/"><img src="/linkedin.png" alt="linkedin"/></a></span> \n      <span><a href="https://twitter.com/ipradeepmishra"><img src="/twitter.png" alt="twitter"/></a></span></div>',N=u(),D=d("div"),D.innerHTML="<div>Press cmd/ctrl + R to reload the game</div> \n    <div>Press Space to start/pause the game</div>",f(n,"class","header-item title svelte-i8azq5"),f(_,"class","status-span svelte-i8azq5"),f(g,"class","svelte-i8azq5"),f(v,"class","header-item status svelte-i8azq5"),f(O,"class","score-span svelte-i8azq5"),f(b,"class","svelte-i8azq5"),f($,"class","header-item score svelte-i8azq5"),f(i,"class","header svelte-i8azq5"),f(T,"class","grid svelte-i8azq5"),p(T,"grid-template-rows","repeat("+B+","+R+")"),p(T,"grid-template-columns","repeat("+B+","+R+")"),f(P,"class","footer-left svelte-i8azq5"),f(D,"class","footer-right svelte-i8azq5"),f(s,"class","svelte-i8azq5")},m(t,e){o(t,s,e),a(s,i),a(i,n),a(i,r),a(i,v),a(v,g),a(g,y),a(g,_),a(_,x),a(i,k),a(i,$),a($,b),a(b,w),a(b,O),a(O,E),a(s,C),a(s,T);for(let t=0;t<S.length;t+=1)S[t].m(T,null);a(s,G),a(s,P),a(s,N),a(s,D)},p(t,[e]){if(2&e&&m(x,t[1]),1&e&&m(E,t[0]),4&e){let s;for(M=t[2],s=0;s<M.length;s+=1){const i=I(t,M,s);S[s]?S[s].p(i,e):(S[s]=q(i),S[s].c(),S[s].m(T,null))}for(;s<S.length;s+=1)S[s].d(1);S.length=M.length}},i:t,o:t,d(t){t&&h(s),c(S,t)}}}const B=25,R="28px";function U(t,e,s){let i,n=500,r=0,a=!1,o="Not Started";const h=new F(B,true),c=h.getGrid();h.onScore((()=>{s(0,r+=1),clearInterval(i),n=500-20*r,n=n<80?80:n,i=d()})),h.onGameOver((()=>{clearInterval(i),s(1,o="Game Over")}));const d=()=>setInterval(h.snake.move.bind(h.snake),n);return document.addEventListener("keydown",(t=>{switch([32,38,39,40,37].includes(t.keyCode)&&t.preventDefault(),t.keyCode){case 32:a?"Game Over"!==o&&(clearInterval(i),s(1,o="Paused"),a=!1):(a=!0,i=d(),s(1,o="Playing"));break;case 38:"Playing"===o&&h.snake.setDirection("UP");break;case 39:"Playing"===o&&h.snake.setDirection("RIGHT");break;case 40:"Playing"===o&&h.snake.setDirection("DOWN");break;case 37:"Playing"===o&&h.snake.setDirection("LEFT")}})),[r,o,c]}return new class extends class{$destroy(){!function(t,e){const s=t.$$;null!==s.fragment&&(i(s.on_destroy),s.fragment&&s.fragment.d(e),s.on_destroy=s.fragment=null,s.ctx=[])}(this,1),this.$destroy=t}$on(t,e){const s=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return s.push(e),()=>{const t=s.indexOf(e);-1!==t&&s.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),N(this,t,U,H,r,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
