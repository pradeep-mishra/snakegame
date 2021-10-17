export default class Utils{
  static addClass(selectorId, className){
    const elm =document.getElementById(selectorId);
    if(!elm){
      throw 'ELEMENT NOT FOUND';
    }
    elm.classList.add(className);
  }

  static removeClass(selectorId, className){
    const elm =document.getElementById(selectorId);
    if(!elm){
      throw 'ELEMENT NOT FOUND';
    }
    elm.classList.remove(className);
  }

  static getElm(selectorId){
    return document.getElementById(selectorId)
  }
}







