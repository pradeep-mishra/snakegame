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
    interval = interval < 80 ? 80 : interval;
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

  <!-- header -->
  <div class="header">
    <div class="header-item title">
      <h1>Snake Game</h1>
    </div>
    <div class="header-item status">
      <h4>Status: 
        <span class="status-span"> {gameStatus}</span>
      </h4>
    </div>
    <div class="header-item score">
      <h4>Score : 
        <span class="score-span"> {score}</span>
      </h4>
    </div>
  </div>

  <!-- grid -->
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

  <div class="footer-left">
    <div> 
      Creator : Pradeep Mishra
      <span>
        <a href="https://www.linkedin.com/in/ipradeepmishra/">
        <img src="/linkedin.png" alt="linkedin" /> 
      </a> 
      </span>
      <span>
        <a href="https://twitter.com/ipradeepmishra">
        <img src="/twitter.png" alt="twitter" /> 
      </a>
      </span>
    </div>
  </div>

  <div class="footer-right">
    <div> Press cmd/ctrl + R to reload the game  </div>
    <div> Press Space to start/pause the game  </div>
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
    padding: 0;
    margin: 5px 0px 15px 0px;
  }
  .grid {
    display: grid;
  }
  
  .header{
    position:fixed;
    left:10px;
    top:10px;
    width:300px;
    height:60px;
  }

  .header-item{
    text-align: left;
  }
  .title{
    color: rgb(61, 61, 61);
  }
  .status-span, .score-span{
    color: rgb(211, 81, 21);
  }
  .footer-left{
    color: rgb(61, 61, 61);
    position: fixed;
    left: 10px;
    bottom: 10px;
    text-align: right;
  }

  .footer-right{
    color:rgb(61, 61, 61);
    position: fixed;
    right: 20px;
    bottom: 10px;
    text-align: right;
  }
  
</style>