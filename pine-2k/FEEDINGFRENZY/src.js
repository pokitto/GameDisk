//Feeding Frenzy for Pine 2K on the Pokitto
//License - MIT
//version = 1.0
//credits: (SHDWWZRD) & (VAMPYRICS)

//look into sfx

if ( file("images.res", 0) != 1 ){//load images.res so we have access to the games graphics
    console("Could not find resources!");
    exit();
}

//initialize constants
const HPUP = [150,300,500,800,1200,1700,2300,3000,5000,10000,100000,1000000];
const vEntity = 4;//each entity has 4 variables X,Y,Xspeed,type
const nEntity = 8;// we have 8 entities
const cEntity = nEntity * vEntity;// we have 8 entities and each entity has 4 variables each
const skyColor = [133,158,1];
const waitTime = [12000,7500,4500];
const press = file("press", 0); 
const logo = file("logo", 0); 
const bg =
    [
    file("bg", 0), // 
    file("bg1", 0) // 
    ];
const sharklives = file("sharklives", 0); 
const entitySprites =
    [
    file("yellowtang", 0), // 
    file("bluetang", 0), // 
    file("angelfish", 0), //     
    file("clownfish", 0),
    file("poison", 0), // 
    file("mine", 0), // 
    file("torpedo", 0), // 
    file("piranas", 0) // 
    ];
const playerSprites =
    [
    file("shark_f1", 0), // load the shark frame 1
    file("shark_f2", 0)  // load the shark frame 2
    ];
resetGame();


//game functions
function resetGame(){
    //initialize variables
    tEntity = Array( cEntity );
    gameState = 0;//0=title 1=playing
    playerY=3;
    playerX=94;
    playerHP=3;
    HPUPON=0;
    playerHit=0;
    dash=0;
    playerAnim=0;
    playerFacingRight=1;
    playerScore = 0;
    counter = 0;
    gameLevel = 0;
    startTime = time();
    nextLevelTime = startTime+waitTime[gameLevel];
    for( var eID = 0; eID < nEntity; eID++ ) {
    	var id = eID * vEntity; //determine the starting index in array for target
    	if(eID%2==0){//even goes right
			resetEntity(eID,true);
    	}else{//odd goes left
			resetEntity(eID,false);
    	}
		tEntity[id+1] = 34+(eID*17);//set  Y coordinate 
    	tEntity[id+3] = 0;//set type to food not hazard
    }
    io("VOLUME", 32);
    io("DURATION", 100);
}

function updateEntites(){
    for( var eID = 0; eID < nEntity; eID++ ) {
    	var id = eID * vEntity; //determine the starting index in array for target
		tEntity[id] += tEntity[id+2]; //move target x coordinate by the targets speed 
		//check to see if target has left the edge of the screen and needs to be reset
		if(tEntity[id]>220 || tEntity[id]<-16){//target x coordinate is greater than right edge of screen
		    resetEntity(eID,tEntity[id+2]);
		}
		if(tEntity[id+2]>0){//moving to the right
			mirror( false );
		}else{//car must be moving left
			mirror( true );
		}
		io("COLLISION", eID+1, 0);//add the next drawn sprite to the collision register with entity ID +1 (1,2,3,4,5,6,7,8)
		sprite(tEntity[id], tEntity[id+1], entitySprites[tEntity[id+3]]);	//draw entity at x and y coordinate 
	}
}

function entityHitPlayer(adjeID) {
    eID = adjeID-1;
    var id = (eID) * vEntity;
    if(tEntity[id+3]<=3){//food
        sound(47);
        if(tEntity[id+2]>0){//moving to the right
    		var spriteID = tEntity[id+2]-1;
        }else{
            var spriteID = -1*(tEntity[id+2])-1;
        }
        playerScore+=spriteID;
    }
    if(tEntity[id+3]>=4){//hazard 
        sound(44);
        playerHP--;
        playerHit=5;
        if(playerHP<=0){
            gameState=0;  
            highscore(playerScore);
        }
    }
    resetEntity(eID,tEntity[id+2]);
}

function resetEntity(eID,onLeft){
    var id = (eID) * vEntity;
	var offset = min(gameLevel/3,3);
    if(onLeft>0){
    	tEntity[id] = -16;//set x coordinate back to 0
		tEntity[id+2] = (gameLevel%3)+2+(gameLevel/3);
		tEntity[id+3] = random(0,2)*4+offset;// set type to a random number between 0 and 1
    }else{
        tEntity[id] = 220;//set target x coordinate back to 252
		tEntity[id+2] = -((gameLevel%3)+2+(gameLevel/3));
		tEntity[id+3] = random(0,2)*4+offset;// set type to a random number between 0 and 1
    }
}

function update()
{
    //drawbg
    playerAnim++;
    fill(skyColor[gameLevel%3]);
	mirror( false );
    for( var x = 0; x < 220; x+=8 )sprite(x, 0, bg[(playerAnim>>2)&1]);
     
    //update and render all entites
    updateEntites();
    
    if(gameState==0){
		//draw game logo
        mirror( false );
        io("SCALE", 2);
        sprite(10, 41, logo);
        io("SCALE", 1);
        sprite(42, 138, press);
        if (justPressed("B")){
			resetGame();
			gameState=1;
		}     
        if (pressed("C"))exit();
    }else if(gameState==1){
        //check for free life
        if(playerScore >= HPUP[HPUPON]){
            HPUPON++;
            playerHP++;
            freelife=10;
        }
        //determine game level
        if(time()>nextLevelTime){
            gameLevel++;
            nextLevelTime+=waitTime[gameLevel%3];
        }
        //check for keys
        if (justPressed("A")){//player wants to dash
			dash=10;
		} else{
            if (pressed("UP") && playerY > 0 && counter%4==0) {          playerY--;counter++;}
            else if (pressed("DOWN") && playerY < 7 && counter%4==0)  {     playerY++;counter++;}
            else if (pressed("UP") || pressed("DOWN")){counter++;}
            else {counter=0;}
            playerX = max(min(188, (playerX + ( (pressed("RIGHT") - pressed("LEFT")) << 2 ) )), 0);
            if(pressed("RIGHT"))playerFacingRight=1;
            if(pressed("LEFT"))playerFacingRight=0;
		}
		if(dash>0){//we are dashing
		    if(playerFacingRight){
		        playerX += dash;
		    }else{
		        playerX -= dash;
		    }
		    dash-=2;
		}
        //render player
        if(playerFacingRight){mirror( false );}else{mirror( true );}
        if(playerHit>0){
            io("SCALE", 2)
            playerHit--;
            sprite(playerX-16, playerY*17+34-8, playerSprites[(playerAnim>>2)&1]);
        }else{
            io("COLLISION", 9, -1, entityHitPlayer);//did an entity hit the player
            sprite(playerX, playerY*17+34, playerSprites[(playerAnim>>2)&1]);
        }
        io("SCALE", 1)
    } 
    //renderHUD
    io("FORMAT", 0, 6);
    color(1);
    cursor(87,5);
    printNumber(playerScore);
    color(7); 
    cursor(86,4);
    printNumber(playerScore);
    io("FORMAT", 0, 0);
    if(freelife>0){
        freelife--;
        io("SCALE", 2);
        sprite(186, 4, sharklives);
        io("SCALE", 1);
    }else{
        sprite(194, 4, sharklives);
    }
    cursor(202,4);
    printNumber(playerHP);
    color(0);
    
}
