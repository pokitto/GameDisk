const minX = 6, maxX = 22;
const minY = 0, maxY = 20;
const boardWidth = maxX - minX;
const boardHeight = maxY - minY;
const heart = builtin("sHeart");
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const ledOFF = builtin("shape1");
const ledON = builtin("sBtn");
const paddleColor = 112;
const bgColor = 129;
const ballColor = 119;
var levels = new Array(27);
var paddleX, bx, by, vx, vy;
var dead, won = 0;
var stepTime;
var level = 0;
var score = 0;
var prevScore = 0;
var lives = 3;
var remaining = 0;
var paddleSize = 3;

levels[0] = builtin("icon1");
levels[1] = builtin("icon2");
levels[2] = builtin("icon3");
levels[3] = builtin("icon4");
levels[4] = builtin("icon5");
levels[5] = builtin("icon6");
levels[6] = builtin("icon7");
levels[7] = builtin("icon8");
levels[8] = builtin("icon9");
levels[9] = builtin("icon10");
levels[10] = builtin("icon11");
levels[11] = builtin("icon12");
levels[12] = builtin("icon13");
levels[13] = builtin("icon14");
levels[14] = builtin("icon15");
levels[15] = builtin("icon16");

window(44, 0, 176, 176);
tileshift(2, 0);
reset();

function reset(){
    if(lives < 0){
        highscore(score);
        exit();
        return;
    }
    score = prevScore;
    if(level > 15){
        paddleSize = 2;
    } else if(level > 30){
        paddleSize = 1;
    }
    color(bgColor);
    for(y = 0; y < boardHeight; ++y){
        for(var x = 0; x < boardWidth; ++x){
            tile(x + minX, y + minY, ledOFF);
        }
    }
    remaining = 0;
    pattern(0, -3, levels[level & 0xF]);
    bx = (boardWidth / 2) << 8;
    by = (boardHeight - 2) << 8;
    paddleX = boardWidth / 2;
    vx = (random(4, 10) + level) * 5;
    vy = 0;
    dead = false;
    won = 0;
}

function pattern(x, y, img){
    var w = peek(img++);
    var h = peek(img++);
    x += minX;
    y += minY;
    var t = peek(img, 0);
    if(y < 0){
        img += w * -y;
        h += y;
        y = 0;
    }
    for(var ty = 0; ty < h; ++ty){
        for(var tx = 0; tx < w; ++tx){
            var c = peek(img, tx);
            if(c && (c != t)){
                color(c - 7);
                tile(x + tx, y + ty, ledOFF);
                ++remaining;
            }
        }
        img += w;
    }
}

function hud(){
    color(47);
    sprite(50, 165, lvl);
    cursor(60, 165);
    printNumber(level + 1);
    sprite(110, 165, pts);
    cursor(120, 165);
    printNumber(score);
    color(0);
    for(var i=0; i<lives; ++i)
        sprite(80 + (i * 8), 165, heart);
}

function hitBlock(){
    var tx = ((bx + 128) >> 8) + minX;
    var ty = ((by + 128) >> 8) + minY;
    var c = io("COLOR", tx, ty);
    if(c == bgColor)
        return false;
    if(c != paddleColor){
        color(bgColor);
        tile(tx, ty, ledOFF);
        --remaining;
        ++score;
    } else {
        by -= 255;
        vx += ((bx >> 8) - paddleX) * random(4, 8) << 3;
        vx >>= 1;
    }
    io("VOLUME", 127);
    io("DURATION", 100);
    sound(random(44, 47));
    return true;
}

function update(){
    if(pressed("C"))
        exit();

    hud();

    if(pressed("LEFT")){
        paddleX--;
        if( (paddleX - paddleSize) < 0 ){
            paddleX = paddleSize;
        }
    }else if(pressed("RIGHT")){
        paddleX++;
        if( (paddleX + paddleSize) >= boardWidth ){
            paddleX = (boardWidth - 1) - paddleSize;
        }
    }else if(pressed("UP") && (vy == 0)){
        vy = -(20 + level) * 7;
    }

    for(var i=0; i<boardWidth; ++i){
        var led = ledON;
        if( (i < (paddleX - paddleSize)) || (i > (paddleX + paddleSize)) ){
            led = ledOFF;
            color(bgColor);
        }else{
            color(paddleColor);
        }
        tile(i + minX, minY + (boardHeight - 1), led);
    }

    by += vy;
    if( by < 0 ){
        by = 0;
        vy = -vy;
    } else if( ((by + 128) >> 8) >= boardHeight ){
        --lives;
        reset();
        return;
    }
    if(hitBlock())
        vy = -vy;
    bx += vx;
    if( bx < 0 ){
        bx = 0;
        vx = -vx;
    } else if( bx >= ((boardWidth - 1) << 8) ){
        bx = ((boardWidth - 1) << 8);
        if(vx > 0)
            vx = -vx;
    }
    if(hitBlock())
        vx = -vx;

    color(ballColor);
    sprite((bx >> 5) + (minX << 3), (by >> 5) + (minY << 3), ledON);

    if(remaining <= 0){
        prevScore = score;
        ++level;
        if(!(level % 5) && (lives < 3)){
            ++lives;
        }
        reset();
    }
}
