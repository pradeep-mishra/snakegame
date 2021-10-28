import { throws } from 'assert';
import Util from './utils';

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

export default class Snake{
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
      }else{
        direction = prevDir.x > this.tail.x ? 'RIGHT' : 'LEFT';
      }
    }else{
      direction = this.direction;
    }
    switch (direction) {
      case 'UP': 
        nextPoint = new SnakePoint(this.tail.x, this.head.y+1)
        break
      case 'RIGHT':
        nextPoint = new SnakePoint(this.tail.x-1, this.tail.y)
        break
      case 'DOWN':
        nextPoint = new SnakePoint(this.tail.x, this.head.y-1)
        break
      case 'LEFT':
        nextPoint = new SnakePoint(this.tail.x + 1, this.tail.y)
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
          Util.addClass(this.head.x,(this.head.y-1), "head");
          tail = this.tail;
          Util.removeClass(tail.x,tail.y,"snake");
          while(tail.prev()){
            const prev = tail.prev();
            tail.x = prev.x;
            tail.y = prev.y;
            Util.removeClass(tail.x,tail.y,"head");
            Util.addClass(tail.x,tail.y, "snake");
            tail = prev;
          }
          tail.y = tail.y-1;
          if(this._onMove){
            this._onMove();
          }
          this._bufferDirection = this.direction;
          break;
        case 'DOWN':
          Util.addClass(this.head.x,this.head.y+1, "head");
          tail = this.tail;
          Util.removeClass(tail.x,tail.y, "snake");
          while(tail.prev()){
            const prev = tail.prev();
            tail.x = prev.x;
            tail.y = prev.y;
            Util.removeClass(tail.x,tail.y, "head");
            Util.addClass(tail.x,tail.y, "snake");
            tail = prev;
          }
          tail.y = tail.y+1;
          if(this._onMove){
            this._onMove();
          }
          this._bufferDirection = this.direction;
          break;
        case 'RIGHT':    
          Util.addClass(this.head.x + 1,this.head.y, "head");
          tail = this.tail;
          Util.removeClass(tail.x,tail.y, "snake");
          while(tail.prev()){
            const prev = tail.prev();
            tail.x = prev.x;
            tail.y = prev.y;
            Util.removeClass(tail.x,tail.y, "head");
            Util.addClass(tail.x,tail.y, "snake");
            tail = prev;
          }
          tail.x = tail.x+1;
          if(this._onMove){
            this._onMove();
          }
          this._bufferDirection = this.direction;
          break;
        case 'LEFT':
          Util.addClass(this.head.x-1,this.head.y, "head");
          tail = this.tail;
          Util.removeClass(tail.x,tail.y, "snake");
          while(tail.prev()){
            const prev = tail.prev();
            tail.x = prev.x;
            tail.y = prev.y;
            Util.addClass(tail.x,tail.y, "snake");
            Util.removeClass(tail.x,tail.y, "head");
            tail = prev;
          }
          tail.x = tail.x-1;
          if(this._onMove){
            this._onMove();
          }
          this._bufferDirection = this.direction;
          break;
      }
      if(Util.getElm(`i-${this.head.x}-${this.head.y}`).classList.contains('snake')){
        return that._onGameOver();
      }
      this._board._checkHeadForFood(this.head.x, this.head.y)
    }catch(e){
      if(e === "ELEMENT NOT FOUND"){
        that._onGameOver();
        return true;
      }else{
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