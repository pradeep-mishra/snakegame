<script>
	import Board from './board';
	import MediaQuery from './MediaQuery.svelte';

	let dimension = 25;
  let maxFood = 8;

	const width = '28px';
  const sound =true;
  let interval=500;
  let intervalKey;
  let score = 0;
  let started =false;
  let gameStatus = "Not Started";


	let board = new Board(dimension,maxFood, sound);
	let grid = board.getGrid();

  const changeView = (view) => {
    if(view === "mobile"){
      dimension = 14
      maxFood = 5
    }
    
    board = new Board(dimension,maxFood, sound);
	  grid = board.getGrid();

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

    return  "";
  }
  
  const handleMobileButtonClick = (evt, direction)=>{
    animateButton(evt);
    switch(direction){
      case 'SPACE' :
        return keyHandler({keyCode : 32});
      case 'UP' :
        return keyHandler({keyCode : 38});
      case 'RIGHT' :
        return keyHandler({keyCode : 39});
      case 'DOWN' :
        return keyHandler({keyCode : 40});
      case 'LEFT' :
        return keyHandler({keyCode : 37});
    }
  }

  const animateButton = (evt)=>{
    evt.target.animate([{ backgroundColor: 'transparent' }, { backgroundColor: 'yellow'},{ backgroundColor: 'transparent'}],{ duration: 300 });
  }

  const start = ()=>{
    return setInterval(board.snake .move.bind(board.snake) ,interval)
  }
	
  const keyHandler = (evt)=>{
    if([32,38,39,40,37].includes(evt.keyCode)){
      evt && evt.preventDefault  ? evt.preventDefault() : '';
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
  <MediaQuery query="(min-width: 481px)" let:matches>
    {#if matches}
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
    {/if}
  </MediaQuery>

  <MediaQuery query="(max-width: 480px)" let:matches>
    {#if matches}
      <div class="header-bottom">
      <div class="header-item title">
        <h3>Snake Game</h3>
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
    {/if}

  </MediaQuery>

  <!-- grid -->

    <MediaQuery query="(min-width: 481px)" let:matches>
      {#if matches}
        <div
        class="grid"
        style="grid-template-rows: repeat({dimension},{width});grid-template-columns: repeat({dimension},{width});">
          {#each grid as row, tIndex}
            {#each row as cell, bIndex}
              <div id={'i-' + bIndex + '-' + tIndex} class="cell {cell === 1 ? 'snake': ''} {cell === 2 ? 'food' : ''} {cell === 3 ? 'head' : ''}"></div>
            {/each}
          {/each}
        </div>
      {/if}
    </MediaQuery>

    <MediaQuery query="(max-width: 480px)" let:matches>
      {#if matches}
        {changeView('mobile')}
        <div
        class="grid"
        style="grid-template-rows: repeat({dimension},{width});grid-template-columns: repeat({dimension},{width});">
          {#each grid as row, tIndex}
            {#each row as cell, bIndex}
              <div id={'i-' + bIndex + '-' + tIndex} class="cell {cell === 1 ? 'snake': ''} {cell === 2 ? 'food' : ''} {cell === 3 ? 'head' : ''}"></div>
            {/each}
          {/each}
        </div>
      {/if}
    </MediaQuery>

  <!-- mobile control -->
  <MediaQuery query="(max-width: 480px)" let:matches>
    {#if matches}
      <div class="mobile-control">
        <div class="control-group control-group-1">
          <span class="control-node control-up" on:click={(evt)=>handleMobileButtonClick(evt,'UP')}> ^ </span>
        </div>
        <div class="control-group control-group-2">
          <span class="control-node control-left" on:click={(evt)=>handleMobileButtonClick(evt,'LEFT')}> &lt; </span>
          <span class="control-node control-start" on:click={(evt)=>handleMobileButtonClick(evt,'SPACE')}> 0</span>
          <span class="control-node control-right" on:click={(evt)=>handleMobileButtonClick(evt,'RIGHT')}>	&gt; </span>
        </div>
        <div class="control-group control-group-3 rotated">
          <span class="control-node control-down " on:click={(evt)=>handleMobileButtonClick(evt,'DOWN')}> ^ </span>
        </div>

      </div>
    {/if}
  </MediaQuery>

  <!-- footer -->

  <div class="footer-left">
    <div> 
      <span class="creator">Pradeep Mishra</span>
      <span>
        <a target="_blank" href="https://github.com/pradeep-mishra">
        <img src="/github.png" alt="github" /> 
      </a> 
      </span>
      <span>
        <a target="_blank" href="https://www.linkedin.com/in/ipradeepmishra/">
        <img src="/linkedin.png" alt="linkedin" /> 
      </a> 
      </span>
      <span>
        <a target="_blank" href="https://twitter.com/ipradeepmishra">
        <img src="/twitter.png" alt="twitter" /> 
      </a>
      </span>
    </div>
  </div>

  <MediaQuery query="(min-width: 481px)" let:matches>
    {#if matches}
      <div class="footer-right">
        <div> Press cmd/ctrl + R to reload the game  </div>
        <div> Press Space to start/pause the game  </div>
      </div>
    {/if}
  </MediaQuery>


</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
    display: grid;
    place-items: center center;
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

  .header-bottom{
    position:fixed;
    left:10px;
    top:550px;
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
  .creator{
    bottom: 7px;
    position: relative;
  }

  .mobile-control{
    margin: 5px auto;
  }

  .control-group{
    margin: 0px 0px; 
  }

  .control-group-1{
    margin-bottom: 20px;
    padding-top: 10px;
  }

  .control-group-2{
    padding: 10px 0px;
  }

  .control-group-3{
    margin-top: 20px;
  }

  .control-node{
    padding: 10px 20px;
    margin: 0px 10px;
    font-size: x-large;
    font-weight: 900;
    border: 1px solid gray;
    cursor: pointer;
  }

  .rotated {
    transform: rotate(180deg); 
  }
  
</style>