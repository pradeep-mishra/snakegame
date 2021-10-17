<script>
	import Board from './board'; 
	const dimension =25;
	const width = '28px';
  const sound =true;
  let interval=500;
  let intervalKey;
  let score = 0;
  let started =false;
  let gameStatus = "Not Started";

	const board = new Board(dimension, sound);
	const grid = board.getGrid();
  
  board.onScore(()=>{
    score += 1;
    clearInterval(intervalKey)
    interval = 500 - (score * 20);
    interval = interval < 100 ? 100 : interval;
    intervalKey = start();
  })
  board.onGameOver(()=>{ 
    clearInterval(intervalKey)
    gameStatus ="Game Over"
  })

  const start = ()=>{
    return setInterval(board.snake .move.bind(board.snake) ,interval)
  }
	
  const keyHandler = (evt)=>{
    if([32,38,39,40,37].includes(evt.keyCode)){
      evt.preventDefault();
    }
		switch (evt.keyCode) {
			case 32:
					// space
        if(!started){
          started=true;
          intervalKey = start()
          gameStatus="Playing";
        }else if(gameStatus !== "Game Over"){
          clearInterval(intervalKey);
          gameStatus="Paused";
          started =false;
        }
        break;
      case 38:
				// up
        if(gameStatus === "Playing"){
          board.snake.setDirection('UP');
        }
        break;
      case 39:
				// right
        if(gameStatus === "Playing"){
          board.snake.setDirection('RIGHT');
        }
        break;
      case 40:
				// down
        if(gameStatus === "Playing"){
         board.snake.setDirection('DOWN');
        }
        break;
      case 37:
				// left
        //console.log('set direction left')
        if(gameStatus === "Playing"){
         board.snake.setDirection('LEFT');
        }
        break;
      default:
        break;
    }
	}
	document.addEventListener("keydown", keyHandler);

</script>

<main>
  <div class="grid-nav">
    <div class="grid-item item-1"><h4>Status: {gameStatus}</h4></div>
    <div class="grid-item item-2"><h1>Snake Game</h1></div>
    <div class="grid-item item-3"><h4>Score : {score}</h4></div>
  </div>
  <div
    class="grid"
    style="grid-template-rows: repeat({dimension},{width});grid-template-columns: repeat({dimension},{width});"
  >
    {#each grid as row, tIndex}
      {#each row as cell, bIndex}
        <div id={'i-' + bIndex + '-' + tIndex} class="cell {cell === 1 ? 'snake': ''} {cell === 2 ? 'food' : ''} {cell === 3 ? 'head' : ''}"></div>
      {/each}
    {/each}
  </div>
</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
    display: grid;
    place-items: center center;
    padding: 0px 10px;
  }
  h1,h4 {
    color: #ff3c00;
    padding: 0;
    margin: 5px 0px 15px 0px;
  }
  .grid {
    display: grid;
  }
  .grid-nav{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-auto-rows: 20px;
    grid-gap: 5px;
    width:100%;
    height:60px;
  }
  .grid-item{
    text-align: center;
    width: 100%; 
    margin: auto;
  }
  .item-1{
    text-align: left;
    margin-left: 15px;
  }
  .item-3{
    text-align: right;
    margin-right: 15px;
  }
  
</style>