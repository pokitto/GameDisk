const minX = 6, maxX = 22;
const minY = 0, maxY = 20;
const boardWidth = maxX - minX;
const boardHeight = maxY - minY;
const heart = builtin("sHeart");
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const ledOFF = builtin("shape2");
const ledON = builtin("sBtn");
const bgColor = 113;
const maxLen = 100;
const car = 0b010111010111;
const bgColor = 49;
const stripeColor = 53;
const playerY = boardHeight - 5;
const AI = new Array(5);
var playerColor = 53;
var playerX;
var level = 0;
var score = 0;
var lives = 3;
var stepTime;
var frame = 0;
var delay;

window(44, 0, 176, 176);
tileshift(2, 0);

reset();

function resetAI(i){
    var safe = false;
    while(!safe){
        safe = true;
        var y = random(boardHeight, boardHeight * 5) + frame;
        var x = random(0, boardWidth - 3);
        AI[i] = y | (x << 24);
        for(var j in AI){
            if(j == i) continue;
            var other = AI[j];
            var ox = other >> 24;
            if((x + 3) < ox) continue;
            if(x >= (ox + 3)) continue;
            var oy = other << 8 >> 8;
            if((y + 4) < oy) continue;
            if(y >= (oy + 4)) continue;
            safe = false;
            break;
        }
    }
}

function resetAllAI(){
    for(var i in AI){
        resetAI(i);
    }
}

function reset(){
    resetAllAI();
    delay = 100;
    playerX = boardWidth / 2 - 1;
}

function drawCar(sx, sy, c){
    var collision = 0;
    sx += minX;
    sy += minY;
    var i = 3 * 4;
    var h = 4;
    color(c);
    if((sy + h) >= boardHeight){
        h = boardHeight - sy;
    }
    for(var y = 0; y < h; ++y){
        var fy = y + sy;
        for(var x = 0; x < 3; ++x){
            if(car & (1 << --i)){
                var fx = x + sx;
                var prevColor = io("COLOR", fx, fy);
                collision += (prevColor != bgColor) && (prevColor != stripeColor);
                tile(fx, fy, ledOFF);
            }
        }
    }
    return collision;
}

function hud(){
    color(47);
    sprite(50, 165, lvl);
    cursor(60, 165);
    printNumber((level >> 2) + 1);
    sprite(110, 165, pts);
    cursor(120, 165);
    printNumber(score);
    color(0);
    for(var i=0; i<lives; ++i)
        sprite(80 + (i * 8), 165, heart);
}

function updateAI(tick){
    for(var i in AI){
        var data = AI[i];
        var x = data >> 24;
        var y = boardHeight - (data << 8 >> 8) + frame;
        if(y > boardHeight){
            resetAI(i);
            score += level;
            io("VOLUME", 80);
            io("DURATION", 100);
            sound(50 + i);
            continue;
        }else if((y + 3) > 0){
            drawCar(x, y, 143 + i * 8);
        }
    }
}

function update(){
    if(pressed("C"))
        exit();

    hud();

    for(var y = minY; y < maxY; ++y){
        color(bgColor);
        for(var x = minX + 1; x < (maxX - 1); ++x){
            tile(x, y, ledOFF);
        }
        if( (y - frame & 3) == 0 ) color(stripeColor);
        tile(minX, y, ledOFF);
        tile(maxX - 1, y, ledOFF);
    }

    var tick = (time() - stepTime) >= delay;
    if(tick){
        stepTime = time();
        if(delay && !(frame << 29)) delay--;
        level = (100 - delay) >> 1;
        frame++;

        playerX -= pressed("LEFT");
        playerX += pressed("RIGHT");
        if(playerX < 0) playerX = 0;
        if(playerX >= (boardWidth - 3)) playerX = boardWidth - 3;

        io("WAVE", "TRIANGLE");
        io("VOLUME", 127);
        io("DURATION", 50);
        sound(45 - (delay >> 2));
    }

    updateAI(tick);

    if(drawCar(playerX, playerY, playerColor) != 0){
        io("VOLUME", 200);
        io("DURATION", 550);
        sound(20, 0);
        io("WAVE", "NOISE");
        io("VOLUME", 200);
        sound(20, 0);

        highscore(score);
        if(--lives < 0) exit();
        frame = 0;
        resetAllAI();
        playerColor = 172;
        delay = 100;
    } else {
        playerColor = 53;
    }
}
