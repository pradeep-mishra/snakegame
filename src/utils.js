export default class Utils {
  static grid

  static setGrid(grid) {
    this.grid = grid
  }
  static addClass(x, y, className) {
    const elm = document.getElementById(`i-${x}-${y}`)
    if (!elm) {
      throw 'ELEMENT NOT FOUND'
    }
    elm.classList.add(className)
    if (this.grid[y][x] !== 2) {
      this.grid[y][x] =
        className === 'head'
          ? 3
          : className === 'food'
          ? 2
          : className === 'snake'
          ? 1
          : 0
    }
  }

  static removeClass(x, y, className) {
    const elm = document.getElementById(`i-${x}-${y}`)
    if (!elm) {
      throw 'ELEMENT NOT FOUND'
    }
    elm.classList.remove(className)
    this.grid[y][x] = 0
  }

  static getElm(selectorId) {
    return document.getElementById(selectorId)
  }

  static hasClass(selectorId, className) {
    return this.getElm(selectorId).classList.contains(className)
  }
}
