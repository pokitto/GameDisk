if ( file("images.res", 0) != 1 ){
    console("Could not find resources!");
    exit();
}

var playerX = 60;
var playerY = 140;
var level = 4;

const NUMBER_OF_ENTITIES = 10;
const NUMBER_OF_HEARTS = 4;

const enemiesX = new Array(NUMBER_OF_ENTITIES);
const enemiesY = new Array(NUMBER_OF_ENTITIES);
const enemiesD = new Array(NUMBER_OF_ENTITIES);  // Direction where 0 = left, 1 = straight fown, 2 = right
const enemiesL = new Array(NUMBER_OF_ENTITIES);  // Length of travel

const bulletsX = new Array(NUMBER_OF_ENTITIES);
const bulletsY = new Array(NUMBER_OF_ENTITIES);

const heartsX = new Array(NUMBER_OF_HEARTS);
const heartsY = new Array(NUMBER_OF_HEARTS);

var bgLY = 0;
var topBgLY = 0;
var score = 0;
var lives = 59;
var shipAnim = 0;
var big = 0;

var timer = 0;

const HUD_BG = file("HUD_BG", 0); 
const gameOverImg = file("GameOver", 0);

const playerSprites =
    [
    file("PlayerShip_F1", 0), // load the ship frame1
    file("PlayerShip_F2", 0)  // load the ship frame 2
    ];
    
const playerShip_shadow = file("PlayerShip_shadow", 0); // load the ship shadow
const Bullet = file("Bullet", 0); // Bullet

const enemyImg = file("Enemy", 0); // load the enemy gfx
const heartImg = builtin("icon21"); 
const hudHeartImg = builtin("sHeart"); //Hearts for lives

const bgL = file("bgL", 0); // load the Left Background bottom layer image
const bgR = file("bgR", 0); // load the right Background bottom layer image
const topBgL = file("TopBgL",0); // load the Left Background Top layer image
const topBgR = file("TopBgR",0); // load the right Background Top layer image


//------------------------------------------------------------------------

// Position enemies and bullets before start of game ..

io("LOOP", 1);
music("lrmusicNew.raw");

fill(65);

for (var i = 0; i < NUMBER_OF_ENTITIES; ++i) {
    heartsY[i&3] = 200;
    bulletsY[i] = -5;
    enemySpawn(i);
}



//------------------------------------------------------------------------


function somethingHitBullet(otherIndex, bulletIndex) {
    if(otherIndex > 255){
        //lives -= 10;
        heartsY[otherIndex >> 8 - 1] = 200;
        playSound();
        score -= 20;
    } else {
        playSound();
        score += 10;
        enemySpawn(otherIndex - 1);
    }
    bulletsY[bulletIndex >> 4 - 1] = -5;    
}

function playerHitHeart(playerIndex, heartIndex) {

    lives += 10;
    playSound();
    score += 20;
    // heartSpawn(heartIndex >> 8 - 1);
    heartsY[heartIndex >> 8 - 1] = 200;
    //bulletsY[bulletIndex >> 4 - 1] = -5;    
    
}

function enemyHitPlayer(enemyIndex, playerIndex) {
    
    playSound();
    enemySpawn(enemyIndex - 1);
    lives -=20;

}


function moveEnemy(enemyIndex) {

    // Move down ..

    var y = enemiesY[enemyIndex] += (2 + (enemyIndex / 4));
    
    // Move left / right
    
    var direction = enemiesD[enemyIndex];
    var enemyX = enemiesX[enemyIndex];
    
    var newX = enemyX + direction;
    var newDirection = newX < 30 || newX > 200 || --enemiesL[enemyIndex] <= 0 || y > 176;

    // New Direction?

    if (newDirection) {
        enemySpawn(enemyIndex);
        if(y <= 176){
            newX = enemyX;
            enemiesY[enemyIndex] = y;
        } else {
            newX = enemiesX[enemyIndex];
        }
    }
    
    enemiesX[enemyIndex] = newX;

    io("SCALE", 1 + (enemyIndex < big));

    // Render enemy ..

    io("COLLISION", enemyIndex + 1, 0);
    sprite(newX, enemiesY[enemyIndex], enemyImg);

}


function enemySpawn(enemyIndex) {
    enemiesY[enemyIndex] = -random(16, 64);
    enemiesX[enemyIndex] = random(32, 192);
    enemiesD[enemyIndex] = random(-2, 3);
    enemiesL[enemyIndex] = random(16, 32);
}

function playSound() {
    io("VOLUME", 127);
    io("DURATION", 70);
    sound(random(44, 47));
}

function fireBullet() {
    
    for (var i = 0; i < NUMBER_OF_ENTITIES; ++i) {
        
       if (bulletsY[i] <= 0) {
            bulletsX[i] = playerX + 6;          
            bulletsY[i] = playerY - 2;   
            break;
       }
       
    }
    
}

function bgScroll() {
    
    for(var yOffset = -220; yOffset < (8 * 55 - 220); yOffset += 55) {
        
        var y = yOffset + bgLY; 
        sprite(32, y, bgL); 
        sprite(172, y, bgR);
        
        y = yOffset + topBgLY; 
        sprite(0, y, topBgL); 
        sprite(188, y, topBgR);
        
    }
    
    bgLY+=2;
    if (bgLY > 55)      {bgLY = 0;}
    topBgLY+=4;
    if (topBgLY > 55)   {topBgLY = 0;}
}

function HUD() {
    
    sprite(0, 0, HUD_BG);

    var x = 110;
    var heartsToDraw = lives / 10;

    while(heartsToDraw > 5){
        sprite(x, -1, heartImg);
        x += 16;
        heartsToDraw -= 5;
    }

    while(heartsToDraw--) {
        sprite(x, 4, hudHeartImg);
        x += 8;
    }
    
    color(7);
    cursor(8,4)
    print(("SCORE ")); 
    print(score);
    color(0);
}


function update() {

    bgScroll();
    
    var px = playerX + ((pressed("RIGHT") - pressed("LEFT")) << 2);
    if(px>20 && px<190) playerX = px;
    var py = playerY + ((pressed("DOWN") - pressed("UP")) << 2);
    if(py>18 && py<160) playerY = py;
    if (justPressed("A")) fireBullet();
    if (pressed("C")) exit();

    if (lives < 1) {
        highscore(score);
        sprite(45, 75, gameOverImg);
        HUD();
        return;
    }

    
    // Decrement the lives using the counter ..

    timer++;
    if (timer % 32 == 0) lives--;


    // Update the level based on the score ..

    if (score > 240){       level = 10; big = (score - 240) >> 7; }
    else if (score > 140)   level = 8;
    else if (score > 40)    level = 6;

    for(var i = 0; i < level; ++i)
        moveEnemy(i); io("SCALE", 1);


    // Render the player ..
    
    ++shipAnim;
    io("COLLISION", 1024, 0x0F, enemyHitPlayer);
    i = playerSprites[(shipAnim>>2)&1];
    sprite(playerX, playerY, i);
    sprite(playerX+20, playerY+20, playerShip_shadow);


    // Move and render the hearts ..

    for (var i = 0; i < NUMBER_OF_HEARTS; ++i){
        // Move down ..
    
        if (heartsY[i] > 176) {
            // heartSpawn(i);
            heartsY[i] = -random(0, 128);
            heartsX[i] = random(32, 192);
        }
        
        var y = heartsY[i]+=2;
        var x = heartsX[i];

        // Make hearts wobble
        x += sin(y+(i<<2)<<4) >> 5;
        
        // Render heart ..
    
        io("COLLISION", (i + 1) << 8, 1024, playerHitHeart);
        sprite(x, y, heartImg);
    }



    // Move and render the bullets ..

    for(var i = 0; i < level; ++i){
        bulletsY[i]-=5;  
        io("COLLISION", (1 + i) << 4, 0xF0F, somethingHitBullet);
        sprite(bulletsX[i], bulletsY[i], Bullet);
    }

    if (score < 0) score = 0;
    if (lives < 0) lives = 0;
    HUD();
}
