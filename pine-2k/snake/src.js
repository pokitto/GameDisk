const minX = 6, maxX = 22;
const minY = 0, maxY = 20;
const boardWidth = maxX - minX;
const boardHeight = maxY - minY;
const heart = builtin("sHeart");
const lvl = builtin("sLvl");
const pts = builtin("sPts");
const ledOFF = builtin("shape2");
const ledON = builtin("sBtn");
const snakeColor = 112;
const bgColor = 113;
const appleColor = 87;
const maxLen = 100;
var snake = new Array(maxLen);
var begin;
var end;
var currentLen;
var len;
var x, y, vx, vy, ax, ay;
var dead, won = 0;
var stepTime;
var delay = 0;
var level = 0;
var inputEnabled = true;
var score = 0;
var prevScore = 0;
var lives = 3;

window(44, 0, 176, 176);
tileshift(2, 0);
io("DURATION", 50);
reset();

function reset(){
    if(lives < 0){
        highscore(score);
        exit();
        return;
    }
    color(bgColor);
    for(y = 0; y < boardHeight; ++y){
        for(x = 0; x < boardWidth; ++x){
            tile(x + minX, y + minY, ledOFF);
        }
    }
    t = 0;
    delay = 100 - (level * 5);
    x = boardWidth / 2;
    y = boardHeight / 2;
    currentLen = 1;
    len = 5;
    vx = 0;
    vy = 0;
    dead = false;
    end = 0;
    begin = end;
    snake[begin] = (x << 16) + y;
    ax = random(0, boardWidth);
    ay = random(0, boardHeight);
    inputEnabled = true;
}

function pattern(x, y, imgName){
    var img = builtin(imgName);
    var w = peek(img++);
    var h = peek(img++);
    x += minX;
    y += minY;
    for(var ty = 0; ty < h; ++ty){
        for(var tx = 0; tx < w; ++tx){
            var c = peek(img, tx);
            if(c){
                color(c - 7);
                tile(x + tx, y + ty, ledOFF);
            }
        }
        img += w;
    }
}

function plot(i, img){
    var c = snake[i];
    var ty = (c << 16) >> 16;
    tile((c >> 16) + minX, ty + minY, img);
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

function update(){
    if(pressed("C"))
        exit();

    hud();

    if(inputEnabled){
        if(pressed("LEFT") && (vx != 1)){
            vx = -1;
            vy = 0;
            inputEnabled = false;
        }

        if(pressed("RIGHT") && (vx != -1)){
            vx = 1;
            vy = 0;
            inputEnabled = false;
        }

        if(pressed("UP") && (vy != 1)){
            vx = 0;
            vy = -1;
            inputEnabled = false;
        }

        if(pressed("DOWN") && (vy != -1)){
            vx = 0;
            vy = 1;
            inputEnabled = false;
        }
    }

    if((time() - stepTime) < delay)
        return;
    stepTime = time();
    inputEnabled = true;

    if(won){
        vx = 0;
        vy = 0;
        --won;
        if(!won){
            ++level;
            reset();
            return;
        }
    } else {
        x += vx;
        y += vy;

        if(x < 0) x = boardWidth - 1;
        else if(x >= boardWidth) x = 0;
        if(y < 0) y = boardHeight - 1;
        else if(y >= boardHeight) y = 0;

        if((x == ax) && (y == ay)){
            ++score;
            len += 3;
            if(len >= ((5 + level) * 5)){
                highscore(score);
                prevScore = score;
                delay = 20;
                won = 10;
                pattern(0, 2, "happyEmote");
                return;
            }
            ax = random(0, boardWidth);
            ay = random(0, boardHeight);
        }
    }

    color(bgColor);
    plot(begin, ledOFF);

    if(dead){
        vx = 0;
        vy = 0;
        if(score > prevScore) --score;
        --len;
        if(!len){
            score = prevScore;
            --lives;
            reset();
            return;
        }
        currentLen = len;
        if(++begin == maxLen) begin = 0;
    }

    var growing = !dead;

    if(vx || vy){
        if(++end == maxLen) end = 0;
        snake[end] = (x << 16) + y;
        if(++currentLen > len){
            growing = false;
            if(++begin == maxLen) begin = 0;
            currentLen--;
        }else{
            sound(40, 0);
        }
    }

    color(snakeColor);
    for(var i = begin; i != end;){
        if(growing)
            color(random(0, 255));
        if(snake[i] == snake[end]){
            delay = 20;
            if(!dead){
                dead = true;
                sound(60, 0);
                pattern(4, 7, "sSkull");
            }
        }
        plot(i, ledON);
        if(++i == maxLen) i = 0;
    }
    color(snakeColor-1);
    plot(end, ledON);

    color(appleColor);
    tile(ax + minX, ay + minY, ledON);
}
