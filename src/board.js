import Snake from './snake'
import Util from './utils'

export default class Board {
  snake

  _eatSound
  _tickSound
  _blastSound
  _grid
  _onScore = () => {}
  _onGameOver
  _dimension
  _sound
  _maxFood
  constructor(dimension = 25, maxFood = 8, sound = true) {
    this._dimension = dimension
    this._maxFood = maxFood
    this._sound = sound
    this._eatSound = new Audio('/eat.wav')
    this._tickSound = new Audio('/tick.wav')
    this._blastSound = new Audio('/blast.wav')
    this.snake = new Snake(2, 0, this)
    this.snake.onGameOver(() => {
      if (this._sound) {
        this._blastSound.play()
      }
      if (this._onGameOver) {
        this._onGameOver()
      }
    })
    this._grid = new Array(dimension).fill(0).map(() => {
      return new Array(dimension).fill(0).map(() => 0)
    })
    Util.setGrid(this._grid)
    this._dropSnakeOnBoard()
    this._dropFoodOnBoard()
  }

  getGrid() {
    return this._grid
  }

  onScore(func) {
    this._onScore = () => {
      func()
    }
  }

  onGameOver(func) {
    this._onGameOver = () => {
      func()
    }
  }

  _dropSnakeOnBoard() {
    let snakeHead = this.snake.head
    this._grid[snakeHead.y][snakeHead.x] = 3
    while (snakeHead.next()) {
      snakeHead = snakeHead.next()
      if (
        this._grid[snakeHead.y] !== undefined &&
        this._grid[snakeHead.y][snakeHead.x] !== undefined
      ) {
        this._grid[snakeHead.y][snakeHead.x] = 1
      }
    }
  }
  _dropFoodOnBoard() {
    for (let i = 0; i < this._maxFood; i++) {
      this._addNewFood()
    }
  }
  _randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  _checkHeadForFood(xAxis, yAxis) {
    if (
      this._grid[yAxis][xAxis] === 2 ||
      Util.hasClass(`i-${xAxis}-${yAxis}`, 'food')
    ) {
      //console.log('snake ate food')
      if (this._sound) {
        this._eatSound.play()
      }
      this._grid[yAxis][xAxis] = 0
      Util.removeClass(xAxis, yAxis, 'food')
      this._onScore()
      this.snake.stretch()
      this._addNewFood(true)
    }
  }
  _addNewFood(withClass = false) {
    const y = this._randomIntBetween(3, this._dimension - 2)
    const x = this._randomIntBetween(3, this._dimension - 2)
    if (withClass) {
      Util.addClass(x, y, 'food')
    } else {
      this._grid[y][x] = 2
    }
  }
}
